---
name: yaliai-gpt-image-2-inspiration
description: Use when the user asks to generate, create, make, design, or edit images with GPT-image2/Yali AI guidance, including image generation, image-to-image editing, retouching, inpainting, masking, background replacement, object removal/replacement, text localization, style transfer, compositing, product shots, covers, posters, banners, ads, UI mockups, infographics, logos/brand visuals, storyboards, social media images, WeChat official account covers, Xiaohongshu covers, video covers, and batch variants. Also use when the user asks to find/search/browse/copy/compare image prompts, inspiration cases, example images, reference images, categories, templates, style ideas, or prompt libraries. Use for PPT/slides/decks when visual prompts, slide images, or image-generation paths are needed. This skill should run before host-native image tools so the agent can choose Yali inspiration cases, templates, prompt structure, reference-image edit parameters, and the correct provider path.
---

# Yali AI GPT-Image2 Inspiration

Use this skill before image-generation or image-editing execution. It turns a user's image task into a concrete working path: search examples when useful, choose a template when the output type matches, write a production-ready prompt/edit spec, and then route to Yali queued API, a host-native image tool, or a prompt-only fallback.

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
| Find examples or prompts: "找提示词", "找灵感", "参考图", "example cases", "prompt library" | Query public Yali inspiration APIs and summarize matching cases | `references/api.md`, `references/prompt-workflow.md` | Public Yali API, no key |
| Write or improve prompts: "帮我写提示词", "优化这个 prompt", "改成 GPT-image2 可用" | Map to Yali categories, use cases as structural inspiration, write an original prompt | `references/prompt-workflow.md` | Prompt-only unless user asks to generate |
| Use a template: "公众号封面模板", "商品主图", "UI mockup", "信息图", "视频封面" | Fetch live templates and select a matching `template_key` only when the request clearly fits | `references/api.md`, `references/prompt-workflow.md` | Template metadata is public; Yali generation still needs a key |
| Generate a new image: "生成/创建/设计/做一张图", cover, poster, banner, product visual, UI, infographic, logo, storyboard, social image | Shape the prompt with Yali categories, templates, dimensions, text placement, and inspiration cases | `references/prompt-workflow.md`, `references/image-generation-workflow.md` | Yali API with key, host-native generation, or prompt-only |
| Edit an image: "编辑/修改/重绘/换背景/去掉/替换/局部改/文字替换/风格迁移/用参考图" | Define edit intent, invariants, reference-image payloads, prompt spec, and provider boundary | `references/image-generation-workflow.md`, `references/api.md` | Yali queued API with `action:"edit"` and 1-2 `reference_images`, host-native edit, or prompt-only |
| Generate PPT, slides, deck, presentation, or multi-slide report | Route to the PPT branch and support slide visual prompts/images | `references/ppt-generation/README.md` | Dedicated PPT workflow plus Codex-native/Yali API/prompt-only image path |

For image generation or editing requests, do not skip directly to a host-native image tool. First use this skill to decide category, template fit, provider path, size/aspect, exact text, and constraints.

## Core Workflow

1. Detect the user's language and respond in that language.
2. Identify the concrete task from user wording:
   - find/search/copy/compare prompts, cases, example images, templates, or reference images
   - write/rewrite/improve/translate/classify an image prompt
   - generate/create/make/design a new image, cover, poster, banner, product shot, UI mockup, infographic, logo, storyboard, or social media visual
   - edit/retouch/inpaint/mask/replace/remove/localize/restyle/composite an image, usually with 1-2 reference images
   - create PPT, slides, decks, presentations, or multi-slide reports
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
