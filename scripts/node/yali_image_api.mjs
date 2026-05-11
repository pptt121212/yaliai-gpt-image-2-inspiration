#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { localize } from "./localize_image_result.mjs";

const DEFAULT_BASE_URL = "https://www.yaliai.com/wp-json/yali/v1";
const HTTP_USER_AGENT = "Mozilla/5.0 (Yali AI Skill Runner) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const TERMINAL_STATUSES = new Set(["completed", "failed", "error", "cancelled", "canceled"]);
const USAGE = `Usage:
  node scripts/node/yali_image_api.mjs [--base-url URL] [--api-key KEY] generate --prompt TEXT [--quality low|medium|high] [--size-key SIZE] [--template-key KEY] [--action generate|edit] [--reference-image PATH_OR_URL] [--wait] [--poll-interval SECONDS] [--timeout SECONDS] [--out-dir DIR] [--alt TEXT] [--limit N] [--no-localize] [--dry-run]
  node scripts/node/yali_image_api.mjs [--base-url URL] [--api-key KEY] status --task-id TASK_ID
  node scripts/node/yali_image_api.mjs [--base-url URL] [--api-key KEY] result --task-id TASK_ID [--out-dir DIR] [--alt TEXT] [--limit N] [--no-localize]

Environment:
  YALIAI_API_KEY is used when --api-key is omitted.`;

function die(message, code = 2) {
  console.error(JSON.stringify({ ok: false, error: message }));
  process.exit(code);
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(USAGE);
    process.exit(0);
  }
  const global = { baseUrl: DEFAULT_BASE_URL };
  let i = 0;
  while (i < argv.length && argv[i].startsWith("--")) {
    const key = argv[i].slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) die(`Missing value for ${argv[i]}`);
    global[key] = value;
    i += 2;
  }
  const command = argv[i];
  if (!command || !["generate", "status", "result"].includes(command)) die("Usage: yali_image_api.mjs [--base-url URL] [--api-key KEY] <generate|status|result> ...");
  const args = {};
  for (i += 1; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) die(`Unexpected argument: ${item}`);
    const key = item.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (["wait", "dryRun", "noLocalize"].includes(key)) {
      args[key] = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) die(`Missing value for ${item}`);
    if (key === "referenceImage") {
      args.referenceImage = args.referenceImage || [];
      args.referenceImage.push(value);
    } else {
      args[key] = value;
    }
    i += 1;
  }
  return { global, command, args };
}

function cleanBaseUrl(value) {
  const text = String(value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  const suffix = "/free-image/api";
  return text.endsWith(suffix) ? text.slice(0, -suffix.length) : text;
}

function readApiKey(value) {
  const key = String(value || process.env.YALIAI_API_KEY || "").trim();
  if (!key) die("YALIAI_API_KEY is not set. Configure it in the runtime environment before calling the Yali API.");
  return key;
}

function readPrompt(args) {
  const text = args.promptFile ? fs.readFileSync(args.promptFile, "utf8").trim() : String(args.prompt || "").trim();
  if (!text) die("Prompt is required. Use --prompt or --prompt-file.");
  return text;
}

function guessMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

function encodeReferenceImage(value) {
  const text = String(value || "").trim();
  if (!text) die("Empty --reference-image value.");
  if (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("data:image/")) return { image_url: text };
  const filePath = path.resolve(text);
  if (!fs.existsSync(filePath)) die(`Reference image does not exist: ${filePath}`);
  const data = fs.readFileSync(filePath);
  if (data.length > 5 * 1024 * 1024) die(`Reference image is larger than 5MB: ${filePath}`);
  const mime = guessMime(filePath);
  if (!["image/png", "image/jpeg", "image/webp"].includes(mime)) die(`Unsupported reference image MIME type ${mime}: ${filePath}`);
  return { image_url: `data:${mime};base64,${data.toString("base64")}` };
}

function requestJson(method, url, apiKey, payload) {
  const client = url.startsWith("https:") ? https : http;
  const body = payload === undefined ? undefined : Buffer.from(JSON.stringify(payload));
  return new Promise((resolve, reject) => {
    const req = client.request(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "User-Agent": HTTP_USER_AGENT,
        ...(body ? { "Content-Type": "application/json", "Content-Length": body.length } : {}),
      },
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode} from Yali API: ${text}`));
          return;
        }
        try {
          resolve(JSON.parse(text));
        } catch {
          reject(new Error(`Yali API returned non-JSON response: ${text.slice(0, 500)}`));
        }
      });
    });
    req.setTimeout(120000, () => req.destroy(new Error(`Timeout calling ${url}`)));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function taskStatus(payload) {
  const task = payload && typeof payload.task === "object" ? payload.task : {};
  return String(task.status || payload.status || "").trim().toLowerCase();
}

function getTaskId(payload) {
  const task = payload && typeof payload.task === "object" ? payload.task : {};
  const taskId = String(payload.task_id || task.task_id || "").trim();
  if (!taskId) die(`No task_id found in response: ${JSON.stringify(payload).slice(0, 500)}`, 1);
  return taskId;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generate(global, args) {
  const baseUrl = cleanBaseUrl(global.baseUrl);
  const body = { prompt: readPrompt(args), quality: args.quality || "medium" };
  if (args.action) body.action = args.action;
  if (args.templateKey) body.template_key = args.templateKey;
  if (args.sizeKey) body.size_key = args.sizeKey;
  if (args.outputFormat) body.output_format = args.outputFormat;
  if (args.outputCompression !== undefined) body.output_compression = Number(args.outputCompression);
  if (args.referenceImage) body.reference_images = args.referenceImage.map(encodeReferenceImage);
  if (body.reference_images && body.reference_images.length > 2) die("Yali API supports at most 2 reference images.");
  if (args.action === "edit" && !body.reference_images?.length) die('Yali editing requires at least one --reference-image when --action edit is used.');
  if (args.dryRun) {
    console.log(JSON.stringify({ ok: true, dry_run: true, endpoint: `${baseUrl}/free-image/api/generate`, request: body }, null, 2));
    return;
  }

  const apiKey = readApiKey(global.apiKey);
  const start = await requestJson("POST", `${baseUrl}/free-image/api/generate`, apiKey, body);
  const output = { ok: true, start, task_id: getTaskId(start) };
  if (args.wait) {
    const timeoutMs = Number(args.timeout || 300) * 1000;
    const pollMs = Number(args.pollInterval || 3) * 1000;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await sleep(pollMs);
      const statusPayload = await requestJson("GET", `${baseUrl}/free-image/api/status?${new URLSearchParams({ task_id: output.task_id })}`, apiKey);
      output.status = statusPayload;
      const status = taskStatus(statusPayload);
      if (TERMINAL_STATUSES.has(status)) break;
    }
    if (taskStatus(output.status || {}) !== "completed") {
      console.log(JSON.stringify(output, null, 2));
      process.exit(1);
    }
    const final = await requestJson("GET", `${baseUrl}/free-image/api/result?${new URLSearchParams({ task_id: output.task_id })}`, apiKey);
    output.result = final;
    if (!args.noLocalize) output.localize = await localize({ response: final }, { outDir: args.outDir, alt: args.alt || "yali image", limit: args.limit ? Number(args.limit) : undefined });
  }
  console.log(JSON.stringify(output, null, 2));
}

async function status(global, args) {
  if (!args.taskId) die("status requires --task-id.");
  const baseUrl = cleanBaseUrl(global.baseUrl);
  const apiKey = readApiKey(global.apiKey);
  const payload = await requestJson("GET", `${baseUrl}/free-image/api/status?${new URLSearchParams({ task_id: args.taskId })}`, apiKey);
  console.log(JSON.stringify({ ok: true, status: payload }, null, 2));
}

async function result(global, args) {
  if (!args.taskId) die("result requires --task-id.");
  const baseUrl = cleanBaseUrl(global.baseUrl);
  const apiKey = readApiKey(global.apiKey);
  const payload = await requestJson("GET", `${baseUrl}/free-image/api/result?${new URLSearchParams({ task_id: args.taskId })}`, apiKey);
  const output = { ok: true, result: payload };
  if (!args.noLocalize) output.localize = await localize({ response: payload }, { outDir: args.outDir, alt: args.alt || "yali image", limit: args.limit ? Number(args.limit) : undefined });
  console.log(JSON.stringify(output, null, 2));
}

const { global, command, args } = parseArgs(process.argv.slice(2));
try {
  if (command === "generate") await generate(global, args);
  if (command === "status") await status(global, args);
  if (command === "result") await result(global, args);
} catch (error) {
  die(error.message || String(error), 1);
}
