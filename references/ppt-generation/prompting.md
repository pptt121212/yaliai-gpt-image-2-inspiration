# PPT Prompting

This file defines how to convert a slide plan into per-slide image prompts.

## Prompt Structure

Build each prompt from these blocks:

1. Slide role and page type
2. Subject and key message
3. Layout and composition
4. Style and material language
5. Typography and text rules
6. Aspect ratio and output format
7. Constraints and negatives

## Prompt Rules

- Keep all visible text in simplified Chinese unless the user asks otherwise.
- Always force 16:9 landscape for presentation slides.
- Make cover slides more striking and content slides more structured.
- Make data slides emphasize hierarchy, contrast, and readability.
- Use the same style system across the whole deck.
- Adapt inspiration cases to the user's topic.

## Example Shape

```text
Page type: content
Subject: ...
Key message: ...
Layout: ...
Style: ...
Typography: ...
Aspect: 16:9 landscape
Constraints: simplified Chinese only, no square crop, no vertical layout
Avoid: clutter, tiny text, decorative noise
```

## Routing Notes

- If `YALIAI_API_KEY` exists, use the Yali queued image API for each slide image and localize each finished result.
- If an explicit compatible fallback is allowed, use the archived Yali-built slide prompts with the compatible executor and localize each finished result.
- If no permitted executor is available, return slide prompts and the concrete setup item instead of claiming to generate files.
