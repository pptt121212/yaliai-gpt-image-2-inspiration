# PPT Generation Branch

Use this reference only when the user asks for PPT, slides, deck, presentation, keynote, slideshow, pitch deck, report slides, or multi-slide visual output.

This image inspiration skill does not own the full PPT workflow. It should route PPT work to a dedicated PPT skill or a local PPT workflow, while contributing Yali visual inspiration, style references, slide image prompts, and image-generation path decisions.

## Boundary

- Do not call the website `/ppt/` task system from this skill.
- Do not create WordPress PPT tasks, depend on browser login, or use website-only authorization state.
- Do not imply the PPT output has editable text and shapes when it is image-based.
- Do not store API keys in generated files. Use environment variables such as `YALIAI_API_KEY`.

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
- selecting Codex-native generation or Yali queued API generation
- generating slide images when the current host supports image generation

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

1. **Codex-native path**: in Codex, use the host's native image-generation tool for each slide image, then use local scripts from the dedicated PPT workflow to package images into PPTX.
2. **Yali API path**: in any tool with `YALIAI_API_KEY`, call the Yali queued image-generation API for each slide image, download finished images, then package locally.
3. **Prompt-only fallback**: if no generation backend is available, create the presentation plan and slide image prompts only.

Codex-native generation is a host capability, not a callable library inside packaged scripts. Scripts can package images and create previews, but the agent must call native image tools directly when using the Codex path.

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
Generation path: <Codex-native | Yali API | prompt-only>
Next artifact: slides_plan + per-slide image prompts
```
