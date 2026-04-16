---
name: text-to-speech
description: Convert text to speech audio. Picks from a catalog of OpenAI and Gemini voices. Supports style/prosody control — inline bracket tags for Gemini voices, free-form "instructions" for OpenAI voices on gpt-4o-mini-tts. Use when user wants voiceovers, narration, audio for videos, multi-voice dialogue, expressive or whispered speech.
---

# Text to Speech

Convert text to speech through the rebyte TTS endpoint. One endpoint, two providers, one voice catalog.

**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the agent's system prompt.

## Picking a voice

Every voice has an explicit provider prefix. **Pick the voice that matches the tone you want**, then compose style per its column below.

### OpenAI voices (style via `instructions` field)

Only `gpt-4o-mini-tts` respects `instructions`. The relay picks this model automatically whenever you pass `instructions`. Without `instructions` you get `tts-1` (cheaper, no style control).

| Voice | Character | Good for | Example `instructions` |
|---|---|---|---|
| `openai:marin` | Female, warm | Podcasts, narration, friendly explainer | `Speak conversationally, warm and relaxed.` |
| `openai:cedar` | Male, authoritative | Documentary, serious explainer | `Speak slowly with gravitas, like a film trailer.` |
| `openai:ash` | Male, energetic | Promo, ad, hype | `Upbeat and energetic, slightly rushed with excitement.` |
| `openai:coral` | Female, professional | Corporate, product demo | `Clear and professional, measured pace.` |
| `openai:ballad` | Male, expressive | Storytelling, audiobook | `Tell this like a campfire story, taking your time.` |
| `openai:sage` | Female, measured | Meditation, ASMR, calm explainer | `Soft and slow, gentle on every consonant.` |
| `openai:verse` | Neutral, versatile | General purpose | `Neutral delivery, no strong emotion.` |

**Legacy voices** (no `instructions` support — use only when you need tts-1 pricing):
`openai:nova`, `openai:alloy`, `openai:echo`, `openai:fable`, `openai:onyx`, `openai:shimmer`.

### Gemini voices (style via inline `[tags]` in text)

Backend: `gemini-3.1-flash-tts-preview`. Style is controlled by natural-language bracket tags **inside the text itself**. Tags aren't spoken — they're interpreted as directives. You can invent any tag that reads like an English adverb/adjective; the examples below are proven starting points.

| Voice | Character | Good for |
|---|---|---|
| `gemini:Kore` | Female, warm, firm | Podcasts, narration, interviews |
| `gemini:Puck` | Male, upbeat, playful | Casual explainer, comedy, chat |
| `gemini:Charon` | Male, deep, informative | Documentary, news, serious voiceover |
| `gemini:Fenrir` | Male, excitable | High-energy promo, sports, hype |
| `gemini:Aoede` | Female, breezy, light | Whispered, intimate, confessional |
| `gemini:Leda` | Female, youthful | Bright explainer, younger audience |

Additional Gemini voices available without a dedicated profile: `gemini:Orus`, `gemini:Zephyr`, `gemini:Callirrhoe`, `gemini:Autonoe`, `gemini:Enceladus`, `gemini:Iapetus`, `gemini:Umbriel`, `gemini:Algieba`, `gemini:Despina`, `gemini:Algenib`, `gemini:Rasalgethi`, `gemini:Achernar`, `gemini:Schedar`, `gemini:Gacrux`, `gemini:Sulafat`.

**Inline tag patterns** (compose freely — these are examples, not an enum):

- `[whispered] We have to be quiet here.`
- `[excited, fast] You are not going to believe what just happened!`
- `[sad, slow] I don't think this is going to work out.`
- `[deadpan] Yes. That is how physics works.`
- `[warm, smiling] Welcome back — great to have you.`
- `[British accent] A proper cup of tea, if you please.`
- Mid-sentence shifts work too: `[neutral] The meeting starts at nine. [conspiratorial] But between you and me, it will run late.`

## Synthesize speech

```bash
curl -X POST "$API_URL/api/data/tts/synthesize" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a sample voiceover.",
    "voice": "openai:marin",
    "instructions": "Speak conversationally, warm and relaxed.",
    "format": "mp3"
  }' | jq -r '.audio.base64' | base64 -d > voiceover.mp3
```

Gemini version (note the inline tag inside `text`):

```bash
curl -X POST "$API_URL/api/data/tts/synthesize" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "[whispered] I have a secret to tell you.",
    "voice": "gemini:Aoede"
  }' | jq -r '.audio.base64' | base64 -d > whisper.wav
```

## Multi-speaker dialogue

Gemini can synthesize a two-speaker conversation in a single call. Use this for podcasts, interviews, sketches, or any back-and-forth where the voices need to flow naturally together (Gemini blends handoffs far better than stitching separate clips).

Separate endpoint: `POST /api/data/tts/synthesize_dialogue`.

**Hard limits:**
- **Exactly 2 distinct speakers per call.** For 3+ speakers, split the script into 2-speaker chunks and concat the WAVs.
- **Gemini voices only** (`gemini:<name>` for every speaker). OpenAI has no native multi-speaker — use `synthesize` per-line and concat if you must.
- Combined text across all lines must fit the 4096-char limit.

**Request:**

```bash
curl -X POST "$API_URL/api/data/tts/synthesize_dialogue" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dialogue": [
      {"speaker": "Alice", "text": "So what do you think about the new TTS system?"},
      {"speaker": "Bob",   "text": "I was skeptical, but the inline tags actually work."},
      {"speaker": "Alice", "text": "[laughing] That must have been fun to debug."},
      {"speaker": "Bob",   "text": "[deadpan] A thrill a minute."}
    ],
    "voices": {
      "Alice": "gemini:Kore",
      "Bob":   "gemini:Charon"
    }
  }' | jq -r '.audio.base64' | base64 -d > dialogue.wav
```

**Parameters:**

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `dialogue` | array of `{speaker, text}` | yes | In order. Each `text` supports inline `[tags]`. |
| `voices` | object map | yes | Speaker name → `gemini:<voice>`. Exactly 2 entries. |
| `format` | string | no | Always returns `wav` regardless. |

**Response:**

```json
{
  "success": true,
  "audio": { "base64": "...", "format": "wav", "mimeType": "audio/wav", "sizeBytes": 754604 },
  "input": {
    "provider": "gemini",
    "mode": "dialogue",
    "speakers": { "Alice": "Kore", "Bob": "Charon" },
    "lineCount": 4,
    "characterCount": 212,
    "durationSeconds": 15.72
  }
}
```

**Tips:**
- **Pick voices with contrast.** Kore + Charon (warm female + deep male) reads clearly; two similar voices are harder to follow.
- **Let inline tags land on a specific speaker's line**, not across speaker boundaries. Gemini interprets tags within the utterance they prefix.
- **Keep line count reasonable per call** (under ~20 lines / 30 seconds of target audio). Latency scales with output duration — a 5-minute podcast should be chunked into ~4 calls at natural scene breaks.
- **For a podcast with 3+ voices**, split the script by scenes where only 2 characters speak, synthesize each, concat with `ffmpeg -i "concat:a.wav|b.wav" -c copy final.wav`.

## Parameters

| Parameter | Type | Required | Default | Notes |
|---|---|---|---|---|
| `text` | string | yes | — | Max 4096 chars. For Gemini voices, put style tags here. |
| `voice` | string | no | `openai:nova` | Use explicit `openai:` or `gemini:` prefix. |
| `instructions` | string | no | — | OpenAI `gpt-4o-mini-tts` only. Ignored by Gemini; to style Gemini, embed tags in `text`. |
| `model` | string | no | auto | OpenAI only: `gpt-4o-mini-tts` \| `tts-1-hd` \| `tts-1`. Relay auto-picks `gpt-4o-mini-tts` when `instructions` is set. |
| `format` | string | no | `mp3` | OpenAI: `mp3` \| `wav` \| `opus` \| `aac` \| `flac` \| `pcm`. Gemini: always returns `wav` regardless. |
| `speed` | number | no | `1.0` | OpenAI only. Range `0.25`–`4.0`. Ignored by Gemini. |

## Response

```json
{
  "success": true,
  "audio": { "base64": "...", "format": "mp3", "mimeType": "audio/mpeg", "sizeBytes": 24576 },
  "input": {
    "provider": "openai" | "gemini",
    "voice": "...",
    "model": "...",
    "characterCount": 35,
    "wordCount": 7
  }
}
```

Decode `audio.base64` with `base64 -d` and save to disk.

## Choosing between OpenAI and Gemini

| Need | Pick |
|---|---|
| Just read this text, no style | Any OpenAI legacy voice (`openai:nova` is the safe default — cheapest, `tts-1`) |
| Specific tone, one consistent delivery | OpenAI `gpt-4o-mini-tts` voice + `instructions` — easier to version-control the prompt |
| Style shifts mid-sentence (whispered → excited → calm) | Gemini voice + inline `[tag]` tags — only way to do this cleanly |
| Accent switching within one clip | Gemini — it handles accent tags natively |
| Multi-speaker dialogue as a single clip | Gemini via `synthesize_dialogue` (native two-speaker blending; see below) |
| Lowest cost per character | OpenAI `tts-1` (legacy voices) |
| Best prosody on a single even read | Either works; test both for your use case |

## Long text (over 4096 characters)

Split at sentence boundaries, synthesize each chunk, concatenate with ffmpeg:

```bash
ffmpeg -i "concat:chunk1.mp3|chunk2.mp3|chunk3.mp3" -c copy final.mp3
```

Keep the same voice + style across chunks or the cuts will be audible.

## Combine with video

```bash
# Replace video audio with generated voiceover
ffmpeg -i video.mp4 -i voiceover.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4

# Mix voiceover over existing audio at 80% voice volume
ffmpeg -i video.mp4 -i voiceover.mp3 \
  -filter_complex "[1:a]volume=0.8[voice];[0:a][voice]amix=inputs=2:duration=first" \
  -c:v copy output.mp4
```

Gemini voices return WAV at 24kHz. Convert to MP3 before mixing into video:
```bash
ffmpeg -i whisper.wav -c:a libmp3lame -q:a 2 whisper.mp3
```

## Delivering output

Upload finished audio to the Artifact Store so the user can access it.

## Tips

- **Read the voice's character column**; don't just pick `openai:nova` by habit. The voice does more for tone than any `instructions` string.
- **Keep `instructions` short** — two sentences, concrete. `"Speak slowly and somberly"` beats a paragraph.
- **For Gemini tags, pick words that would describe the delivery to a human director**: `[whispered]`, `[excited]`, `[mock-serious]`, `[slightly drunk]`. If it would make sense on a film set, it probably works here.
- **Test one sentence first** before synthesizing a long script. Adjust voice/style, then run the full text.
- **Chunk long text at sentence boundaries** — never mid-sentence. Mid-sentence cuts produce audible prosody jumps.
