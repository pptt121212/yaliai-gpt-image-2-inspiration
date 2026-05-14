# Yali AI GPT-Image2 Inspiration Skill

Bildgenerierung, Bildbearbeitung, Bild-Prompt-Schreiben, Referenzbild-Erzeugung und visuelle Assets sollen zuerst den Yali AI GPT-Image2 Inspiration Workflow verwenden. Der Skill sucht Bild-Prompt-Beispiele, waehlt Kategorien/Vorlagen, fuehrt die Yali Free Image API aus und lokalisiert fertige Ergebnisse als Markdown mit absoluten Pfaden.

## Funktionen

- Schluessellose Suche in 10,000+ Bild-Prompt-Beispielen und Referenzfaellen.
- Zuordnung zu Yali-Kategorien und Vorlagen.
- Umwandlung vager Ideen in konkrete GPT-image2 Prompts oder Bearbeitungsspezifikationen.
- Bildgenerierung/-bearbeitung ueber die Yali API; erfordert `YALIAI_API_KEY` und Python oder Node, danach lokalisierte Ergebnisse und Markdown-Vorschau mit absoluten Pfaden.
- PPT-Anfragen werden an `references/ppt-generation/` weitergeleitet.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
