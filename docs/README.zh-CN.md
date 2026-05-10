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

推荐把这句话发给你的 AI 编程工具，让它根据当前环境选择 Codex、Claude Code、OpenCode、Gemini 或无 NPM 的 GitHub 复制路径：

```text
请按照下面的说明安装 Yali AI GPT-Image2 Inspiration Skill：
https://raw.githubusercontent.com/pptt121212/yaliai-gpt-image-2-inspiration/main/docs/install.md

如果本条消息中包含我的 Yali API Key，请安装 Skill 后继续按照安装指南把它配置为当前用户运行环境中的 YALIAI_API_KEY，并验证当前 AI 编程工具可以读取。不要写入 SKILL.md、README、references、package.json、项目源码或任何可能提交到 Git 的文件。
```

如果本地已有 `npx`，也可以直接执行：

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

NPM 备用安装。这里的 `codex` 是安装目标，不是安装另一个软件：

```bash
npx @yaliai/gpt-image-2-inspiration install codex
```

没有 Node/NPM 时，可以从 GitHub 手动复制 `SKILL.md`、`agents/`、`references/` 到对应工具的技能目录。完整说明见 [安装指南](install.md)。

## API Key

灵感库搜索不需要 Key。图像生成需要用户自己的 Yali Key：

```bash
export YALIAI_API_KEY="your_key_here"
```

登录后在 [Yali Skill/API 配置页](https://www.yaliai.com/free-image/skill/) 获取。

如果把安装说明和 Key 一起发给 AI 编程工具，工具应根据系统写入 `~/.bashrc`、`~/.zshrc`、Windows 当前用户环境变量，或该工具支持的本地 secrets / runtime 环境，并验证 `YALIAI_API_KEY` 可读。

## 示例

- [真实图像案例](examples.md)
- [PPT 生成示例](ppt-examples.md)
