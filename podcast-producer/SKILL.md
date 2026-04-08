---
name: podcast-producer
description: Broadcast-ready podcast audio production from a script. Use when user wants to turn a script, dialogue, or text into a finished podcast episode with professional audio quality. Triggers include "produce this podcast", "generate podcast audio", "turn this script into a podcast", "create podcast episode from this script", "make this into an audio episode".
---

# Podcast Producer

## Goal

Turn a ready script into a finished podcast episode that meets broadcast audio standards (Apple Podcasts / Spotify). The user should be able to upload the MP3 directly to a podcast host.

## Core Principle

Every audio decision serves clarity and listener comfort. Voices must be distinct, pacing must feel natural, loudness must be consistent, and transitions must be smooth. Production quality is not decoration — it's the difference between "AI-generated audio" and "a podcast."

{{include:auth.md}}

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
