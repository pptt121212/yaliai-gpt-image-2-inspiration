#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const USAGE = `Usage:
  node scripts/node/archive_prompt.mjs --title TEXT --provider-mode MODE --intent INTENT --prompt TEXT [options]
  node scripts/node/archive_prompt.mjs --title TEXT --provider-mode MODE --intent INTENT --prompt-file FILE [options]

Options:
  --out-dir DIR                 Base output directory (default: ./.yaliai)
  --slug TEXT                   File slug override
  --template-key KEY            Yali template key or none
  --fallback-template TEXT      Local fallback category/template or none
  --size TEXT                   Size/aspect description
  --quality TEXT                Quality level
  --search-query TEXT           Repeatable Yali search query
  --reference-case TEXT         Repeatable case id/title/url summary
  --edit-spec TEXT              Optional edit spec
  --metadata-json JSON          Extra metadata object
  --dry-run                     Print output plan without writing files`;

function die(message, code = 2) {
  console.error(JSON.stringify({ ok: false, error: message }));
  process.exit(code);
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(USAGE);
    process.exit(0);
  }
  const args = { searchQuery: [], referenceCase: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) die(`Unexpected argument: ${item}`);
    const key = item.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (key === "dryRun") {
      args.dryRun = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) die(`Missing value for ${item}`);
    if (key === "searchQuery") args.searchQuery.push(value);
    else if (key === "referenceCase") args.referenceCase.push(value);
    else args[key] = value;
    i += 1;
  }
  return args;
}

function slugify(value) {
  const slug = String(value || "yali-image-task")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  return (slug || "yali-image-task").slice(0, 80);
}

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function readPrompt(args) {
  if (args.promptFile) return fs.readFileSync(args.promptFile, "utf8").trim();
  return String(args.prompt || "").trim();
}

function metadataFromJson(value) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    die("--metadata-json must be a JSON object.");
  }
}

function renderMarkdown(data) {
  const lines = [
    `# ${data.title}`,
    "",
    `Provider mode: ${data.provider_mode}`,
    `Intent: ${data.intent}`,
    `Template: ${data.template_key || "none"}`,
    `Fallback template: ${data.fallback_template || "none"}`,
    `Size/aspect: ${data.size || "unspecified"}`,
    `Quality: ${data.quality || "unspecified"}`,
    "",
    "## Yali References",
    "",
  ];
  if (data.search_queries.length) for (const query of data.search_queries) lines.push(`- Query: ${query}`);
  if (data.reference_cases.length) for (const item of data.reference_cases) lines.push(`- Case: ${item}`);
  if (!data.search_queries.length && !data.reference_cases.length) lines.push("- none");
  lines.push("", "## Final Prompt", "", data.prompt);
  if (data.edit_spec) lines.push("", "## Edit Spec", "", data.edit_spec);
  return `${lines.join("\n")}\n`;
}

const args = parseArgs(process.argv.slice(2));
const prompt = readPrompt(args);
if (!prompt) die("Prompt is required. Use --prompt or --prompt-file.");

const title = String(args.title || "Yali image task").trim();
const baseDir = path.resolve(args.outDir || ".yaliai");
const name = `${slugify(args.slug || title)}-${timestamp()}`;
const promptPath = path.join(baseDir, "prompts", `${name}.md`);
const runPath = path.join(baseDir, "runs", `${name}.json`);
const data = {
  ok: true,
  title,
  provider_mode: args.providerMode || "advisor",
  intent: args.intent || "prompt",
  template_key: args.templateKey || null,
  fallback_template: args.fallbackTemplate || null,
  size: args.size || null,
  quality: args.quality || null,
  search_queries: args.searchQuery,
  reference_cases: args.referenceCase,
  prompt,
  edit_spec: args.editSpec || "",
  prompt_path: promptPath,
  run_path: runPath,
  ...metadataFromJson(args.metadataJson),
};
const markdown = renderMarkdown(data);

if (!args.dryRun) {
  fs.mkdirSync(path.dirname(promptPath), { recursive: true });
  fs.mkdirSync(path.dirname(runPath), { recursive: true });
  fs.writeFileSync(promptPath, markdown, "utf8");
  fs.writeFileSync(runPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ ok: true, dry_run: Boolean(args.dryRun), prompt_path: promptPath, run_path: runPath, markdown }, null, 2));
