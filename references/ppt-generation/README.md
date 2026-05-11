# PPT Generation Branch

Use this reference only when the user asks for PPT, slides, deck, presentation, keynote, slideshow, pitch deck, report slides, or multi-slide visual output.

This image inspiration skill does not own the full PPT workflow. It should route PPT work to a dedicated PPT skill or a local PPT workflow, while contributing Yali visual inspiration, style references, slide image prompts, and image-generation path decisions.

## Boundary

- Use a dedicated PPT skill or local PPT workflow for the deck itself.
- Use the Yali image API for slide images when `YALIAI_API_KEY` is available.
- Describe image-based PPT output as image-based slides.
- Keep API keys in environment variables such as `YALIAI_API_KEY`.

## Preferred Direction

Prefer a dedicated PPT skill, such as `yaliai-ai-ppt`, when installed. That skill should own:

1. Presentation requirements and audience analysis.
2. Slide structure and `slides_plan` generation.
3. Per-slide visual prompt construction.
4. Per-slide image generation.
5. HTML preview creation.
6. PPTX packaging and download-ready local output.

This image skill may support the dedicated PPT skill by:

- searching Yali inspiration cases for visual references
- choosing Yali categories or templates for slide imagery
- writing slide-level GPT-image2 prompts
- selecting Yali queued API generation or prompt-only output
- generating slide images through the Yali API when the runtime is configured

## Branch Documents

- Read `plan-schema.md` to understand the canonical slide plan structure.
- Read `prompting.md` to turn each slide into a production-ready image prompt.
- Read `packaging.md` to package generated images into HTML preview and PPTX output.
- Read `styles.md` to pick or adapt slide visual styles.
- Read `template-clone.md` only when the deck must mimic an existing `.pptx` or page template.
- Read `workflow.md` for the local PPT generation procedure and handoff rules.
- Read `dependencies.md` before proposing or running a PPT workflow, especially when packaging PPTX locally.

## Local Generation Paths

Choose one path before executing:

1. **Yali API path**: in any tool with `YALIAI_API_KEY`, call the Yali queued image-generation API for each slide image, localize finished images, then package locally.
2. **Prompt-only fallback**: if Yali cannot run, create the presentation plan and slide image prompts only.

Slide images go through the Yali API and `scripts/python/localize_image_result.py` or `scripts/node/localize_image_result.mjs` before packaging.

## Output Contract

When routing a PPT request, state which path will be used and keep output expectations explicit:

- `slides_plan.md` or `slides_plan.json` for planned slide content
- `images/slide-01.png`, `images/slide-02.png`, and so on for generated slide images
- `index.html` for local preview
- `.pptx` for the packaged image-based presentation

If only this image skill is available, produce a compact handoff instead of attempting the full PPT workflow:

```text
PPT workflow needed: <dedicated skill or local scripts>
Topic: <user topic>
Audience: <audience>
Suggested style: <visual direction>
Generation path: <Yali API | prompt-only>
Next artifact: slides_plan + per-slide image prompts
```
