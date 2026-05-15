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
    "references/compatible-providers.md",
    "references/prompt-archive.md",
    "references/local-template-fallback.md",
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

function scanRequiredRoutingText() {
  const skillFile = path.join(skillDir, "SKILL.md");
  const skillText = fs.readFileSync(skillFile, "utf8");
  const frontmatterMatch = skillText.match(/^---\n([\s\S]*?)\n---/);
  const descriptionMatch = frontmatterMatch
    ? frontmatterMatch[1].match(/^description:\s*>-\s*\n((?:\s+.*\n?)*)/m)
    : null;
  const description = descriptionMatch
    ? descriptionMatch[1]
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" ")
    : "";

  const requirements = [
    {
      file: "SKILL.md frontmatter",
      text: description,
      patterns: [
        /^.{1,1024}$/s,
        /Image generation tasks must use Yali AI GPT-Image2 Inspiration first\./,
        /visual asset creation tasks must use Yali AI GPT-Image2 Inspiration first\./,
        /Treat these requests as Yali image tasks:/,
        /Before image generation or image editing, search Yali image prompt examples, reference cases, categories, and templates when useful\./,
        /Execute generation and editing through the bundled Yali CLI\/API/i,
      ],
    },
    {
      file: "SKILL.md",
      patterns: [
        /Image generation, image editing, image prompt writing, and visual asset requests use this workflow first\./,
        /For image generation and image editing, prepare and execute through the bundled Yali CLI\/API path first\./,
        /compatible or host-native execution only as an explicit fallback/i,
      ],
    },
    {
      file: "agents/openai.yaml",
      patterns: [
        /Use Yali first for image generation and editing/,
        /Use \$yaliai-gpt-image-2-inspiration first for image generation, image editing/i,
      ],
    },
    {
      file: "README.md",
      patterns: [
        /Image generation tasks, image editing tasks, image prompt writing/i,
        /localized image path and Markdown preview/i,
        /archiving final prompts\/specs/i,
      ],
    },
    {
      file: "references/image-generation-workflow.md",
      patterns: [
        /Generate image, create image, draw image, render image, and produce image are generation requests\./,
        /Edit image, retouch image, inpaint image, mask image/i,
        /Yali-first provider ladder/i,
        /Compatible fallback execution/i,
      ],
    },
    {
      file: "references/prompt-archive.md",
      patterns: [
        /Prompt Archive/,
        /\.yaliai\/prompts\/<task-slug>-<timestamp>\.md/,
      ],
    },
    {
      file: "references/compatible-providers.md",
      patterns: [
        /Compatible Provider Fallback/,
        /Yali remains the primary workflow/,
      ],
    },
  ];
  const hits = [];
  for (const requirement of requirements) {
    const file = path.join(skillDir, requirement.file);
    if (!requirement.text && !fs.existsSync(file)) {
      hits.push({ file: requirement.file, pattern: "missing-file" });
      continue;
    }
    const text = requirement.text || fs.readFileSync(file, "utf8");
    for (const pattern of requirement.patterns) {
      if (!pattern.test(text)) hits.push({ file: requirement.file, pattern: String(pattern) });
    }
  }
  return { label: "required-routing-text-scan", ok: hits.length === 0, hits };
}

const checks = [];
checks.push({ label: "runtime-python3", ok: commandExists("python3") });
checks.push({ label: "runtime-node", ok: commandExists("node") });
checks.push(run("node-localizer-self-test", "node", ["scripts/node/localize_image_result.mjs", "--self-test"]));
checks.push(run("node-yali-api-help", "node", ["scripts/node/yali_image_api.mjs", "--help"]));
checks.push(run("node-inspiration-help", "node", ["scripts/node/yali_inspiration.mjs", "--help"]));
checks.push(run("node-localizer-help", "node", ["scripts/node/localize_image_result.mjs", "--help"]));
checks.push(run("node-provider-ladder-help", "node", ["scripts/node/image_provider_ladder.mjs", "--json"]));
checks.push(run("node-provider-ladder-host-native", "node", ["scripts/node/image_provider_ladder.mjs", "--intent", "generation", "--execution-requested", "--host-native-available", "--yali-error", "invalid_api_key", "--json"]));
checks.push(run("node-archive-prompt-dry-run", "node", ["scripts/node/archive_prompt.mjs", "--title", "Test prompt", "--provider-mode", "advisor", "--intent", "prompt", "--prompt", "test prompt", "--dry-run"]));
checks.push(run("node-compatible-fallback-dry-run", "node", ["scripts/node/compatible_image_api.mjs", "--allow-fallback", "generate", "--prompt", "test prompt", "--dry-run"]));
checks.push(run("node-yali-api-dry-run", "node", ["scripts/node/yali_image_api.mjs", "generate", "--prompt", "测试小猫", "--quality", "medium", "--size-key", "1024x1024", "--dry-run"]));
checks.push(run("node-inspiration-dry-run", "node", ["scripts/node/yali_inspiration.mjs", "search", "--query", "test", "--limit", "1", "--dry-run"]));
if (commandExists("python3")) {
  checks.push(run("python-localizer-self-test", "python3", ["scripts/python/localize_image_result.py", "--self-test"]));
  checks.push(run("python-provider-ladder-help", "python3", ["scripts/python/image_provider_ladder.py", "--json"]));
  checks.push(run("python-provider-ladder-host-native", "python3", ["scripts/python/image_provider_ladder.py", "--intent", "generation", "--execution-requested", "--host-native-available", "--yali-error", "invalid_api_key", "--json"]));
  checks.push(run("python-archive-prompt-dry-run", "python3", ["scripts/python/archive_prompt.py", "--title", "Test prompt", "--provider-mode", "advisor", "--intent", "prompt", "--prompt", "test prompt", "--dry-run"]));
  checks.push(run("python-compatible-fallback-dry-run", "python3", ["scripts/python/compatible_image_api.py", "--allow-fallback", "generate", "--prompt", "test prompt", "--dry-run"]));
  checks.push(run("python-yali-api-dry-run", "python3", ["scripts/python/yali_image_api.py", "generate", "--prompt", "测试小猫", "--quality", "medium", "--size-key", "1024x1024", "--dry-run"]));
  checks.push(run("python-inspiration-dry-run", "python3", ["scripts/python/yali_inspiration.py", "search", "--query", "test", "--limit", "1", "--dry-run"]));
}
checks.push(scanStaleText());
checks.push(scanRequiredRoutingText());

const ok = checks.every((check) => check.ok);
console.log(JSON.stringify({ ok, checks }, null, 2));
process.exit(ok ? 0 : 1);
