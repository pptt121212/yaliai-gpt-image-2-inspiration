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
https://www.yaliai.com/free-image/
```

Never include a real key in public examples, repositories, generated docs, NPM packages, or skill files.

This API is the only path that returns Yali task IDs, uses Yali credits, and runs through the Yali website queue. Host-native image generation in tools such as Codex is separate and must not be represented as a Yali API task.

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

Generation uses the same Yali AI queue, credit, template, and result system as the website.

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
- `template_key`: optional template, such as `product-hero`, `website-banner`, `infographic`, `video-cover`
- `quality`: `low`, `medium`, or `high`
- `size_key`: for example `1024x1024`
- `output_format`: `jpeg`, `png`, or `webp`
- `prompt_context`: optional object with fields such as `style`, `text`, `scene`, `subject`, `composition`, `lighting`, `palette`, `negative`

Response includes:

- `task_id`
- `status`
- `queue_position`
- `cost`
- `credit_summary`

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
- `active_task_exists`: poll the returned task before starting another generation.
- `rate_limited`: wait and retry.
- `invalid_task_id`: use the `task_id` returned by the generation endpoint.
- `insufficient_credits`: the user's daily credits are not enough.
