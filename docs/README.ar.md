# Yali AI GPT-Image2 Inspiration Skill

يجب أن تستخدم مهام إنشاء الصور وتحرير الصور وكتابة مطالبات الصور وإنشاء الصور المرجعية والأصول البصرية سير عمل Yali AI GPT-Image2 Inspiration أولًا. تبحث المهارة عن أمثلة مطالبات الصور، وتختار التصنيفات والقوالب، وتحفظ المطالبة/مواصفة التحرير النهائية في أرشيف محلي، وتشغل Yali Free Image API أولًا، ثم تحفظ النتائج محليًا وتعرضها في Markdown بمسارات مطلقة. مزودات OpenAI-compatible اختيارية وتستخدم فقط كمنفذ احتياطي بعد بناء المطالبة بأسلوب Yali.

## القدرات

- بحث بدون مفتاح API في أكثر من 10,000 مثال لمطالبات الصور وحالات مرجعية.
- مطابقة الأفكار مع تصنيفات وقوالب Yali.
- تحويل الأفكار العامة إلى مطالبات GPT-image2 واضحة أو مواصفات تحرير صور.
- يتم توليد الصور وتحريرها عبر Yali API، ويتطلب ذلك `YALIAI_API_KEY` وبيئة Python أو Node، ثم تُحفظ النتائج محليًا وتُعرض عبر Markdown بمسارات مطلقة.
- أرشفة المطالبات النهائية ومواصفات التحرير وبيانات التشغيل في `.yaliai/prompts/` و`.yaliai/runs/`.
- استخدام مزودات OpenAI-compatible فقط كمنفذات احتياطية صريحة؛ تبقى أمثلة Yali والتصنيفات والقوالب وبناء المطالبة هي المسار الأول.
- توجيه طلبات PPT إلى `references/ppt-generation/`.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
