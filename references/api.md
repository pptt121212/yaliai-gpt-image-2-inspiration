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

Public inspiration endpoints do not require an API key.

Image generation endpoints require:

```text
Authorization: Bearer $YALIAI_API_KEY
```

Users can get their own API key after logging in at:

```text
https://www.yaliai.com/free-image/skill/
```

Never include a real key in public examples, repositories, generated docs, NPM packages, or skill files.

This API is the only path that returns Yali task IDs, uses Yali credits, and runs through the Yali website queue. Host-native image generation or editing in tools such as Codex is separate and must not be represented as a Yali API task.

Yali editing uses the same queued generation endpoint. Send `action:"edit"` and provide 1-2 `reference_images`. There is no separate public edit endpoint.

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

Use this endpoint before generation when the user's use case clearly matches a Yali template. Prefer the live endpoint over the fallback template list in `prompt-workflow.md`, because the website may add or revise templates. Do not force a template for broad or ambiguous creative requests.

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

- `prompt`: required image prompt
- `action`: optional, `generate` or `edit`; defaults to generation behavior when omitted
- `template_key`: optional template, such as `product-hero`, `website-banner`, `infographic`, `video-cover`
- `quality`: `low`, `medium`, or `high`
- `size_key`: for example `1024x1024`
- `output_format`: `jpeg`, `png`, or `webp`
- `output_compression`: 0-100, for JPEG/WEBP
- `reference_images`: optional array of up to 2 image payloads for generation references; required for `action:"edit"`
- `mask_image`: optional single image payload when supported by the website configuration
- `prompt_context`: optional object with fields such as `style`, `text`, `scene`, `subject`, `composition`, `lighting`, `palette`, `negative`

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

Response includes:

- `task_id`
- `status`
- `queue_position`
- `cost`
- `credit_summary`

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

### Result

```http
GET /free-image/api/result?task_id=free_img_xxx
Authorization: Bearer $YALIAI_API_KEY
```

Only call after the task is `completed`.

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
