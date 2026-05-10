# Yali AI GPT-Image2 Inspiration Skill

Agent Skill zum Durchsuchen der Yali AI GPT-image2 Inspirationsbibliothek, Schreiben produktionsreifer Bild-Prompts, Nutzen der Yali Free Image API und Weiterleiten von PPT-/Slides-/Deck-Anfragen an einen lokalen PPT-Workflow.

## Funktionen

- Schluessellose Suche in 10,000+ kuratierten Prompt-Beispielen.
- Zuordnung zu Yali-Kategorien und Vorlagen.
- Umwandlung vager Ideen in konkrete GPT-image2 Prompts.
- Bildgenerierung ueber die Yali API mit `YALIAI_API_KEY`.
- Codex-native Bildgenerierung, wenn verfuegbar.
- PPT-Anfragen werden an `references/ppt-generation/` weitergeleitet.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
