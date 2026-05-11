# PPT Generation Examples

The PPT branch is a local workflow driven by this Skill's routing documents under `references/ppt-generation/`: local planning, Yali slide-image generation, localization, HTML preview, and PPTX packaging.

## Example Workflow

```mermaid
flowchart TD
  A["Topic and audience"] --> B["slides_plan.md / slides_plan.json"]
  B --> C["Choose Yali /ppt style"]
  C --> D["One image prompt per slide"]
  D --> E["Yali API image generation + localization"]
  E --> F["images/slide-01.png ..."]
  F --> G["index.html preview"]
  F --> H["presentation.pptx"]
```

## Example: Short China-Red Deck

Topic: `普通人如何做自媒体`

Style: `china-red-official`

Output type: image-based 16:9 PPTX with local HTML preview.

<p>
  <img src="assets/ppt-example/slide-01.png" width="280" alt="PPT slide 1">
  <img src="assets/ppt-example/slide-02.png" width="280" alt="PPT slide 2">
  <img src="assets/ppt-example/slide-03.png" width="280" alt="PPT slide 3">
</p>

## Yali PPT Styles

The PPT branch uses the style set from `https://www.yaliai.com/ppt/`, including:

`gradient-glass`, `clean-tech-blue`, `china-red-official`, `soft-gradient`, `premium-dark`, `clean-data`, `luxury-serif`, `organic-paper`, `bold-pop`, `vector-illustration`, `playful-kids-illustration`, `editorial-mono`, `dark-aurora`, `risograph`, `japanese-wabi`, `east-asian-ink-luxury`, `swiss-grid`, `hand-sketch`, `y2k-chrome`, and `custom`.

## Important Boundary

PPT output is currently image-based: each slide is one generated image placed into a PPTX. This gives strong visual fidelity across PowerPoint, Keynote, WPS, and web viewers, but the text and shapes are not editable unless a future dedicated PPT workflow adds editable slide construction.
