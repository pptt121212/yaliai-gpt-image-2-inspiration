---
name: yaliai-gpt-image-2-inspiration
description: Use Yali AI's public GPT-image2 inspiration library, template guidance, and optional image generation paths to search visual references, choose categories, rewrite image prompts, and start queued Yali API image tasks. Use when the user asks for image prompt inspiration, Yali inspiration cases, GPT-image2 prompt writing, image generation through Yali AI, Codex-native image generation using Yali inspiration, or category/style matching from the Yali AI library.
---

# Yali AI GPT-Image2 Inspiration

Use this skill to search the Yali AI inspiration library, turn user intent into a production-ready image prompt, and optionally generate images through either the Yali queued API or a host tool's native image capability.

Do not include or invent private API keys. Yali API generation requires the user's own key from `https://www.yaliai.com/free-image/`, preferably configured as `YALIAI_API_KEY`. Codex-native image generation may not need a Yali key, but that only applies inside hosts that already provide native image tools.

## References

- Read `references/api.md` when calling the Yali AI API or explaining setup.
- Read `references/prompt-workflow.md` when choosing categories, adapting inspiration cases, or writing final prompts.
- Read `references/image-generation-workflow.md` when deciding between prompt-only, Yali queued generation, Codex-native generation, edits, batches, sizes, or quality settings.

## Core Workflow

1. Detect the user's language and respond in that language.
2. Identify whether the user wants:
   - inspiration search only
   - prompt rewriting or prompt creation
   - category/style matching
   - actual image generation
3. For inspiration search, use the public API. No API key is needed.
4. For prompt work, search or reference matching cases first, then write an original prompt adapted to the user's subject.
5. For actual image generation, choose the execution path before writing commands:
   - Use Yali queued API when the user asks for Yali generation, account/credit tracking, website-consistent templates, public API behavior, or provides `YALIAI_API_KEY`.
   - Use Codex-native generation only when running in Codex or another host that explicitly provides native image generation and the user does not require the Yali queued API.
   - If neither path is available, return the final prompt and key/setup instructions.
6. For clear template-shaped use cases, read `/free-image/api/templates`, select the matching `template_key`, and use that template's fixed size or size options when appropriate. If the request does not clearly match a template, generate without `template_key`.
7. For Yali API generation, require `YALIAI_API_KEY` or an explicit user-provided key. Never store the key in generated project files unless the user explicitly asks for local environment setup.
8. Start Yali generation through the queued API and return the `task_id`. Poll status every 2-3 seconds if the user asks you to wait for completion.
9. If generation is complete, return the image URL and relevant metadata.

## Output Defaults

- Put the useful result first: prompt, case list, or task result.
- Include case IDs and links when using references.
- Keep prompts concrete: subject, composition, style, materials, lighting, text requirements, size/aspect ratio, constraints, and negatives.
- If the user's request is vague, present 2-3 direction options before generating.
- If the user's request clearly matches a template, state the selected template key and use the template's constraints in the generation request. Do not force a template for broad or ambiguous creative requests.
- If no Yali API key is configured, use host-native image generation only when the host provides it and the user accepts that path. Otherwise provide the final prompt and instructions for where to get a key.

## API Key Rules

- Never embed a real API key in `SKILL.md`, references, GitHub examples, NPM package files, or generated code samples.
- Use `$YALIAI_API_KEY` in examples.
- Tell users to get their own key from `https://www.yaliai.com/free-image/` after login.
- Prefer environment variables over hardcoded key strings.
- Do not imply that an NPM install creates a universal image-generation backend. The package installs the agent skill; generation still depends on either the Yali API key or the host's native image capability.
