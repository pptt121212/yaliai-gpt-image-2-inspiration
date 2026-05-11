#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const skillName = 'yaliai-gpt-image-2-inspiration';
const args = process.argv.slice(2);
const commandOrTarget = args[0] || 'install';
const allowedCommands = new Set(['install', 'sync']);

let command = commandOrTarget;
let targetArgs = args.slice(1);
if (!allowedCommands.has(commandOrTarget)) {
  command = 'install';
  targetArgs = args;
}

const usage = [
  'Usage: yaliai-gpt-image-2-inspiration install [all|codex|claude-code|opencode|gemini|agents]',
  'Examples:',
  '  yaliai-gpt-image-2-inspiration install all',
  '  yaliai-gpt-image-2-inspiration install codex',
  '  yaliai-gpt-image-2-inspiration install claude-code'
].join('\n');

if (!allowedCommands.has(command)) {
  console.error(usage);
  process.exit(1);
}

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const entries = ['SKILL.md', 'agents', 'references', 'scripts'];
const targetDefinitions = {
  codex: {
    label: 'Codex',
    root: join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'skills')
  },
  'claude-code': {
    label: 'Claude Code',
    root: join(process.env.CLAUDE_HOME || join(homedir(), '.claude'), 'skills')
  },
  opencode: {
    label: 'OpenCode',
    root: join(process.env.OPENCODE_HOME || join(homedir(), '.opencode'), 'skills')
  },
  gemini: {
    label: 'Gemini CLI',
    root: join(process.env.GEMINI_HOME || join(homedir(), '.gemini'), 'skills')
  },
  agents: {
    label: 'Shared agent skills',
    root: join(process.env.AGENTS_HOME || join(homedir(), '.agents'), 'skills')
  }
};
const targetAliases = {
  all: Object.keys(targetDefinitions),
  codex: ['codex'],
  claude: ['claude-code'],
  'claude-code': ['claude-code'],
  opencode: ['opencode'],
  gemini: ['gemini'],
  agents: ['agents'],
  shared: ['agents']
};

for (const entry of entries) {
  const source = join(packageRoot, entry);
  if (!existsSync(source)) {
    throw new Error(`Missing package entry: ${entry}`);
  }
}

function shouldCopy(source) {
  return !source.includes('__pycache__') && !source.endsWith('.pyc');
}

function selectedTargets(rawTargets) {
  const names = rawTargets.length ? rawTargets : ['all'];
  const selected = new Set();

  for (const name of names) {
    const normalized = name.toLowerCase();
    const matches = targetAliases[normalized];
    if (!matches) {
      console.error(usage);
      throw new Error(`Unknown target: ${name}`);
    }
    for (const match of matches) selected.add(match);
  }

  return [...selected].map((name) => targetDefinitions[name]);
}

for (const targetDefinition of selectedTargets(targetArgs)) {
  const target = join(targetDefinition.root, skillName);
  mkdirSync(targetDefinition.root, { recursive: true });
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });

  for (const entry of entries) {
    cpSync(join(packageRoot, entry), join(target, entry), { recursive: true, filter: shouldCopy });
  }

  console.log(`Installed ${skillName} for ${targetDefinition.label}: ${target}`);
}
