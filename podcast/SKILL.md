---
version: 1
name: podcast
description: Research a topic and produce a podcast episode with AI-generated voices. Use when user wants to create a podcast, audio episode, narrated discussion, or audio content from a topic or document. Triggers include "create a podcast", "make a podcast episode", "podcast about", "audio episode", "narrated discussion", "turn this into a podcast".
---

# Podcast

Produce podcast episodes from scratch or from source material. This skill handles content preparation, preview, and audio production end-to-end.

## Sub-Skills

- `rebyteai/internet-search` — Quick web search for facts, quotes, and current data
- `rebyteai/text-to-speech` — TTS synthesis (voices, style, dialogue)
- `rebyteai/show-me-how` — Interactive widgets for the episode preview

## Workflow

### Step 1: Understand the Episode

Parse what the user wants:
- **Topic or source** — A topic to research, or a document/article to convert?
- **Format** — Solo narration, two-host discussion, interview style, news roundup?
- **Length** — Short (5 min, ~750 words), medium (10 min, ~1500 words), long (15+ min, ~2250+ words)
- **Tone** — Conversational, educational, debate, storytelling, professional?
- **Audience** — Technical, general, executive?

### Step 2: Research (if needed)

Skip if the user provides source material (uploaded document, pasted text, etc.).

- **News/current events** — Use `internet-search` for 3-5 targeted searches.
- **Deep topic** — Use `internet-search` for comprehensive multi-source coverage.
- **Debate/discussion** — Research both sides with `internet-search`.

Organize findings into an outline: group by segment, note quotes/stats, identify narrative arc.

### Step 3: Write the Script

Write a complete, natural-sounding script. Script quality determines podcast quality.

**Script rules:**
- Write for the **ear**, not the eye. Short sentences, contractions, conversational phrasing.
- Avoid jargon unless the audience is technical.
- Include transitions between segments.
- Use `[SPEAKER NAME]` markers for each speaker on their own line.

**Format by episode type:**

**Solo narration:**
```
[HOST]
Welcome to the show. Today we're diving into...

[HOST]
That's it for today. If you found this useful...
```

**Two-host discussion:**
```
[HOST A]
So I've been reading about this new trend in...

[HOST B]
Yeah, I saw that too. What surprised me was...
```

**Interview:**
```
[INTERVIEWER]
Tell us about your experience with...

[GUEST]
Well, it started when...
```

**Structure every episode with:**
1. **Intro** — Welcome, topic intro, what listeners will learn
2. **Body** — Main content in 2-4 segments with transitions
3. **Outro** — Summary, key takeaway, sign-off

### Step 4: Show Episode Preview (REQUIRED)

**Before generating any audio, show the user a preview widget for approval.** Audio generation is expensive (TTS API calls, ffmpeg processing). The preview lets the user catch issues early.

Generate a `show-me-how` widget that displays the full episode plan. The widget should include:

1. **Episode header** — Title, estimated duration, format (solo/discussion/interview/news)
2. **Cast** — Each speaker with their assigned voice and a short voice description
3. **Sound design** — What music/ambience will be used (e.g., "Intro: downloaded lo-fi track from Pixabay, Background: ocean waves, Outro: same as intro")
4. **Full transcript** — The complete script, styled with:
   - Speaker names as colored labels (different color per speaker)
   - The actual dialogue text
   - Structural markers (`[INTRO MUSIC]`, `[TRANSITION]`, `[OUTRO MUSIC]`) shown as visual dividers
   - Estimated timestamp for each segment

**Widget template:**

````
```widget
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--widget-font-sans); background: var(--widget-bg-primary); color: var(--widget-text-primary); padding: 24px; }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
    .subtitle { color: var(--widget-text-secondary); font-size: 0.875rem; margin-bottom: 20px; }
    .card { background: var(--widget-bg-secondary); border: 1px solid var(--widget-border); border-radius: var(--widget-border-radius); padding: 20px; box-shadow: var(--widget-shadow-sm); margin-bottom: 16px; }
    .card h2 { font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; }

    /* Episode metadata */
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .meta-item { text-align: center; padding: 12px; background: var(--widget-bg-tertiary); border-radius: 8px; }
    .meta-value { font-family: var(--widget-font-mono); font-size: 1.25rem; font-weight: 700; color: var(--widget-accent); }
    .meta-label { font-size: 0.75rem; color: var(--widget-text-muted); margin-top: 4px; }

    /* Cast */
    .cast-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--widget-border); }
    .cast-row:last-child { border-bottom: none; }
    .voice-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: var(--widget-accent-text); }

    /* Sound design */
    .sound-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--widget-border); font-size: 0.9rem; }
    .sound-row:last-child { border-bottom: none; }
    .sound-label { color: var(--widget-text-muted); }

    /* Transcript */
    .segment { margin-bottom: 16px; }
    .speaker-label { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: var(--widget-accent-text); margin-bottom: 6px; }
    .timestamp { float: right; font-family: var(--widget-font-mono); font-size: 0.75rem; color: var(--widget-text-muted); }
    .dialogue { font-size: 0.95rem; line-height: 1.6; color: var(--widget-text-primary); white-space: pre-wrap; }
    .divider { text-align: center; padding: 12px 0; color: var(--widget-text-muted); font-size: 0.8rem; font-style: italic; border-top: 1px dashed var(--widget-border); border-bottom: 1px dashed var(--widget-border); margin: 12px 0; }
  </style>
</head>
<body>
  <h1>🎙️ Episode Preview: TITLE HERE</h1>
  <p class="subtitle">Review the episode plan before generating audio</p>

  <!-- Metadata -->
  <div class="meta-grid">
    <div class="meta-item"><div class="meta-value">~10 min</div><div class="meta-label">Duration</div></div>
    <div class="meta-item"><div class="meta-value">2</div><div class="meta-label">Speakers</div></div>
    <div class="meta-item"><div class="meta-value">Discussion</div><div class="meta-label">Format</div></div>
    <div class="meta-item"><div class="meta-value">3</div><div class="meta-label">Segments</div></div>
  </div>

  <!-- Cast -->
  <div class="card">
    <h2>Cast</h2>
    <div class="cast-row">
      <span class="voice-badge" style="background: var(--widget-chart-1);">HOST A</span>
      <span><strong>marin</strong> — Female, warm, confident</span>
    </div>
    <div class="cast-row">
      <span class="voice-badge" style="background: var(--widget-chart-2);">HOST B</span>
      <span><strong>cedar</strong> — Male, calm, authoritative</span>
    </div>
  </div>

  <!-- Sound Design -->
  <div class="card">
    <h2>Sound Design</h2>
    <div class="sound-row"><span>Intro Music</span><span class="sound-label">Lo-fi podcast intro (Pixabay, 6s)</span></div>
    <div class="sound-row"><span>Background</span><span class="sound-label">Soft coffee shop ambience (0.2x volume)</span></div>
    <div class="sound-row"><span>Transitions</span><span class="sound-label">Generated tonal sting (3s)</span></div>
    <div class="sound-row"><span>Outro Music</span><span class="sound-label">Same as intro (8s, fade out)</span></div>
  </div>

  <!-- Transcript -->
  <div class="card">
    <h2>Transcript</h2>
    <div class="divider">🎵 Intro Music (6s)</div>
    <div class="segment">
      <span class="speaker-label" style="background: var(--widget-chart-1);">HOST A</span>
      <span class="timestamp">0:06</span>
      <div class="dialogue">Welcome back to the show. Today we're looking at...</div>
    </div>
    <div class="segment">
      <span class="speaker-label" style="background: var(--widget-chart-2);">HOST B</span>
      <span class="timestamp">0:32</span>
      <div class="dialogue">Yeah, this is a fascinating topic because...</div>
    </div>
    <div class="divider">🔀 Transition (3s)</div>
    <!-- ... more segments ... -->
    <div class="divider">🎵 Outro Music (8s)</div>
  </div>
</body>
</html>
```
````

**After showing the preview, ask the user:**

> Here's the full episode plan. You can:
> - **Continue** — I'll generate the audio now
> - **Change voices** — e.g., "Make Host B use ash instead of cedar"
> - **Edit the script** — tell me what to change
> - **Change music/ambience** — e.g., "Use rain instead of coffee shop" or "No background ambience"
> - **Adjust length** — e.g., "Make segment 2 shorter"

**Only proceed to Step 5 after the user approves.**

### Step 5: Produce Audio

Follow the **Audio Production Engine** section below. It handles:
- Voice selection and pairing (Gemini multi-speaker TTS as primary)
- Script chunking and synthesis (one API call per chunk, not per line)
- Music download, ambience mixing, mastering
- Fallback to per-line OpenAI `gpt-audio-mini` if Gemini fails

### Step 6: Deliver

1. Upload the final MP3 to the Artifact Store
2. Provide:
   - The audio file
   - The full script (so the user can review/edit)
   - Episode metadata: title, duration, segment breakdown, voices used
   - Sources cited (if research was done)
3. Ask if the user wants:
   - A different voice or pacing
   - Script edits before regenerating
   - Additional segments or a follow-up episode
   - A web player app (can build with `rebyte-app-builder`)

## Decision Points

- **"Research or use provided content?"** — If the user uploads a document or pastes text, use that. If they give a topic, research it. Some need both.
- **"How many voices?"** — Solo = 1, Discussion/debate/interview = 2. Default to solo unless specified.
- **"How long?"** — Default ~10 minutes (~1500 words). News = 5 min. Deep dives = 15 min.
- **"User wants a web player"** — Build with `rebyte-app-builder` and deploy to rebyte.pro. Only if asked.


---

# Audio Production Engine

Turn a script into a finished podcast episode. Uses Gemini multi-speaker TTS as primary (natural dialogue in one call), falls back to per-line OpenAI if needed.

**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` from the system prompt.

## Pipeline

```
Script → format as "Speaker: line" dialogue → chunk at ~3500 chars
  → Gemini synthesize_dialogue per chunk (2 speakers per call)
  → concat chunk WAVs → download music/ambience → mix → master → MP3
```

### Setup

```bash
for cmd in ffmpeg curl jq base64; do
  command -v "$cmd" >/dev/null || { echo "FATAL: $cmd not found"; exit 1; }
done
WORKDIR=$(mktemp -d /tmp/podcast-XXXXXX)
mkdir -p "$WORKDIR/chunks" "$WORKDIR/assets"
```

## Voice Selection

### Gemini Voices (primary — used with synthesize_dialogue)

| Voice | Character | Best For |
|-------|-----------|----------|
| **Kore** | Female, warm, firm | Primary host, narration |
| **Charon** | Male, deep, informative | Co-host, expert segments |
| **Puck** | Male, upbeat, playful | Casual, comedy, chat |
| **Aoede** | Female, breezy, light | Soft segments, intimate |
| **Fenrir** | Male, excitable | High-energy, sports, hype |
| **Leda** | Female, youthful | Bright explainer |

### Voice Pairing

| Format | Recommended | Why |
|--------|-------------|-----|
| Two-host discussion | Kore + Charon | Warm female + deep male — distinct |
| Interview | Kore + Puck | Firm host + upbeat guest |
| Debate | Fenrir + Kore | Energetic vs. measured |
| News roundup | Kore + Fenrir | Confident anchor + energetic reporter |

### OpenAI Fallback Voices (per-line synthesis if Gemini fails)

| Voice | Character |
|-------|-----------|
| **openai:marin** | Female, warm |
| **openai:cedar** | Male, authoritative |
| **openai:ash** | Male, energetic |
| **openai:coral** | Female, professional |

## TTS Synthesis

### Primary: Gemini Multi-Speaker Dialogue

Format the script as `Speaker: line` text and call `synthesize_dialogue`:

```bash
RESPONSE=$(curl -s -X POST "$API_URL/api/data/tts/synthesize_dialogue" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dialogue": [
      {"speaker": "Host A", "text": "Welcome to the show. Today we are diving into..."},
      {"speaker": "Host B", "text": "Yeah, this is a fascinating topic because..."},
      {"speaker": "Host A", "text": "Let me share some numbers that surprised me."}
    ],
    "voices": {
      "Host A": "gemini:Kore",
      "Host B": "gemini:Charon"
    }
  }')
echo "$RESPONSE" | jq -r '.audio.base64' | base64 -d > "$WORKDIR/chunks/chunk_001.wav"
```

**Constraints:**
- Max **2 speakers** per call. For 3+ speakers, split by speaker pairs and concat.
- Max **4096 chars** combined text. Chunk scripts at ~3500 chars at sentence boundaries.
- Always returns WAV (24kHz PCM). Normalize: `ffmpeg -i in.wav -ar 44100 -ac 2 -sample_fmt s16 out.wav`

**For solo narration**, use single-speaker `synthesize` instead:

```bash
curl -s -X POST "$API_URL/api/data/tts/synthesize" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Welcome to the show...", "voice": "gemini:Kore"}' \
  | jq -r '.audio.base64' | base64 -d > "$WORKDIR/chunks/chunk_001.wav"
```

### Chunking

Split scripts > 3500 chars at:
1. Scene/segment breaks (best)
2. Paragraph boundaries (`\n\n`)
3. Sentence boundaries (`.` `!` `?` followed by space + uppercase)

Keep speaker pairs consistent across chunks. Concat chunks with ffmpeg.

### Fallback: Per-Line OpenAI

If Gemini `synthesize_dialogue` fails (returns `no_audio` or API error), fall back to per-line OpenAI synthesis:

1. Split script into individual lines
2. Call `synthesize` per line with `openai:<voice>` and `gpt-audio-mini`
3. Generate 0.6s silence WAVs between speakers
4. Concat all with ffmpeg

This is slower and more expensive but always works.

### Error Handling

| Error | Action |
|-------|--------|
| `no_audio` from Gemini | Retry once. If still fails, fall back to per-line OpenAI |
| `text_too_long` | Re-chunk smaller, retry |
| `rate_limit` | Wait 5s, retry (max 3) |
| TTS fails after all retries | **FATAL** — report error |

## Music & Ambience

Download royalty-free audio from Pixabay (CC0):

```bash
curl -L -o "$WORKDIR/assets/intro_raw.mp3" "<pixabay-url>"
ffmpeg -i "$WORKDIR/assets/intro_raw.mp3" -ar 44100 -ac 2 -sample_fmt s16 "$WORKDIR/assets/intro.wav"
```

| Element | Duration | Fade In | Fade Out |
|---------|----------|---------|----------|
| Intro music | 5-10s | 1s | 2s |
| Outro music | 5-10s | 2s | 3s |
| Ambience | Full episode | 2s | 5s |

If download fails, skip music/ambience and produce speech-only. Warn user.

## Assembly & Mastering

### 1. Concat speech chunks

```bash
# speech_list.txt: file 'chunks/chunk_001.wav' \n file 'chunks/chunk_002.wav' ...
ffmpeg -f concat -safe 0 -i "$WORKDIR/speech_list.txt" -c copy "$WORKDIR/all_speech.wav"
```

### 2. Mix ambience (if available)

```bash
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$WORKDIR/all_speech.wav" | cut -d. -f1)
ffmpeg -i "$WORKDIR/all_speech.wav" -i "$WORKDIR/assets/ambience.wav" \
  -filter_complex "[0:a]volume=1.0[speech];[1:a]volume=0.25,afade=t=out:st=$((DURATION-5)):d=5[bg];[speech][bg]amix=inputs=2:duration=shortest" \
  -ac 2 -ar 44100 "$WORKDIR/episode_with_ambience.wav"
```

### 3. Add intro/outro

```bash
# episode_list.txt: intro.wav, silence, episode_with_ambience.wav, silence, outro.wav
ffmpeg -f concat -safe 0 -i "$WORKDIR/episode_list.txt" -c copy "$WORKDIR/episode_raw.wav"
```

### 4. Two-pass loudnorm mastering (-16 LUFS)

```bash
# Pass 1: measure
STATS=$(ffmpeg -i "$WORKDIR/episode_raw.wav" -af "loudnorm=I=-16:TP=-1.0:LRA=7:print_format=json" -f null /dev/null 2>&1)
INPUT_I=$(echo "$STATS" | grep '"input_i"' | grep -o '[-0-9.]*')
INPUT_TP=$(echo "$STATS" | grep '"input_tp"' | grep -o '[-0-9.]*')
INPUT_LRA=$(echo "$STATS" | grep '"input_lra"' | grep -o '[-0-9.]*')
INPUT_THRESH=$(echo "$STATS" | grep '"input_thresh"' | grep -o '[-0-9.]*')
TARGET_OFFSET=$(echo "$STATS" | grep '"target_offset"' | grep -o '[-0-9.]*')

# Pass 2: apply
ffmpeg -i "$WORKDIR/episode_raw.wav" \
  -af "loudnorm=I=-16:TP=-1.0:LRA=7:measured_I=${INPUT_I}:measured_TP=${INPUT_TP}:measured_LRA=${INPUT_LRA}:measured_thresh=${INPUT_THRESH}:offset=${TARGET_OFFSET}:linear=true" \
  "$WORKDIR/episode_mastered.wav"
```

### 5. Encode MP3

```bash
ffmpeg -i "$WORKDIR/episode_mastered.wav" -codec:a libmp3lame -b:a 192k -ar 44100 "podcast-episode-${SLUG}.mp3"
```

Upload to Artifact Store. Clean up `$WORKDIR`.
