#!/usr/bin/env python3
"""
NanoPPT Image Generation Script

Usage:
  # Text-to-image
  python generate.py --prompt "Doraemon style slide" --output slide.png

  # Image-to-image (edit existing)
  python generate.py --prompt "Fix text: Helo to Hello" --input slide.png --output slide-fixed.png

  # With options
  python generate.py --prompt "..." --model pro --aspect-ratio 16:9 --size 2K --output slide.png
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


def get_api_url() -> str:
    """Get the images API URL from auth.json relay_url"""
    _, relay_url = get_auth()
    return f"{relay_url}/api/data/images/generate"


def generate_image(
    prompt: str,
    input_image: str | None = None,
    model: str = "flash",
    aspect_ratio: str = "16:9",
    image_size: str | None = None,
) -> dict:
    """Generate or edit an image using Nano Banana API."""

    payload = {
        "prompt": prompt,
        "model": model,
        "aspectRatio": aspect_ratio,
    }

    if image_size and model == "pro":
        payload["imageSize"] = image_size

    if input_image:
        with open(input_image, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")
        payload["image"] = image_data

        # Detect mime type from extension
        ext = input_image.lower().split(".")[-1]
        mime_map = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}
        payload["imageMimeType"] = mime_map.get(ext, "image/png")

    token, _ = get_auth()
    api_url = get_api_url()
    req = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(description="NanoPPT Image Generation")
    parser.add_argument("--prompt", "-p", required=True, help="Text prompt or editing instructions")
    parser.add_argument("--input", "-i", help="Input image path (for image-to-image editing)")
    parser.add_argument("--output", "-o", required=True, help="Output image path")
    parser.add_argument("--model", "-m", choices=["flash", "pro"], default="flash", help="Model: flash (fast) or pro (high quality)")
    parser.add_argument("--aspect-ratio", "-a", default="16:9", help="Aspect ratio (e.g., 16:9, 1:1)")
    parser.add_argument("--size", "-s", choices=["1K", "2K", "4K"], help="Image size (pro model only)")

    args = parser.parse_args()

    print(f"Generating image...", file=sys.stderr)
    if args.input:
        print(f"  Input: {args.input}", file=sys.stderr)
    print(f"  Prompt: {args.prompt}", file=sys.stderr)
    print(f"  Model: {args.model}, Aspect: {args.aspect_ratio}", file=sys.stderr)

    try:
        result = generate_image(
            prompt=args.prompt,
            input_image=args.input,
            model=args.model,
            aspect_ratio=args.aspect_ratio,
            image_size=args.size,
        )
    except urllib.error.HTTPError as e:
        print(f"API Error: {e.code} - {e.read().decode()}", file=sys.stderr)
        sys.exit(1)

    if "error" in result:
        print(f"Error: {result.get('error')} - {result.get('message')}", file=sys.stderr)
        sys.exit(1)

    # Save image
    image_base64 = result.get("image", {}).get("base64")
    if not image_base64:
        print("Error: No image in response", file=sys.stderr)
        sys.exit(1)

    with open(args.output, "wb") as f:
        f.write(base64.b64decode(image_base64))

    print(f"Saved: {args.output}", file=sys.stderr)

    # Print description if available
    if result.get("description"):
        print(f"Description: {result['description']}", file=sys.stderr)


if __name__ == "__main__":
    main()
