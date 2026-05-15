#!/usr/bin/env node
import http from "node:http";
import https from "node:https";

const DEFAULT_BASE_URL = "https://www.yaliai.com/wp-json/yali/v1";
const HTTP_USER_AGENT = "Mozilla/5.0 (Yali AI Skill Inspiration) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const USAGE = `Usage:
  node scripts/node/yali_inspiration.mjs [--base-url URL] search --query TEXT [--limit N] [--offset N] [--category NAME] [--dry-run]
  node scripts/node/yali_inspiration.mjs [--base-url URL] categories [--dry-run]
  node scripts/node/yali_inspiration.mjs [--base-url URL] case --case-id CASE_ID [--dry-run]
  node scripts/node/yali_inspiration.mjs [--base-url URL] templates [--dry-run]`;

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
  if (!command || !["search", "categories", "case", "templates"].includes(command)) {
    die("Usage: yali_inspiration.mjs [--base-url URL] <search|categories|case|templates> ...");
  }
  const args = {};
  for (i += 1; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) die(`Unexpected argument: ${item}`);
    const key = item.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (key === "dryRun") {
      args.dryRun = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) die(`Missing value for ${item}`);
    args[key] = value;
    i += 1;
  }
  return { global, command, args };
}

function cleanBaseUrl(value) {
  return String(value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
}

function getJson(url) {
  const client = url.startsWith("https:") ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.get(url, { headers: { Accept: "application/json", "User-Agent": HTTP_USER_AGENT } }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${text.slice(0, 500)}`));
          return;
        }
        try {
          resolve(JSON.parse(text));
        } catch {
          reject(new Error(`Non-JSON response: ${text.slice(0, 500)}`));
        }
      });
    });
    req.setTimeout(60000, () => req.destroy(new Error(`Timeout calling ${url}`)));
    req.on("error", reject);
  });
}

function normalizeSearch(payload) {
  const items = payload?.items || payload?.response?.items || [];
  const promptFor = (item) => (typeof item.prompt === "string" ? item.prompt.trim() : "");
  return {
    ok: true,
    count: Array.isArray(items) ? items.length : 0,
    items: Array.isArray(items) ? items.map((item) => ({
      case_id: item.case_id,
      slug: item.slug,
      title: item.title,
      category: item.category,
      categories: item.categories,
      keywords: item.keywords,
      prompt: promptFor(item),
      image_url: item.image_url,
      thumb_url: item.thumb_url,
      detail_url: item.detail_url,
      source: item.source,
    })) : [],
  };
}

function normalizeTemplates(payload) {
  const presets = payload?.templatePresets || payload?.response?.templatePresets || {};
  return {
    ok: true,
    count: Object.keys(presets).length,
    defaultTemplateKey: payload?.defaultTemplateKey || payload?.response?.defaultTemplateKey,
    templatePresets: presets,
    capabilities: payload?.capabilities || payload?.response?.capabilities || {},
    raw: payload,
  };
}

async function main() {
  const { global, command, args } = parseArgs(process.argv.slice(2));
  const baseUrl = cleanBaseUrl(global.baseUrl);
  let url;
  if (command === "search") {
    if (!args.query && !args.q) die("search requires --query.");
    url = `${baseUrl}/inspiration/search?${new URLSearchParams({ q: args.query || args.q, limit: args.limit || "5", ...(args.category ? { category: args.category } : {}), ...(args.offset ? { offset: args.offset } : {}) })}`;
    if (args.dryRun) {
      console.log(JSON.stringify({ ok: true, dry_run: true, endpoint: url }, null, 2));
      return;
    }
    console.log(JSON.stringify(normalizeSearch(await getJson(url)), null, 2));
    return;
  }
  if (command === "categories") {
    url = `${baseUrl}/inspiration/categories`;
    if (args.dryRun) {
      console.log(JSON.stringify({ ok: true, dry_run: true, endpoint: url }, null, 2));
      return;
    }
    console.log(JSON.stringify({ ok: true, response: await getJson(url) }, null, 2));
    return;
  }
  if (command === "case") {
    if (!args.caseId) die("case requires --case-id.");
    url = `${baseUrl}/inspiration/cases/${encodeURIComponent(args.caseId)}`;
    if (args.dryRun) {
      console.log(JSON.stringify({ ok: true, dry_run: true, endpoint: url }, null, 2));
      return;
    }
    console.log(JSON.stringify({ ok: true, response: await getJson(url) }, null, 2));
    return;
  }
  if (command === "templates") {
    url = `${baseUrl}/free-image/api/templates`;
    if (args.dryRun) {
      console.log(JSON.stringify({ ok: true, dry_run: true, endpoint: url }, null, 2));
      return;
    }
    console.log(JSON.stringify(normalizeTemplates(await getJson(url)), null, 2));
  }
}

main().catch((error) => die(error.message || String(error), 1));
