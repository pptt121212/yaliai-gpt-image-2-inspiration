# PPT Workflow Dependencies

Use this dependency guide before proposing or running a local PPT workflow.

## Required Conceptual Dependencies

- A slide planning schema such as `slides_plan.json`.
- A per-slide image generation path.
- A local PPTX packaging script.
- A local HTML preview template.

## Yali Image Path

For slide image generation:

- `YALIAI_API_KEY` is required.
- The agent must call the Yali queued image-generation API.
- Finished image results must be localized with `scripts/python/localize_image_result.py` or `scripts/node/localize_image_result.mjs`.
- Packaging still needs a local runtime such as Node.js or Python.

## Yali API Path

For Yali API image generation:

- Requires `YALIAI_API_KEY` in the environment or explicitly provided for the current run.
- Uses Yali queued image-generation endpoints.
- Returns Yali task IDs and result URLs.
- Generated images should be localized before PPTX packaging.

Keep real keys out of repository files. Use `$YALIAI_API_KEY` in examples.

## Recommended Local Packaging Stack

Prefer Node for the future dedicated NPM/Skill package:

```text
node >= 18
pptxgenjs
sharp or image-size
```

Use cases:

- `pptxgenjs`: create a 16:9 image-based `.pptx`.
- `sharp`: inspect, resize, or normalize slide images if needed.
- `image-size`: lightweight dimension checks when image processing is not needed.

Python fallback:

```text
python >= 3.9
python-pptx
Pillow
```

Use cases:

- `python-pptx`: create a simple 16:9 image-based `.pptx`.
- `Pillow`: inspect or normalize generated slide images.

## Optional Template Clone Dependencies

Template clone mode should belong to the dedicated PPT skill, not this image inspiration skill.

If implemented later, likely dependencies are:

- `libreoffice` or `soffice` for rendering `.pptx` templates to PNG.
- Docker plus a LibreOffice image as a fallback render path.
- A vision-capable model or local screenshot/image analysis tool to analyze template screenshots.

Keep template clone dependencies optional for basic PPT generation.

## Environment Variables

Use explicit environment variables only:

```bash
YALIAI_API_KEY=your_yali_key
YALIAI_API_BASE=https://www.yaliai.com/wp-json/yali/v1
```

If a future dedicated PPT skill supports another image provider, keep those keys in that skill's own `.env.example`, not in this image inspiration skill.

## Minimum Viable Local Workflow

The smallest viable local implementation needs:

1. A `slides_plan.json`.
2. Generated `images/slide-XX.png` files.
3. A PPTX packer using `pptxgenjs` or `python-pptx`.
4. An `index.html` viewer that lists the slide images.

Everything else, including template clone mode, style galleries, concurrent generation, and revision UI, is optional.
