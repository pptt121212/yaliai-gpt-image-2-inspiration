#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { localize } from "./localize_image_result.mjs";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-image-1";
const TRUTHY = new Set(["1", "true", "yes", "on", "y"]);
const USAGE = `Usage:
  node scripts/node/compatible_image_api.mjs [--base-url URL] [--api-key KEY] [--model MODEL] [--allow-fallback] generate --prompt TEXT [--size SIZE] [--quality LEVEL] [--n N] [--out-dir DIR] [--alt TEXT] [--limit N] [--no-localize] [--dry-run]
  node scripts/node/compatible_image_api.mjs [--base-url URL] [--api-key KEY] [--model MODEL] [--allow-fallback] edit --prompt TEXT --image FILE [--image FILE] [--mask FILE] [--size SIZE] [--quality LEVEL] [--out-dir DIR] [--alt TEXT] [--limit N] [--no-localize] [--dry-run]

Environment:
  YALIAI_ALLOW_COMPAT_PROVIDER=1 must be set, unless --allow-fallback is used.
  OPENAI_API_KEY, OPENAI_BASE_URL, and OPENAI_IMAGE_MODEL configure the compatible provider.`;

function die(message, code = 2) {
  console.error(JSON.stringify({ ok: false, error: message }));
  process.exit(code);
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(USAGE);
    process.exit(0);
  }
  const global = {};
  let i = 0;
  while (i < argv.length && argv[i].startsWith("--")) {
    const key = argv[i].slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (key === "allowFallback") {
      global.allowFallback = true;
      i += 1;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) die(`Missing value for ${argv[i]}`);
    global[key] = value;
    i += 2;
  }
  const command = argv[i];
  if (!command || !["generate", "edit"].includes(command)) die("Usage: compatible_image_api.mjs [global options] <generate|edit> ...");
  const args = { image: [] };
  for (i += 1; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) die(`Unexpected argument: ${item}`);
    const key = item.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (["dryRun", "noLocalize"].includes(key)) {
      args[key] = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) die(`Missing value for ${item}`);
    if (key === "image") args.image.push(value);
    else args[key] = value;
    i += 1;
  }
  return { global, command, args };
}

function cleanBaseUrl(value) {
  return String(value || process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
}

function fallbackAllowed(global) {
  return Boolean(global.allowFallback) || TRUTHY.has(String(process.env.YALIAI_ALLOW_COMPAT_PROVIDER || "").trim().toLowerCase());
}

function readApiKey(global, dryRun) {
  const key = String(global.apiKey || process.env.OPENAI_API_KEY || "").trim();
  if (!key && !dryRun) die("OPENAI_API_KEY is required for compatible fallback execution.");
  return key;
}

function readPrompt(args) {
  const text = args.promptFile ? fs.readFileSync(args.promptFile, "utf8").trim() : String(args.prompt || "").trim();
  if (!text) die("Prompt is required. Use --prompt or --prompt-file.");
  return text;
}

function request(method, url, apiKey, body, headers = {}) {
  const client = url.startsWith("https:") ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        ...headers,
      },
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode} from compatible image API: ${text}`));
          return;
        }
        try {
          resolve(JSON.parse(text));
        } catch {
          reject(new Error(`Compatible image API returned non-JSON response: ${text.slice(0, 500)}`));
        }
      });
    });
    req.setTimeout(120000, () => req.destroy(new Error(`Timeout calling ${url}`)));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function jsonRequest(url, apiKey, payload) {
  const body = Buffer.from(JSON.stringify(payload));
  return request("POST", url, apiKey, body, { "Content-Type": "application/json", "Content-Length": body.length });
}

function guessMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

function multipartBody(fields, files) {
  const boundary = `----yaliai-compatible-${Date.now().toString(16)}`;
  const chunks = [];
  const push = (value) => chunks.push(Buffer.isBuffer(value) ? value : Buffer.from(value));
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") continue;
    push(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`);
  }
  for (const file of files) {
    const filePath = path.resolve(file.path);
    if (!fs.existsSync(filePath)) die(`Image file does not exist: ${filePath}`);
    push(`--${boundary}\r\nContent-Disposition: form-data; name="${file.name}"; filename="${path.basename(filePath)}"\r\nContent-Type: ${guessMime(filePath)}\r\n\r\n`);
    push(fs.readFileSync(filePath));
    push("\r\n");
  }
  push(`--${boundary}--\r\n`);
  const body = Buffer.concat(chunks);
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

async function maybeLocalize(payload, args) {
  if (args.noLocalize) return undefined;
  return localize(payload, { outDir: args.outDir, alt: args.alt || "compatible image", limit: args.limit ? Number(args.limit) : undefined });
}

async function generate(global, args) {
  if (!fallbackAllowed(global) && !args.dryRun) die("Compatible fallback is not enabled. Set YALIAI_ALLOW_COMPAT_PROVIDER=1 or pass --allow-fallback.");
  const baseUrl = cleanBaseUrl(global.baseUrl);
  const payload = {
    model: global.model || process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL,
    prompt: readPrompt(args),
  };
  if (args.size) payload.size = args.size;
  if (args.quality) payload.quality = args.quality;
  if (args.n) payload.n = Number(args.n);
  if (args.outputFormat) payload.output_format = args.outputFormat;
  if (args.responseFormat) payload.response_format = args.responseFormat;
  const endpoint = `${baseUrl}/images/generations`;
  if (args.dryRun) {
    console.log(JSON.stringify({ ok: true, dry_run: true, provider: "compatible-fallback", endpoint, request: payload }, null, 2));
    return;
  }
  const result = await jsonRequest(endpoint, readApiKey(global, false), payload);
  const output = { ok: true, provider: "compatible-fallback", endpoint, result };
  const localized = await maybeLocalize(result, args);
  if (localized) output.localize = localized;
  console.log(JSON.stringify(output, null, 2));
}

async function edit(global, args) {
  if (!fallbackAllowed(global) && !args.dryRun) die("Compatible fallback is not enabled. Set YALIAI_ALLOW_COMPAT_PROVIDER=1 or pass --allow-fallback.");
  if (!args.image.length) die("edit requires at least one --image.");
  const baseUrl = cleanBaseUrl(global.baseUrl);
  const fields = {
    model: global.model || process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL,
    prompt: readPrompt(args),
    size: args.size,
    quality: args.quality,
    n: args.n,
  };
  const endpoint = `${baseUrl}/images/edits`;
  if (args.dryRun) {
    console.log(JSON.stringify({ ok: true, dry_run: true, provider: "compatible-fallback", endpoint, request: { ...fields, image: args.image, mask: args.mask || null } }, null, 2));
    return;
  }
  const files = args.image.map((item) => ({ name: "image", path: item }));
  if (args.mask) files.push({ name: "mask", path: args.mask });
  const { body, contentType } = multipartBody(fields, files);
  const result = await request("POST", endpoint, readApiKey(global, false), body, { "Content-Type": contentType, "Content-Length": body.length });
  const output = { ok: true, provider: "compatible-fallback", endpoint, result };
  const localized = await maybeLocalize(result, args);
  if (localized) output.localize = localized;
  console.log(JSON.stringify(output, null, 2));
}

const { global, command, args } = parseArgs(process.argv.slice(2));
try {
  if (command === "generate") await generate(global, args);
  if (command === "edit") await edit(global, args);
} catch (error) {
  die(error.message || String(error), 1);
}
