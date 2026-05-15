#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import mimetypes
import os
from pathlib import Path
import time
import urllib.error
import urllib.request
from typing import Any

from localize_image_result import localize


DEFAULT_BASE_URL = "https://api.openai.com/v1"
DEFAULT_MODEL = "gpt-image-1"
TRUTHY = {"1", "true", "yes", "on", "y"}


def die(message: str, code: int = 2) -> None:
    print(json.dumps({"ok": False, "error": message}, ensure_ascii=False), file=os.sys.stderr)
    raise SystemExit(code)


def clean_base_url(value: str | None) -> str:
    return (value or os.environ.get("OPENAI_BASE_URL") or DEFAULT_BASE_URL).strip().rstrip("/")


def fallback_allowed(value: bool) -> bool:
    return value or (os.environ.get("YALIAI_ALLOW_COMPAT_PROVIDER", "").strip().lower() in TRUTHY)


def read_api_key(value: str | None, dry_run: bool) -> str:
    key = (value or os.environ.get("OPENAI_API_KEY") or "").strip()
    if not key and not dry_run:
        die("OPENAI_API_KEY is required for compatible fallback execution.")
    return key


def read_prompt(prompt: str | None, prompt_file: str | None) -> str:
    text = Path(prompt_file).read_text(encoding="utf-8").strip() if prompt_file else (prompt or "").strip()
    if not text:
        die("Prompt is required. Use --prompt or --prompt-file.")
    return text


def request_json(url: str, api_key: str, payload: dict[str, Any]) -> dict[str, Any]:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    return parse_response(request, "compatible image API")


def parse_response(request: urllib.request.Request, label: str) -> dict[str, Any]:
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            text = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        text = exc.read().decode("utf-8", errors="replace")
        die(f"HTTP {exc.code} from {label}: {text}", code=1)
    except urllib.error.URLError as exc:
        die(f"{label} request failed: {exc}", code=1)
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        die(f"{label} returned non-JSON response: {text[:500]}", code=1)
    if not isinstance(parsed, dict):
        die(f"{label} returned JSON that is not an object.", code=1)
    return parsed


def guess_mime(file_path: str) -> str:
    return mimetypes.guess_type(file_path)[0] or "image/png"


def multipart_body(fields: dict[str, Any], files: list[tuple[str, str]]) -> tuple[bytes, str]:
    boundary = f"----yaliai-compatible-{int(time.time() * 1000):x}"
    chunks: list[bytes] = []
    for name, value in fields.items():
        if value is None or value == "":
            continue
        chunks.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode("utf-8"))
    for name, file_name in files:
        file_path = Path(file_name).resolve()
        if not file_path.exists():
            die(f"Image file does not exist: {file_path}")
        chunks.append(
            (
                f"--{boundary}\r\n"
                f"Content-Disposition: form-data; name=\"{name}\"; filename=\"{file_path.name}\"\r\n"
                f"Content-Type: {guess_mime(str(file_path))}\r\n\r\n"
            ).encode("utf-8")
        )
        chunks.append(file_path.read_bytes())
        chunks.append(b"\r\n")
    chunks.append(f"--{boundary}--\r\n".encode("utf-8"))
    return b"".join(chunks), f"multipart/form-data; boundary={boundary}"


def request_multipart(url: str, api_key: str, fields: dict[str, Any], files: list[tuple[str, str]]) -> dict[str, Any]:
    body, content_type = multipart_body(fields, files)
    request = urllib.request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
            "Content-Type": content_type,
            "Content-Length": str(len(body)),
        },
        method="POST",
    )
    return parse_response(request, "compatible image API")


def maybe_localize(payload: dict[str, Any], args: argparse.Namespace) -> dict[str, Any] | None:
    if args.no_localize:
        return None
    return localize(payload, args.out_dir, args.alt or "compatible image", args.limit)


def generate(args: argparse.Namespace) -> None:
    if not fallback_allowed(args.allow_fallback) and not args.dry_run:
        die("Compatible fallback is not enabled. Set YALIAI_ALLOW_COMPAT_PROVIDER=1 or pass --allow-fallback.")
    base_url = clean_base_url(args.base_url)
    payload: dict[str, Any] = {
        "model": args.model or os.environ.get("OPENAI_IMAGE_MODEL") or DEFAULT_MODEL,
        "prompt": read_prompt(args.prompt, args.prompt_file),
    }
    for key in ("size", "quality", "output_format", "response_format"):
        value = getattr(args, key)
        if value:
            payload[key] = value
    if args.n:
        payload["n"] = args.n
    endpoint = f"{base_url}/images/generations"
    if args.dry_run:
        print(json.dumps({"ok": True, "dry_run": True, "provider": "compatible-fallback", "endpoint": endpoint, "request": payload}, ensure_ascii=False, indent=2))
        return
    result = request_json(endpoint, read_api_key(args.api_key, False), payload)
    output: dict[str, Any] = {"ok": True, "provider": "compatible-fallback", "endpoint": endpoint, "result": result}
    localized = maybe_localize(result, args)
    if localized:
        output["localize"] = localized
    print(json.dumps(output, ensure_ascii=False, indent=2))


def edit(args: argparse.Namespace) -> None:
    if not fallback_allowed(args.allow_fallback) and not args.dry_run:
        die("Compatible fallback is not enabled. Set YALIAI_ALLOW_COMPAT_PROVIDER=1 or pass --allow-fallback.")
    if not args.image:
        die("edit requires at least one --image.")
    base_url = clean_base_url(args.base_url)
    fields: dict[str, Any] = {
        "model": args.model or os.environ.get("OPENAI_IMAGE_MODEL") or DEFAULT_MODEL,
        "prompt": read_prompt(args.prompt, args.prompt_file),
        "size": args.size,
        "quality": args.quality,
        "n": args.n,
    }
    endpoint = f"{base_url}/images/edits"
    if args.dry_run:
        print(json.dumps({"ok": True, "dry_run": True, "provider": "compatible-fallback", "endpoint": endpoint, "request": {**fields, "image": args.image, "mask": args.mask}}, ensure_ascii=False, indent=2))
        return
    files = [("image", item) for item in args.image]
    if args.mask:
        files.append(("mask", args.mask))
    result = request_multipart(endpoint, read_api_key(args.api_key, False), fields, files)
    output: dict[str, Any] = {"ok": True, "provider": "compatible-fallback", "endpoint": endpoint, "result": result}
    localized = maybe_localize(result, args)
    if localized:
        output["localize"] = localized
    print(json.dumps(output, ensure_ascii=False, indent=2))


def add_common(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--prompt")
    parser.add_argument("--prompt-file")
    parser.add_argument("--size")
    parser.add_argument("--quality")
    parser.add_argument("--n", type=int)
    parser.add_argument("--out-dir")
    parser.add_argument("--alt", default="compatible image")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--no-localize", action="store_true")
    parser.add_argument("--dry-run", action="store_true")


def main() -> int:
    parser = argparse.ArgumentParser(description="OpenAI-compatible fallback image executor for Yali-built prompts.")
    parser.add_argument("--base-url")
    parser.add_argument("--api-key")
    parser.add_argument("--model")
    parser.add_argument("--allow-fallback", action="store_true")
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate_parser = subparsers.add_parser("generate")
    add_common(generate_parser)
    generate_parser.add_argument("--output-format")
    generate_parser.add_argument("--response-format")
    generate_parser.set_defaults(func=generate)

    edit_parser = subparsers.add_parser("edit")
    add_common(edit_parser)
    edit_parser.add_argument("--image", action="append", default=[])
    edit_parser.add_argument("--mask")
    edit_parser.set_defaults(func=edit)

    args = parser.parse_args()
    args.func(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
