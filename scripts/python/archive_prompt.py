#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import datetime
import json
from pathlib import Path
import re
import unicodedata
from typing import Any


def die(message: str, code: int = 2) -> None:
    raise SystemExit(json.dumps({"ok": False, "error": message}, ensure_ascii=False))


def slugify(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "yali-image-task")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return (text or "yali-image-task")[:80]


def read_prompt(prompt: str | None, prompt_file: str | None) -> str:
    if prompt_file:
        return Path(prompt_file).read_text(encoding="utf-8").strip()
    return (prompt or "").strip()


def metadata_from_json(value: str | None) -> dict[str, Any]:
    if not value:
        return {}
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        die("--metadata-json must be a JSON object.")
    if not isinstance(parsed, dict):
        die("--metadata-json must be a JSON object.")
    return parsed


def render_markdown(data: dict[str, Any]) -> str:
    lines = [
        f"# {data['title']}",
        "",
        f"Provider mode: {data['provider_mode']}",
        f"Intent: {data['intent']}",
        f"Template: {data.get('template_key') or 'none'}",
        f"Fallback template: {data.get('fallback_template') or 'none'}",
        f"Size/aspect: {data.get('size') or 'unspecified'}",
        f"Quality: {data.get('quality') or 'unspecified'}",
        "",
        "## Yali References",
        "",
    ]
    if data["search_queries"]:
        lines.extend([f"- Query: {query}" for query in data["search_queries"]])
    if data["reference_cases"]:
        lines.extend([f"- Case: {item}" for item in data["reference_cases"]])
    if not data["search_queries"] and not data["reference_cases"]:
        lines.append("- none")
    lines.extend(["", "## Final Prompt", "", data["prompt"]])
    if data.get("edit_spec"):
        lines.extend(["", "## Edit Spec", "", data["edit_spec"]])
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Archive a Yali-built prompt/edit spec and run metadata.")
    parser.add_argument("--title", default="Yali image task")
    parser.add_argument("--provider-mode", default="advisor")
    parser.add_argument("--intent", default="prompt")
    parser.add_argument("--prompt")
    parser.add_argument("--prompt-file")
    parser.add_argument("--out-dir", default=".yaliai")
    parser.add_argument("--slug")
    parser.add_argument("--template-key")
    parser.add_argument("--fallback-template")
    parser.add_argument("--size")
    parser.add_argument("--quality")
    parser.add_argument("--search-query", action="append", default=[])
    parser.add_argument("--reference-case", action="append", default=[])
    parser.add_argument("--edit-spec", default="")
    parser.add_argument("--metadata-json")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    prompt = read_prompt(args.prompt, args.prompt_file)
    if not prompt:
        die("Prompt is required. Use --prompt or --prompt-file.")

    base_dir = Path(args.out_dir).resolve()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    name = f"{slugify(args.slug or args.title)}-{stamp}"
    prompt_path = base_dir / "prompts" / f"{name}.md"
    run_path = base_dir / "runs" / f"{name}.json"
    data: dict[str, Any] = {
        "ok": True,
        "title": args.title,
        "provider_mode": args.provider_mode,
        "intent": args.intent,
        "template_key": args.template_key,
        "fallback_template": args.fallback_template,
        "size": args.size,
        "quality": args.quality,
        "search_queries": args.search_query,
        "reference_cases": args.reference_case,
        "prompt": prompt,
        "edit_spec": args.edit_spec,
        "prompt_path": str(prompt_path),
        "run_path": str(run_path),
    }
    data.update(metadata_from_json(args.metadata_json))
    markdown = render_markdown(data)

    if not args.dry_run:
        prompt_path.parent.mkdir(parents=True, exist_ok=True)
        run_path.parent.mkdir(parents=True, exist_ok=True)
        prompt_path.write_text(markdown, encoding="utf-8")
        run_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({"ok": True, "dry_run": args.dry_run, "prompt_path": str(prompt_path), "run_path": str(run_path), "markdown": markdown}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
