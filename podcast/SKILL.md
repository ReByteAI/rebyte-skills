---
name: podcast
description: Research a topic and produce a podcast episode with AI-generated voices. Use when user wants to create a podcast, audio episode, narrated discussion, or audio content from a topic or document. Triggers include "create a podcast", "make a podcast episode", "podcast about", "audio episode", "narrated discussion", "turn this into a podcast".
---

# Podcast

Produce podcast episodes from scratch or from source material. This skill orchestrates content preparation, shows the user a preview for approval, then delegates audio production to the `podcast-producer` skill.

## Sub-Skills

- `rebyteai/internet-search` — Quick web search for facts, quotes, and current data
- `rebyteai/deep-research` — Comprehensive multi-source research for in-depth topics
- `rebyteai/podcast-producer` — **Audio production engine.** Handles all TTS, audio processing, music, mastering. Follow its guidelines for ALL audio production decisions.
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
- **Deep topic** — Use `deep-research` for comprehensive multi-source coverage.
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

**Delegate entirely to the `podcast-producer` skill.** It handles:
- Voice selection and pairing (uses `gpt-4o-mini-tts` with voices like marin, cedar, ash)
- Script parsing and chunking
- TTS synthesis with retry/fallback
- Per-segment audio processing (highpass, compression, limiting)
- Silence insertion between speakers
- Intro/outro music download and fading
- Background ambience mixing
- Episode assembly and loudness mastering (-16 LUFS)
- Final MP3 encoding

Follow ALL audio production guidance from `podcast-producer`. Do not manually call TTS or process audio outside of its pipeline.

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

# Audio Production Engine (merged from podcast-producer)

# Podcast Producer

## Goal

Turn a ready script into a finished podcast episode that meets broadcast audio standards (Apple Podcasts / Spotify). The user should be able to upload the MP3 directly to a podcast host.

## Core Principle

Every audio decision serves clarity and listener comfort. Voices must be distinct, pacing must feel natural, loudness must be consistent, and transitions must be smooth. Production quality is not decoration — it's the difference between "AI-generated audio" and "a podcast."

**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the agent's system prompt; use them as Bearer token and base URL.

---

## Part 1: Pipeline Overview

```
Script text
  |  Parse (check directive markers FIRST, then speaker markers)
  v
Segment list [{ speaker, text, directives }]
  |  Assign voices (Part 2)
  v
Segment list with voice assignments
  |  Preflight: probe TTS with tiny text to verify model availability
  |  Chunk segments > 3500 chars (Part 3)
  v
Chunk list
  |  Synthesize via relay TTS API (sequential, with retry)
  |  Decode base64 -> WAV, normalize to canonical format
  v
Raw chunk WAVs ($WORKDIR/chunks/)
  |  Reassemble same-speaker chunks (concat)
  |  Per-segment processing: highpass -> compressor -> limiter
  v
Processed segments ($WORKDIR/segments/)
  |  Generate silence files, download music + ambience ($WORKDIR/assets/)
  v
All assets in canonical WAV (44100 Hz, stereo, s16)
  |  Assemble speech + silences (ffmpeg concat demuxer)
  v
all_speech.wav
  |  Mix background ambience under speech (volume + amix)
  v
episode_with_ambience.wav
  |  Prepend intro music, append outro music (concat)
  v
episode_raw.wav
  |  Final mastering: two-pass loudnorm (-16 LUFS)
  v
episode_mastered.wav
  |  Encode to MP3 (192kbps)
  v
podcast-episode-<slug>.mp3
  |  Upload to Artifact Store
  v
Done
```

**Key invariant**: All intermediate audio is WAV (PCM, 44100 Hz, stereo, s16). MP3 encoding happens once at the very end. This avoids generation-loss and format mismatch issues.

### Setup

Before starting, verify tools and create working directory:

```bash
for cmd in ffmpeg curl jq base64 python3; do
  command -v "$cmd" >/dev/null || { echo "FATAL: $cmd not found"; exit 1; }
done

WORKDIR=$(mktemp -d /tmp/podcast-XXXXXX)
mkdir -p "$WORKDIR/chunks" "$WORKDIR/segments" "$WORKDIR/assets"
```

On success: delete `$WORKDIR` after upload. On failure: preserve `$WORKDIR` and report its path.

---

## Part 2: Voice Selection & Configuration

### Model

Use **`gpt-4o-mini-tts`**. It produces the most natural prosody.

**Preflight check**: Before synthesizing any real segments, make one probe call with a short text (e.g., "Hello") to verify the model is available. If it fails, switch to `tts-1-hd` and remap voices BEFORE any real synthesis begins. Never mix models within an episode.

### Voice Palette

| Voice | Character | Best For |
|-------|-----------|----------|
| **marin** | Female, warm, confident | Primary host, narration (default) |
| **cedar** | Male, calm, authoritative | Co-host, expert segments |
| **ash** | Male, energetic, youthful | News, upbeat topics |
| **coral** | Female, clear, professional | Interviews, corporate |
| **ballad** | Male, storytelling, expressive | Narrative, dramatic |
| **sage** | Female, wise, measured | Educational, explainer |

### Voice Pairing Rules

Select voices that **contrast** in register and timbre:

| Format | Recommended Pairing | Why |
|--------|---------------------|-----|
| Two-host discussion | marin + cedar | Warm female + calm male — distinct but harmonious |
| Interview | coral + cedar | Professional interviewer + authoritative guest |
| Debate | ash + sage | Energetic vs. measured — creates tension |
| News roundup | marin + ash | Confident anchor + energetic reporter |

**Rule**: Never pair two voices of the same character. The listener must instantly distinguish who is speaking.

### Voice Assignment by Speaker Count

Voices are assigned to speakers in order of first appearance:

| Speakers | Assignment |
|----------|-----------|
| 1 | marin |
| 2 | marin, cedar (or template pairing) |
| 3 | marin, cedar, ash |
| 4 | marin, cedar, ash, coral |
| 5 | marin, cedar, ash, coral, sage |
| 6+ | Cycle: marin, cedar, ash, coral, ballad, sage. Warn if reusing. |

### Fallback Remap (gpt-4o-mini-tts -> tts-1-hd)

If falling back to `tts-1-hd`, remap ALL voices before any synthesis:

| Original | Fallback | Rationale |
|----------|----------|-----------|
| marin | nova | Both female, warm |
| cedar | onyx | Both male, authoritative |
| ash | echo | Both male, conversational |
| coral | nova | Both female, professional |
| ballad | fable | Both expressive |
| sage | shimmer | Both female, calm |

---

## Part 3: Script Parsing & Chunking

### Script Grammar

**Directive markers** are checked FIRST (take precedence over speaker markers):

```
Directive: ^\[(INTRO|OUTRO|TRANSITION|SEGMENT|SILENCE)[^\]]*\]\s*$
Speaker:   ^\[([A-Za-z0-9 _-]+)\]\s*$
```

If a line matches a directive pattern, it is a directive — never a speaker. This prevents `[INTRO]` from being treated as a speaker named "INTRO".

### Parser Rules

1. Check directive regex first. If match -> store as structural cue.
2. Check speaker regex. If match -> start new segment.
3. All other non-empty lines -> speech text for current speaker.
4. Empty lines within a speaker block -> paragraph breaks (0.3s silence).
5. Text before any speaker marker -> default narrator.
6. No speaker markers at all -> entire text is single narrator, Solo Narration template.
7. Empty speaker blocks -> skip (no audio).

### Chunking Long Segments

TTS limit: 4096 characters. Split segments > 3500 chars using this priority:

1. **Paragraph boundary** (`\n\n`)
2. **Sentence boundary** — regex `(?<=[.!?])\s+(?=[A-Z])` — avoids splitting on "Dr. Smith", "3.14", ellipses
3. **Clause boundary** — `; ` or `, `
4. **Hard split** — last space before 3500 chars

Concatenate same-speaker chunks with no gap (same voice, continuous thought).

---

## Part 4: TTS Synthesis

### API Call

**Always send all five fields explicitly.** Never rely on relay defaults.

```bash
RESPONSE=$(curl -s -X POST "$API_URL/api/data/tts/synthesize" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"$CHUNK_TEXT\",
    \"voice\": \"$VOICE\",
    \"model\": \"$MODEL\",
    \"format\": \"wav\",
    \"speed\": $SPEED
  }")
```

Request WAV format to avoid lossy MP3 round-trip. If relay rejects WAV, fall back to flac, then mp3.

### Decode Response

```bash
# Validate
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
AUDIO=$(echo "$RESPONSE" | jq -r '.audio.base64 // empty')

if [ "$SUCCESS" != "true" ] || [ -z "$AUDIO" ]; then
  # Handle error / retry
fi

# Save and normalize to canonical format
echo "$AUDIO" | base64 -d > "$WORKDIR/chunks/chunk_${N}_raw.wav"
ffmpeg -i "$WORKDIR/chunks/chunk_${N}_raw.wav" -ar 44100 -ac 2 -sample_fmt s16 "$WORKDIR/chunks/chunk_${N}.wav"
```

### Fallback State Machine

```
1. Call with (model=gpt-4o-mini-tts, format=wav)
2. success=true AND audio.base64 non-empty -> save, done
3. success=false:
   a. text_too_long -> re-split, retry smaller
   b. rate_limit -> wait 5s, retry (max 3)
   c. authentication_error -> re-auth, retry once
   d. invalid_model -> switch ALL to tts-1-hd + remap voices, retry
   e. invalid_format -> try flac, then mp3 (global switch)
   f. other error -> retry once, then FATAL
4. success=true but audio.base64 empty -> retry once
```

Model and format fallbacks apply globally to ALL subsequent calls.

### Rate Limiting

| Rule | Value |
|------|-------|
| Concurrency | **1** (sequential) |
| Delay between calls | **0.5s** |
| Retry on 429 | Wait 5s, up to 3 retries |
| Per-call timeout | **60 seconds** |
| Total TTS phase timeout | **15 minutes** |
| Max TTS calls | **30** |
| Max script length | Warning at 15k chars, fatal at 25k chars |

---

## Part 5: Audio Processing

### Per-Segment Processing Chain

Apply to each assembled segment (after same-speaker chunk concatenation):

```bash
ffmpeg -i "$WORKDIR/segments/segment_${N}_raw.wav" \
  -af "highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=100,alimiter=limit=-1.0" \
  "$WORKDIR/segments/segment_${N}.wav"
```

| Filter | Purpose |
|--------|---------|
| `highpass=f=80` | Remove rumble and TTS artifacts below 80Hz |
| `acompressor` | Even out dynamics — threshold -20dB, ratio 3:1 |
| `alimiter` | Hard ceiling at -1.0 dBTP — no clipping |

**Do NOT apply `loudnorm` per-segment.** It causes pumping at boundaries.

### Silence Generation

Pre-generate needed silence durations:

```bash
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 0.6 -sample_fmt s16 "$WORKDIR/assets/silence_0_6s.wav"
```

| Transition | Silence | Rationale |
|------------|---------|-----------|
| Same speaker, paragraph break | **0.3s** | Brief breath |
| Different speaker responds | **0.6s** | Natural turn-taking |
| New segment/topic | **1.2s** | Signals topic shift |
| After intro music | **0.8s** | Let music breathe |
| Before outro music | **1.0s** | Signal wrap-up |

---

## Part 6: Music, Ambience & Sound Design

Professional podcasts use two layers of audio beyond speech: **music** (intro/outro/transitions) and **background ambience** (atmospheric sounds that set the mood throughout). Both dramatically improve production quality.

### Two Layers

| Layer | Purpose | Examples | Volume |
|-------|---------|----------|--------|
| **Music** | Brand identity, structure | Intro jingle, transition stings, outro | Full volume when solo, -15dB under speech |
| **Ambience** | Mood, atmosphere, warmth | Ocean waves, rain, coffee shop, forest, lo-fi hum | **0.2-0.3x** speech volume (subtle, never distracting) |

### Getting Audio: Download Free Sounds

**Do NOT generate sine-wave tones.** Download real music and ambience from free sources instead. These are royalty-free and sound infinitely better:

| Source | URL | License | Best For |
|--------|-----|---------|----------|
| **Pixabay Music** | pixabay.com/music/ | CC0 (no attribution) | Podcast intro/outro music, ambient tracks |
| **Pixabay Sound Effects** | pixabay.com/sound-effects/ | CC0 (no attribution) | Ocean waves, rain, birds, city, coffee shop |
| **Freesound** | freesound.org | CC0 / CC-BY (varies) | Huge library of ambience and effects |
| **Mixkit** | mixkit.co/free-sound-effects/ | Free license | Clean sound effects and music |

**Download approach**: Use `curl` or `wget` to download audio. Convert to canonical WAV format:

```bash
# Download ocean waves from Pixabay (example — find real URL by searching the site)
curl -L -o "$WORKDIR/assets/ambience_raw.mp3" "<url>"
ffmpeg -i "$WORKDIR/assets/ambience_raw.mp3" -ar 44100 -ac 2 -sample_fmt s16 "$WORKDIR/assets/ambience.wav"
```

**Choose ambience that matches the episode tone:**

| Episode Tone | Suggested Ambience |
|-------------|-------------------|
| Calm, reflective | Ocean waves, gentle rain, wind |
| Energetic, news | None or subtle city hum |
| Educational | Soft lo-fi background, library ambience |
| Storytelling | Forest, fireplace, subtle music bed |
| Professional/corporate | None or very subtle office ambience |

### Music Positions

| Position | Purpose | Duration |
|----------|---------|----------|
| **Intro** | Brand identity, energy setter | 5-10s |
| **Transitions** | Signal topic change | 2-4s |
| **Outro** | Sign-off, wrap-up | 5-10s |

### Mixing Background Audio Under Speech

This is the most important sound design technique. Use `volume` + `amix` — simple and reliable:

```bash
# Mix narration (full volume) with background ambience (0.25 volume, fade out at end)
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$WORKDIR/segments/all_speech.wav" | cut -d. -f1)

ffmpeg -i "$WORKDIR/segments/all_speech.wav" -i "$WORKDIR/assets/ambience.wav" \
  -filter_complex "[0:a]volume=1.0[speech];[1:a]volume=0.25,afade=t=out:st=$((DURATION-5)):d=5[bg];[speech][bg]amix=inputs=2:duration=shortest" \
  -ac 2 -ar 44100 "$WORKDIR/episode_with_ambience.wav"
```

**Key parameters:**
- Speech volume: **1.0** (never reduce speech)
- Ambience volume: **0.2-0.3** (subtle background, not competing with speech)
- Fade out ambience near end of speech (5s fade)
- `duration=shortest` ensures output matches speech length

This is the same technique Manus and other production tools use. It's simpler and more reliable than `sidechaincompress`.

### When to Mix vs. Concat

| Scenario | Technique |
|----------|-----------|
| Intro/outro music (plays alone, then speech starts) | **Concat** — sequential, no overlap |
| Background ambience under entire episode | **Mix** — `volume` + `amix` |
| Music bed under intro speech | **Mix** — music at 0.2-0.3 volume |
| Transition stings between segments | **Concat** — too short to mix |

### Assembly Order

When using background ambience, the pipeline changes slightly:

1. Assemble all speech segments + silences into one file via concat (no music/ambience yet)
2. Mix background ambience under the assembled speech using `amix`
3. Prepend intro music and append outro music via concat
4. Apply final mastering

### Fade Rules

Apply fades to music/ambience BEFORE mixing or assembly:

| Element | Fade In | Fade Out |
|---------|---------|----------|
| Intro music | 1.0s | 2.0s |
| Transition sting | 0.3s | 0.3s |
| Outro music | 2.0s | 3.0s |
| Background ambience | 2.0s | 5.0s |

### Degradation Policy

Music and ambience are additive polish, not load-bearing:

| Scenario | Action |
|----------|--------|
| Download fails (network issues) | Skip ambience/music, produce speech-only episode, warn user |
| User-provided audio corrupt | Warn, try downloading from free source instead |
| No suitable ambience for tone | Skip ambience — not every episode needs it |

---

## Part 7: Episode Assembly & Mastering

### Step 1: Concat Speech + Silences

All files must be canonical WAV. Use alphanumeric filenames only (no spaces/quotes):

```
file 'segments/segment_001.wav'
file 'assets/silence_0_6s.wav'
file 'segments/segment_002.wav'
file 'assets/silence_1_2s.wav'
file 'segments/segment_003.wav'
```

```bash
ffmpeg -f concat -safe 0 -i "$WORKDIR/speech_list.txt" -c copy "$WORKDIR/all_speech.wav"
```

### Step 2: Mix Background Ambience (if available)

```bash
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$WORKDIR/all_speech.wav" | cut -d. -f1)

ffmpeg -i "$WORKDIR/all_speech.wav" -i "$WORKDIR/assets/ambience.wav" \
  -filter_complex "[0:a]volume=1.0[speech];[1:a]volume=0.25,afade=t=out:st=$((DURATION-5)):d=5[bg];[speech][bg]amix=inputs=2:duration=shortest" \
  -ac 2 -ar 44100 -sample_fmt s16 "$WORKDIR/episode_with_ambience.wav"
```

If no ambience, just copy: `cp all_speech.wav episode_with_ambience.wav`

### Step 3: Prepend Intro + Append Outro

```
file 'assets/intro.wav'
file 'assets/silence_0_8s.wav'
file 'episode_with_ambience.wav'
file 'assets/silence_1_0s.wav'
file 'assets/outro.wav'
```

```bash
ffmpeg -f concat -safe 0 -i "$WORKDIR/episode_list.txt" -c copy "$WORKDIR/episode_raw.wav"
```

### Two-Pass Loudnorm Mastering

**Pass 1: Measure**

```bash
LOUDNORM_STATS=$(ffmpeg -i "$WORKDIR/episode_raw.wav" \
  -af "loudnorm=I=-16:TP=-1.0:LRA=7:print_format=json" \
  -f null /dev/null 2>&1 | grep -A 20 '"input_i"' | head -20)
```

Extract values with jq or grep:

```bash
INPUT_I=$(echo "$LOUDNORM_STATS" | grep '"input_i"' | grep -o '[-0-9.]*')
INPUT_TP=$(echo "$LOUDNORM_STATS" | grep '"input_tp"' | grep -o '[-0-9.]*')
INPUT_LRA=$(echo "$LOUDNORM_STATS" | grep '"input_lra"' | grep -o '[-0-9.]*')
INPUT_THRESH=$(echo "$LOUDNORM_STATS" | grep '"input_thresh"' | grep -o '[-0-9.]*')
TARGET_OFFSET=$(echo "$LOUDNORM_STATS" | grep '"target_offset"' | grep -o '[-0-9.]*')
```

**Pass 2: Apply**

```bash
ffmpeg -i "$WORKDIR/episode_raw.wav" \
  -af "loudnorm=I=-16:TP=-1.0:LRA=7:measured_I=${INPUT_I}:measured_TP=${INPUT_TP}:measured_LRA=${INPUT_LRA}:measured_thresh=${INPUT_THRESH}:offset=${TARGET_OFFSET}:linear=true" \
  "$WORKDIR/episode_mastered.wav"
```

### Final Encode

```bash
ffmpeg -i "$WORKDIR/episode_mastered.wav" -codec:a libmp3lame -b:a 192k -ar 44100 "podcast-episode-${SLUG}.mp3"
```

---

## Part 8: Episode Structure Templates

### Solo Narration

```
[INTRO MUSIC: 6s]  [SILENCE: 0.8s]
[HOST] Intro (30-60s)
[SILENCE: 1.2s]
[HOST] Segment 1  [TRANSITION: 3s]
[HOST] Segment 2  [TRANSITION: 3s]
[HOST] Segment 3
[SILENCE: 1.2s]
[HOST] Outro (30-60s)
[SILENCE: 1.0s]  [OUTRO MUSIC: 8s]
```

Voice: marin | Speed: 0.93

### Two-Host Discussion

Voice: marin + cedar | Speed: 0.95 | Speaker gaps: 0.6s

### Interview

Voice: coral + cedar | Speed: 0.93 | Speaker gaps: 0.8s

### News Roundup

Voice: marin or ash | Speed: 1.0 | Transition stings between stories

---

## Part 9: Decision Logic

### Precedence (highest first)

1. User explicit instruction
2. Script markers (e.g., `[HOST A: voice=ash]`)
3. Template defaults
4. Auto-detection from script patterns
5. Skill defaults

### Auto-Detect Format

| Script Pattern | Template |
|---------------|----------|
| Single speaker | Solo Narration |
| Two speakers, balanced turns | Two-Host Discussion |
| One asks questions, other answers | Interview |
| Single speaker, many short sections | News Roundup |

---

## Part 10: Delivering Output

Upload the final MP3 to the Artifact Store. Report:

| Field | Value |
|-------|-------|
| Title | From script or user |
| Duration | From final MP3 (`ffprobe -show_entries format=duration`) |
| Format | MP3, 192kbps, 44100 Hz, stereo |
| Loudness | -16 LUFS (±1) |
| Voices | Speaker -> voice mapping |
| Segments | Count + timestamps (from cumulative WAV durations) |

Offer adjustments: swap voices, change speed, re-generate a segment, change music.

---

## Part 11: Error Handling

**Fail early, fail loudly.** TTS and audio assembly errors are fatal. Music errors degrade gracefully.

| Scenario | Action |
|----------|--------|
| TTS fails after retries | **FATAL** — report segment text + error |
| Model unavailable | Preflight catches this. Fallback to tts-1-hd. Both fail -> FATAL |
| ffmpeg missing | **FATAL** — detected in setup |
| ffmpeg filter/concat fails | **FATAL** — report step + error |
| Script > 25k chars | **FATAL** — ask user to split |
| Script > 15k chars | **WARNING** — suggest splitting |
| No speaker markers | Treat as solo narrator |
| Music corrupt | Warn, use generated pad |
| Auth expired | Re-auth, retry once |

On fatal failure, preserve `$WORKDIR` and report its path for inspection.

---

## What This Skill Does NOT Do

- **Content creation**: No topic research, no script writing
- **Transcription**: No speech-to-text
- **Video**: Audio only
- **Distribution**: No RSS feeds, no podcast host uploads
- **Live streaming**: Offline generation only
