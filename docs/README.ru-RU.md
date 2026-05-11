# Yali AI GPT-Image2 Inspiration Skill

Agent Skill для поиска в библиотеке вдохновения Yali AI GPT-image2, написания готовых промптов для изображений, использования Yali Free Image API и маршрутизации запросов PPT / slides / deck в локальный PPT workflow.

## Возможности

- Поиск без API-ключа по 10,000+ отобранным примерам промптов.
- Сопоставление идей с категориями и шаблонами Yali.
- Преобразование расплывчатых идей в конкретные GPT-image2 prompts.
- Генерация через Yali API при наличии `YALIAI_API_KEY`, локализация результатов и Markdown-превью с абсолютными путями.
- PPT-запросы направляются в `references/ppt-generation/`.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
