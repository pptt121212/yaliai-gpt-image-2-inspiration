# Local Template Fallback

Use local fallback templates only when Yali retrieval is unavailable, returns weak matches, or the user explicitly asks for offline prompt work. Do not read this file before trying Yali inspiration/categories/templates when network access is available and useful.

This file is a compact fallback taxonomy, not a replacement for the Yali inspiration library. Use it to structure missing-field questions, prompt variants, and avoid lists, then continue with Yali API execution when possible.

## Fallback Template Contract

For any category below, build the prompt with:

1. **Scope**: what the visual is for.
2. **Required fields**: missing fields that materially affect the result.
3. **Main prompt structure**: subject, scene, layout, style, visible text, constraints, avoid list.
4. **Variants**: 2-3 alternative directions only when the user is vague.
5. **Yali mapping**: search terms and likely live template keys.

Ask only for missing required fields that change the output. Default everything else.

## Category Matrix

| Category | Use for | Required fields | Yali search terms | Likely template keys |
| --- | --- | --- | --- | --- |
| UI mockups | websites, apps, SaaS, dashboards, product interfaces | product type, screen purpose, visible UI text when important | `网站 UI`, `dashboard UI`, `SaaS UI`, `app interface` | `ui-mockup`, `website-banner` |
| Product visuals | product hero, e-commerce, white background, lifestyle scene | product name/type, selling point, target platform | `商品主图`, `product hero`, `电商海报`, `packaging` | `product-hero` |
| Posters and campaigns | ads, covers, banners, campaign KV, social covers | campaign subject, headline text, platform/aspect | `海报`, `广告`, `封面`, `banner`, `小红书封面` | `website-banner`, `video-cover` |
| Infographics | explainers, guides, comparison visuals, KPI boards | topic, 3-7 facts, text language | `信息图`, `guide infographic`, `comparison infographic` | `infographic` |
| Editing workflows | background replacement, object removal, retouching, restyle | source image, edit target, must-preserve elements | `图像编辑`, `换背景`, `去除物体`, `product retouch` | none or edit action |
| Portraits and characters | professional portraits, founder shots, virtual hosts, character sheets | person/character identity, usage, realism level | `portrait`, `角色设定`, `职业肖像`, `虚拟主播` | none |
| Avatars and stickers | profile icons, sticker sets, themed avatars | subject, number of items, style | `头像`, `贴纸`, `3D icon`, `sticker set` | none |
| Branding and packaging | identity boards, logo concepts, mascot kits, label designs | brand name, product/category, visual personality | `品牌视觉`, `logo`, `包装设计`, `mascot` | `logo-concept`, `product-hero` |
| Typography layouts | text-first posters, bilingual layouts, title-safe graphics | exact text, language, hierarchy | `字体设计`, `typography poster`, `双语版式` | none |
| Scenes and illustrations | mood scenes, concept art, picture-book scenes | subject, mood, setting, style | `插画`, `concept art`, `绘本`, `场景` | `story-illustration`, `concept-art` |
| Storyboards and sequences | comics, cinematic boards, recipe/process boards | sequence steps or story beats, panel count | `分镜`, `storyboard`, `四格漫画`, `流程图` | `film-storyboard`, `ad-storyboard` |
| Grids and collages | multi-panel ads, lookbooks, mixed-style boards | grid size, item list, shared style | `九宫格`, `lookbook`, `广告banner合集` | none |
| Slides and visual docs | single-slide visuals, report pages, dense explainers | topic, audience, key message | `PPT`, `slide`, `报告页`, `讲解图` | `infographic` |
| PPT decks | multi-slide presentations | slide count, topic, audience, output format | `PPT`, `presentation`, `deck` | see `ppt-generation/` |
| Maps | travel maps, city maps, store distribution maps | location, stops/regions, labels | `地图`, `旅行路线`, `城市地图`, `门店分布` | none |
| Technical diagrams | architecture, flowchart, ER, sequence, topology | system/components, relationships, labels | `架构图`, `流程图`, `technical diagram` | `technical-diagram` |
| Academic figures | graphical abstracts, method pipelines, publication diagrams | field, method/process, non-fabricated labels | `论文图`, `graphical abstract`, `method pipeline` | `technical-diagram`, `infographic` |
| Assets and props | icons, game screenshots, UI props | asset list, style, format | `icon set`, `game screenshot`, `素材` | none |

## Main Prompt Skeleton

```text
Create <output type> for <subject/use case>.
Composition: <layout, hierarchy, focal point, panel/grid if any>.
Style: <visual style, medium, lighting, color, material>.
Content: <visible text, labels, UI copy, data facts, product claims>.
Constraints: preserve <must-preserve>; avoid <failure modes>.
Format: <aspect ratio, size, platform>.
```

## Missing-Field Questions

Ask precise questions, not broad style questions:

- For UI: What screen/workflow is shown, and what text must appear?
- For product visuals: What product and selling point must be visible?
- For posters/covers: What headline and platform/aspect ratio are required?
- For editing: Which source image, what exact edit target, and what must not change?
- For infographics/academic/technical diagrams: Which labels or facts are provided, and which must not be invented?

If the user says to decide for them, choose reasonable defaults and continue.
