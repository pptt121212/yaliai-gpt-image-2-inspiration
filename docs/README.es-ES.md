# Yali AI GPT-Image2 Inspiration Skill

Agent Skill para buscar en la biblioteca de inspiración GPT-image2 de Yali AI, escribir prompts de imagen, usar la API Yali Free Image y enrutar solicitudes de PPT o presentaciones hacia un flujo local.

## Capacidades

- Buscar más de 10,000 ejemplos curados sin API key.
- Mapear ideas a categorías y plantillas de Yali.
- Convertir ideas vagas en prompts GPT-image2 listos para producción.
- Ejecutar generación/edición de imágenes con la API de Yali; requiere `YALIAI_API_KEY` y Python o Node, luego localiza resultados y muestra Markdown con rutas absolutas.
- Enrutar solicitudes de PPT / slides / deck a `references/ppt-generation/`.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
