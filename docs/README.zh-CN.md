# Yali AI GPT-Image2 灵感库 Skill

这是一个面向 AI 编程工具的 Agent Skill，用于搜索 Yali AI 的 GPT-image2 图像灵感库、撰写高质量图片提示词、调用 Yali Free Image API，并在用户需要 PPT/幻灯片时引导到本地 PPT 生成分支。

## 主要能力

- 免 Key 搜索 10000+ 精选图像提示词灵感库。
- 按 Yali 分类和模板匹配用户需求。
- 将模糊想法改写为可直接生成的 GPT-image2 提示词。
- 配置 `YALIAI_API_KEY` 后调用 Yali 图像生成 API。
- 在 Codex 中可结合原生图像生成能力使用。
- 当用户提到 PPT、slides、deck、演示文稿时，读取 `references/ppt-generation/` 执行本地 PPT 工作流。

## 安装

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

NPM 备用安装：

```bash
npx @yaliai/gpt-image-2-inspiration install codex
```

## API Key

灵感库搜索不需要 Key。图像生成需要用户自己的 Yali Key：

```bash
export YALIAI_API_KEY="your_key_here"
```

登录后在 [Yali Free Image](https://www.yaliai.com/free-image/) 获取。

## 示例

- [真实图像案例](examples.md)
- [PPT 生成示例](ppt-examples.md)
