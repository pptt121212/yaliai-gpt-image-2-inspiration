# Yali AI GPT-Image2 Inspiration Skill

Agent Skill para buscar en la biblioteca de inspiración GPT-image2 de Yali AI, escribir prompts de imagen, usar la API Yali Free Image y enrutar solicitudes de PPT o presentaciones hacia un flujo local.

## Capacidades

- Buscar más de 10,000 ejemplos curados sin API key.
- Mapear ideas a categorías y plantillas de Yali.
- Convertir ideas vagas en prompts GPT-image2 listos para producción.
- Usar la API de generación de Yali con `YALIAI_API_KEY`.
- Usar generación nativa de imágenes en Codex cuando esté disponible.
- Enrutar solicitudes de PPT / slides / deck a `references/ppt-generation/`.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
