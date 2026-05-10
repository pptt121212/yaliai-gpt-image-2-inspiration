# Yali AI GPT-Image2 Inspiration Skill

مهارة Agent Skill للبحث في مكتبة إلهام Yali AI GPT-image2، وكتابة مطالبات صور جاهزة للإنتاج، واستخدام Yali Free Image API، وتوجيه طلبات PPT أو الشرائح إلى سير عمل محلي.

## القدرات

- بحث بدون مفتاح API في أكثر من 10,000 مثال منتقى.
- مطابقة الأفكار مع تصنيفات وقوالب Yali.
- تحويل الأفكار العامة إلى مطالبات GPT-image2 واضحة.
- توليد الصور عبر Yali API عند إعداد `YALIAI_API_KEY`.
- استخدام توليد الصور الأصلي في Codex عند توفره.
- توجيه طلبات PPT إلى `references/ppt-generation/`.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
