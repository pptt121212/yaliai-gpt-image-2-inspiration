---
name: yaliai-gpt-image-2-inspiration
description: Use Yali AI's public GPT-image2 inspiration library, category matching, template guidance, prompt writing, image generation/edit routing, and PPT/slide visual workflow routing. Use when the user asks to search or compare Yali inspiration cases/prompts/images, choose Yali categories or templates, write or improve image prompts, generate a new image, edit/transform an existing image, create social or marketing visuals such as WeChat official account covers, Xiaohongshu covers, video covers, article hero images, posters, banners, ads, product visuals, UI mockups, infographics, storyboards, logos/brand visuals, or create PPT/slides/decks where Yali visual generation should support a dedicated PPT workflow. This skill should run before calling a host-native image tool when the request needs Yali inspiration, template selection, prompt shaping, or provider choice.
---

# Yali AI GPT-Image2 Inspiration

Use this skill to search the Yali AI inspiration library, turn user intent into a production-ready image prompt, choose templates when appropriate, and route generation or editing through either the Yali queued API, the host tool's native image capability, or a prompt-only fallback.

Do not include or invent private API keys. Yali API generation requires the user's own key from `https://www.yaliai.com/free-image/`, preferably configured as `YALIAI_API_KEY`. Codex-native image generation may not need a Yali key, but that only applies inside hosts that already provide native image tools.

## References

- Read `references/api.md` when calling the Yali AI API or explaining setup.
- Read `references/prompt-workflow.md` when choosing categories, adapting inspiration cases, or writing final prompts.
- Read `references/image-generation-workflow.md` when deciding between prompt-only, Yali queued generation, Codex-native generation, edits, batches, sizes, or quality settings.
- Read `references/ppt-generation/README.md` when the user asks for PPT, slides, decks, presentations, keynote-style output, or multi-slide reports.

## Capability Router

Use this routing before calling any image-generation or image-editing tool:

| User intent | What this skill contributes | Required reference | Execution path |
| --- | --- | --- | --- |
| Search inspiration, cases, prompts, titles, categories, or example images | Query public Yali inspiration APIs and summarize matching cases | `references/api.md`, `references/prompt-workflow.md` | Public Yali API, no key |
| Write, improve, translate, classify, or compare prompts | Map to Yali categories, use cases as structural inspiration, write an original prompt | `references/prompt-workflow.md` | Prompt-only unless user asks to generate |
| Choose or explain a template | Fetch live templates and select a matching `template_key` only when the request clearly fits | `references/api.md`, `references/prompt-workflow.md` | Template metadata is public; Yali generation still needs a key |
| Generate a new image, cover, poster, banner, product visual, UI mockup, infographic, logo, storyboard, or social media visual | Shape the prompt with Yali categories, templates, dimensions, text placement, and inspiration cases | `references/prompt-workflow.md`, `references/image-generation-workflow.md` | Yali API with key, host-native generation, or prompt-only |
| Edit, retouch, replace, remove, localize, restyle, composite, or transform an existing image | Define edit intent, invariants, reference-image payloads, prompt spec, and provider boundary | `references/image-generation-workflow.md`, `references/api.md` | Yali queued API with `action:"edit"` and 1-2 `reference_images`, host-native edit, or prompt-only |
| Generate PPT, slides, deck, presentation, or multi-slide report | Route to the PPT branch and support slide visual prompts/images | `references/ppt-generation/README.md` | Dedicated PPT workflow plus Codex-native/Yali API/prompt-only image path |

For image generation or editing requests, do not skip directly to a host-native image tool. First use this skill to decide category, template fit, provider path, size/aspect, exact text, and constraints.

## Core Workflow

1. Detect the user's language and respond in that language.
2. Identify whether the user wants:
   - inspiration search only
   - prompt rewriting or prompt creation
   - category/style matching
   - actual image generation
   - image editing, retouching, replacement, localization, compositing, or style transfer
   - social-media, content-operations, or marketing visuals such as WeChat official account covers, Xiaohongshu covers, video covers, article hero images, posters, banners, or ads
   - PPT, slides, decks, presentations, or multi-slide reports
3. For inspiration search, use the public API. No API key is needed.
4. For PPT-like requests, read `references/ppt-generation/README.md` and route to the dedicated PPT workflow. Use this skill only for visual inspiration, slide image prompts, and image generation support.
5. For prompt work, search or reference matching cases first, then write an original prompt adapted to the user's subject.
6. For image generation or editing, read `references/image-generation-workflow.md` before calling a tool. Preserve exact visible text, platform size, edit invariants, and user constraints.
7. For actual image generation, choose the execution path before writing commands:
   - Use Yali queued API when the user asks for Yali generation/editing, account/credit tracking, website-consistent templates, reference-image support, public API behavior, or provides `YALIAI_API_KEY`.
   - Use Codex-native generation/editing only when running in Codex or another host that explicitly provides native image generation/editing and the user does not require the Yali queued API.
   - If neither path is available, return the final prompt and key/setup instructions.
8. For clear template-shaped use cases, read `/free-image/api/templates`, select the matching `template_key`, and use that template's fixed size or size options when appropriate. If the request does not clearly match a template, generate without `template_key`.
9. For Yali API generation, require `YALIAI_API_KEY` or an explicit user-provided key. Never store the key in generated project files unless the user explicitly asks for local environment setup.
10. Start Yali generation through the queued API and return the `task_id`. Poll status every 2-3 seconds if the user asks you to wait for completion.
11. If generation is complete, return the image URL and relevant metadata.

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
