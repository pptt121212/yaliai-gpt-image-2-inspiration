# Image Generation Workflow

Use this file when the installed skill is asked to generate, edit, or batch-create images.

This reference is especially important for Codex installs because Codex may provide a native image-generation tool that does not require `YALIAI_API_KEY`. That Codex-native path is a host capability, not a Yali API feature.

For non-Codex tools, do not assume native image generation exists. Claude Code, OpenCode, Gemini CLI, or other agents may install this same skill, but actual image generation must use either the Yali queued API with `YALIAI_API_KEY` or that tool's own documented image-generation capability if it exists.

Keep the boundary between Yali API generation and host-native generation explicit.

## Provider Decision

Choose one path:

1. **Yali queued API**: use when the user wants Yali website-consistent generation, templates, account credits, queue behavior, task IDs, or has `YALIAI_API_KEY`.
2. **Host-native generation**: use when the current AI tool already provides native image generation, such as Codex image generation, and the user does not require Yali queue/account behavior.
3. **Prompt-only**: use when no generation path is available, the user wants a prompt, or key/setup is missing.

Do not blur these paths:

- Public Yali inspiration search never requires a key.
- Yali image generation always requires `YALIAI_API_KEY`.
- Codex-native generation does not use Yali credits, Yali task IDs, Yali templates as server presets, or Yali result URLs.
- Other AI coding tools may install this skill but may not have native image generation. In those tools, generation should use the Yali API or the tool's own documented image feature if present.

## Tool-Specific Paths

- **Codex**: may use Codex-native image generation without `YALIAI_API_KEY` when the user wants local/host-native generation. Use Yali inspiration, categories, cases, and visible template guidance to build the prompt, then run the host-native image tool. Do not fabricate Yali task metadata.
- **Yali API from any tool**: use when the user wants Yali website behavior, templates, queue, credits, task IDs, or shared API behavior. Requires `Authorization: Bearer $YALIAI_API_KEY`.
- **Claude Code / OpenCode / Gemini CLI / shared agents**: the skill can still search Yali inspiration and write prompts. For actual generation, use Yali API unless that host explicitly provides its own image-generation tool.
- **No generation backend available**: return the final prompt, matched categories/templates, and setup instructions instead of pretending generation can run.

## Intent Decision

- If the user provides an input image or says edit, retouch, inpaint, mask, replace, remove, translate, localize, or change only one part: treat it as an **edit**.
- If the user needs many prompts, many assets, or variations across a set: treat it as **batch generation**.
- Otherwise treat it as **new generation**.

For edits, list invariants explicitly: what must stay unchanged, what may change, and any exact text that must remain verbatim.

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
- Do not invent new creative requirements. You may add implied production constraints, such as negative space for a banner.
- For photorealism, use camera, lens, framing, lighting, and real material language.
- For UI, diagrams, logos, and infographics, describe hierarchy, layout, labels, and intended audience.
- Add a short `Avoid:` line when the request risks generic, cluttered, or over-stylized output.

## Template Use

Templates are optional accelerators, not the default path.

Use a Yali template only when the user's request clearly matches a template from:

```text
GET https://www.yaliai.com/wp-json/yali/v1/free-image/api/templates
```

When using the Yali API with a template:

- Send `template_key`.
- Use `fixedSize` when present.
- Otherwise choose the best `sizeOptions` value.
- Put user-specific subject, style, text, and constraints in `prompt` and optional `prompt_context`.

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

For host-native generation, return or display the generated image according to the host's normal image workflow and include the final prompt/spec used. Do not fabricate a Yali task ID or result URL.
