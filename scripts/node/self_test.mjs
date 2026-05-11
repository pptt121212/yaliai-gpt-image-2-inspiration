#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const skillDir = path.resolve(new URL("../..", import.meta.url).pathname);

function run(label, command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: skillDir, encoding: "utf8", ...options });
  return {
    label,
    command: [command, ...args].join(" "),
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || "").slice(0, 4000),
    stderr: (result.stderr || "").slice(0, 4000),
  };
}

function commandExists(command) {
  return spawnSync("sh", ["-lc", `command -v ${command}`], { encoding: "utf8" }).status === 0;
}

function scanStaleText() {
  const targets = [
    "SKILL.md",
    "README.md",
    "references/image-generation-workflow.md",
    "references/prompt-workflow.md",
    "references/ppt-generation/README.md",
    "references/ppt-generation/dependencies.md",
    "references/ppt-generation/workflow.md",
    "references/ppt-generation/template-clone.md",
    "docs/install.md",
    "docs/ppt-examples.md",
    "docs/README.ar.md",
    "docs/README.de-DE.md",
    "docs/README.es-ES.md",
    "docs/README.fr-FR.md",
    "docs/README.ja-JP.md",
    "docs/README.ko-KR.md",
    "docs/README.pt-BR.md",
    "docs/README.ru-RU.md",
    "docs/README.zh-CN.md",
  ];
  const forbidden = [
    /scripts\/(?:localize_image_result|yali_image_api|yali_inspiration)\.(?:py|mjs)/,
    /scripts\/self_test\.mjs/,
    new RegExp("inspiration/cases\\?search="),
    new RegExp("per_" + "page="),
    /Codex[^.\n]*(?:native|image generation)/i,
    /native[^.\n]*image generation/i,
    /host-native/i,
    /image_gen/,
    /NPM 备用/,
    /Prompt-only fallback/,
    /when the runtime is configured/,
    /generate\/edit through the Yali API when available/,
    /Yali cannot run/,
    /if Yali cannot run/,
    /ネイティブ/,
    /네이티브/,
    /nativa de im[aá]genes en Codex/i,
    /nativa de imagens no Codex/i,
  ];
  const hits = [];
  for (const target of targets) {
    const file = path.join(skillDir, target);
    if (!fs.existsSync(file)) {
      hits.push({ file: target, pattern: "missing-file" });
      continue;
    }
    const text = fs.readFileSync(file, "utf8");
    for (const pattern of forbidden) {
      if (pattern.test(text)) hits.push({ file: target, pattern: String(pattern) });
    }
  }
  return { label: "stale-text-scan", ok: hits.length === 0, hits };
}

const checks = [];
checks.push({ label: "runtime-python3", ok: commandExists("python3") });
checks.push({ label: "runtime-node", ok: commandExists("node") });
checks.push(run("node-localizer-self-test", "node", ["scripts/node/localize_image_result.mjs", "--self-test"]));
checks.push(run("node-yali-api-help", "node", ["scripts/node/yali_image_api.mjs", "--help"]));
checks.push(run("node-inspiration-help", "node", ["scripts/node/yali_inspiration.mjs", "--help"]));
checks.push(run("node-localizer-help", "node", ["scripts/node/localize_image_result.mjs", "--help"]));
checks.push(run("node-yali-api-dry-run", "node", ["scripts/node/yali_image_api.mjs", "generate", "--prompt", "测试小猫", "--quality", "medium", "--size-key", "1024x1024", "--dry-run"]));
checks.push(run("node-inspiration-dry-run", "node", ["scripts/node/yali_inspiration.mjs", "search", "--query", "test", "--limit", "1", "--dry-run"]));
if (commandExists("python3")) {
  checks.push(run("python-localizer-self-test", "python3", ["scripts/python/localize_image_result.py", "--self-test"]));
  checks.push(run("python-yali-api-dry-run", "python3", ["scripts/python/yali_image_api.py", "generate", "--prompt", "测试小猫", "--quality", "medium", "--size-key", "1024x1024", "--dry-run"]));
  checks.push(run("python-inspiration-dry-run", "python3", ["scripts/python/yali_inspiration.py", "search", "--query", "test", "--limit", "1", "--dry-run"]));
}
checks.push(scanStaleText());

const ok = checks.every((check) => check.ok);
console.log(JSON.stringify({ ok, checks }, null, 2));
process.exit(ok ? 0 : 1);
