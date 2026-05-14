# Yali AI GPT-Image2 Inspiration Skill

Задачи генерации изображений, редактирования изображений, написания image prompts, создания reference images и визуальных assets должны сначала использовать workflow Yali AI GPT-Image2 Inspiration. Skill ищет примеры prompts для изображений, выбирает категории/шаблоны, запускает Yali Free Image API и локализует готовые результаты как Markdown с абсолютными путями.

## Возможности

- Поиск без API-ключа по 10,000+ примерам prompts для изображений и reference cases.
- Сопоставление идей с категориями и шаблонами Yali.
- Преобразование расплывчатых идей в конкретные GPT-image2 prompts или specs для редактирования.
- Генерация/редактирование изображений выполняется через Yali API; требуется `YALIAI_API_KEY` и Python или Node, затем результаты локализуются и показываются как Markdown-превью с абсолютными путями.
- PPT-запросы направляются в `references/ppt-generation/`.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
