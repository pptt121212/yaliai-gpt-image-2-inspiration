# Local PPT Workflow

Use this workflow when a user asks for PPT generation and a dedicated PPT skill or local PPT scripts are available. This document describes the intended local workflow based on local planning, slide image generation, preview, and PPTX packaging.

## Responsibilities

The PPT workflow owns:

1. Requirements clarification when needed: topic, audience, slide count, tone, and source material.
2. Slide planning: create `slides_plan.md` for human review and `slides_plan.json` for scripts.
3. Visual direction: choose a style, template, or reference direction.
4. Per-slide prompt writing: turn each slide into a 16:9 image prompt.
5. Image generation: use Yali API, then localize image results.
6. Packaging: create local HTML preview and image-based PPTX.

This image inspiration skill supports only the visual parts: inspiration search, category/template guidance, prompt writing, and image generation path selection.

## Read Order

1. Read `dependencies.md` to choose the available runtime and generation path.
2. Read `styles.md` to select or adapt a visual style.
3. Read `plan-schema.md` before writing `slides_plan.md` or `slides_plan.json`.
4. Read `prompting.md` before generating slide image prompts.
5. Read `packaging.md` before creating `index.html` or `presentation.pptx`.
6. Read `template-clone.md` only when the user provides an existing `.pptx` or visual template to mimic.

## Recommended Artifacts

Create outputs in a single local directory:

```text
outputs/<timestamp>/
├── slides_plan.md
├── slides_plan.json
├── prompts.json
├── images/
│   ├── slide-01.png
│   ├── slide-02.png
│   └── ...
├── index.html
└── presentation.pptx
```

## Image Generation Paths

Use one path consistently for a deck:

- **Yali API**: the agent calls Yali queued image generation with `YALIAI_API_KEY`, waits for completed images, localizes them with the Python or Node localizer, then packages locally.
- **Setup-needed prompt/spec mode**: if Yali key/runtime setup is incomplete, produce the slide plan and per-slide prompts without claiming to generate files.

## Handoff Message

When this image skill cannot run the full PPT workflow, return:

```text
PPT workflow needed: yaliai-ai-ppt or local PPT scripts
Topic: <topic>
Audience: <audience>
Slide count: <count or auto>
Suggested style: <style>
Generation path: <Yali API | setup-needed prompt/spec mode>
Next artifact: slides_plan + per-slide image prompts
```
