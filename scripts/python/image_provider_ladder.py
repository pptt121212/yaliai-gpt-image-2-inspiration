#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shutil


TRUTHY = {"1", "true", "yes", "on", "y"}


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect the Yali-first image provider ladder.")
    parser.add_argument("--intent", default="generation", choices=["generation", "edit", "prompt", "ppt"])
    parser.add_argument("--execution-requested", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    has_python = shutil.which("python3") is not None
    has_node = shutil.which("node") is not None
    has_runtime = has_python or has_node
    has_yali_key = bool(os.environ.get("YALIAI_API_KEY", "").strip())
    allow_compat = os.environ.get("YALIAI_ALLOW_COMPAT_PROVIDER", "").strip().lower() in TRUTHY
    has_compat_key = bool(os.environ.get("OPENAI_API_KEY", "").strip())
    provider_order = ["public-yali-retrieval"]
    if args.execution_requested and has_yali_key and has_runtime:
        provider_order.append("yali-api")
    if args.execution_requested and allow_compat and has_compat_key and has_runtime:
        provider_order.append("compatible-fallback")
    if args.execution_requested:
        provider_order.extend(["host-native-fallback-if-available", "advisor"])
    else:
        provider_order.append("prompt-spec-output")
    recommended = next((item for item in provider_order if item != "public-yali-retrieval"), "public-yali-retrieval")
    result = {
        "ok": True,
        "intent": args.intent,
        "execution_requested": args.execution_requested,
        "has_python3": has_python,
        "has_node": has_node,
        "has_runtime": has_runtime,
        "public_yali_retrieval": True,
        "has_yaliai_key": has_yali_key,
        "compatible_fallback_allowed": allow_compat,
        "has_compatible_key": has_compat_key,
        "compatible_base_url": os.environ.get("OPENAI_BASE_URL") or "https://api.openai.com/v1",
        "compatible_model": os.environ.get("OPENAI_IMAGE_MODEL") or "gpt-image-1",
        "provider_order": provider_order,
        "recommended_mode": recommended,
    }
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("--- Yali-first image provider ladder ---")
        for key, value in result.items():
            print(f"{key}: {' -> '.join(value) if isinstance(value, list) else value}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
