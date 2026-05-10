# PPT Workflow Dependencies

Use this dependency guide before proposing or running a local PPT workflow.

## Required Conceptual Dependencies

- A slide planning schema such as `slides_plan.json`.
- A per-slide image generation path.
- A local PPTX packaging script.
- A local HTML preview template.

## Codex-Native Path

For Codex-native image generation:

- No Yali API key is required for the image tool itself if the host provides native image generation.
- The agent must call the host image-generation tool directly.
- Local scripts cannot call Codex-native image generation like a normal SDK.
- Packaging still needs a local runtime such as Node.js or Python.

## Yali API Path

For Yali API image generation:

- Requires `YALIAI_API_KEY` in the environment or explicitly provided for the current run.
- Uses Yali queued image-generation endpoints.
- Returns Yali task IDs and result URLs.
- Generated images should be downloaded locally before PPTX packaging.

Never store real keys in repository files. Use `$YALIAI_API_KEY` in examples.

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
- A vision-capable model or host-native multimodal reading to analyze template screenshots.

Do not make template clone dependencies mandatory for basic PPT generation.

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
