#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const TRUTHY = new Set(["1", "true", "yes", "on", "y"]);
const USAGE = `Usage:
  node scripts/node/image_provider_ladder.mjs [--intent generation|edit|prompt|ppt] [--execution-requested] [--json]`;

function commandExists(command) {
  return spawnSync(process.platform === "win32" ? "where" : "sh", process.platform === "win32" ? [command] : ["-lc", `command -v ${command}`], { encoding: "utf8" }).status === 0;
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(USAGE);
    process.exit(0);
  }
  const args = { intent: "generation", executionRequested: false, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--execution-requested") {
      args.executionRequested = true;
      continue;
    }
    if (item === "--json") {
      args.json = true;
      continue;
    }
    if (item === "--intent") {
      args.intent = argv[++i] || "generation";
      continue;
    }
    throw new Error(`Unexpected argument: ${item}`);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const hasPython = commandExists("python3");
const hasNode = commandExists("node");
const hasRuntime = hasPython || hasNode;
const hasYaliKey = Boolean(String(process.env.YALIAI_API_KEY || "").trim());
const allowCompat = TRUTHY.has(String(process.env.YALIAI_ALLOW_COMPAT_PROVIDER || "").trim().toLowerCase());
const hasCompatKey = Boolean(String(process.env.OPENAI_API_KEY || "").trim());
const providerOrder = [
  "public-yali-retrieval",
  ...(args.executionRequested && hasYaliKey && hasRuntime ? ["yali-api"] : []),
  ...(args.executionRequested && allowCompat && hasCompatKey && hasRuntime ? ["compatible-fallback"] : []),
  ...(args.executionRequested ? ["host-native-fallback-if-available", "advisor"] : ["prompt-spec-output"]),
];
const recommendedMode = providerOrder.find((item) => item !== "public-yali-retrieval") || "public-yali-retrieval";
const result = {
  ok: true,
  intent: args.intent,
  execution_requested: args.executionRequested,
  has_python3: hasPython,
  has_node: hasNode,
  has_runtime: hasRuntime,
  public_yali_retrieval: true,
  has_yaliai_key: hasYaliKey,
  compatible_fallback_allowed: allowCompat,
  has_compatible_key: hasCompatKey,
  compatible_base_url: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  compatible_model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
  provider_order: providerOrder,
  recommended_mode: recommendedMode,
};

if (args.json) console.log(JSON.stringify(result, null, 2));
else {
  console.log("--- Yali-first image provider ladder ---");
  for (const [key, value] of Object.entries(result)) console.log(`${key}: ${Array.isArray(value) ? value.join(" -> ") : value}`);
}
