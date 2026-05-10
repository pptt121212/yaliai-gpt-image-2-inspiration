# Yali AI GPT-Image2 Inspiration Skill

Agent Skill pour rechercher dans la bibliothèque d'inspiration GPT-image2 de Yali AI, rédiger des prompts d'image, utiliser l'API Yali Free Image et orienter les demandes PPT / slides / deck vers un workflow local.

## Capacités

- Recherche sans clé API dans plus de 10 000 exemples de prompts sélectionnés.
- Correspondance avec les catégories et modèles Yali.
- Transformation d'idées vagues en prompts GPT-image2 prêts à générer.
- Génération via l'API Yali avec `YALIAI_API_KEY`.
- Génération native dans Codex quand elle est disponible.
- Routage des demandes PPT vers `references/ppt-generation/`.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
