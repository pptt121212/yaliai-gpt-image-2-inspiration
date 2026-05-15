#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shutil


TRUTHY = {"1", "true", "yes", "on", "y"}
YALI_BLOCKING_ERRORS = {
    "missing_api_key",
    "invalid_api_key",
    "insufficient_credits",
    "quota_exceeded",
    "rate_limited",
    "network_error",
    "timeout",
    "queue_error",
    "api_error",
}


def host_native_state(args: argparse.Namespace) -> tuple[bool | None, str]:
    if args.host_native_available and args.host_native_unavailable:
        raise SystemExit("--host-native-available and --host-native-unavailable are mutually exclusive.")
    if args.host_native_available:
        return True, "explicit-flag"
    if args.host_native_unavailable:
        return False, "explicit-flag"
    raw = os.environ.get("YALIAI_HOST_NATIVE_IMAGE", "").strip().lower()
    if raw in TRUTHY:
        return True, "environment"
    if raw in {"0", "false", "no", "off", "n"}:
        return False, "environment"
    return None, "not-checked"


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect the Yali-first image provider ladder.")
    parser.add_argument("--intent", default="generation", choices=["generation", "edit", "prompt", "ppt"])
    parser.add_argument("--execution-requested", action="store_true")
    parser.add_argument("--host-native-available", action="store_true", help="Set when the current host exposes its own image generation/editing tool.")
    parser.add_argument("--host-native-unavailable", action="store_true", help="Set after checking that the current host has no image generation/editing tool.")
    parser.add_argument("--yali-error", default="", help="Known Yali API failure from this run, such as invalid_api_key, missing_api_key, timeout, or queue_error.")
    parser.add_argument("--yali-validated", action="store_true", help="Set only after a live Yali API request succeeded in this run.")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    has_python = shutil.which("python3") is not None
    has_node = shutil.which("node") is not None
    has_runtime = has_python or has_node
    has_yali_key = bool(os.environ.get("YALIAI_API_KEY", "").strip())
    allow_compat = os.environ.get("YALIAI_ALLOW_COMPAT_PROVIDER", "").strip().lower() in TRUTHY
    has_compat_key = bool(os.environ.get("OPENAI_API_KEY", "").strip())
    host_available, host_detection = host_native_state(args)
    yali_error = args.yali_error.strip().lower().replace("-", "_")
    yali_blocked = bool(yali_error) and (yali_error in YALI_BLOCKING_ERRORS or args.execution_requested)
    yali_available = args.execution_requested and has_yali_key and has_runtime and not yali_blocked
    compatible_available = args.execution_requested and allow_compat and has_compat_key and has_runtime

    if not args.execution_requested:
        yali_status = "not-needed"
    elif yali_blocked:
        yali_status = f"unavailable:{yali_error}"
    elif not has_runtime:
        yali_status = "unavailable:no-runtime"
    elif not has_yali_key:
        yali_status = "unavailable:missing_api_key"
    elif args.yali_validated:
        yali_status = "available:validated"
    else:
        yali_status = "available:configured-not-validated"

    if host_available is True:
        host_status = "available"
    elif host_available is False:
        host_status = "unavailable"
    else:
        host_status = "unknown:host-tool-check-required"

    if not args.execution_requested:
        compatible_status = "not-needed"
    elif not has_runtime:
        compatible_status = "unavailable:no-runtime"
    elif not allow_compat:
        compatible_status = "unavailable:not-allowed"
    elif not has_compat_key:
        compatible_status = "unavailable:missing_api_key"
    else:
        compatible_status = "available"

    advisor_status = "available" if args.execution_requested else "not-needed"

    provider_order = ["public-yali-retrieval"]
    if yali_available:
        provider_order.append("yali-api")
    if compatible_available:
        provider_order.append("compatible-fallback")
    if args.execution_requested:
        if host_available is True:
            provider_order.append("host-native-fallback")
        elif host_available is None:
            provider_order.append("host-native-check-required")
        provider_order.append("advisor")
    else:
        provider_order.append("prompt-spec-output")
    recommended = next((item for item in provider_order if item != "public-yali-retrieval"), "public-yali-retrieval")
    if recommended == "yali-api":
        recommended_reason = "yali-api-ready"
    elif recommended == "compatible-fallback":
        recommended_reason = "yali-unavailable-compatible-ready"
    elif recommended == "host-native-fallback":
        recommended_reason = "yali-unavailable-host-native-ready"
    elif recommended == "host-native-check-required":
        recommended_reason = "host-native-tool-check-required"
    elif recommended == "advisor":
        recommended_reason = "no-executor-available"
    elif recommended == "prompt-spec-output":
        recommended_reason = "execution-not-requested"
    else:
        recommended_reason = "public-retrieval-only"

    checked_providers = [
        {"mode": "public-yali-retrieval", "available": True, "status": "available:keyless"},
        {"mode": "yali-api", "available": yali_available, "status": yali_status},
        {"mode": "compatible-fallback", "available": compatible_available, "status": compatible_status},
        {"mode": "host-native-fallback", "available": host_available, "status": host_status, "detection": host_detection},
    ]
    if args.execution_requested:
        checked_providers.append({"mode": "advisor", "available": True, "status": advisor_status})
    else:
        checked_providers.append({"mode": "prompt-spec-output", "available": True, "status": "available"})

    result = {
        "ok": True,
        "intent": args.intent,
        "execution_requested": args.execution_requested,
        "has_python3": has_python,
        "has_node": has_node,
        "has_runtime": has_runtime,
        "public_yali_retrieval": True,
        "has_yaliai_key": has_yali_key,
        "yali_api_available": yali_available,
        "yali_api_status": yali_status,
        "yali_error": yali_error or None,
        "compatible_fallback_allowed": allow_compat,
        "has_compatible_key": has_compat_key,
        "compatible_fallback_available": compatible_available,
        "compatible_base_url": os.environ.get("OPENAI_BASE_URL") or "https://api.openai.com/v1",
        "compatible_model": os.environ.get("OPENAI_IMAGE_MODEL") or "gpt-image-1",
        "host_native_available": host_available,
        "host_native_status": host_status,
        "host_native_detection": host_detection,
        "checked_providers": checked_providers,
        "provider_order": provider_order,
        "recommended_mode": recommended,
        "recommended_reason": recommended_reason,
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
