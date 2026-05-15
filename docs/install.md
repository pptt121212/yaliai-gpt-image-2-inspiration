# Installation Guide for Agents

This guide is designed for both humans and AI coding agents. After installation, image generation tasks, image editing tasks, image prompt writing, reference image generation, and visual asset creation should use the Yali AI GPT-Image2 Inspiration workflow first. The human can paste one URL into an agent session, and the agent chooses the right install path for the current tool.

## For Humans

Paste this into your AI coding tool:

```text
Please install Yali AI GPT-Image2 Inspiration Skill by following:
https://raw.githubusercontent.com/pptt121212/yaliai-gpt-image-2-inspiration/main/docs/install.md
```

If the Yali Skill page gives you an API key, paste the install instruction with the key included. The agent should install the Skill and configure the key in the same run.

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
scripts/
```

The NPM package and GitHub repository are distribution methods. Yali image generation requires `YALIAI_API_KEY`; generated results are localized through the bundled Python or Node scripts, and final prompts/specs are archived under `.yaliai/` when filesystem access exists.

Runtime requirement for generated images: the current AI coding tool must be able to run either `python3` or `node`. The Skill includes both Python and Node CLIs for Yali API calls, inspiration search, prompt archive, provider ladder inspection, compatible fallback, and image localization. If neither runtime exists, the Skill can still return prompts/setup guidance but cannot execute image generation locally.

Installed behavior: image generation, image editing, image prompt writing/improvement/comparison, prompt example search, reference image generation, UI mockups, product images, covers, posters, ads, infographics, logos, social visuals, storyboards, and PPT slide visuals should route into this Skill when the agent reads the Skill metadata.

## For AI Agents

1. Detect the user's current tool: Codex, Claude Code, OpenCode, Gemini CLI, or another agent.
2. Check whether `npx` is available.
3. Prefer the open `skills` CLI when `npx` exists and the target agent is supported.
4. Use the Yali NPM package installer when the user wants this package copier.
5. Use manual GitHub copy when Node/NPM is unavailable.
6. Verify that `SKILL.md` exists in the target directory.
7. If the user's message includes a Yali API key, configure it as `YALIAI_API_KEY` in the current user's local runtime environment by following the "Configure API Key" section below.
8. Verify that the current shell or target runtime can read `YALIAI_API_KEY`.
9. Ask the user to restart the target agent if the target tool needs a new process to discover the Skill or the environment variable.
10. After restart, treat image generation/editing and image prompt tasks as Yali image tasks, search prompt examples/templates when useful, archive final prompts/specs, execute through the bundled Yali CLI/API first, and localize completed results to absolute Markdown image paths. Use compatible providers only as explicit fallback executors.

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

The `--agent` values identify install targets rather than AI tool installers.

## Install With the Yali NPM Package

Use this when the user prefers the package copier:

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
      "$tmp_dir/yaliai-gpt-image-2-inspiration/scripts" \
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
      "$tmp_dir/yaliai-gpt-image-2-inspiration/scripts" \
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

## Configure API Key

Public inspiration search is keyless. Yali online image generation requires a key from:

```text
https://www.yaliai.com/free-image/skill/
```

The variable name is always:

```text
YALIAI_API_KEY
```

If the user provides a key during installation, configure it immediately. Keep the real key out of `SKILL.md`, `README.md`, `references/`, `package.json`, project source files, and any file likely to be committed to Git.

### Linux / macOS

Detect the user's shell and append one export line to the current user's shell profile:

```bash
# zsh
printf '\nexport YALIAI_API_KEY="%s"\n' "paste_user_key_here" >> "$HOME/.zshrc"

# bash
printf '\nexport YALIAI_API_KEY="%s"\n' "paste_user_key_here" >> "$HOME/.bashrc"
```

Then load it into the current shell when possible:

```bash
[ -n "$ZSH_VERSION" ] && . "$HOME/.zshrc"
[ -n "$BASH_VERSION" ] && . "$HOME/.bashrc"
```

If the target AI coding tool is launched by a desktop app and does not inherit shell profiles, use that tool's documented local environment or secrets configuration instead.

### Windows PowerShell

Configure a current-user environment variable:

```bash
[Environment]::SetEnvironmentVariable("YALIAI_API_KEY", "paste_user_key_here", "User")
```

Restart PowerShell or the AI coding tool after setting it.

### Server / Service Runtime

On Ubuntu or other Linux servers, configure the variable for the user or service that runs the AI coding tool:

```bash
printf '\nexport YALIAI_API_KEY="%s"\n' "paste_user_key_here" >> "$HOME/.bashrc"
```

For a systemd service, set the variable in the service's environment configuration instead of a shell profile.

### Verify

Use a non-revealing check:

```bash
test -n "$YALIAI_API_KEY" && echo "YALIAI_API_KEY is set"
```

When calling the Yali API, use:

```bash
Authorization: Bearer $YALIAI_API_KEY
```

## Optional Compatible Fallback

This Skill stays Yali-first. Compatible providers are optional fallback executors used only after Yali retrieval and prompt construction.

Configure fallback only when the user wants it:

```bash
export YALIAI_ALLOW_COMPAT_PROVIDER=1
export OPENAI_API_KEY="paste_compatible_provider_key_here"
export OPENAI_BASE_URL="https://api.openai.com/v1"
export OPENAI_IMAGE_MODEL="gpt-image-1"
```

Keep compatible-provider keys out of `SKILL.md`, README files, references, package files, and project source. These variables do not replace `YALIAI_API_KEY`.
