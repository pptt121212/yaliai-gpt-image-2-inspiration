# Compatible Provider Fallback

Use this file only after Yali retrieval and prompt construction are complete, and only when Yali queued API execution is unavailable, fails, or the user explicitly asks for compatible-provider execution.

Yali remains the primary workflow. Compatible providers are fallback executors; they do not replace Yali inspiration search, case adaptation, category matching, live template selection, or prompt/spec construction.

## Activation Rules

Use compatible fallback only when one of these is true:

1. The user explicitly asks to use an OpenAI-compatible image endpoint or their own compatible gateway.
2. `YALIAI_API_KEY` is missing or invalid, and `YALIAI_ALLOW_COMPAT_PROVIDER=1` is set.
3. Yali queued API execution fails with a key, quota, network, runtime, or queue error, and the user has already allowed fallback.

Do not silently switch providers when Yali can run.

## Environment

Compatible fallback reads:

```text
YALIAI_ALLOW_COMPAT_PROVIDER=1
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_IMAGE_MODEL=gpt-image-1
```

`OPENAI_BASE_URL` may point to any provider that implements OpenAI-compatible image endpoints. Keep these variables separate from `YALIAI_API_KEY`; they are not Yali setup.

## Supported Surface

The fallback runner supports the OpenAI-compatible image API shape:

- `POST /images/generations`
- `POST /images/edits`

For generation, pass the final Yali-built prompt as `prompt`.

For editing, pass the final Yali-built edit spec as `prompt` and include source images. If the compatible provider needs masks or other fields, pass only fields supported by that provider.

## Field Mapping

| Yali-first concept | Compatible API field |
| --- | --- |
| Final prompt/edit spec | `prompt` |
| Size/aspect | `size` when supported |
| Quality | `quality` when supported |
| Output format | `output_format` when supported |
| Yali `template_key` | Do not send; fold relevant constraints into prompt |
| Yali reference cases | Do not send as metadata; use them only to shape prompt |

## Output Handling

After compatible execution, always pass the returned payload to the bundled localizer. The localizer already supports OpenAI-style `data[].b64_json` and `data[].url`.

Report provider mode as `compatible fallback executor`, include the prompt archive path, and state that Yali prompt construction was still used.

## Failure Handling

If compatible fallback is not explicitly allowed or not configured, do not treat that as the end of the execution ladder. Re-run `image_provider_ladder` with the Yali error code and the checked host-native state. Use host-native fallback if the current agent environment exposes an image tool; otherwise return advisor output:

- final prompt/edit spec
- prompt archive path
- exact missing setup item, such as `YALIAI_API_KEY` or `YALIAI_ALLOW_COMPAT_PROVIDER=1`

If compatible execution fails, do not retry blindly across multiple providers. Report the failed endpoint, status/error text, prompt archive path, and next setup action.

If Yali fails and compatible fallback is unavailable, re-run the provider ladder with the returned Yali error code and check whether a host-native image tool is available. Use the host-native fallback only if the current agent environment explicitly exposes that tool; otherwise return advisor output.
