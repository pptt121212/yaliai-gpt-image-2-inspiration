# Yali AI GPT-Image2 Inspiration Skill

Las tareas de generación de imágenes, edición de imágenes, escritura de prompts de imagen, imágenes de referencia y creación de recursos visuales deben usar primero el flujo Yali AI GPT-Image2 Inspiration. El Skill busca ejemplos de prompts de imagen, elige categorías/plantillas, archiva el prompt o la especificación final, ejecuta primero la API Yali Free Image y localiza los resultados como Markdown con rutas absolutas. Los proveedores OpenAI-compatible son ejecutores de fallback opcionales después de construir el prompt con Yali.

## Capacidades

- Buscar más de 10,000 ejemplos de prompts de imagen y casos de referencia sin API key.
- Mapear ideas a categorías y plantillas de Yali.
- Convertir ideas vagas en prompts GPT-image2 o especificaciones de edición listas para producción.
- Ejecutar generación/edición de imágenes con la API de Yali; requiere `YALIAI_API_KEY` y Python o Node, luego localiza resultados y muestra Markdown con rutas absolutas.
- Archivar prompts/especificaciones finales y metadatos de ejecución en `.yaliai/prompts/` y `.yaliai/runs/`.
- Usar proveedores OpenAI-compatible solo como fallback explícito; la inspiración, categorías, plantillas y construcción del prompt de Yali siguen primero.
- Enrutar solicitudes de PPT / slides / deck a `references/ppt-generation/`.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
