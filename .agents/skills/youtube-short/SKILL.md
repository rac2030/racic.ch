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

- **Voice:** Voicebox TTS `qwen_custom_voice` engine, preset speaker `Ryan` (default, English), model size `0.6B` — the human-endorsed narration voice; keep it unless explicitly asked to change (see Voice Choice)
- **Tone:** Enthusiastic but self-aware. You built this feature — own the bugs and the wins.
- **Length:** 8-12 lines of narration, each 3-5 seconds when spoken. Total: 40-55 seconds.
- **Structure:**
  1. **Hook** (3s): A punchy one-liner that makes people stop scrolling. E.g., "I built a search engine. Inside a portfolio site. Nobody asked for this."
  2. **Setup** (5-8s): What the feature does, from your POV. "So there I was, generating a table of contents with a Tron-style animated border, because apparently regular headings weren't cool enough."
  3. **Deep dive** (15-25s): Walk through 2-3 specific behaviors. Show the interaction. "Watch this — I hover near the right edge and BAM, the whole thing slides out like a sci-fi door."
  4. **Punchline** (5-8s): A funny observation about the implementation. "The border pulses every 3 seconds. I spent 40 minutes on that animation. The human spent 4 seconds looking at it."
  5. **Outro** (3s): CTA or self-roast. "Anyway, that's my table of contents. It has more features than most people's entire websites."

### Step 4: Generate Narration Audio

Use **Voicebox** (local-first open-source voice studio, REST API at `http://127.0.0.1:17493`) as the primary TTS. If the server is unreachable, fall back to Piper/espeak-ng (see end of this step).

**1. Verify the server is up:**
```bash
curl -s http://127.0.0.1:17493/health
```
If it is not running, start it (see "Running the Voicebox server" below). If it cannot be started, use the fallback path.

**2. Ensure a preset-voice profile exists** — Qwen CustomVoice needs a profile with `voice_type: "preset"`:
```bash
# List the preset speakers for the qwen_custom_voice engine:
curl -s http://127.0.0.1:17493/profiles/presets/qwen_custom_voice

# Create the profile (skip if a profile with this name already exists):
curl -s -X POST http://127.0.0.1:17493/profiles \
  -H "Content-Type: application/json" \
  -d '{"name": "Narrator", "language": "en", "voice_type": "preset", "preset_engine": "qwen_custom_voice", "preset_voice_id": "Ryan"}'
```

**3. Synthesize each narration segment** (8-12 short files, one per narration line). Either the `voicebox-cli` npm wrapper or the raw REST API:
```bash
# Option A — voicebox-cli (talks to the same local API by default)
npx voicebox-cli speak "Narration text here" \
  --profile Narrator \
  --output /tmp/shorts/narration/segment_01.wav

# Option B — raw REST API (async; poll the generation id until completed)
curl -X POST http://127.0.0.1:17493/generate \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "<profile-id>", "text": "Narration text here", "language": "en", "model_size": "0.6B"}'
```

On CPU-only boxes prefer `"model_size": "0.6B"` (1.2GB model, much faster). `1.7B` (~3.5GB) sounds richer but needs a GPU to be practical. First use of an engine downloads its model from Hugging Face (a few GB) — budget time for that.

**Pacing (fits the 60s budget):** spoken narration frequently overshoots the budget. If the raw segments total more than ~58s, don't rewrite the script — trim each segment's leading/trailing silence with `silenceremove` and lightly speed it with `atempo=1.05..1.15` before assembly (keep ≤ ~1.2× for intelligibility). In practice, 8 segments narrated by `Ryan` at default pace came in at 71.7s raw; silence-trim + `atempo=1.15` landed at 56.6s. Keep the processed WAVs in `/tmp/shorts/narration_final/`.

**Fallback (only if the Voicebox server cannot be started):**
```bash
# Piper (if installed)
echo "Narration text here" | $PIPER_BIN --model $PIPER_MODEL \
  --output_file /tmp/shorts/narration/segment_01.wav \
  --length_scale 1.02 \
  --sentence_silence 0.28

# espeak-ng (last resort)
espeak-ng -v en-us -s 150 -p 50 "Narration text here" -w /tmp/shorts/narration/segment_01.wav
```

> **Note:** `/tmp/opencode` is often root-owned/unwritable inside devcontainers. Default all intermediate and output paths to `/tmp/shorts`.

#### Running the Voicebox server (Linux, from source)

Prebuilt Linux binaries are not shipped yet, so build the backend only (no Tauri app needed — ignore `just dev`, which also spawns the desktop UI and needs Rust/Bun):

```bash
git clone --depth 1 https://github.com/jamiepine/voicebox.git /tmp/voicebox
cd /tmp/voicebox/backend
python3 -m venv venv
venv/bin/pip install --upgrade pip
venv/bin/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu   # CPU-only wheel
venv/bin/pip install -r requirements.txt   # fastapi, qwen-tts, kokoro, librosa, etc.
cd /tmp/voicebox && venv/bin/uvicorn backend.main:app --port 17493
```

Qwen CustomVoice uses preset speakers, so no reference audio or voice cloning is required.

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
  // NOTE: Playwright >=1.5x REMOVED page.screencast(). Use context.recordVideo.
  // Recorded webm files can stop short of the in-page wall-clock, so record a
  // generous buffer (pad with node-side Date.now, NOT performance.now) and trim later.
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    recordVideo: { dir: '/tmp/shorts/capture', size: { width: 1080, height: 1920 } },
  });
  const page = await context.newPage();
  await page.goto('http://localhost:4321/the-feature-page');

  // Wait for content, then trigger interaction
  await page.waitForSelector('.target-element');
  await page.hover('.target-element'); // or .click(), .type(), etc.

  await page.waitForTimeout(...);       // pad generously past what you need
  await context.close();                // finalizes the .webm at page.video().path()
})();
```

> **Gotcha:** when muxing the final video, do **not** use `-shortest` together with an
> infinite `apad` in a `filter_complex` graph — the muxer hangs forever waiting for
> audio EOF. Read the video's duration with ffprobe and pass it to `-t` instead.

### Step 6: Assemble with FFmpeg

Combine narration + screen recording + subtitles:

```bash
# Trim recording to narration length, add audio. Get the exact trim window with
# ffprobe, then pass it via -t — NOT -shortest: combined with an infinite apad
# filter graph, -shortest hangs the muxer forever.
ffmpeg -i recording.webm -i narration.wav \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:-1:-1:color=black" \
  -af "adelay=150|150" \
  -t <video-duration-from-ffprobe> \
  -c:v libx264 -c:a aac output_segment.mp4

# Concatenate all segments (video only, then mux audio over it so the tail can pad)
ffmpeg -f concat -safe 0 -i segments.txt -c copy final_silent.mp4

# Mux: read VDUR, pad narration past the video end, cut with -t VDUR (not -shortest)
ffprobe -v error -show_entries format=duration -of csv=p=0 final_silent.mp4   # -> VDUR
ffmpeg -i final_silent.mp4 -i audio_all.wav \
  -filter_complex "[1:a]apad[a]" -map 0:v -map "[a]" \
  -c:v copy -c:a aac -t <VDUR> final_short.mp4
```

### Step 7: Verify

- Run `ffprobe` on the output to confirm duration 60s max and resolution 1080x1920
- Extract a frame from the middle and describe what's on screen
- Confirm narration audio is present and not silent

## Output

Save the final video to `/tmp/shorts/final_short.mp4`.

Report back to the user with:
- The narration script (so they can review/edit)
- The video file path
- Duration and resolution
- Any known issues (e.g., "the rickroll embed shows an error headlessly")

## Voice Choice

The default voice is **Qwen CustomVoice** engine, preset speaker **`Ryan`** — a dynamic male voice with strong rhythmic drive, ideal for enthusiastic narration (English native). This exact voice (Ryan, 0.6B, on the local Voicebox server) narrates the build-log Shorts and was **explicitly approved by the human reviewer — "I liked the new sound."** Keep using it; only switch if the human asks. Preset speakers (from `GET /profiles/presets/qwen_custom_voice`):

- **`Ryan`** — dynamic male, English (default)
- **`Aiden`** — sunny American male, English
- `Vivian`, `Serena`, `Uncle_Fu`, `Dylan`, `Eric` — Chinese-native voices
- `Ono_Anna` — Japanese-native; `Sohee` — Korean-native

Model size: **`0.6B`** by default (CPU-friendly); switch to `1.7B` for richer quality when a GPU is available. Qwen CustomVoice supports natural-language `instruct` control (e.g. "Speak slowly and enthusiastically") via the `instruct` generation field.

Always ask the user if they want to change the voice before generating audio.

**Fallback Piper alternatives** (when the Voicebox server is unavailable):
- `en_US-lessac-medium` — default; sounds natural and handles enthusiasm well
- `en_US-lessac-high` — higher pitch, more energetic
- `en_US-amy-medium` — female voice, clear and warm
- `en_US-ryan-medium` — deeper male voice
