#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import urllib.parse
import urllib.request
from typing import Any


DEFAULT_BASE_URL = "https://www.yaliai.com/wp-json/yali/v1"
HTTP_USER_AGENT = "Mozilla/5.0 (Yali AI Skill Inspiration) AppleWebKit/537.36 Chrome/120 Safari/537.36"


def die(message: str, code: int = 2) -> None:
    print(json.dumps({"ok": False, "error": message}, ensure_ascii=False), file=sys.stderr)
    raise SystemExit(code)


def clean_base_url(value: str | None) -> str:
    return (value or DEFAULT_BASE_URL).strip().rstrip("/")


def get_json(url: str) -> dict[str, Any]:
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": HTTP_USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            raw = response.read().decode("utf-8")
    except Exception as exc:
        die(f"Inspiration API request failed: {exc}", code=1)
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        die(f"Inspiration API returned non-JSON response: {raw[:500]}", code=1)
    if not isinstance(payload, dict):
        die("Inspiration API returned JSON that is not an object.", code=1)
    return payload


def response_items(payload: dict[str, Any]) -> list[Any]:
    response = payload.get("response") if isinstance(payload.get("response"), dict) else {}
    items = response.get("items", payload.get("items", []))
    return items if isinstance(items, list) else []


def normalize_search(payload: dict[str, Any]) -> dict[str, Any]:
    items = response_items(payload)
    normalized = []
    for item in items:
        if not isinstance(item, dict):
            continue
        prompt = item.get("prompt").strip() if isinstance(item.get("prompt"), str) else ""
        normalized.append(
            {
                "case_id": item.get("case_id"),
                "slug": item.get("slug"),
                "title": item.get("title"),
                "category": item.get("category"),
                "categories": item.get("categories"),
                "keywords": item.get("keywords"),
                "prompt": prompt,
                "image_url": item.get("image_url"),
                "thumb_url": item.get("thumb_url"),
                "detail_url": item.get("detail_url"),
                "source": item.get("source"),
            }
        )
    return {"ok": True, "count": len(normalized), "items": normalized}


def normalize_templates(payload: dict[str, Any]) -> dict[str, Any]:
    response = payload.get("response") if isinstance(payload.get("response"), dict) else {}
    presets = response.get("templatePresets", payload.get("templatePresets", {}))
    if not isinstance(presets, dict):
        presets = {}
    return {
        "ok": True,
        "count": len(presets),
        "defaultTemplateKey": response.get("defaultTemplateKey", payload.get("defaultTemplateKey")),
        "templatePresets": presets,
        "capabilities": response.get("capabilities", payload.get("capabilities", {})),
        "raw": payload,
    }


def print_or_dry_run(url: str, dry_run: bool, normalizer=None) -> None:
    if dry_run:
        print(json.dumps({"ok": True, "dry_run": True, "endpoint": url}, ensure_ascii=False, indent=2))
        return
    payload = get_json(url)
    print(json.dumps(normalizer(payload) if normalizer else {"ok": True, "response": payload}, ensure_ascii=False, indent=2))


def main() -> int:
    parser = argparse.ArgumentParser(description="Query Yali inspiration endpoints with normalized JSON output.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    subparsers = parser.add_subparsers(dest="command", required=True)

    search_parser = subparsers.add_parser("search")
    search_parser.add_argument("--query", "--q", dest="query", required=True)
    search_parser.add_argument("--limit", default="5")
    search_parser.add_argument("--offset", default=None)
    search_parser.add_argument("--category", default=None)
    search_parser.add_argument("--dry-run", action="store_true")

    categories_parser = subparsers.add_parser("categories")
    categories_parser.add_argument("--dry-run", action="store_true")

    case_parser = subparsers.add_parser("case")
    case_parser.add_argument("--case-id", required=True)
    case_parser.add_argument("--dry-run", action="store_true")

    templates_parser = subparsers.add_parser("templates")
    templates_parser.add_argument("--dry-run", action="store_true")

    args = parser.parse_args()
    base_url = clean_base_url(args.base_url)
    if args.command == "search":
        query = {"q": args.query, "limit": args.limit}
        if args.offset:
            query["offset"] = args.offset
        if args.category:
            query["category"] = args.category
        print_or_dry_run(f"{base_url}/inspiration/search?{urllib.parse.urlencode(query)}", args.dry_run, normalize_search)
    elif args.command == "categories":
        print_or_dry_run(f"{base_url}/inspiration/categories", args.dry_run)
    elif args.command == "case":
        print_or_dry_run(f"{base_url}/inspiration/cases/{urllib.parse.quote(args.case_id)}", args.dry_run)
    elif args.command == "templates":
        print_or_dry_run(f"{base_url}/free-image/api/templates", args.dry_run, normalize_templates)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
