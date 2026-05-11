# Yali AI GPT-Image2 Inspiration Skill

Agent Skill para pesquisar a biblioteca de inspiracao GPT-image2 da Yali AI, escrever prompts de imagem prontos para producao, usar a API Yali Free Image e encaminhar pedidos de PPT, slides ou decks para um fluxo local.

## Recursos

- Busca sem chave em mais de 10,000 exemplos curados de prompts.
- Correspondencia com categorias e modelos da Yali.
- Transformacao de ideias vagas em prompts GPT-image2 concretos.
- Geracao/edicao de imagens via API Yali; requer `YALIAI_API_KEY` e Python ou Node, depois localiza os resultados e mostra preview Markdown com caminhos absolutos.
- Pedidos de PPT sao encaminhados para `references/ppt-generation/`.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
