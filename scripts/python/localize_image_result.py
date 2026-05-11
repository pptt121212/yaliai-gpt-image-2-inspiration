#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import functools
import http.server
import json
import mimetypes
import re
import shutil
import sys
import threading
import time
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from typing import Any


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
JPEG_SIGNATURE = b"\xff\xd8\xff"
WEBP_RIFF = b"RIFF"
HTTP_USER_AGENT = "Mozilla/5.0 (Yali AI Skill Localizer) AppleWebKit/537.36 Chrome/120 Safari/537.36"


def die(message: str, code: int = 2) -> None:
    print(json.dumps({"ok": False, "error": message}, ensure_ascii=False), file=sys.stderr)
    raise SystemExit(code)


def slugify(value: str, fallback: str = "image") -> str:
    slug = re.sub(r"[^a-zA-Z0-9._-]+", "-", value.strip().lower()).strip("-._")
    return (slug or fallback)[:60]


def output_root(raw: str | None) -> Path:
    root = Path(raw).expanduser() if raw else Path.cwd() / ".yaliai" / "generated-images"
    root.mkdir(parents=True, exist_ok=True)
    return root.resolve()


def extension_from_bytes(data: bytes, fallback: str = ".png") -> str:
    if data.startswith(PNG_SIGNATURE):
        return ".png"
    if data.startswith(JPEG_SIGNATURE):
        return ".jpg"
    if data.startswith(WEBP_RIFF) and data[8:12] == b"WEBP":
        return ".webp"
    return fallback if fallback.startswith(".") else f".{fallback}"


def extension_from_location(value: str) -> str:
    parsed = urllib.parse.urlparse(value)
    path = parsed.path if parsed.scheme else value.split("?", 1)[0].split("#", 1)[0]
    suffix = Path(path).suffix.lower()
    if suffix == ".jpeg":
        return ".jpg"
    return suffix if suffix in {".png", ".jpg", ".webp"} else ".png"


def add_source(sources: list[dict[str, str]], label: str, value: Any) -> None:
    if isinstance(value, str) and value.strip():
        sources.append({"label": label, "value": value.strip()})


def collect_sources(payload: Any) -> list[dict[str, str]]:
    sources: list[dict[str, str]] = []

    if isinstance(payload, list):
        for index, item in enumerate(payload):
            for source in collect_sources(item):
                sources.append({**source, "label": f"list[{index}].{source['label']}"})
        return sources

    if not isinstance(payload, dict):
        return sources

    response = payload.get("response") if isinstance(payload.get("response"), dict) else {}
    add_source(sources, "yali.response.url", response.get("url"))
    for index, asset in enumerate(response.get("assets") or []):
        if isinstance(asset, dict):
            add_source(sources, f"yali.response.assets[{index}].url", asset.get("url"))

    for index, item in enumerate(payload.get("data") or []):
        if isinstance(item, dict):
            add_source(sources, f"openai.data[{index}].b64_json", item.get("b64_json"))
            add_source(sources, f"openai.data[{index}].url", item.get("url"))

    for index, item in enumerate(payload.get("output_items") or []):
        if isinstance(item, dict):
            add_source(sources, f"host.output_items[{index}].result", item.get("result"))
            add_source(sources, f"host.output_items[{index}].url", item.get("url"))

    output = payload.get("output") if isinstance(payload.get("output"), dict) else {}
    add_source(sources, "generic.output.path", output.get("path"))
    for index, item in enumerate(output.get("files") or []):
        if isinstance(item, dict):
            add_source(sources, f"generic.output.files[{index}].path", item.get("path"))

    for key in ("url", "image_url", "b64_json", "base64", "result", "path"):
        add_source(sources, f"generic.{key}", payload.get(key))

    for index, item in enumerate(payload.get("images") or []):
        if isinstance(item, str):
            add_source(sources, f"generic.images[{index}]", item)
        elif isinstance(item, dict):
            for key in ("url", "image_url", "b64_json", "base64", "result", "path"):
                add_source(sources, f"generic.images[{index}].{key}", item.get(key))

    return sources


def bytes_from_source(value: str) -> tuple[bytes, str, str | None]:
    if value.startswith("data:image/"):
        header, encoded = value.split(",", 1)
        mime = header.split(";", 1)[0].removeprefix("data:")
        ext = mimetypes.guess_extension(mime) or ".png"
        return base64.b64decode(encoded), ext, None

    parsed = urllib.parse.urlparse(value)
    if parsed.scheme in {"http", "https"}:
        request = urllib.request.Request(
            value,
            headers={
                "User-Agent": HTTP_USER_AGENT,
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            },
        )
        with urllib.request.urlopen(request, timeout=60) as response:
            return response.read(), extension_from_location(value), value
    if parsed.scheme == "file":
        path = Path(urllib.request.url2pathname(parsed.path))
        return path.read_bytes(), path.suffix or ".png", str(path.resolve())

    path = Path(value).expanduser()
    if path.exists():
        return path.read_bytes(), path.suffix or ".png", str(path.resolve())

    return base64.b64decode(value), ".png", None


def localize(payload: Any, out_dir: str | None, alt: str, limit: int | None = None) -> dict[str, Any]:
    sources = collect_sources(payload)
    if not sources:
        die("No supported image source found. Expected response.url, response.assets[].url, data[].b64_json/url, output_items[].result, path, url, or base64.")

    root = output_root(out_dir)
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    selected = sources[:limit] if limit else sources
    outputs: list[dict[str, Any]] = []

    for index, source in enumerate(selected, start=1):
        data, guessed_ext, original_location = bytes_from_source(source["value"])
        ext = extension_from_bytes(data, guessed_ext)
        stem = f"{timestamp}-{slugify(alt)}-{index:02d}-{uuid.uuid4().hex[:8]}"
        image_path = (root / f"{stem}{ext}").resolve()
        image_path.write_bytes(data)

        metadata_path = image_path.with_suffix(".json")
        item = {
            "index": index,
            "source_label": source["label"],
            "original_location": original_location,
            "output_path": str(image_path),
            "metadata_path": str(metadata_path),
            "bytes": len(data),
            "alt": alt,
            "markdown": f"![{alt}]({image_path})",
        }
        metadata_path.write_text(json.dumps(item, ensure_ascii=False, indent=2), encoding="utf-8")
        outputs.append(item)

    return {
        "ok": True,
        "count": len(outputs),
        "output_dir": str(root),
        "primary_output_path": outputs[0]["output_path"],
        "primary_metadata_path": outputs[0]["metadata_path"],
        "markdown": "\n".join(item["markdown"] for item in outputs),
        "outputs": outputs,
    }


def self_test() -> int:
    test_root = Path("/tmp/yaliai-localize-image-result-test").resolve()
    if test_root.exists():
        shutil.rmtree(test_root)
    test_root.mkdir(parents=True)

    sample_png_b64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8"
        "/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
    )
    source_png = test_root / "source.png"
    source_png.write_bytes(base64.b64decode(sample_png_b64))

    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(test_root))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    http_url = f"http://127.0.0.1:{server.server_port}/source.png"

    cases = [
        ("yali-primary-url", {"response": {"url": http_url}}),
        ("yali-fallback-asset-url", {"response": {"assets": [{"url": http_url}]}}),
        ("openai-b64-json", {"data": [{"b64_json": sample_png_b64}]}),
        ("host-output-item", {"output_items": [{"result": sample_png_b64}]}),
        ("generic-local-path", {"path": str(source_png)}),
        ("generic-data-url", {"url": f"data:image/png;base64,{sample_png_b64}"}),
        ("multiple-openai", {"data": [{"b64_json": sample_png_b64}, {"b64_json": sample_png_b64}]}),
    ]

    results: list[dict[str, Any]] = []
    try:
        for name, payload in cases:
            result = localize(payload, str(test_root / "localized"), name)
            checks = []
            for item in result["outputs"]:
                image_path = Path(item["output_path"])
                metadata_path = Path(item["metadata_path"])
                checks.append(
                    image_path.is_absolute()
                    and image_path.exists()
                    and image_path.read_bytes().startswith(PNG_SIGNATURE)
                    and metadata_path.exists()
                    and item["markdown"] == f"![{name}]({image_path})"
                )
            results.append({"case": name, "ok": all(checks), "count": result["count"], "markdown": result["markdown"]})
    finally:
        server.shutdown()
        server.server_close()

    ok = all(item["ok"] for item in results)
    print(json.dumps({"ok": ok, "results": results}, ensure_ascii=False, indent=2))
    return 0 if ok else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Localize generated image results to absolute local files and Markdown previews.")
    parser.add_argument("--payload-json", help="Image result JSON string.")
    parser.add_argument("--payload-file", help="Path to an image result JSON file.")
    parser.add_argument("--out-dir", help="Directory for localized image files. Defaults to ./.yaliai/generated-images.")
    parser.add_argument("--alt", default="generated image", help="Markdown alt text and filename hint.")
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of image sources to localize.")
    parser.add_argument("--self-test", action="store_true", help="Run offline fixture tests.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if args.payload_file:
        payload = json.loads(Path(args.payload_file).read_text(encoding="utf-8"))
    elif args.payload_json:
        payload = json.loads(args.payload_json)
    else:
        payload = json.load(sys.stdin)

    print(json.dumps(localize(payload, args.out_dir, args.alt, args.limit), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
