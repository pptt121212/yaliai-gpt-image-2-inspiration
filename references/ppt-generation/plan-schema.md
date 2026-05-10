# PPT Plan Schema

Use this schema for local PPT planning when the user asks for a presentation, slides, deck, keynote, or report-style output.

## Minimum Fields

```json
{
  "title": "Deck title",
  "audience": "Target audience",
  "style": "clean-tech-blue",
  "slides_count": 5,
  "slides": [
    {
      "slide_number": 1,
      "page_type": "cover",
      "title": "Slide title",
      "key_message": "What this slide must communicate",
      "goal": "Why this slide exists",
      "content": "Core bullet content or body text",
      "visual_hint": "Layout and composition guidance"
    }
  ]
}
```

## Rules

- Keep `slide_number` stable and sequential.
- Start with a `cover` slide.
- Use `content` for the visible subject matter of the slide.
- Use `visual_hint` to describe layout, hierarchy, and spacing, not to restate the content.
- Keep the structure compact unless a dedicated PPT skill defines a richer schema.

## Optional Fields

- `subtitle`
- `tone`
- `speaker_note`
- `data_points`
- `bullets`
- `layout_id`
- `template_key`

Prefer adding fields only when the slide needs them. The goal is a schema that is easy for a local script or agent to validate.
