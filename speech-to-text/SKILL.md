---
version: 1
name: speech-to-text
description: Transcribe audio to text using OpenAI Whisper. Use when user wants to convert speech to text, transcribe audio files, generate subtitles, or extract text from recordings. Triggers include "speech to text", "STT", "transcribe", "transcription", "subtitles", "captions", "audio to text", "convert audio to text".
---

# Speech to Text

Transcribe audio to text using OpenAI Whisper API.

**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the agent's system prompt; use them as Bearer token and base URL.

## When to Use

Use this skill when the user needs to:
- Transcribe audio recordings to text
- Generate subtitles or captions (SRT, VTT)
- Extract spoken content from audio files
- Convert voice memos or interviews to text

## How It Works

Send audio directly via multipart/form-data — standard Whisper API format:

```bash
curl -s -X POST "$API_URL/api/data/stt/transcribe" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -F "file=@recording.mp3" \
  -F "model=whisper-1" \
  -F "language=en" \
  -F "response_format=json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Hello, this is a transcription of the audio recording."
  }
}
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `file` | file | Yes | - | Audio file (multipart/form-data) |
| `language` | string | No | auto | ISO-639-1 language code (e.g. `"en"`, `"es"`, `"ja"`) — improves accuracy |
| `prompt` | string | No | - | Optional text to guide transcription style or continue a previous segment |
| `model` | string | No | `whisper-1` | Model to use (currently only `whisper-1`) |
| `response_format` | string | No | `json` | Output format (see below) |
| `temperature` | number | No | `0` | Sampling temperature (0-1). Lower = more deterministic |

### Response Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| `json` | Simple JSON with `text` field | Default, quick text extraction |
| `verbose_json` | JSON with timestamps, segments, duration | When you need word-level timing |
| `text` | Plain text only | Simple text output |
| `srt` | SubRip subtitle format | Video subtitles |
| `vtt` | WebVTT subtitle format | Web video captions |

### Supported Audio Formats

Whisper accepts: `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`, `webm`, `ogg`, `flac`

**Max file size: 25 MB**

## Example: Full Transcription Workflow

```bash
# Get auth
AUTH_TOKEN=$(/home/user/.local/bin/rebyte-auth)
API_URL=$(python3 -c "import json; print(json.load(open('/home/user/.rebyte.ai/auth.json'))['sandbox']['relay_url'])")

# Transcribe directly
RESULT=$(curl -s -X POST "$API_URL/api/data/stt/transcribe" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -F "file=@interview.mp3" \
  -F "language=en" \
  -F "response_format=json")

# Extract text
echo "$RESULT" | jq -r '.data.text' > transcript.txt
echo "Transcript saved to transcript.txt"
```

## Example: Generate SRT Subtitles

```bash
RESULT=$(curl -s -X POST "$API_URL/api/data/stt/transcribe" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -F "file=@video-audio.mp3" \
  -F "response_format=srt")

# Save SRT file
echo "$RESULT" | jq -r '.data.text' > subtitles.srt

# Burn subtitles into video with ffmpeg
ffmpeg -i video.mp4 -vf subtitles=subtitles.srt output.mp4
```

## Tips

- Always specify `language` when you know it — improves accuracy and speed
- Use `verbose_json` when you need timestamps for syncing with video
- Use `srt` or `vtt` format to directly generate subtitle files
- For long audio files, consider splitting with ffmpeg first: `ffmpeg -i long.mp3 -f segment -segment_time 300 -c copy chunk_%03d.mp3`
- Set `temperature` to 0 (default) for most accurate results
- The `prompt` parameter helps with domain-specific terms — include key vocabulary the model should recognize
