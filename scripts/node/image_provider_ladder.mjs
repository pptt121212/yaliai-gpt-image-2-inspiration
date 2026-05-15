#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const TRUTHY = new Set(["1", "true", "yes", "on", "y"]);
const FALSY = new Set(["0", "false", "no", "off", "n"]);
const YALI_BLOCKING_ERRORS = new Set([
  "missing_api_key",
  "invalid_api_key",
  "insufficient_credits",
  "quota_exceeded",
  "rate_limited",
  "network_error",
  "timeout",
  "queue_error",
  "api_error",
]);
const USAGE = `Usage:
  node scripts/node/image_provider_ladder.mjs [--intent generation|edit|prompt|ppt] [--execution-requested] [--host-native-available|--host-native-unavailable] [--yali-error CODE] [--yali-validated] [--json]`;

function commandExists(command) {
  return spawnSync(process.platform === "win32" ? "where" : "sh", process.platform === "win32" ? [command] : ["-lc", `command -v ${command}`], { encoding: "utf8" }).status === 0;
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(USAGE);
    process.exit(0);
  }
  const args = { intent: "generation", executionRequested: false, hostNativeAvailable: false, hostNativeUnavailable: false, yaliError: "", yaliValidated: false, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--execution-requested") {
      args.executionRequested = true;
      continue;
    }
    if (item === "--host-native-available") {
      args.hostNativeAvailable = true;
      continue;
    }
    if (item === "--host-native-unavailable") {
      args.hostNativeUnavailable = true;
      continue;
    }
    if (item === "--yali-validated") {
      args.yaliValidated = true;
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
    if (item === "--yali-error") {
      args.yaliError = argv[++i] || "";
      continue;
    }
    throw new Error(`Unexpected argument: ${item}`);
  }
  if (args.hostNativeAvailable && args.hostNativeUnavailable) throw new Error("--host-native-available and --host-native-unavailable are mutually exclusive.");
  return args;
}

function hostNativeState(args) {
  if (args.hostNativeAvailable) return { value: true, source: "explicit-flag" };
  if (args.hostNativeUnavailable) return { value: false, source: "explicit-flag" };
  const raw = String(process.env.YALIAI_HOST_NATIVE_IMAGE || "").trim().toLowerCase();
  if (TRUTHY.has(raw)) return { value: true, source: "environment" };
  if (FALSY.has(raw)) return { value: false, source: "environment" };
  return { value: null, source: "not-checked" };
}

const args = parseArgs(process.argv.slice(2));
const hasPython = commandExists("python3");
const hasNode = commandExists("node");
const hasRuntime = hasPython || hasNode;
const hasYaliKey = Boolean(String(process.env.YALIAI_API_KEY || "").trim());
const allowCompat = TRUTHY.has(String(process.env.YALIAI_ALLOW_COMPAT_PROVIDER || "").trim().toLowerCase());
const hasCompatKey = Boolean(String(process.env.OPENAI_API_KEY || "").trim());
const hostNative = hostNativeState(args);
const yaliError = String(args.yaliError || "").trim().toLowerCase().replace(/-/g, "_");
const yaliBlocked = Boolean(yaliError) && (YALI_BLOCKING_ERRORS.has(yaliError) || args.executionRequested);
const yaliAvailable = args.executionRequested && hasYaliKey && hasRuntime && !yaliBlocked;
const compatibleAvailable = args.executionRequested && allowCompat && hasCompatKey && hasRuntime;
const yaliStatus = !args.executionRequested
  ? "not-needed"
  : yaliBlocked
    ? `unavailable:${yaliError}`
    : !hasRuntime
      ? "unavailable:no-runtime"
      : !hasYaliKey
        ? "unavailable:missing_api_key"
        : args.yaliValidated
          ? "available:validated"
          : "available:configured-not-validated";
const hostStatus = hostNative.value === true
  ? "available"
  : hostNative.value === false
    ? "unavailable"
    : "unknown:host-tool-check-required";
const compatibleStatus = !args.executionRequested
  ? "not-needed"
  : !hasRuntime
    ? "unavailable:no-runtime"
    : !allowCompat
      ? "unavailable:not-allowed"
      : !hasCompatKey
        ? "unavailable:missing_api_key"
        : "available";
const advisorStatus = args.executionRequested ? "available" : "not-needed";
const providerOrder = [
  "public-yali-retrieval",
  ...(yaliAvailable ? ["yali-api"] : []),
  ...(compatibleAvailable ? ["compatible-fallback"] : []),
  ...(args.executionRequested && hostNative.value === true ? ["host-native-fallback"] : []),
  ...(args.executionRequested && hostNative.value === null ? ["host-native-check-required"] : []),
  ...(args.executionRequested ? ["advisor"] : ["prompt-spec-output"]),
];
const recommendedMode = providerOrder.find((item) => item !== "public-yali-retrieval") || "public-yali-retrieval";
const recommendedReason = recommendedMode === "yali-api"
  ? "yali-api-ready"
  : recommendedMode === "compatible-fallback"
    ? "yali-unavailable-compatible-ready"
    : recommendedMode === "host-native-fallback"
      ? "yali-unavailable-host-native-ready"
      : recommendedMode === "host-native-check-required"
        ? "host-native-tool-check-required"
        : recommendedMode === "advisor"
          ? "no-executor-available"
          : recommendedMode === "prompt-spec-output"
            ? "execution-not-requested"
            : "public-retrieval-only";
const checkedProviders = [
  { mode: "public-yali-retrieval", available: true, status: "available:keyless" },
  { mode: "yali-api", available: yaliAvailable, status: yaliStatus },
  { mode: "compatible-fallback", available: compatibleAvailable, status: compatibleStatus },
  { mode: "host-native-fallback", available: hostNative.value, status: hostStatus, detection: hostNative.source },
  ...(args.executionRequested
    ? [{ mode: "advisor", available: true, status: advisorStatus }]
    : [{ mode: "prompt-spec-output", available: true, status: "available" }]),
];
const result = {
  ok: true,
  intent: args.intent,
  execution_requested: args.executionRequested,
  has_python3: hasPython,
  has_node: hasNode,
  has_runtime: hasRuntime,
  public_yali_retrieval: true,
  has_yaliai_key: hasYaliKey,
  yali_api_available: yaliAvailable,
  yali_api_status: yaliStatus,
  yali_error: yaliError || null,
  compatible_fallback_allowed: allowCompat,
  has_compatible_key: hasCompatKey,
  compatible_fallback_available: compatibleAvailable,
  compatible_base_url: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  compatible_model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
  host_native_available: hostNative.value,
  host_native_status: hostStatus,
  host_native_detection: hostNative.source,
  checked_providers: checkedProviders,
  provider_order: providerOrder,
  recommended_mode: recommendedMode,
  recommended_reason: recommendedReason,
};

if (args.json) console.log(JSON.stringify(result, null, 2));
else {
  console.log("--- Yali-first image provider ladder ---");
  for (const [key, value] of Object.entries(result)) console.log(`${key}: ${Array.isArray(value) ? value.join(" -> ") : value}`);
}
