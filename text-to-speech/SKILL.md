---
name: text-to-speech
description: Convert text to speech audio using OpenAI TTS. Use when user wants to generate voiceovers, narration, audio files from text, or add voice to videos. Triggers include "text to speech", "TTS", "voiceover", "narration", "generate audio", "speak this text", "convert to audio", "voice generation".
---

# Text to Speech

Convert text to high-quality speech audio using OpenAI TTS API.

{{include:auth.md}}

## When to Use

Use this skill when the user needs to:
- Generate voiceovers for videos
- Create audio narration from text
- Convert written content to spoken audio
- Add voice to presentations or demos

## Synthesize Speech

```bash
curl -X POST "$API_URL/api/data/tts/synthesize" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a sample voiceover.",
    "voice": "nova",
    "model": "tts-1",
    "format": "mp3",
    "speed": 1.0
  }'
```

**Response:**
```json
{
  "success": true,
  "audio": {
    "base64": "//uQxAAAAAANIAAAAAExBTUUzLjEw...",
    "format": "mp3",
    "mimeType": "audio/mpeg",
    "sizeBytes": 24576
  },
  "input": {
    "characterCount": 35,
    "wordCount": 7,
    "voice": "nova",
    "model": "tts-1",
    "speed": 1.0
  }
}
```

## Save Audio to File

After receiving the response, decode the base64 audio and save it:

```bash
# Extract base64 from response and save as MP3
echo '<base64_audio_content>' | base64 -d > voiceover.mp3
```

Or in a script:
```bash
# Full workflow
RESPONSE=$(curl -s -X POST "$API_URL/api/data/tts/synthesize" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here", "voice": "nova"}')

# Extract base64 and save
echo "$RESPONSE" | jq -r '.audio.base64' | base64 -d > voiceover.mp3
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | - | Text to convert (max 4096 characters, ~700 words) |
| `voice` | string | No | `nova` | Voice selection (see below) |
| `model` | string | No | `tts-1` | Quality model |
| `format` | string | No | `mp3` | Audio format |
| `speed` | number | No | `1.0` | Speech speed (0.25 to 4.0) |

### Available Voices

| Voice | Style | Best For |
|-------|-------|----------|
| `nova` | Female, friendly | Narration, tutorials (recommended) |
| `alloy` | Neutral, versatile | General purpose |
| `echo` | Male, warm | Conversational content |
| `fable` | British, expressive | Storytelling, dramatic |
| `onyx` | Male, deep | Authoritative, professional |
| `shimmer` | Female, soft | Calm, soothing content |

### Quality Models

| Model | Description |
|-------|-------------|
| `tts-1` | Faster, good for drafts and testing |
| `tts-1-hd` | Higher quality, better for final output |

### Audio Formats

| Format | Use Case |
|--------|----------|
| `mp3` | Best compatibility, recommended for video |
| `wav` | Uncompressed, high quality |
| `opus` | Efficient streaming |
| `aac` | Apple devices |
| `flac` | Lossless compression |

## Handling Long Text

The API has a 4096 character limit (~700 words) per request. For longer text:

1. **Split at sentence boundaries** - Break text into chunks of ~3500 characters
2. **Call synthesize for each chunk** - Generate audio files for each part
3. **Concatenate with ffmpeg** - Combine the audio files

```bash
# Example: Combine multiple audio chunks
ffmpeg -i "concat:chunk1.mp3|chunk2.mp3|chunk3.mp3" -c copy final.mp3
```

## Combine with Video

Add the generated voiceover to a video file:

```bash
# Replace video audio with voiceover
ffmpeg -i video.mp4 -i voiceover.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4

# Mix voiceover with existing audio (voiceover at 80% volume)
ffmpeg -i video.mp4 -i voiceover.mp3 -filter_complex "[1:a]volume=0.8[voice];[0:a][voice]amix=inputs=2:duration=first" -c:v copy output.mp4
```

## Example: Generate Narration

```bash
# Get auth
AUTH_TOKEN=$(/home/user/.local/bin/rebyte-auth)
API_URL=$(python3 -c "import json; print(json.load(open('/home/user/.rebyte.ai/auth.json'))['sandbox']['relay_url'])")

# Generate narration
curl -s -X POST "$API_URL/api/data/tts/synthesize" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to our product demo. Today I will show you the key features that make our solution stand out from the competition.",
    "voice": "nova",
    "model": "tts-1-hd",
    "speed": 0.95
  }' | jq -r '.audio.base64' | base64 -d > narration.mp3

echo "Saved narration.mp3"
```

## Delivering Output

After generating audio files, upload them to the Artifact Store so the user can access them.

## Tips

- Use `nova` voice for most narration - it sounds natural and friendly
- Use `tts-1-hd` model for final output, `tts-1` for testing
- Set `speed` to 0.9-0.95 for clearer narration
- Always use `mp3` format for video compatibility
- Check character count before calling - split if over 4000 characters
