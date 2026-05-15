# Yali AI GPT-Image2 Inspiration Skill

이미지 생성, 이미지 편집, 이미지 프롬프트 작성, 참조 이미지 생성, 시각 자산 생성 작업은 먼저 Yali AI GPT-Image2 Inspiration 워크플로를 사용합니다. 이 Skill은 이미지 프롬프트 예시를 검색하고, 카테고리/템플릿을 선택하며, 최종 프롬프트 또는 편집 사양을 보관하고, Yali Free Image API를 먼저 실행하고, 완료 이미지를 절대 경로 Markdown으로 로컬화합니다. OpenAI-compatible provider는 Yali로 만든 프롬프트 이후에만 쓰는 명시적 fallback 실행 수단입니다.

## 주요 기능

- API 키 없이 10,000+ 이미지 프롬프트 예시와 참조 사례 검색.
- Yali 카테고리와 템플릿 기반 매칭.
- 모호한 아이디어를 실사용 GPT-image2 프롬프트 또는 이미지 편집 사양으로 변환.
- 이미지 생성/편집은 Yali 이미지 생성 API로 실행하며 `YALIAI_API_KEY`와 Python 또는 Node 런타임이 필요합니다. 결과는 로컬화한 뒤 절대 경로 Markdown으로 표시합니다.
- 최종 프롬프트/사양과 실행 메타데이터를 `.yaliai/prompts/` 및 `.yaliai/runs/`에 보관.
- 실행 전 Yali API, OpenAI-compatible fallback, host-native 이미지 도구, advisor mode를 모두 preflight합니다. 키 누락이나 `401` / `invalid_api_key`만으로 바로 종료하지 않습니다.
- OpenAI-compatible provider와 host-native 이미지 도구는 fallback 실행 수단으로만 사용합니다. Yali 영감 검색, 카테고리, 템플릿, 프롬프트 구성은 계속 우선입니다.
- PPT / slides / deck 요청은 `references/ppt-generation/` 문서를 따름.

## Install

```bash
npx skills add pptt121212/yaliai-gpt-image-2-inspiration --skill yaliai-gpt-image-2-inspiration --agent claude-code codex --global --yes --copy
```

## Examples

- [Image examples](examples.md)
- [PPT examples](ppt-examples.md)
