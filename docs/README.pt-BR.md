# Yali AI GPT-Image2 Inspiration Skill

Tarefas de geracao de imagens, edicao de imagens, escrita de prompts de imagem, imagens de referencia e criacao de assets visuais devem usar primeiro o fluxo Yali AI GPT-Image2 Inspiration. O Skill pesquisa exemplos de prompts de imagem, escolhe categorias/modelos, arquiva o prompt ou especificacao final, executa primeiro a API Yali Free Image e localiza resultados como Markdown com caminhos absolutos. Provedores OpenAI-compatible sao executores opcionais de fallback depois da construcao do prompt com Yali.

## Recursos

- Busca sem chave em mais de 10,000 exemplos de prompts de imagem e casos de referencia.
- Correspondencia com categorias e modelos da Yali.
- Transformacao de ideias vagas em prompts GPT-image2 ou especificacoes de edicao concretas.
- Geracao/edicao de imagens via API Yali; requer `YALIAI_API_KEY` e Python ou Node, depois localiza os resultados e mostra preview Markdown com caminhos absolutos.
- Preflight completo da API Yali, fallback OpenAI-compatible, ferramenta host-native de imagem e modo advisor; chave ausente ou `401` / `invalid_api_key` nao encerra o fluxo diretamente.
- Arquivo de prompts/especificacoes finais e metadados de execucao em `.yaliai/prompts/` e `.yaliai/runs/`.
- Uso de provedores OpenAI-compatible e ferramentas host-native apenas como executores fallback; inspiracao, categorias, modelos e construcao de prompt da Yali continuam primeiro.
- Pedidos de PPT sao encaminhados para `references/ppt-generation/`.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
