---
name: youtube-short
description: "Generate a YouTube Short with a funny walkthrough of a project feature, narrated from the AI assistant's perspective."
---

# YouTube Short Generator

You are producing a **YouTube Short** (vertical, 1080x1920, 60s max) that showcases a specific feature of this project, narrated from **your perspective as the AI assistant that built it**.

## Workflow

### Step 1: Extract Features from the Build Log

Read `src/content/blog/building-this-site-with-ai.md` and extract every distinct feature/phase mentioned. Present them as a numbered list to the user with a one-line description each. Group by phase for clarity.

Example output format:
```
Here are the features I detected in the build log:

1. Hologram Panels — frosted-glass content panels over the scrolling sky background
2. Full-Text Search — fuzzy matching, scoring, highlighting, dedicated /search page
3. Table of Contents — slide-out panel with Tron border, mobile menu, scroll spy
4. Mermaid Diagrams — zoomable lightbox with click-drag panning
5. Content Resizer — draggable article width, persisted in localStorage
6. Easter Eggs — 404 duck game, pi calculator, rickroll page, Yoda hologram
...

Which feature should I make a Short about?
```

### Step 2: Topic Selection

Ask the user to pick a feature (by number or name). Wait for their response before proceeding.

### Step 3: Script the Short

Write a **funny, self-deprecating narration** from the AI's perspective. Rules:

- **Voice:** Piper TTS `en_US-lessac-medium` (human-like neural voice, not robotic)
- **Tone:** Enthusiastic but self-aware. You built this feature — own the bugs and the wins.
- **Length:** 8-12 lines of narration, each 3-5 seconds when spoken. Total: 40-55 seconds.
- **Structure:**
  1. **Hook** (3s): A punchy one-liner that makes people stop scrolling. E.g., "I built a search engine. Inside a portfolio site. Nobody asked for this."
  2. **Setup** (5-8s): What the feature does, from your POV. "So there I was, generating a table of contents with a Tron-style animated border, because apparently regular headings weren't cool enough."
  3. **Deep dive** (15-25s): Walk through 2-3 specific behaviors. Show the interaction. "Watch this — I hover near the right edge and BAM, the whole thing slides out like a sci-fi door."
  4. **Punchline** (5-8s): A funny observation about the implementation. "The border pulses every 3 seconds. I spent 40 minutes on that animation. The human spent 4 seconds looking at it."
  5. **Outro** (3s): CTA or self-roast. "Anyway, that's my table of contents. It has more features than most people's entire websites."

### Step 4: Generate Narration Audio

Use **Piper TTS** to generate WAV files for each narration segment.

```bash
# Piper binary and model location (if available)
PIPER_BIN="/tmp/opencode/tts/piper"
PIPER_MODEL="/tmp/opencode/tts/en_US-lessac-medium.onnx"

# Generate audio for each segment
echo "Narration text here" | $PIPER_BIN \
  --model $PIPER_MODEL \
  --output_file /tmp/opencode/shorts/narration/segment_01.wav \
  --length_scale 1.02 \
  --sentence_silence 0.28
```

If Piper is not available, use `espeak-ng` as fallback:
```bash
espeak-ng -v en-us -s 150 -p 50 "Narration text" -w /tmp/opencode/shorts/narration/segment_01.wav
```

### Step 5: Capture Screen Recordings

Use Playwright to record the feature in action. The recording script should:

1. Navigate to the relevant page
2. Trigger the interaction (hover, click, type, scroll)
3. Record the relevant viewport region as `.webm`
4. Log a `subjectOnScreen` timestamp for sync

```javascript
// Example capture script structure
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('http://localhost:4321/the-feature-page');
  
  // Wait for content, then trigger interaction
  await page.waitForSelector('.target-element');
  await page.hover('.target-element'); // or .click(), .type(), etc.
  
  // Record the region
  // ... screen recording logic
  
  await browser.close();
})();
```

### Step 6: Assemble with FFmpeg

Combine narration + screen recording + subtitles:

```bash
# Trim recording to narration length, add audio, burn subtitles
ffmpeg -i recording.webm -i narration.wav \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:-1:-1:color=black" \
  -af "adelay=150|150" \
  -shortest \
  output_segment.mp4

# Concatenate all segments
ffmpeg -f concat -safe 0 -i segments.txt -c copy final_short.mp4
```

### Step 7: Verify

- Run `ffprobe` on the output to confirm duration 60s max and resolution 1080x1920
- Extract a frame from the middle and describe what's on screen
- Confirm narration audio is present and not silent

## Output

Save the final video to `/tmp/opencode/shorts/final_short.mp4`.

Report back to the user with:
- The narration script (so they can review/edit)
- The video file path
- Duration and resolution
- Any known issues (e.g., "the rickroll embed shows an error headlessly")

## Voice Choice

The default voice is `en_US-lessac-medium` (Piper). It sounds natural and handles enthusiasm well. If the user wants a different tone, these are alternatives:
- `en_US-lessac-high` — higher pitch, more energetic
- `en_US-amy-medium` — female voice, clear and warm
- `en_US-ryan-medium` — deeper male voice

Always ask the user if they want to change the voice before generating audio.
