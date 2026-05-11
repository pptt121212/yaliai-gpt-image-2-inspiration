#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HTTP_USER_AGENT = "Mozilla/5.0 (Yali AI Skill Localizer) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const USAGE = `Usage:
  node scripts/node/localize_image_result.mjs --payload-file RESULT.json [--out-dir DIR] [--alt TEXT] [--limit N]
  node scripts/node/localize_image_result.mjs --payload-json JSON [--out-dir DIR] [--alt TEXT] [--limit N]
  cat result.json | node scripts/node/localize_image_result.mjs [--out-dir DIR] [--alt TEXT] [--limit N]
  node scripts/node/localize_image_result.mjs --self-test

Output:
  JSON with primary_output_path, primary_metadata_path, markdown, and outputs[].`;

function die(message, code = 2) {
  console.error(JSON.stringify({ ok: false, error: message }));
  process.exit(code);
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(USAGE);
    process.exit(0);
  }
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) die(`Unexpected argument: ${item}`);
    const key = item.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (key === "selfTest") {
      args.selfTest = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) die(`Missing value for ${item}`);
    args[key] = value;
    i += 1;
  }
  return args;
}

function slugify(value, fallback = "image") {
  const slug = String(value || "").trim().toLowerCase().replace(/[^a-z0-9._-]+/gi, "-").replace(/^[-._]+|[-._]+$/g, "");
  return (slug || fallback).slice(0, 60);
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function extensionFromBytes(buffer, fallback = ".png") {
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ".png";
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return ".jpg";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return ".webp";
  return fallback.startsWith(".") ? fallback : `.${fallback}`;
}

function extensionFromLocation(value) {
  const clean = String(value).split("?")[0].split("#")[0];
  const suffix = path.extname(clean).toLowerCase();
  if (suffix === ".jpeg") return ".jpg";
  return [".png", ".jpg", ".webp"].includes(suffix) ? suffix : ".png";
}

function addSource(sources, label, value) {
  if (typeof value === "string" && value.trim()) sources.push({ label, value: value.trim() });
}

export function collectSources(payload) {
  const sources = [];
  if (Array.isArray(payload)) {
    payload.forEach((item, index) => {
      for (const source of collectSources(item)) sources.push({ ...source, label: `list[${index}].${source.label}` });
    });
    return sources;
  }
  if (!payload || typeof payload !== "object") return sources;

  const response = payload.response && typeof payload.response === "object" ? payload.response : {};
  addSource(sources, "yali.response.url", response.url);
  for (const [index, asset] of Object.entries(response.assets || [])) {
    if (asset && typeof asset === "object") addSource(sources, `yali.response.assets[${index}].url`, asset.url);
  }
  for (const [index, item] of Object.entries(payload.data || [])) {
    if (item && typeof item === "object") {
      addSource(sources, `openai.data[${index}].b64_json`, item.b64_json);
      addSource(sources, `openai.data[${index}].url`, item.url);
    }
  }
  for (const [index, item] of Object.entries(payload.output_items || [])) {
    if (item && typeof item === "object") {
      addSource(sources, `host.output_items[${index}].result`, item.result);
      addSource(sources, `host.output_items[${index}].url`, item.url);
    }
  }
  const output = payload.output && typeof payload.output === "object" ? payload.output : {};
  addSource(sources, "generic.output.path", output.path);
  for (const [index, item] of Object.entries(output.files || [])) {
    if (item && typeof item === "object") addSource(sources, `generic.output.files[${index}].path`, item.path);
  }
  for (const key of ["url", "image_url", "b64_json", "base64", "result", "path"]) addSource(sources, `generic.${key}`, payload[key]);
  for (const [index, item] of Object.entries(payload.images || [])) {
    if (typeof item === "string") addSource(sources, `generic.images[${index}]`, item);
    if (item && typeof item === "object") {
      for (const key of ["url", "image_url", "b64_json", "base64", "result", "path"]) addSource(sources, `generic.images[${index}].${key}`, item[key]);
    }
  }
  return sources;
}

function uniqueSources(sources) {
  const seen = new Set();
  const unique = [];
  for (const source of sources) {
    const key = source.value;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(source);
  }
  return unique;
}

function httpGetBuffer(url) {
  const client = url.startsWith("https:") ? https : http;
  return new Promise((resolve, reject) => {
    const request = client.get(url, { headers: { "User-Agent": HTTP_USER_AGENT, Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" } }, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`HTTP ${response.statusCode} while downloading ${url}`));
        response.resume();
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
    });
    request.setTimeout(60000, () => request.destroy(new Error(`Timeout downloading ${url}`)));
    request.on("error", reject);
  });
}

async function bytesFromSource(value) {
  if (value.startsWith("data:image/")) {
    const [header, encoded] = value.split(",", 2);
    const mime = header.split(";", 1)[0].replace("data:", "");
    const ext = mime === "image/jpeg" ? ".jpg" : `.${mime.split("/")[1] || "png"}`;
    return { data: Buffer.from(encoded, "base64"), guessedExt: ext, originalLocation: null };
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return { data: await httpGetBuffer(value), guessedExt: extensionFromLocation(value), originalLocation: value };
  }
  if (value.startsWith("file://")) {
    const localPath = fileURLToPath(value);
    return { data: fs.readFileSync(localPath), guessedExt: path.extname(localPath) || ".png", originalLocation: path.resolve(localPath) };
  }
  const localPath = path.resolve(value);
  if (fs.existsSync(localPath)) return { data: fs.readFileSync(localPath), guessedExt: path.extname(localPath) || ".png", originalLocation: localPath };
  return { data: Buffer.from(value, "base64"), guessedExt: ".png", originalLocation: null };
}

export async function localize(payload, options = {}) {
  const alt = options.alt || "generated image";
  const sources = collectSources(payload);
  if (!sources.length) die("No supported image source found.");
  const root = path.resolve(options.outDir || path.join(process.cwd(), ".yaliai", "generated-images"));
  fs.mkdirSync(root, { recursive: true });
  const unique = uniqueSources(sources);
  const selected = options.limit ? unique.slice(0, Number(options.limit)) : unique;
  const outputs = [];
  for (let i = 0; i < selected.length; i += 1) {
    const source = selected[i];
    const { data, guessedExt, originalLocation } = await bytesFromSource(source.value);
    const ext = extensionFromBytes(data, guessedExt);
    const stem = `${stamp()}-${slugify(alt)}-${String(i + 1).padStart(2, "0")}-${crypto.randomBytes(4).toString("hex")}`;
    const imagePath = path.join(root, `${stem}${ext}`);
    fs.writeFileSync(imagePath, data);
    const metadataPath = imagePath.replace(/\.[^.]+$/, ".json");
    const item = {
      index: i + 1,
      source_label: source.label,
      original_location: originalLocation,
      output_path: imagePath,
      metadata_path: metadataPath,
      bytes: data.length,
      alt,
      markdown: `![${alt}](${imagePath})`,
    };
    fs.writeFileSync(metadataPath, `${JSON.stringify(item, null, 2)}\n`, "utf8");
    outputs.push(item);
  }
  return {
    ok: true,
    count: outputs.length,
    output_dir: root,
    primary_output_path: outputs[0].output_path,
    primary_metadata_path: outputs[0].metadata_path,
    markdown: outputs.map((item) => item.markdown).join("\n"),
    outputs,
  };
}

async function selfTest() {
  const testRoot = path.resolve("/tmp/yaliai-localize-image-result-node-test");
  fs.rmSync(testRoot, { recursive: true, force: true });
  fs.mkdirSync(testRoot, { recursive: true });
  const sample = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
  const sourcePath = path.join(testRoot, "source.png");
  fs.writeFileSync(sourcePath, Buffer.from(sample, "base64"));
  const cases = [
    ["yali-primary-url", { response: { url: `data:image/png;base64,${sample}` } }],
    ["yali-duplicate-url", { response: { url: `data:image/png;base64,${sample}`, assets: [{ url: `data:image/png;base64,${sample}` }] } }],
    ["openai-b64-json", { data: [{ b64_json: sample }] }],
    ["generic-local-path", { path: sourcePath }],
  ];
  const results = [];
  for (const [name, payload] of cases) {
    const result = await localize(payload, { outDir: path.join(testRoot, "localized"), alt: name });
    results.push({ case: name, ok: fs.existsSync(result.primary_output_path), count: result.count, markdown: result.markdown });
  }
  const ok = results.every((item) => item.ok);
  console.log(JSON.stringify({ ok, results }, null, 2));
  return ok ? 0 : 1;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selfTest) return selfTest();
  let payload;
  if (args.payloadFile) payload = JSON.parse(fs.readFileSync(args.payloadFile, "utf8"));
  else if (args.payloadJson) payload = JSON.parse(args.payloadJson);
  else payload = JSON.parse(fs.readFileSync(0, "utf8"));
  const result = await localize(payload, { outDir: args.outDir, alt: args.alt || "generated image", limit: args.limit ? Number(args.limit) : undefined });
  console.log(JSON.stringify(result, null, 2));
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((code) => process.exit(code)).catch((error) => die(error.message || String(error), 1));
}
