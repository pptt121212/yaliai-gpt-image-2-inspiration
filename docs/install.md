# Installation Guide for Agents

This guide is designed for both humans and AI coding agents. It borrows the useful structure of agent-first installation guides: the human can paste one URL into an agent session, and the agent chooses the right install path for the current tool. The commands here are specific to this Yali AI Skill.

## For Humans

Paste this into your AI coding tool:

```text
Please install Yali AI GPT-Image2 Inspiration Skill by following:
https://raw.githubusercontent.com/pptt121212/yaliai-gpt-image-2-inspiration/main/docs/install.md
```

After installation, restart the agent session so the new Skill metadata can be discovered.

## What Gets Installed

The Skill folder is named:

```text
yaliai-gpt-image-2-inspiration
```

It contains:

```text
SKILL.md
agents/
references/
```

The NPM package and GitHub repository are only distribution methods. Installing this Skill does not create a private image backend. Yali image generation still requires `YALIAI_API_KEY`; Codex-native image generation only works in hosts that already provide native image generation.

## For AI Agents

1. Detect the user's current tool: Codex, Claude Code, OpenCode, Gemini CLI, or another agent.
2. Check whether `npx` is available.
3. Prefer the open `skills` CLI when `npx` exists and the target agent is supported.
4. Use the Yali NPM fallback when the user wants this package's built-in installer.
5. Use manual GitHub copy when Node/NPM is unavailable.
6. Verify that `SKILL.md` exists in the target directory.
7. Ask the user to restart the target agent.

### Target Directories

Use these default global directories unless the user's tool documents a different path or an environment variable overrides it:

| Tool | Target directory |
| --- | --- |
| Codex | `~/.codex/skills/yaliai-gpt-image-2-inspiration` |
| Claude Code | `~/.claude/skills/yaliai-gpt-image-2-inspiration` |
| OpenCode | `~/.opencode/skills/yaliai-gpt-image-2-inspiration` |
| Gemini CLI | `~/.gemini/skills/yaliai-gpt-image-2-inspiration` |
| Shared agents | `~/.agents/skills/yaliai-gpt-image-2-inspiration` |

The package installer also respects `CODEX_HOME`, `CLAUDE_HOME`, `OPENCODE_HOME`, `GEMINI_HOME`, and `AGENTS_HOME`.

## Install With the Skills CLI

Use this when `npx` is available and the user wants a multi-agent install from GitHub:

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

Codex only:

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent codex --global --yes --copy
```

Claude Code only:

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code --global --yes --copy
```

The `--agent` values are install targets. They do not install those AI tools.

## Install With the Yali NPM Package

Use this when the user prefers the package's built-in copier:

```bash
npx @yaliai/gpt-image-2-inspiration install codex
```

Other targets:

```bash
npx @yaliai/gpt-image-2-inspiration install claude-code
npx @yaliai/gpt-image-2-inspiration install opencode
npx @yaliai/gpt-image-2-inspiration install gemini
npx @yaliai/gpt-image-2-inspiration install agents
npx @yaliai/gpt-image-2-inspiration install all
```

If the terminal says `npx: command not found`, use the manual GitHub copy path below or install Node.js first.

## Install Without NPM

Use this when Node/NPM is unavailable. Replace the target directory if the user's tool uses a custom skill path.

```bash
tmp_dir="$(mktemp -d)"
git clone https://github.com/pptt121212/yaliai-gpt-image-2-inspiration.git "$tmp_dir/yaliai-gpt-image-2-inspiration"
mkdir -p ~/.codex/skills/yaliai-gpt-image-2-inspiration
cp -R "$tmp_dir/yaliai-gpt-image-2-inspiration/SKILL.md" \
      "$tmp_dir/yaliai-gpt-image-2-inspiration/agents" \
      "$tmp_dir/yaliai-gpt-image-2-inspiration/references" \
      ~/.codex/skills/yaliai-gpt-image-2-inspiration/
rm -rf "$tmp_dir"
```

OpenCode manual target:

```bash
tmp_dir="$(mktemp -d)"
git clone https://github.com/pptt121212/yaliai-gpt-image-2-inspiration.git "$tmp_dir/yaliai-gpt-image-2-inspiration"
mkdir -p ~/.opencode/skills/yaliai-gpt-image-2-inspiration
cp -R "$tmp_dir/yaliai-gpt-image-2-inspiration/SKILL.md" \
      "$tmp_dir/yaliai-gpt-image-2-inspiration/agents" \
      "$tmp_dir/yaliai-gpt-image-2-inspiration/references" \
      ~/.opencode/skills/yaliai-gpt-image-2-inspiration/
rm -rf "$tmp_dir"
```

## Verify

Run the check for the target you installed:

```bash
test -f ~/.codex/skills/yaliai-gpt-image-2-inspiration/SKILL.md && echo "Codex Skill installed"
test -f ~/.claude/skills/yaliai-gpt-image-2-inspiration/SKILL.md && echo "Claude Code Skill installed"
test -f ~/.opencode/skills/yaliai-gpt-image-2-inspiration/SKILL.md && echo "OpenCode Skill installed"
test -f ~/.gemini/skills/yaliai-gpt-image-2-inspiration/SKILL.md && echo "Gemini Skill installed"
```

Restart the agent after the file exists.

## Optional API Key

Public inspiration search does not require a key. Yali online image generation requires a key from:

```text
https://www.yaliai.com/free-image/skill/
```

Configure it as an environment variable:

```bash
export YALIAI_API_KEY="your_key_here"
```

Do not write a private key into a repository, README, package file, or shared prompt.
