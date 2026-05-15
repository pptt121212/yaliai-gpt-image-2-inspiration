#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
from pathlib import Path
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from localize_image_result import localize


DEFAULT_BASE_URL = "https://www.yaliai.com/wp-json/yali/v1"
HTTP_USER_AGENT = "Mozilla/5.0 (Yali AI Skill Runner) AppleWebKit/537.36 Chrome/120 Safari/537.36"
TERMINAL_STATUSES = {"completed", "failed", "error", "cancelled", "canceled"}


def die(message: str, code: int = 2, error_code: str | None = None, http_status: int | None = None) -> None:
    payload: dict[str, Any] = {"ok": False, "error": message}
    if error_code:
        payload["error_code"] = error_code
    if http_status is not None:
        payload["http_status"] = http_status
    print(json.dumps(payload, ensure_ascii=False), file=sys.stderr)
    raise SystemExit(code)


def api_error_code(body: str) -> str | None:
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        return None
    if not isinstance(payload, dict):
        return None
    for key in ("code", "error_code"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    error = payload.get("error")
    if isinstance(error, str) and error.strip():
        return error.strip()
    if isinstance(error, dict):
        value = error.get("code") or error.get("type")
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def clean_base_url(value: str | None) -> str:
    text = (value or DEFAULT_BASE_URL).strip().rstrip("/")
    if not text:
        return DEFAULT_BASE_URL
    if text.endswith("/free-image/api"):
        return text.removesuffix("/free-image/api")
    return text


def read_prompt(prompt: str | None, prompt_file: str | None) -> str:
    if prompt_file:
        text = Path(prompt_file).read_text(encoding="utf-8").strip()
    else:
        text = (prompt or "").strip()
    if not text:
        die("Prompt is required. Use --prompt or --prompt-file.")
    return text


def read_api_key(value: str | None) -> str:
    key = (value or os.environ.get("YALIAI_API_KEY") or "").strip()
    if not key:
        die("YALIAI_API_KEY is not set. Configure it in the runtime environment before calling the Yali API.", error_code="missing_api_key")
    return key


def encode_reference_image(value: str) -> dict[str, str]:
    text = value.strip()
    if not text:
        die("Empty --reference-image value.")
    if text.startswith("http://") or text.startswith("https://") or text.startswith("data:image/"):
        return {"image_url": text}

    path = Path(text).expanduser()
    if not path.exists():
        die(f"Reference image does not exist: {path}")
    data = path.read_bytes()
    if len(data) > 5 * 1024 * 1024:
        die(f"Reference image is larger than 5MB: {path}")
    mime = mimetypes.guess_type(str(path))[0] or "image/png"
    if mime not in {"image/png", "image/jpeg", "image/webp"}:
        die(f"Unsupported reference image MIME type {mime}: {path}")
    return {"image_url": f"data:{mime};base64,{base64.b64encode(data).decode('ascii')}"}


def request_json(method: str, url: str, api_key: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    data = None
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "User-Agent": HTTP_USER_AGENT,
    }
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        fallback_code = "invalid_api_key" if exc.code in (401, 403) else f"http_{exc.code}"
        die(f"HTTP {exc.code} from Yali API: {body}", code=1, error_code=api_error_code(body) or fallback_code, http_status=exc.code)
    except urllib.error.URLError as exc:
        die(f"Yali API request failed: {exc}", code=1, error_code="network_error")

    try:
        parsed = json.loads(body)
    except json.JSONDecodeError:
        die(f"Yali API returned non-JSON response: {body[:500]}", code=1)
    if not isinstance(parsed, dict):
        die("Yali API returned JSON that is not an object.", code=1)
    return parsed


def task_status(payload: dict[str, Any]) -> str:
    task = payload.get("task") if isinstance(payload.get("task"), dict) else {}
    status = task.get("status") or payload.get("status") or ""
    return str(status).strip().lower()


def get_task_id(payload: dict[str, Any]) -> str:
    task = payload.get("task") if isinstance(payload.get("task"), dict) else {}
    task_id = payload.get("task_id") or task.get("task_id") or ""
    task_id = str(task_id).strip()
    if not task_id:
        die(f"No task_id found in response: {json.dumps(payload, ensure_ascii=False)[:500]}", code=1)
    return task_id


def generate(args: argparse.Namespace) -> None:
    base_url = clean_base_url(args.base_url)
    prompt = read_prompt(args.prompt, args.prompt_file)
    body: dict[str, Any] = {
        "prompt": prompt,
        "quality": args.quality,
    }
    if args.action:
        body["action"] = args.action
    if args.template_key:
        body["template_key"] = args.template_key
    if args.size_key:
        body["size_key"] = args.size_key
    if args.output_format:
        body["output_format"] = args.output_format
    if args.output_compression is not None:
        body["output_compression"] = args.output_compression
    if args.reference_image:
        if len(args.reference_image) > 2:
            die("Yali API supports at most 2 reference images.")
        body["reference_images"] = [encode_reference_image(item) for item in args.reference_image]
    if args.action == "edit" and not body.get("reference_images"):
        die('Yali editing requires at least one --reference-image when --action edit is used.')

    if args.dry_run:
        print(json.dumps({"ok": True, "dry_run": True, "endpoint": f"{base_url}/free-image/api/generate", "request": body}, ensure_ascii=False, indent=2))
        return

    api_key = read_api_key(args.api_key)
    start = request_json("POST", f"{base_url}/free-image/api/generate", api_key, body)
    result: dict[str, Any] = {"ok": True, "start": start}
    task_id = get_task_id(start)
    result["task_id"] = task_id

    if args.wait:
        deadline = time.time() + args.timeout
        statuses: list[dict[str, Any]] = []
        while True:
            if time.time() > deadline:
                die(f"Timed out waiting for Yali task {task_id}.", code=1)
            time.sleep(args.poll_interval)
            status_payload = request_json(
                "GET",
                f"{base_url}/free-image/api/status?{urllib.parse.urlencode({'task_id': task_id})}",
                api_key,
            )
            statuses.append(status_payload)
            status = task_status(status_payload)
            if status in TERMINAL_STATUSES:
                result["status"] = status_payload
                break
        if task_status(result["status"]) != "completed":
            print(json.dumps(result, ensure_ascii=False, indent=2))
            raise SystemExit(1)

        final = request_json(
            "GET",
            f"{base_url}/free-image/api/result?{urllib.parse.urlencode({'task_id': task_id})}",
            api_key,
        )
        result["result"] = final
        if not args.no_localize:
            result["localize"] = localize({"response": final}, args.out_dir, args.alt or "yali image", args.limit)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def status(args: argparse.Namespace) -> None:
    base_url = clean_base_url(args.base_url)
    api_key = read_api_key(args.api_key)
    payload = request_json(
        "GET",
        f"{base_url}/free-image/api/status?{urllib.parse.urlencode({'task_id': args.task_id})}",
        api_key,
    )
    print(json.dumps({"ok": True, "status": payload}, ensure_ascii=False, indent=2))


def result(args: argparse.Namespace) -> None:
    base_url = clean_base_url(args.base_url)
    api_key = read_api_key(args.api_key)
    payload = request_json(
        "GET",
        f"{base_url}/free-image/api/result?{urllib.parse.urlencode({'task_id': args.task_id})}",
        api_key,
    )
    output: dict[str, Any] = {"ok": True, "result": payload}
    if not args.no_localize:
        output["localize"] = localize({"response": payload}, args.out_dir, args.alt or "yali image", args.limit)
    print(json.dumps(output, ensure_ascii=False, indent=2))


def main() -> int:
    parser = argparse.ArgumentParser(description="Call Yali image generation/editing API with polling and localization support.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--api-key", help="Defaults to YALIAI_API_KEY.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate_parser = subparsers.add_parser("generate", help="Start a Yali generation/editing task.")
    generate_parser.add_argument("--prompt")
    generate_parser.add_argument("--prompt-file")
    generate_parser.add_argument("--action", choices=["generate", "edit"])
    generate_parser.add_argument("--template-key")
    generate_parser.add_argument("--quality", choices=["low", "medium", "high"], default="medium")
    generate_parser.add_argument("--size-key")
    generate_parser.add_argument("--output-format", choices=["png", "jpeg", "webp"])
    generate_parser.add_argument("--output-compression", type=int)
    generate_parser.add_argument("--reference-image", action="append", default=[])
    generate_parser.add_argument("--wait", action="store_true", help="Poll until terminal status, then fetch result.")
    generate_parser.add_argument("--poll-interval", type=float, default=3.0)
    generate_parser.add_argument("--timeout", type=float, default=300.0)
    generate_parser.add_argument("--out-dir")
    generate_parser.add_argument("--alt", default="yali image")
    generate_parser.add_argument("--limit", type=int)
    generate_parser.add_argument("--no-localize", action="store_true")
    generate_parser.add_argument("--dry-run", action="store_true")
    generate_parser.set_defaults(func=generate)

    status_parser = subparsers.add_parser("status", help="Fetch task status.")
    status_parser.add_argument("--task-id", required=True)
    status_parser.set_defaults(func=status)

    result_parser = subparsers.add_parser("result", help="Fetch completed task result and localize it.")
    result_parser.add_argument("--task-id", required=True)
    result_parser.add_argument("--out-dir")
    result_parser.add_argument("--alt", default="yali image")
    result_parser.add_argument("--limit", type=int)
    result_parser.add_argument("--no-localize", action="store_true")
    result_parser.set_defaults(func=result)

    args = parser.parse_args()
    args.func(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
