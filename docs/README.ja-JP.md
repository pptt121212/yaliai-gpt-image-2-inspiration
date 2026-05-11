# Yali AI GPT-Image2 Inspiration Skill

Yali AI の GPT-image2 インスピレーションライブラリを検索し、画像生成プロンプトを作成し、Yali Free Image API を使うための Agent Skill です。PPT / スライド / デッキの依頼は、ローカル PPT ワークフローへルーティングします。

## 主な機能

- API キーなしで 10,000+ の厳選画像プロンプト例を検索。
- Yali のカテゴリとテンプレートに基づいて用途を分類。
- あいまいなアイデアを実用的な GPT-image2 プロンプトへ変換。
- `YALIAI_API_KEY` 設定時は Yali 画像生成 API を利用し、結果をローカル化して絶対パス Markdown で表示。
- PPT / slides / deck の依頼は `references/ppt-generation/` を参照。

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
