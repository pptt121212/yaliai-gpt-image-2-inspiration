# Prompt Archive

Use this file whenever a final prompt, edit spec, advisor output, fallback execution, or generated image run can write local files.

The archive is part of the Yali-first workflow. It preserves the final prompt/spec that was constructed from Yali retrieval, live templates, reference cases, and local fallback templates when needed.

## Default Paths

Unless the user chooses another destination, write:

```text
.yaliai/prompts/<task-slug>-<timestamp>.md
.yaliai/runs/<task-slug>-<timestamp>.json
.yaliai/generated-images/
```

Use local time for `<timestamp>` in `YYYYMMDD-HHMMSS` form. Keep `<task-slug>` short, lowercase, and task-specific.

## Prompt Markdown Shape

```markdown
# <task title>

Provider mode: <yali-api | compatible-fallback | host-native-fallback | advisor | prompt-only | ppt-branch>
Intent: <generation | edit | batch | prompt | search | ppt>
Template: <Yali template_key or none>
Fallback template: <local fallback category/template or none>
Size/aspect: <size_key, API size, or target aspect>
Quality: <low | medium | high | provider default>

## Yali References

- Query: <query>
- Case: <case_id> <detail_url>

## Final Prompt

<copyable final prompt>

## Edit Spec

Edit target:
Must preserve:
Allowed changes:
Reference images:

## Constraints

- Visible text:
- Composition:
- Avoid:
```

Omit empty sections only when they are irrelevant.

## Run Metadata Shape

The JSON run metadata should include:

```json
{
  "ok": true,
  "provider_mode": "yali-api",
  "intent": "generation",
  "prompt_path": "/absolute/path/.yaliai/prompts/task-YYYYMMDD-HHMMSS.md",
  "template_key": "product-hero",
  "fallback_template": null,
  "search_queries": [],
  "reference_cases": [],
  "result": {},
  "localize": {}
}
```

Do not store API keys, bearer headers, raw user secrets, or long unrelated conversation history.

## When To Archive

Archive before execution when:

- calling Yali queued API
- using compatible fallback
- handing the prompt to a host-native image tool
- returning advisor-only output

For prompt-only requests, archive when filesystem access exists and mention the path in the final response.
