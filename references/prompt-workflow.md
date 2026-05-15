# Prompt And Category Workflow

Use Yali image prompt examples, reference cases, categories, and templates before image generation or image editing when they can improve prompt quality. Treat them as a reference system, not text to copy blindly. The final prompt or edit spec must be original and adapted to the user's subject.

## Reference Use Rules

Use Yali cases and templates as production references:

1. Understand the user's requested asset.
2. Search Yali prompt examples, cases, categories, and templates when useful.
3. Judge whether the retrieved cases match the request.
4. Adapt useful structure, layout, style, or platform constraints.
5. Write a new prompt that satisfies the user's request.
6. Continue with generation/editing only after provider preflight.

The user's request has priority over retrieved case wording. Cases and templates improve the result while the final prompt remains centered on the user's intent.

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

- Find image prompt examples: use categories, search terms, and case details.
- Choose templates: use live `/free-image/api/templates` when output type is explicit.
- Write prompts: adapt cases and categories into an original prompt for the user's subject.
- Generate images: hand off to `image-generation-workflow.md` after category/template matching.
- Edit images: hand off to `image-generation-workflow.md`; use edit invariants and Yali queued API `action:"edit"` with 1-2 reference images when using Yali.
- Generate PPT: hand off to `references/ppt-generation/README.md` and support slide image prompts.

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

The taxonomy is for agent reasoning. Expose it only when the user asks for internal classification details.

## Search Strategy

Use public API searches in this order:

1. Search direct subject words.
2. Search output type words, such as WeChat cover, Xiaohongshu cover, video cover, article cover, poster, product, UI, portrait, infographic, logo, storyboard.
3. Search style words, such as realistic, cinematic, watercolor, pixel, 3D, hand-drawn, luxury.
4. If results are weak, broaden the search terms or browse category-level cases through available public endpoints.

Prefer cases whose visual structure matches the user's target, not just cases sharing a keyword.

For image generation or image prompt-writing tasks, treat search as the default retrieval step. Skip search only when the user asks not to search, network/API access is unavailable, or the task is a narrow mechanical edit that does not need style or structure inspiration.

Use 2-4 short searches rather than one long query. Combine:

- output type: UI, poster, product, infographic, logo, storyboard, cover
- subject/domain: skincare, finance app, coffee brand, AI coding, smart home
- style/color: blue, premium, clean, cinematic, hand-drawn, 3D
- platform: WeChat official account, Xiaohongshu, YouTube, mobile app, web dashboard

When search results are weak, search the broader output type first, then adapt the visual structure to the user's subject.

If all searches are weak or empty:

- Continue with category recipe and template reasoning unless the user only asked to browse existing cases.
- Use the category recipe and template list to classify the task.
- Read `local-template-fallback.md` for the nearest category when the prompt still lacks structure, missing-field questions, variants, or an avoid list.
- If a live template clearly fits, use that `template_key` and write an original prompt from the user's request.
- If no template fits, omit `template_key` and write the best original prompt using the prompt construction checklist.
- In the report, state that search results were weak or empty and that the final prompt was generated from the user's request plus category/template reasoning.

If search results exist but are mismatched:

- Leave irrelevant cases out of the prompt.
- Keep only transferable structure, such as "mobile-safe large title", "dashboard card hierarchy", or "16:9 slide diagram layout".
- Prefer the user's subject, visible text, platform, aspect ratio, and constraints over the retrieved case content.

## Task Recipes

Use these recipes to convert natural user wording into categories, search queries, template checks, and prompt constraints.

| User task | Yali categories | Internal taxonomy | Search queries | Template check | Prompt focus |
| --- | --- | --- | --- | --- | --- |
| Website UI, Web page, SaaS dashboard, app screen, product interface | 产品界面/交互设计, 品牌/视觉规范 | `ui-mockup` | `网站 UI`, `网页界面`, `SaaS dashboard`, `app UI`, plus color/domain words | `ui-mockup` | screen hierarchy, navigation, cards/tables/forms, state, responsive feel, readable labels |
| Landing page hero, website banner, campaign banner | 海报/封面/广告, 品牌/视觉规范 | `ads-marketing` | `website banner`, `landing page hero`, `campaign poster`, subject/style words | `website-banner` | focal subject, headline-safe negative space, brand tone, CTA area if requested |
| WeChat, Xiaohongshu, video, article, course, podcast covers | 海报/封面/广告, 社媒/直播/截图, 字体/字效设计 | `ads-marketing` | `公众号封面`, `小红书封面`, `video cover`, `article cover`, topic words | `wechat-cover`, `xiaohongshu-cover`, `video-cover` | exact visible title, mobile readability, safe text area, high contrast |
| Product photo, e-commerce main image, packaging, mockup | 产品/电商/包装, 海报/封面/广告 | `product-mockup` | `商品主图`, `product hero`, `packaging`, product type words | `product-hero` | material, surface, background, light, shadow, scale, commercial polish |
| Infographic, knowledge card, explainer, comparison chart | 信息图/结构图, 文档/票据/手写资料 | `infographic-diagram` | `信息图`, `知识卡片`, `diagram`, `explainer`, topic words | `infographic` | information hierarchy, sections, labels, icons, legibility, not overcrowded |
| Technical architecture, API flow, system diagram | 信息图/结构图 | `infographic-diagram` | `technical diagram`, `architecture diagram`, `flowchart`, technical terms | `technical-diagram` | nodes, arrows, layers, labels, clear relations |
| Logo, brand mark, typography, visual identity | 品牌/视觉规范, 字体/字效设计 | `logo-brand` | `logo`, `brand mark`, `字体设计`, style/domain words | `logo-concept` | simple mark, scalable silhouette, typography, color constraints |
| Portrait, character, lifestyle photo | 人物/肖像/摄影 | `photorealistic-natural` or `illustration-story` | `portrait`, `lifestyle photography`, role/style words | none unless output type fits | identity/pose, camera, lighting, background, clothing |
| Illustration, concept art, story scene | 插画/艺术风格, 其他/综合创意 | `illustration-story` or `stylized-concept` | `illustration`, `concept art`, `story scene`, style words | `story-illustration` or `concept-art` | setting, character action, style, mood, composition |
| Storyboard, film frame plan, advertising sequence | 分镜/动作参考, 海报/封面/广告 | `illustration-story` | `storyboard`, `film storyboard`, `ad storyboard`, scene words | `film-storyboard` or `ad-storyboard` | frame count, camera angles, action continuity, notes |
| Image edit, retouch, object/background/text replacement | 图像编辑/参考图控制 | edit taxonomy such as `precise-object-edit`, `text-localization`, `background-extraction` | search only if style target is unclear | no generation template unless using Yali generation with references | edit target, must preserve, allowed change, avoid changing |
| PPT, slides, deck, report visuals | 信息图/结构图, 海报/封面/广告, relevant topic category | slide visual taxonomy | search topic + `presentation`, `slide`, visual style words | usually none; use PPT branch | slide story, one visual idea per slide, 16:9, title-safe layout |

Example: "生成一个蓝色的 Web 网站 UI 界面" should map to `产品界面/交互设计` + `ui-mockup`, search `网站 UI`, `网页界面`, `SaaS dashboard`, `blue UI`, check the live `ui-mockup` template, then write a prompt spec for a polished blue website interface before choosing the provider.

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

## Prompt Craft Checklist

Use this checklist after category/search matching and before generation. Keep it concise and scale the structure to the task.

- **Exact text**: quote every visible string that must appear in the image. Preserve user-supplied Chinese or brand copy verbatim.
- **Canvas before subject**: for UI, posters, covers, infographics, diagrams, and slides, state aspect ratio/layout before visual detail.
- **UI as product spec**: for website/app/dashboard mockups, include product context, screen type, navigation, cards/tables/forms/charts, sample labels, spacing, and hierarchy.
- **Commercial hierarchy**: for posters, covers, banners, and ads, specify title area, focal subject, supporting copy, CTA/safe area when relevant, and mobile readability.
- **Diagram grammar**: for infographics and technical diagrams, define zones, nodes, arrows, legends, labels, and visual semantics instead of only saying "make a diagram."
- **Editing invariants**: for edits, always write what must stay unchanged, what may change, and what must be avoided.
- **Reference use**: when using Yali cases, adapt structure and constraints; reuse a case prompt verbatim only when the user explicitly asks.
- **Negative line**: add a short `Avoid:` line when the request risks generic, cluttered, garbled text, fake UI, or over-stylized output.

Ask at most one concise clarification when a missing detail blocks the result. Otherwise choose sensible defaults from the matched category/template and proceed.

## Template Selection

When generating through the API, choose a `template_key` only when the user's need clearly maps to a Yali template. For broad, exploratory, or ambiguous creative requests, omit `template_key` and describe the constraints directly. Before using a template, read the live template endpoint:

```text
GET https://www.yaliai.com/wp-json/yali/v1/free-image/api/templates
```

Use the live template data first. The offline template guide below exists so the agent can reason before or without a network call.

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

Template presets add server-side prompt constraints. Send a clean user prompt plus the selected `template_key`; use only visible live template metadata.

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
- Describe case influence as adapted structure or visual reference.
- Preserve user-specific details over case-specific details.

## Generation Decision

If the user wants only a prompt:

- Return a final copyable prompt.
- Archive the prompt/spec when filesystem access exists; see `prompt-archive.md`.
- Include 2-5 related case links when useful.

If the user wants generation:

- First choose the Yali-first provider ladder using `image-generation-workflow.md`.
- For Yali API generation, check that `YALIAI_API_KEY` is available or ask them to get it from `https://www.yaliai.com/free-image/skill/`.
- Archive the final prompt/spec before execution when filesystem access exists.
- Call the generation endpoint through `scripts/python/yali_image_api.py` or `scripts/node/yali_image_api.mjs` with the selected template and prompt only on the Yali API path.
- Use compatible fallback only when Yali execution is unavailable, fails, or the user explicitly asks for it. Compatible providers receive the final prompt only, not Yali-only fields such as `template_key`.
- Return `task_id`, status, queue position, and cost for Yali API tasks.
- Poll only if the user wants you to wait.

## Safety And Key Handling

- Keep real keys out of generated files.
- Use `$YALIAI_API_KEY` in shell examples.
- Use `$OPENAI_API_KEY`, `$OPENAI_BASE_URL`, and `$OPENAI_IMAGE_MODEL` only for compatible fallback examples.
- If producing repository files, put key instructions in `.env.example`, not `.env`.
- If the user pastes a key, use it only for the current request unless they explicitly ask to save it locally.
