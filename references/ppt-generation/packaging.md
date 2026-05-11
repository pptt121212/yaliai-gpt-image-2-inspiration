# PPT Packaging

This file describes the local output packaging for a PPT workflow.

## Output Set

The preferred local output directory contains:

```text
slides_plan.md
slides_plan.json
prompts.json
images/
index.html
presentation.pptx
```

## HTML Preview

Create a simple viewer that:

- loads every slide image
- supports keyboard navigation
- keeps the presentation in 16:9
- is safe to open locally without a server

## PPTX Packaging

Preferred path:

- use `pptxgenjs` for a Node-based packaging flow
- place one full-slide image on each slide
- size the deck to 16:9 widescreen

Fallback path:

- use `python-pptx` if Node packaging is unavailable

## Packaging Rules

- Keep editable text-shape construction separate from image-based slides unless the dedicated PPT workflow explicitly supports both.
- Keep the PPTX output visually faithful to the generated slide images.
- Ensure the PPTX file name is derived from the deck title.
- Normalize image dimensions before packaging when needed.
