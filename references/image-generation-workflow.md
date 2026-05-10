# Image Generation Workflow

Use this file when the installed skill is asked to generate, edit, or batch-create images. Treat user verbs literally: generate/create/make/design means new generation; edit/retouch/inpaint/mask/replace/remove/localize/restyle/composite means image editing.

Do not route ordinary frontend or application coding work here unless the user asks for generated visuals, prompt inspiration, mockup images, image assets, or slide visuals.

This reference is especially important for Codex installs because Codex may provide a native image-generation tool that does not require `YALIAI_API_KEY`. That Codex-native path is a host capability, not a Yali API feature.

For non-Codex tools, do not assume native image generation exists. Claude Code, OpenCode, Gemini CLI, or other agents may install this same skill, but actual image generation must use either the Yali queued API with `YALIAI_API_KEY` or that tool's own documented image-generation capability if it exists.

Keep the boundary between Yali API generation and host-native generation explicit.

## Skill-First Execution Order

For any image generation or editing request, follow this order before calling a tool. Treat it as mandatory runbook logic, not optional advice:

1. Classify the task: new image, edit, batch, or PPT slide image.
2. Map the request to Yali categories and inspiration search terms.
3. Search Yali examples by default for broad generation, prompt writing, templates, style matching, and PPT visual work. Skip only if the user forbids search, network/API access is unavailable, the task is a narrow mechanical edit, or the user gives a complete prompt and explicitly asks to generate directly.
4. Check template fit when the output type is explicit, such as WeChat cover, product hero, UI mockup, infographic, video cover, storyboard, logo, or banner.
5. Build a compact prompt spec with reference cases, exact visible text, size/aspect, layout, constraints, and negative details.
6. Run provider preflight: key, reference images, template size, quality, polling behavior, and fallback.
7. Choose the provider path: Yali queued API, host-native generation/editing, or prompt-only.
8. Execute through the chosen provider, then report the result in that provider's terms.

This skill is the prompt/template/provider router. Host-native tools produce or edit pixels; Yali inspiration and templates guide what should be generated.

Important: using Codex-native or another host-native generator does not remove the retrieval step. The Yali search/template work still supplies the category, visual references, and prompt spec; only the final pixel generation changes provider.

## Agent Judgment Boundary

The agent has room to make visual-production decisions when API retrieval is incomplete, weak, or mismatched. Use that freedom only inside the user's stated goal and this skill's provider/API boundaries.

Allowed:

- Rewrite the final prompt from the user's request instead of copying a retrieved case.
- Ignore irrelevant search results after noting that they did not fit.
- Use a live template only for its matching output type, size, and server-side preset behavior.
- Omit `template_key` when no template clearly fits.
- Choose sensible defaults for style, composition, quality, and size when the user gave enough direction to proceed.
- Ask one concise clarification only when a missing detail blocks execution or changes the expected artifact substantially.

Not allowed:

- Claim a Yali case/template was used when it was only loosely related or not used.
- Treat weak search results as mandatory content.
- Invent template keys, hidden template prompts, API fields, task IDs, or result URLs.
- Replace the user's explicit subject, platform, visible text, or edit invariant with retrieved-case content.
- Pretend generation/editing happened when no provider path succeeded.

## Trigger Words To Respect

New generation requests often use: generate, create, make, design, draw, render, produce, image, cover, poster, banner, ad, product shot, UI mockup, infographic, logo, storyboard, hero image, social media image, 公众号封面, 小红书封面, 视频封面, 海报, 主图, 信息图.

Editing requests often use: edit, modify, retouch, inpaint, mask, change only, replace, remove, keep unchanged, preserve, localize text, translate text, background replacement, style transfer, composite, use this reference image, 用参考图, 改图, 换背景, 去掉, 替换, 保留主体.

When these words appear, do not answer with generic advice. Build a prompt/edit spec, choose the provider path, and execute if a backend is available.

## Provider Decision

Choose exactly one path:

1. **Yali queued API**: use when the user wants Yali website-consistent generation or editing, templates, reference-image support, account credits, queue behavior, task IDs, or has `YALIAI_API_KEY`.
2. **Host-native generation or editing**: use when the current AI tool already provides native image generation/editing, such as Codex image generation, and the user does not require Yali queue/account behavior.
3. **Prompt-only**: use when no generation path is available, the user wants a prompt, or key/setup is missing.

Do not blur these paths:

- Public Yali inspiration search never requires a key.
- Yali image generation and editing always require `YALIAI_API_KEY`.
- If `YALIAI_API_KEY` is missing or invalid, direct the user to `https://www.yaliai.com/free-image/skill/` to copy or reset their key.
- Codex-native generation/editing does not use Yali credits, Yali task IDs, Yali templates as server presets, or Yali result URLs.
- Other AI coding tools may install this skill but may not have native image generation. In those tools, generation should use the Yali API or the tool's own documented image feature if present.
- Yali editing uses the same queued `/free-image/api/generate` endpoint with `action:"edit"` and `reference_images`; do not invent a separate edit endpoint.

## Preflight Checklist

Run this checklist before any generation/editing call:

1. **Intent**: generation, edit, batch, or PPT slide image is explicit.
2. **Retrieval**: searches and case details are complete, or the reason for skipping search is explicit.
3. **Template**: live templates were fetched for clear template-shaped tasks; selected `template_key` or `none` is explicit.
4. **Provider**: one provider path is selected; do not mix Yali and host-native semantics.
5. **Yali key**: `YALIAI_API_KEY` exists for Yali calls. If missing/invalid, stop the Yali call and point to `https://www.yaliai.com/free-image/skill/`.
6. **Reference images**: Yali editing has 1-2 reference images; reference-image generation has at most 2. Each image is PNG/JPEG/WEBP and under 5MB when using the Yali API.
7. **Prompt/edit spec**: exact visible text, size/aspect, quality, constraints, and edit invariants are present.
8. **Preview plan**: know where the final image will be accessible. For Yali remote results, download to a stable local path when filesystem access exists; use the host's native preview mechanism when available.
9. **Side effects**: do not create `.env`, persist keys, reinstall skills, overwrite skill folders, or modify unrelated files unless the user explicitly asks.

If any required preflight item fails, return the prompt/edit spec plus the concrete missing item. Do not silently fall back from Yali API to host-native generation if the user specifically requested Yali queue/account behavior.

## Retrieval Before Execution

Before generation, gather enough reference context to avoid a generic prompt:

1. Read `prompt-workflow.md` for category and task recipe matching.
2. Run public inspiration search using 2-4 concise queries when network access exists, unless the user provided a complete production prompt and explicitly asked for direct generation.
3. Fetch case details for the best 1-3 cases when excerpts are not enough.
4. Fetch live templates when the output type has a likely template.
5. Write an original prompt spec. Do not copy a case prompt verbatim unless the user explicitly asks to reuse it.

For batch generation, run retrieval once per batch theme, then produce per-item prompt specs from that shared structure.

For editing, retrieval is optional and style-driven. If the user says "remove this object" or "change only the background," prioritize invariants and edit precision over browsing examples.

## Tool-Specific Paths

- **Codex**: may use Codex-native image generation or editing without `YALIAI_API_KEY` when the user wants local/host-native output. Use Yali inspiration, categories, cases, and visible template guidance to build the prompt or edit spec, then run the host-native image tool. Do not fabricate Yali task metadata.
- **Yali API from any tool**: use when the user wants Yali website behavior, templates, reference images, queue, credits, task IDs, or shared API behavior. Requires `Authorization: Bearer $YALIAI_API_KEY`.
- **Claude Code / OpenCode / Gemini CLI / shared agents**: the skill can still search Yali inspiration and write prompts. For actual generation or editing, use Yali API when `YALIAI_API_KEY` is available; otherwise use that host's documented image tool if present, or return a prompt/edit spec.
- **No generation backend available**: return the final prompt, matched categories/templates, and setup instructions instead of pretending generation can run.

## Intent Decision

- If the user provides an input image or says edit, retouch, inpaint, mask, replace, remove, translate, localize, or change only one part: treat it as an **edit**.
- If the user needs many prompts, many assets, or variations across a set: treat it as **batch generation**.
- If the user asks for a WeChat official account cover, Xiaohongshu cover, video cover, article hero image, poster, banner, ad, product visual, UI mockup, infographic, or other social/marketing image: treat it as **new generation** and first use Yali categories/templates to shape the prompt before choosing a provider.
- Otherwise treat it as **new generation**.

For edits, list invariants explicitly: what must stay unchanged, what may change, and any exact text that must remain verbatim.

## Capability-Specific Execution Notes

- **Prompt search only**: return 3-8 relevant cases with `case_id`, title, category, prompt summary, image/detail URLs, and why each case is useful.
- **Prompt writing only**: search cases, classify categories, then return one final prompt plus optional alternatives. Do not call generation.
- **Template-shaped generation**: fetch live templates, select `template_key`, use template size constraints, then choose provider. For host-native generation, translate template guidance into the prompt rather than claiming `template_key` was applied.
- **Reference-image generation**: if the user supplies 1-2 images as style/subject references but wants a new image, treat it as generation with references. On Yali, use `action:"generate"` or omit `action` and include `reference_images`.
- **Image editing**: if the user supplies image(s) and asks to change, remove, preserve, replace, localize, or restyle, treat it as edit. On Yali, use `action:"edit"` and 1-2 `reference_images`.
- **PPT/slides**: route to the PPT branch, then use this workflow only for slide visual prompts and image provider choice.

## Editing Workflow

Use this for retouching, replacing objects, removing elements, changing style, localizing text in an image, compositing multiple inputs, or transforming an existing reference image.

1. Identify the edit target and any supporting reference images.
2. State invariants: subject identity, composition, text, logo, product shape, colors, perspective, lighting, and areas that must not change.
3. State the allowed change precisely.
4. Choose provider:
   - Yali queued API with `action:"edit"` when the user wants website/API behavior or provides `YALIAI_API_KEY`.
   - Codex-native or host-native edit when the host exposes image editing and the user does not require Yali task IDs/credits.
   - Prompt-only edit spec when no edit backend is available.
5. For Yali queued editing, pass 1-2 images in `reference_images`. Each image is an object containing either `image_url:"data:image/...;base64,..."` or `mime_type` plus `base64`. Supported formats are PNG, JPEG, and WEBP. Keep each image under 5MB. Editing requires at least one reference image.
6. Do not convert an edit into a new-generation task unless the user accepts a full regeneration.

## Prompt Spec

Rewrite the user request into a compact production spec. Include only relevant lines:

```text
Use case: <Yali category or generation taxonomy>
Asset type: <where the image will be used>
Primary request: <main subject and task>
Reference cases: <case IDs, if used>
Template: <template_key or none>
Scene/background: <environment>
Subject: <main subject>
Style/medium: <photo, illustration, 3D, UI, diagram, etc.>
Composition/framing: <viewpoint, crop, layout, negative space>
Lighting/mood: <lighting and emotional tone>
Color palette: <palette notes>
Materials/textures: <surface details>
Text (verbatim): "<exact text>"
Quality: <low, medium, high>
Size/aspect: <size_key or native size>
Constraints: <must keep, must include>
Avoid: <negative constraints>
```

Rules:

- Structure the prompt as scene/background -> subject -> details -> constraints -> output intent.
- Use exact quoted text for in-image text and specify placement and typography when relevant.
- For social-media covers and article hero images, include platform, aspect ratio, title text, subtitle text if any, safe text area, visual hierarchy, and mobile-list readability.
- For edits, include `Edit target`, `Must preserve`, `Allowed changes`, and `Avoid changing`.
- Do not invent new creative requirements. You may add implied production constraints, such as negative space for a banner.
- For photorealism, use camera, lens, framing, lighting, and real material language.
- For UI, diagrams, logos, and infographics, describe hierarchy, layout, labels, and intended audience.
- Add a short `Avoid:` line when the request risks generic, cluttered, or over-stylized output.

## Template Use

Templates are optional accelerators, not the default path.

For clear platform cover requests, prefer these live templates when available:

- WeChat official account cover: `wechat-cover`
- Xiaohongshu note cover: `xiaohongshu-cover`
- YouTube, Bilibili, or short-video cover: `video-cover`

Use a Yali template only when the user's request clearly matches a template from:

```text
GET https://www.yaliai.com/wp-json/yali/v1/free-image/api/templates
```

When using the Yali API with a template:

- Send `template_key`.
- Use `fixedSize` when present.
- Otherwise choose the best `sizeOptions` value.
- Put user-specific subject, style, text, and constraints in `prompt` and optional `prompt_context`.
- Include `reference_images` when the user provides reference images for generation or editing. Use `action:"edit"` for editing; use `action:"generate"` or omit `action` for new generation with style/subject references.

When using host-native generation:

- Do not send `template_key`.
- Translate the template's visible intent into the prompt spec, but do not claim server-side template constraints are active.

## Size Guidance

For Yali API generation, prefer the live template sizes or documented API-supported `size_key` values.

For host-native generation, use the host's supported sizes. If the host accepts flexible GPT-image2 style sizes, prefer these common production sizes:

- Square: `1024x1024`, `1536x1536`, `2048x2048`, `2560x2560`
- Landscape: `1280x720`, `1536x1024`, `2560x1440`, `3840x2160`
- Portrait: `720x1280`, `1024x1536`, `1440x2560`, `2160x3840`

If flexible validation is needed, use dimensions that are multiples of 16, within 16-3840 pixels per side, with aspect ratio no wider than 3:1.

## Quality Guidance

- Use `low` for fast drafts and broad exploration.
- Use `medium` as the default production balance.
- Use `high` for text-heavy, detail-critical, product, UI, diagram, or identity-sensitive images.

For edits, keep each iteration targeted. Re-state invariants every time.

## Output Contract

For prompt-only work, return the final prompt and any reference cases.

For Yali API generation, return `task_id`, status, queue position, cost/credit summary when available, and result URL when complete.

For Yali API editing, return the same queued task fields. Do not describe it as a separate edit endpoint; it is a queued image task with `action:"edit"` and reference images.

For host-native generation, return or display the generated image according to the host's normal image workflow and include the final prompt/spec used. Do not fabricate a Yali task ID or result URL.

For host-native editing, return or display the edited image according to the host's normal image workflow and include the edit spec used.

After generation, always report where the image is accessible:

- For Yali API: report the original `response.url` and, when filesystem access exists, download it to a stable local path and report that path.
- For host-native generation: report the host-generated local path or normal host result handle.
- For prompt-only: state that no image file was generated.

For hosts that support Markdown image previews, this format is recommended:

```md
![descriptive alt text](/absolute/local/path.png)
![descriptive alt text](https://example.com/remote-image.png)
```

Do not assume Markdown is required in every AI coding tool. Use the host's native preview behavior when it exists. In Codex-like desktop hosts, local absolute paths are the most reliable for preview. For Yali API results, download `response.url` or `response.assets[0].url` to a stable local path when possible.

Yali API field paths to use:

- Start response task id: `response.task_id`
- Start response status: `response.status`
- Status response status: `response.task.status`
- Status response queue position: `response.task.queue_position`
- Status response error: `response.task.error_message`
- Result primary image URL: `response.url`
- Result fallback image URL: `response.assets[0].url`
- Result revised prompt: `response.revised_prompt`

Use this compact report shape for generation/editing work:

```text
Provider: <Yali queued API | host-native | prompt-only | PPT branch>
Search: <queries used, or skipped with reason>
Reference cases: <case_id/title links, or none>
Template: <template_key or none>
Prompt/edit spec: <final spec or summary>
Result: <task_id/status/result URL, host output, or missing setup>
```

For Yali API errors, surface the error code and useful fields such as `get_key_url`, `recommended_env`, `task_id`, or `queue_position`. Do not hide missing-key, active-task, rate-limit, or insufficient-credit errors behind generic wording.
