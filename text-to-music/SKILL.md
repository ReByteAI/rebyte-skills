---
version: 1
name: text-to-music
description: Generate music from text (and optionally a reference image) using Google Lyria 3 via Rebyte data API. Two models — `lyria-3` for fast 30-second clips, `lyria-3-pro` for full songs up to ~3 minutes with structural awareness (intro/verse/chorus/bridge). 44.1 kHz stereo MP3 or WAV. Pass an `image` to condition mood/genre on a visual. Use for soundtracks, jingles, intro/outro music, ambient beds, podcast theme music, image-to-music, or any text-to-music task. Triggers include "generate music", "create a song", "make a soundtrack", "compose music", "background music", "jingle", "theme song", "music from prompt", "text to music", "image to music", "music from image", "AI music".
---

# Text to Music

Generate music from a text prompt using Google Lyria 3 via the Rebyte data proxy. One endpoint, two models, returns a public URL to the rendered audio.

## Authentication

```bash
AUTH_TOKEN=$(/home/user/.local/bin/rebyte-auth)
API_URL=$(python3 -c "import json; print(json.load(open('/home/user/.rebyte.ai/auth.json'))['sandbox']['relay_url'])")
```

## Models

| Model | ID | Length | Good for |
|---|---|---|---|
| **Lyria 3** | `lyria-3` | ~30 seconds | Jingles, stings, ad beds, social loops, fast iteration |
| **Lyria 3 Pro** | `lyria-3-pro` | up to ~3 minutes | Full songs, podcast themes, soundtracks; understands structure (intro/verse/chorus/bridge) |

**Latency:** `lyria-3` returns in seconds; `lyria-3-pro` can take 1–3 minutes. Don't set short HTTP timeouts.

## Generate music

```bash
curl -X POST "$API_URL/api/data/music/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Warm lo-fi hip-hop with mellow Rhodes piano, dusty drum break at 80 BPM, vinyl crackle, late-night study vibe",
    "model": "lyria-3",
    "format": "mp3"
  }'
```

Full song with structure (Pro):

```bash
curl -X POST "$API_URL/api/data/music/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Indie folk ballad in 6/8, fingerpicked acoustic guitar, soft female vocal, gentle strings. Intro: solo guitar 8 bars. Verse: vocal enters with light brush kit. Chorus: full band lifts, harmonies open up. Bridge: drop to vocal + guitar, then build back. Outro: ritard on the final chord.",
    "model": "lyria-3-pro",
    "format": "wav"
  }'
```

Image-conditioned (the image guides mood/genre/instrumentation alongside the prompt):

```bash
IMAGE_B64=$(base64 -w 0 cover-art.png)
curl -X POST "$API_URL/api/data/music/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"prompt\": \"Score this scene — instrumental only, match the lighting and mood.\",
    \"image\": \"$IMAGE_B64\",
    \"imageMimeType\": \"image/png\",
    \"model\": \"lyria-3-pro\"
  }"
```

## Parameters

| Name | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `prompt` | string | **Yes** | — | — | Text description of the music. See prompting tips below. |
| `model` | string | No | `lyria-3` | `lyria-3`, `lyria-3-pro` | Pro for full songs; default for clips. |
| `format` | string | No | `mp3` | `mp3`, `wav` | MP3 is smaller; WAV is lossless. |
| `image` | string | No | — | — | Optional base64-encoded reference image. Lyria infers mood/genre/instrumentation cues from it alongside the text. |
| `imageMimeType` | string | No | `image/png` | `image/png`, `image/jpeg`, `image/webp` | MIME type of the source image (only used when `image` is provided). |

## Response

```json
{
  "audio": {
    "url": "https://artifacts.rebyte.ai/<workspace>/lyria-1717024812-9f3a.mp3",
    "mimeType": "audio/mpeg",
    "format": "mp3",
    "sizeBytes": 482133,
    "model": "lyria-3-clip-preview"
  },
  "text": "Verse 1: ..."
}
```

The `text` field is **only present for Pro** when the model returns lyrics or a structural plan alongside the audio. Treat it as optional.

The `audio.url` is **already public** — hand it to the user directly, embed it in HTML, or download with `curl -o`. No extra upload step needed.

## Prompting tips

Lyria responds well to specific musical language. Vague prompts get vague music.

**Cover these dimensions when possible:**

| Dimension | Examples |
|---|---|
| **Genre** | "lo-fi hip-hop", "synthwave", "bossa nova", "trap", "indie folk", "orchestral cinematic" |
| **Mood** | "uplifting", "melancholy", "tense", "playful", "triumphant", "sleepy" |
| **Instrumentation** | "Rhodes piano + upright bass + brushed drums", "808s, dark synth pad, vocal chops" |
| **Tempo / time sig** | "85 BPM", "uptempo 140 BPM", "slow 6/8", "swung 16ths" |
| **Reference (no copyrighted names)** | "early-2000s indie sleaze", "Studio Ghibli pastoral", "John Carpenter analog horror" |
| **Production texture** | "dusty vinyl crackle", "wide reverb tail", "tape saturation", "tight close-mic'd drums" |

**Pro-only structural cues** — Pro understands song form. Be explicit:

- *"Intro: 8 bars solo piano"*
- *"Verse: vocal enters, sparse instrumentation"*
- *"Chorus: full band, harmonies, lifted energy"*
- *"Bridge: drop to half-time, then build back"*
- *"Outro: ritard on the final chord"*

The clip model (`lyria-3`) ignores structure cues — it always renders ~30 seconds of one section.

## Picking the model

| Need | Pick |
|---|---|
| Background bed for a video / ad / social clip (≤30s) | `lyria-3` |
| Quick iteration on style — try 5 prompts before committing | `lyria-3` |
| Podcast intro / outro theme | `lyria-3` for stings, `lyria-3-pro` for full themes with arc |
| Full song with verses + chorus | `lyria-3-pro` |
| Soundtrack with intentional structural arc (build/drop) | `lyria-3-pro` |
| Lyrics returned alongside audio | `lyria-3-pro` (sometimes — check `text` field) |

## Combining with video / voiceover

```bash
# Save the rendered track locally
curl -L -o track.mp3 "$AUDIO_URL"

# Replace video audio with generated music
ffmpeg -i video.mp4 -i track.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4

# Mix music UNDER a voiceover (music at 25%, voice at 100%)
ffmpeg -i voiceover.mp3 -i track.mp3 \
  -filter_complex "[1:a]volume=0.25[bg];[0:a][bg]amix=inputs=2:duration=first" \
  mixed.mp3

# Loop a 30s clip to fill 2 minutes (clip model)
ffmpeg -stream_loop 3 -i clip.mp3 -t 120 -c copy looped.mp3
```

Render the **voice with `text-to-speech`** and the **bed with `text-to-music`**, then mix as above. Keep the music ≥10 dB below the voice or it will fight the dialogue.

## Tips

- **Iterate at clip speed.** Use `lyria-3` to dial in style and mood, then re-prompt with the same description on `lyria-3-pro` for the full version.
- **Don't name copyrighted artists or tracks.** Describe the era and production style instead — "early-2000s indie", "late-90s trip-hop", "modern hyperpop". The model is more reliable on stylistic cues than on artist names.
- **One genre per prompt.** "Jazzy lo-fi orchestral synthwave" produces mush. Pick one anchor genre, use the others as accent words ("synthwave with a jazz Rhodes lead").
- **For loops, ask for it.** "Seamless 30-second loop, no fade-in or fade-out" — otherwise Lyria may build to a stinger.
- **Check the URL early.** The artifact URL is returned as soon as the audio is ready; you can `curl -I` it before doing anything else with the response.

## Delivering output

The `audio.url` is already a public artifact URL. Hand it to the user directly, embed it in chat output, or download + re-deliver via the artifact store if you want a fixed filename.
