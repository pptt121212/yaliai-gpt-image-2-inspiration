# Prompt And Category Workflow

Use the Yali AI inspiration library as a reference system, not as text to copy blindly. The final prompt should be original and adapted to the user's subject.

## Category-First Matching

When the user provides an image idea, first map it to one or more Yali categories. Current public categories include:

- 人物/肖像/摄影
- 插画/艺术风格
- 产品/电商/包装
- 图像编辑/参考图控制
- 海报/封面/广告
- 自然/景观/地貌
- 社媒/直播/截图
- 空间/建筑/室内
- 信息图/结构图
- 文档/票据/手写资料
- 字体/字效设计
- 分镜/动作参考
- 品牌/视觉规范
- 产品界面/交互设计
- 其他/综合创意

Use multiple categories when the request naturally crosses domains, such as a product poster with typography, or a UI screenshot with social media context.

Capability mapping:

- Inspiration library search: use categories, search terms, random cases, and case details.
- Template selection: use live `/free-image/api/templates` when output type is explicit.
- Prompt writing: adapt cases and categories into an original prompt for the user's subject.
- New image generation: hand off to `image-generation-workflow.md` after category/template matching.
- Image editing: hand off to `image-generation-workflow.md`; use edit invariants and Yali queued API `action:"edit"` with 1-2 reference images when using Yali.
- PPT generation: hand off to `references/ppt-generation/README.md` and support slide image prompts.

## Generation Taxonomy

Use these buckets internally when a prompt needs more precise production handling. Map them back to one or more Yali categories for search and classification:

- `photorealistic-natural`: candid/editorial photography, portraits, lifestyle scenes
- `product-mockup`: product, packaging, e-commerce, catalog imagery
- `ads-marketing`: WeChat official account covers, Xiaohongshu covers, video covers, article hero images, posters, banners, campaign concepts, and ad creatives
- `ui-mockup`: app, website, dashboard, interface concepts
- `infographic-diagram`: knowledge cards, diagrams, structured explainers
- `logo-brand`: logo, brand mark, visual identity exploration
- `illustration-story`: comics, children's book art, narrative illustrations
- `stylized-concept`: concept art, 3D, painterly, fantasy, worldbuilding
- `text-localization`: replace or preserve in-image text
- `identity-preserve`: maintain person, face, pose, product, or reference identity
- `precise-object-edit`: remove, replace, or adjust a specific object only
- `lighting-weather`: change light, season, weather, or atmosphere only
- `background-extraction`: cutout or transparent-background work
- `style-transfer`: apply a reference style while controlling subject drift
- `compositing`: combine multiple images with matched perspective and light
- `sketch-to-render`: turn sketch, wireframe, or rough draft into polished output

The taxonomy is for agent reasoning. Do not expose it as if it were the website's official category list unless the user asks for internal classification details.

## Search Strategy

Use public API searches in this order:

1. Search direct subject words.
2. Search output type words, such as WeChat cover, Xiaohongshu cover, video cover, article cover, poster, product, UI, portrait, infographic, logo, storyboard.
3. Search style words, such as realistic, cinematic, watercolor, pixel, 3D, hand-drawn, luxury.
4. If results are weak, use category-filtered random cases for browsing.

Prefer cases whose visual structure matches the user's target, not just cases sharing a keyword.

## Prompt Construction

Build prompts with these blocks:

1. Subject and task
2. Composition and layout
3. Visual style and materials
4. Lighting, camera, texture, or rendering details
5. Text and label requirements
6. Aspect ratio, size, and output format
7. Constraints and negative details

For Chinese users, write the final prompt in Chinese unless they ask otherwise.

For generation, edits, or batches, see `image-generation-workflow.md` for the full compact spec format, provider decision, size guidance, and quality rules.

## Template Selection

When generating through the API, choose a `template_key` only when the user's need clearly maps to a Yali template. Do not force templates for broad, exploratory, or ambiguous creative requests. Before using a template, read the live template endpoint:

```text
GET https://www.yaliai.com/wp-json/yali/v1/free-image/api/templates
```

Use the live template data first. The fallback list below exists so the agent can reason before or without a network call.

- `product-hero`: product main image, e-commerce hero, product detail visual
- `website-banner`: commercial poster, campaign image, banner, ad landing image
- `ui-mockup`: app, website, dashboard, interface mockup
- `infographic`: explanation diagram, relationship map, knowledge card
- `technical-diagram`: system flow, architecture, sequence, technical process
- `logo-concept`: logo and brand mark exploration
- `wechat-cover`: WeChat article cover
- `xiaohongshu-cover`: Xiaohongshu note cover
- `video-cover`: YouTube, Bilibili, short-video cover
- `film-storyboard`: film storyboard sheet
- `ad-storyboard`: advertising storyboard sheet
- `story-illustration`: story scene illustration
- `concept-art`: worldbuilding, style exploration, concept design
- `sketch-to-render`: turn a sketch/reference into a finished image

If unsure, omit `template_key` and put more constraints in the prompt.

## Template-Aware Generation

When a request is clearly template-shaped, use this sequence:

1. Fetch `/free-image/api/templates`.
2. Select the best `template_key`.
3. Read that template's `description`, `hint`, `fixedSize`, and `sizeOptions`.
4. Write a user-facing prompt that supplies the missing subject, style, text, and constraints.
5. Set `size_key` from `fixedSize` if present; otherwise pick the most suitable `sizeOptions` value.
6. Send `template_key`, `prompt`, `size_key`, `quality`, and optional `prompt_context` to `/free-image/api/generate`.

Template presets add server-side prompt constraints. Do not paste hidden server instructions or invent template internals; send a clean user prompt plus the selected `template_key`.

When the request is not clearly template-shaped, omit `template_key` and express the needed constraints directly in the prompt.

## Template Matching Rules

Use `product-hero` when the user wants product photography, e-commerce hero images, packaging shots, or product detail visuals.

Use `website-banner` when the user wants a commercial poster, campaign visual, banner, landing image, or advertising image.

Use `wechat-cover` when the user asks for a WeChat official account cover, public account article cover, 公众号封面, 微信公众号首图, or similar Chinese content-operations cover image.

Use `ui-mockup` when the user wants an app screen, website page, dashboard, SaaS UI, or interface concept.

Use `infographic` when the user wants knowledge cards, relationship diagrams, process explanations, or visual summaries.

Use `technical-diagram` when the user wants architecture diagrams, flowcharts, API flows, system diagrams, or technical process visuals.

Use `logo-concept` when the user wants logo exploration, brand marks, symbols, or identity concepts.

Use `wechat-cover`, `xiaohongshu-cover`, or `video-cover` when the target platform is explicit.

Use `film-storyboard` or `ad-storyboard` when the user wants a multi-frame production board or storyboard sheet.

Use `story-illustration` when the user wants a single narrative illustration.

Use `concept-art` when the user wants worldbuilding, visual development, character/scene concept art, or style exploration.

Use `sketch-to-render` when the user provides or describes a rough sketch/reference that should become a polished image.

## Case Use

When referencing cases:

- Include `case_id`, `title`, and `detail_url`.
- Use case prompts as structural inspiration.
- Do not claim the result is copied from the case.
- Preserve user-specific details over case-specific details.

## Generation Decision

If the user wants only a prompt:

- Return a final copyable prompt.
- Include 2-5 related case links when useful.

If the user wants generation:

- First choose Yali queued API, host-native generation, or prompt-only using `image-generation-workflow.md`.
- For Yali API generation, check that `YALIAI_API_KEY` is available or ask them to get it from `https://www.yaliai.com/free-image/`.
- Call the generation endpoint with the selected template and prompt only on the Yali API path.
- Return `task_id`, status, queue position, and cost for Yali API tasks.
- Poll only if the user wants you to wait.

## Safety And Key Handling

- Never include a real key in generated files.
- Use `$YALIAI_API_KEY` in shell examples.
- If producing repository files, put key instructions in `.env.example`, not `.env`.
- If the user pastes a key, use it only for the current request unless they explicitly ask to save it locally.
