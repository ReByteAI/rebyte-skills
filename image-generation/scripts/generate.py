#!/usr/bin/env python3
"""
Image Generation CLI — Nano Banana 2 (Gemini) + GPT Image 2 (OpenAI)

Usage:
  # Text-to-image (Gemini, default)
  python generate.py --prompt "A mountain landscape at dawn" --output landscape.png

  # Text-to-image (GPT Image 2)
  python generate.py --prompt "A poster with bold text" --provider gpt --output poster.png

  # Image-to-image (edit/composite)
  python generate.py --prompt "Place this photo in a card layout" --input photo.jpg --output card.png

  # GPT with quality control
  python generate.py --prompt "..." --provider gpt --quality high --image-size 1024x1536 --output result.png
"""

import argparse
import base64
import json
import os
import sys
import urllib.request

AUTH_FILE = os.path.expanduser("~/.rebyte.ai/auth.json")


def get_auth() -> tuple[str, str]:
    """Get auth token and relay URL from ~/.rebyte.ai/auth.json"""
    with open(AUTH_FILE) as f:
        data = json.load(f)
    return data["sandbox"]["token"], data["sandbox"]["relay_url"]


def generate_image(
    prompt: str,
    input_image: str | None = None,
    provider: str = "gemini",
    aspect_ratio: str = "1:1",
    size: str | None = None,
    quality: str | None = None,
    image_size: str | None = None,
    output_format: str | None = None,
    background: str | None = None,
    moderation: str | None = None,
) -> dict:
    """Generate or edit an image via Rebyte data API."""

    payload: dict = {"prompt": prompt, "provider": provider}

    if provider == "gpt":
        if quality:
            payload["quality"] = quality
        if image_size:
            payload["size"] = image_size
        if output_format:
            payload["outputFormat"] = output_format
        if background:
            payload["background"] = background
        if moderation:
            payload["moderation"] = moderation
    else:
        payload["aspectRatio"] = aspect_ratio
        if size:
            payload["imageSize"] = size

    if input_image:
        with open(input_image, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")
        payload["image"] = image_data

        ext = input_image.lower().rsplit(".", 1)[-1]
        mime_map = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}
        payload["imageMimeType"] = mime_map.get(ext, "image/png")

    token, relay_url = get_auth()
    api_url = f"{relay_url}/api/data/images/generate"

    req = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(description="Image Generation CLI (Nano Banana 2 + GPT Image 2)")
    parser.add_argument("--prompt", "-p", required=True, help="Text prompt or editing instructions")
    parser.add_argument("--input", "-i", help="Input image path (triggers image-to-image)")
    parser.add_argument("--output", "-o", required=True, help="Output image path")
    parser.add_argument("--provider", choices=["gemini", "gpt"], default="gemini", help="Backend: gemini (default) or gpt")

    # Gemini-only
    parser.add_argument("--aspect-ratio", "-a", default="1:1", help="[gemini] Aspect ratio (1:1, 16:9, 9:16, etc.)")
    parser.add_argument("--size", "-s", choices=["512", "1K", "2K", "4K"], help="[gemini] Output size")

    # GPT-only
    parser.add_argument("--quality", "-q", choices=["low", "medium", "high", "auto"], help="[gpt] Render quality")
    parser.add_argument("--image-size", choices=["1024x1024", "1024x1536", "1536x1024", "auto"], help="[gpt] Pixel dimensions")
    parser.add_argument("--format", "-f", choices=["png", "webp", "jpeg"], help="[gpt] Output format")
    parser.add_argument("--background", choices=["opaque", "auto"], help="[gpt] Background mode")
    parser.add_argument("--moderation", choices=["auto", "low"], help="[gpt] Content moderation strictness")

    args = parser.parse_args()

    print(f"Generating image...", file=sys.stderr)
    print(f"  Provider: {args.provider}", file=sys.stderr)
    print(f"  Prompt: {args.prompt}", file=sys.stderr)
    if args.input:
        print(f"  Input: {args.input}", file=sys.stderr)

    try:
        result = generate_image(
            prompt=args.prompt,
            input_image=args.input,
            provider=args.provider,
            aspect_ratio=args.aspect_ratio,
            size=args.size,
            quality=args.quality,
            image_size=args.image_size,
            output_format=args.format,
            background=args.background,
            moderation=args.moderation,
        )
    except urllib.error.HTTPError as e:
        print(f"API Error: {e.code} - {e.read().decode()}", file=sys.stderr)
        sys.exit(1)

    if "error" in result:
        print(f"Error: {result.get('error')} - {result.get('message', '')}", file=sys.stderr)
        if result.get("fix"):
            print(f"Fix: {result['fix']}", file=sys.stderr)
        sys.exit(1)

    image_base64 = result.get("image", {}).get("base64")
    if not image_base64:
        print("Error: No image in response", file=sys.stderr)
        sys.exit(1)

    with open(args.output, "wb") as f:
        f.write(base64.b64decode(image_base64))

    print(f"Saved: {args.output}", file=sys.stderr)
    print(f"Provider: {result.get('provider')}, Model: {result.get('model')}", file=sys.stderr)

    if result.get("description"):
        print(f"Description: {result['description']}", file=sys.stderr)


if __name__ == "__main__":
    main()
