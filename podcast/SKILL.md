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
