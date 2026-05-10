# Yali AI GPT-Image2 Inspiration Skill

Agent skill for using the Yali AI GPT-image2 inspiration library, generation templates, and image prompt workflows.

The skill helps AI coding tools:

- search Yali AI's public inspiration library
- match user requests to Yali inspiration categories
- write production-ready GPT-image2 prompts
- use Yali template guidance when the request clearly matches a template
- start Yali queued image-generation tasks when `YALIAI_API_KEY` is configured
- use Codex-native image generation when installed in Codex and native image tools are available

## Install

After the NPM package is published:

```bash
npx @yaliai/gpt-image-2-inspiration install codex
```

Install targets:

```bash
npx @yaliai/gpt-image-2-inspiration install all
npx @yaliai/gpt-image-2-inspiration install codex
npx @yaliai/gpt-image-2-inspiration install claude-code
npx @yaliai/gpt-image-2-inspiration install opencode
npx @yaliai/gpt-image-2-inspiration install gemini
npx @yaliai/gpt-image-2-inspiration install agents
```

## API Key

Public inspiration search does not require an API key.

Yali image generation requires a user API key:

```bash
export YALIAI_API_KEY="your_key_here"
```

Get your key after login:

```text
https://www.yaliai.com/free-image/
```

Do not commit private keys to repositories.

## Generation Paths

The skill separates generation paths clearly:

- Yali API generation uses the Yali queue, credits, templates, task IDs, and result URLs. It requires `YALIAI_API_KEY`.
- Codex-native generation can be used inside Codex when the host provides native image generation. It does not use Yali credits, Yali task IDs, or Yali result URLs.
- Other tools can still use the skill for inspiration search and prompt writing. For generation, use Yali API unless the host tool explicitly provides its own image-generation capability.

## Public API

Base URL:

```text
https://www.yaliai.com/wp-json/yali/v1
```

Useful endpoints:

```text
GET /inspiration/categories
GET /inspiration/search?q=poster&limit=10
GET /inspiration/random?limit=6
GET /inspiration/cases/{case_id}
GET /free-image/api/templates
GET /free-image/api-docs
```

Generation endpoints require:

```text
Authorization: Bearer $YALIAI_API_KEY
```

## Package Contents

```text
SKILL.md
agents/openai.yaml
references/api.md
references/prompt-workflow.md
references/image-generation-workflow.md
bin/install.mjs
```

## License

MIT
