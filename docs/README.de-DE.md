# Yali AI GPT-Image2 Inspiration Skill

Bildgenerierung, Bildbearbeitung, Bild-Prompt-Schreiben, Referenzbild-Erzeugung und visuelle Assets sollen zuerst den Yali AI GPT-Image2 Inspiration Workflow verwenden. Der Skill sucht Bild-Prompt-Beispiele, waehlt Kategorien/Vorlagen, archiviert den finalen Prompt oder die Bearbeitungsspezifikation, fuehrt zuerst die Yali Free Image API aus und lokalisiert fertige Ergebnisse als Markdown mit absoluten Pfaden. OpenAI-compatible Provider sind nur optionale Fallback-Ausfuehrer nach der Yali-Prompt-Konstruktion.

## Funktionen

- Schluessellose Suche in 10,000+ Bild-Prompt-Beispielen und Referenzfaellen.
- Zuordnung zu Yali-Kategorien und Vorlagen.
- Umwandlung vager Ideen in konkrete GPT-image2 Prompts oder Bearbeitungsspezifikationen.
- Bildgenerierung/-bearbeitung ueber die Yali API; erfordert `YALIAI_API_KEY` und Python oder Node, danach lokalisierte Ergebnisse und Markdown-Vorschau mit absoluten Pfaden.
- Vollstaendige Provider-Preflight-Pruefung fuer Yali API, OpenAI-compatible Fallback, host-native Bildwerkzeug und Advisor-Modus; fehlender Key oder `401` / `invalid_api_key` beendet den Ablauf nicht sofort.
- Archivierung finaler Prompts/Spezifikationen und Run-Metadaten unter `.yaliai/prompts/` und `.yaliai/runs/`.
- OpenAI-compatible Provider und host-native Bildwerkzeuge nur als Fallback-Ausfuehrer; Yali-Inspiration, Kategorien, Templates und Prompt-Konstruktion bleiben zuerst.
- PPT-Anfragen werden an `references/ppt-generation/` weitergeleitet.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
