# Yali AI GPT-Image2 Inspiration Skill

Yali AI의 GPT-image2 영감 라이브러리를 검색하고, 이미지 생성 프롬프트를 작성하며, Yali Free Image API 또는 Codex 네이티브 이미지 생성을 활용하는 Agent Skill입니다. PPT, 슬라이드, 덱 요청은 로컬 PPT 워크플로로 라우팅합니다.

## 주요 기능

- API 키 없이 10,000+ 선별 이미지 프롬프트 예시 검색.
- Yali 카테고리와 템플릿 기반 매칭.
- 모호한 아이디어를 실사용 GPT-image2 프롬프트로 변환.
- `YALIAI_API_KEY` 설정 시 Yali 이미지 생성 API 사용.
- Codex에서는 네이티브 이미지 생성 경로 사용 가능.
- PPT / slides / deck 요청은 `references/ppt-generation/` 문서를 따름.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
