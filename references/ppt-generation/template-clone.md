# Template Clone Mode

Use this file only when a deck must imitate an existing `.pptx` or page template.

## Status

This is optional and should not block basic PPT generation.

## Preferred Flow

1. Render the source `.pptx` or template pages to images.
2. Analyze layout, spacing, typography, and style.
3. Build a page schema that matches the template structure.
4. Generate new slide images with the same visual logic.
5. Package the result as preview + PPTX.

## Dependencies

Likely dependencies:

- `libreoffice` or `soffice`
- optional Docker fallback for rendering
- a vision-capable model or host-native multimodal analysis

## Rules

- Do not force template clone mode for ordinary PPT requests.
- Keep the clone logic separate from the normal style-based workflow.
- Treat the source template as a layout guide, not content to copy.
