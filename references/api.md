# Yali AI API Reference

Base URL:

```text
https://www.yaliai.com/wp-json/yali/v1
```

API docs endpoint:

```text
GET /free-image/api-docs
```

Full URL:

```text
https://www.yaliai.com/wp-json/yali/v1/free-image/api-docs
```

## Authentication

Public inspiration endpoints are keyless.

Image generation endpoints require:

```text
Authorization: Bearer $YALIAI_API_KEY
```

Users can get their own API key after logging in at:

```text
https://www.yaliai.com/free-image/skill/
```

Keep real keys out of public examples, repositories, generated docs, NPM packages, and skill files.

This API is the generation/editing path for this Skill. It returns Yali task IDs, uses Yali credits, runs through the Yali website queue, and produces result URLs that must be passed to `scripts/python/localize_image_result.py` or `scripts/node/localize_image_result.mjs`.

Yali editing uses the same queued generation endpoint. Send `action:"edit"` and provide 1-2 `reference_images`.

Compatible fallback execution is separate from Yali API. It may use `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_IMAGE_MODEL`, but only after the Yali-built prompt/spec has been archived and fallback has been explicitly allowed.

## Public Inspiration Endpoints

### Categories

```http
GET /inspiration/categories
```

Returns public inspiration categories and counts.

### Search

```http
GET /inspiration/search?q=海报&category=&limit=10&offset=0
```

Searches titles, categories, prompts, and keywords.

Important fields:

- Search results are under `response.items`.
- `case_id`
- `slug`
- `title`
- `prompt`
- `prompt_excerpt`
- `category`
- `categories`
- `keywords`
- `image_url`
- `thumb_url`
- `detail_url`
- `source`

### Case Detail

```http
GET /inspiration/cases/case-14112
```

Returns one case with the full prompt.

### Random Cases

```http
GET /inspiration/random?category=&limit=6
```

Use for exploration when the user's direction is broad.

### Template Presets

```http
GET /free-image/api/templates
```

Returns image generation templates and current generation capabilities.

Response shape:

```json
{
  "success": true,
  "templatePresets": {
    "ui-mockup": {
      "label": "UI Mockup / 线框图",
      "description": "...",
      "hint": "...",
      "fixedSize": "",
      "sizeOptions": []
    }
  },
  "defaultTemplateKey": "none",
  "capabilities": {}
}
```

Important: live templates are under `response.templatePresets`.

Use this endpoint before generation when the user's use case clearly matches a Yali template. Prefer the live endpoint over the offline template guide in `prompt-workflow.md`, because the website may add or revise templates. For broad or ambiguous creative requests, omit `template_key`. If the prompt still lacks structure after retrieval, use the local fallback guide in `local-template-fallback.md` rather than replacing the live template flow.

Important template fields:

- `label`: user-facing template name
- `description`: what the template is for
- `hint`: what extra user details help this template
- `fixedSize`: required output size when present
- `sizeOptions`: recommended selectable sizes for this template

When a template has `fixedSize`, send that size as `size_key` unless the user explicitly asks for a different supported format.

When a template has `sizeOptions`, choose the best size for the target platform and send it as `size_key`.

## Image Generation

Generation and editing use the same Yali AI queue, credit, template, reference-image, and result system as the website.

Prefer a bundled runner instead of hand-written `curl`. Use Python when available:

```bash
python3 scripts/python/yali_image_api.py generate \
  --prompt "一张极简商品主图，白色背景，高级棚拍光线" \
  --template-key product-hero \
  --quality medium \
  --size-key 1024x1024 \
  --wait \
  --alt "product hero image"
```

The runner uses Python standard-library JSON handling.

If `python3` is unavailable but Node.js is available:

```bash
node scripts/node/yali_image_api.mjs generate \
  --prompt "一张极简商品主图，白色背景，高级棚拍光线" \
  --template-key product-hero \
  --quality medium \
  --size-key 1024x1024 \
  --wait \
  --alt "product hero image"
```

The Node runner uses only Node built-in modules.

### Start Generation

```http
POST /free-image/api/generate
Authorization: Bearer $YALIAI_API_KEY
Content-Type: application/json
```

Example:

```bash
curl -X POST "https://www.yaliai.com/wp-json/yali/v1/free-image/api/generate" \
  -H "Authorization: Bearer $YALIAI_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{"prompt":"一张极简商品主图，白色背景，高级棚拍光线","template_key":"product-hero","quality":"medium","size_key":"1024x1024"}'
```

Common body fields:

| Field | Type | Required | Values / shape | Notes |
| --- | --- | --- | --- | --- |
| `prompt` | string | yes | any clear image prompt | Required for generation and editing. |
| `action` | string | no | `generate` or `edit` | Defaults to generation behavior when omitted. Use `edit` only with `reference_images`. |
| `template_key` | string | no | live template key such as `product-hero`, `website-banner`, `ui-mockup`, `infographic`, `video-cover` | Fetch `/free-image/api/templates` first and use a returned key. |
| `quality` | string | no | `low`, `medium`, `high` | Use `medium` by default; use `high` for text/UI/product/detail-critical work. |
| `size_key` | string | no | e.g. `1024x1024` or a live template size | Prefer `fixedSize` or best `sizeOptions` from live templates. |
| `output_format` | string | no | `jpeg`, `png`, `webp` | Defaults to website/API behavior when omitted. |
| `output_compression` | integer | no | `0`-`100` | Used for JPEG/WEBP only. |
| `reference_images` | array | conditional | up to 2 image payloads | Required for `action:"edit"`; optional for reference-guided generation. |
| `mask_image` | object | no | one image payload | Optional when supported by website configuration. |
| `prompt_context` | object | no | `style`, `text`, `scene`, `subject`, `composition`, `lighting`, `palette`, `negative` | Optional structured context; keep the main prompt self-contained. |

Reference image payload formats:

```json
{
  "reference_images": [
    { "image_url": "data:image/png;base64,..." },
    { "mime_type": "image/jpeg", "base64": "..." }
  ]
}
```

Rules:

- Supported reference formats: PNG, JPEG, WEBP.
- Maximum reference images: 2.
- Maximum reference image size: 5MB each.
- Editing requires at least one reference image.
- Reference images add credit cost in the same way as the website.

Start response includes top-level task metadata:

- `task_id`
- `status`
- `queue_position`
- `cost`
- `credit_summary`

Minimal start response shape:

```json
{
  "success": true,
  "task_id": "free_img_xxx",
  "status": "queued_or_processing",
  "queue_position": 0,
  "cost": 3,
  "credit_summary": {}
}
```

### Edit With Reference Image

```bash
curl -X POST "https://www.yaliai.com/wp-json/yali/v1/free-image/api/generate" \
  -H "Authorization: Bearer $YALIAI_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{"action":"edit","prompt":"保留主体和构图，将背景替换为浅色科技感工作台，保持真实光影","quality":"medium","size_key":"1024x1024","reference_images":[{"image_url":"data:image/png;base64,..."}]}'
```

### Status

```http
GET /free-image/api/status?task_id=free_img_xxx
Authorization: Bearer $YALIAI_API_KEY
```

Poll every 2-3 seconds. Polling too quickly may return `rate_limited`.

Status response shape:

```json
{
  "success": true,
  "task": {
    "task_id": "free_img_xxx",
    "status": "queued_or_processing_or_completed_or_failed",
    "assets": [],
    "asset_count": 0,
    "queue_position": 0,
    "error_message": ""
  }
}
```

Important status paths:

- Task status: `response.task.status`
- Task id: `response.task.task_id`
- Queue position: `response.task.queue_position`
- Error message: `response.task.error_message`

Read status from `response.task.status`; the status endpoint nests it under `task.status`.

### Result

```http
GET /free-image/api/result?task_id=free_img_xxx
Authorization: Bearer $YALIAI_API_KEY
```

Only call after the task is `completed`.

Result response shape:

```json
{
  "success": true,
  "url": "https://www.yaliai.com/wp-content/uploads/yali-free-image-tasks/free_img_xxx.png",
  "assets": [
    {
      "index": 1,
      "url": "https://www.yaliai.com/wp-content/uploads/yali-free-image-tasks/free_img_xxx.png",
      "filename": "free_img_xxx.png",
      "output_format": "png",
      "response_id": "resp_xxx",
      "item_id": "ig_xxx"
    }
  ],
  "prompt": "original prompt",
  "revised_prompt": "provider revised prompt when available",
  "size_key": "1024x1024",
  "output_format": "png",
  "credit_summary": {},
  "cost": 3,
  "completed_at": "ISO or site timestamp",
  "expires_at": "ISO or site timestamp"
}
```

Important result paths:

- Primary image URL: `response.url`
- Fallback image URL: `response.assets[0].url`
- Asset filename: `response.assets[0].filename`
- Original prompt: `response.prompt`
- Revised prompt: `response.revised_prompt`
- Size: `response.size_key`
- Output format: `response.output_format`

After a Yali task completes, report the image URL and, when filesystem access exists, download it to a stable local path for the current workspace/session. Different AI coding tools preview files differently; the stable requirement is that the agent provides the local path and original URL.

Before any execution path, archive the final prompt/spec using `prompt-archive.md` when filesystem access exists.

For hosts that support Markdown image previews, this format is recommended:

```md
![Yali API result](https://www.yaliai.com/wp-content/uploads/yali-free-image-tasks/free_img_xxx.png)
```

For hosts that reliably preview local absolute paths, prefer the downloaded local file:

```md
![Yali API result](/absolute/path/to/yali-result.png)
```

When filesystem access exists, localize the result and use the localizer's absolute-path Markdown preview as the final display artifact.

## Rate And Queue Behavior

- One API key can have one `queued` or `processing` task at a time.
- If a task is active, generation returns `active_task_exists` with the existing `task_id`.
- Repeated generation requests are rate-limited.
- Status/result polling should use a 2-3 second interval.

## Common Errors

- `missing_api_key`: no Bearer key was provided.
- `invalid_api_key`: key is invalid or revoked.

For `missing_api_key` or `invalid_api_key`, direct the user to `https://www.yaliai.com/free-image/skill/` to copy or reset their own key, then configure it as `YALIAI_API_KEY`.
- `active_task_exists`: poll the returned task before starting another generation.
- `rate_limited`: wait and retry.
- `invalid_task_id`: use the `task_id` returned by the generation endpoint.
- `insufficient_credits`: the user's daily credits are not enough.
