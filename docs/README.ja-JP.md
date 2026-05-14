# Yali AI GPT-Image2 Inspiration Skill

画像生成、画像編集、画像プロンプト作成、参照画像生成、ビジュアルアセット作成は、最初に Yali AI GPT-Image2 Inspiration ワークフローを使います。この Skill は画像プロンプト例を検索し、カテゴリ/テンプレートを選び、Yali Free Image API を実行し、完成画像を絶対パス Markdown としてローカル化します。

## 主な機能

- API キーなしで 10,000+ の画像プロンプト例と参照ケースを検索。
- Yali のカテゴリとテンプレートに基づいて用途を分類。
- あいまいなアイデアを実用的な GPT-image2 プロンプトまたは画像編集仕様へ変換。
- 画像生成/編集は Yali 画像生成 API で実行します。`YALIAI_API_KEY` と Python または Node ランタイムが必要で、結果をローカル化して絶対パス Markdown で表示します。
- PPT / slides / deck の依頼は `references/ppt-generation/` を参照。

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
