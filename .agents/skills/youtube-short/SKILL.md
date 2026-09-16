---
name: youtube-short
description: "Generate short-form (vertical, ≤60s) feature videos and longer multi-language widescreen walkthrough videos of this project, narrated from the AI assistant's perspective."
---

# YouTube Short Generator

You are producing a **YouTube Short** (vertical, 1080x1920, 60s max) that showcases a specific feature of this project, narrated from **your perspective as the AI assistant that built it**.

## Pipeline scripts & story manifests

Every Short lives as a **story** under `stories/<story-id>/` in this repo:

- `story.json` — machine-readable manifest: narration segments, voice, pacing, capture scenes, assembly (the single source of truth)
- `script.md` — the approved, human-readable narration (feeds the Short *and* any longer walkthrough video)
- `narration/`, `narration_final/`, `segments/`, `output/` — generated assets (git-ignored; a rebuild regenerates them)

The repeatable pipeline lives in `.agents/skills/youtube-short/scripts/` and is wired as npm scripts:

| Command | What it does |
|---|---|
| `npm run new:story -- <id> "Title" "Description"` | Scaffold a story folder (manifest + script) |
| `npm run short:narration -- <id>` | Synthesize + pace all narration segments (Voicebox) |
| `npm run short:capture -- <id> [--only s1,s3]` | Record one `.webm` per segment (Playwright) |
| `npm run short:assemble -- <id>` | Trim/concat/mux into `output/final_short.mp4` |
| `npm run short:verify -- <id>` | QA: duration/resolution/audio/luma |
| `npm run short:build -- <id> [--force]` | Run the whole chain (`narration → capture → assemble → verify`) |

`<id>` may be the bare id, `stories/<id>`, or a full path. Steps are idempotent (existing assets are reused). `--force` regenerates the narration. `build-short` auto-starts the dist site server and the Voicebox backend when they're installed but down.

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

Then scaffold the story so all artifacts stay reproducible:

```bash
npm run new:story -- <slug> "<Short Title>" "<Short description>"
```

### Step 3: Script the Short

Write a **funny, self-deprecating narration** from the AI's perspective and fill it into `stories/<slug>/story.json` (`segments[].text`) plus `script.md`. Rules:

- **Voice:** Voicebox TTS `qwen_custom_voice` engine, preset speaker `Ryan` (default, English), model size `0.6B` — the human-endorsed narration voice; keep it unless explicitly asked to change (see Voice Choice)
- **Tone:** Enthusiastic but self-aware. You built this feature — own the bugs and the wins.
- **Length:** 8-12 lines of narration, each 3-5 seconds when spoken. Total: 40-55 seconds.
- **Structure:**
  1. **Hook** (3s): A punchy one-liner that makes people stop scrolling. E.g., "I built a search engine. Inside a portfolio site. Nobody asked for this."
  2. **Setup** (5-8s): What the feature does, from your POV.
  3. **Deep dive** (15-25s): Walk through 2-3 specific behaviors. Show the interaction.
  4. **Punchline** (5-8s): A funny observation about the implementation.
  5. **Outro** (3s): CTA or self-roast.

For each segment, also describe the **scene**: the page (`scene.url`), and the interactions (`scene.actions`) using the action DSL:

| Action | Meaning |
|---|---|
| `waitMs { ms }` | idle pause |
| `waitFor { selector }` | wait for an element |
| `click / hover / type / press { selector, key... }` | standard DOM interaction |
| `graphFish { title, kind: wiki\|bookmark, ms }` | hover-circling a canvas node by its drawn label |
| `graphDoubleClick { title, kind }` | navigate by double-clicking a canvas node |
| `assertUrl { pattern }` | verify navigation target |
| `pan { from: "corner", dx, dy, steps, stepMs }` | drag-pan the canvas from the bottom-left corner |
| `mouseMove { to: "corner" }` | park the cursor off-node |
| `evaluate { js }` / `evaluateRemove { selectors }` | inject / remove an overlay (e.g. the "!! BUG !!" ring) |

### Step 4: Generate Narration Audio

```bash
npm run short:narration -- <slug>
```

This uses **Voicebox** (local-first open-source voice studio, REST API at `http://127.0.0.1:17493`). If the server is unreachable, start it (see "Running the Voicebox server" below); if it cannot be started, fall back to Piper/espeak-ng (see end of this step).

Under the hood the script:
1. Resolves (or creates) the `Narrator` preset profile — Qwen CustomVoice needs `voice_type: "preset"` with `preset_engine: "qwen_custom_voice"` and `preset_voice_id: "Ryan"`.
2. Synthesizes each segment (`engine: "qwen_custom_voice"`, `model_size: "0.6B"`) — **`engine` must be passed explicitly** or the API rejects the profile. First use downloads the ~1.2GB model to `~/.cache/huggingface`.
3. Applies the story's `pacing`: silence trim + `atempo` so the total fits 60s.

On CPU-only boxes prefer `"model_size": "0.6B"` (much faster). `1.7B` (~3.5GB) sounds richer but needs a GPU to be practical.

**Pacing (fits the 60s budget):** spoken narration frequently overshoots the budget. If the raw segments total more than ~58s, don't rewrite the script — the script trims each segment's leading/trailing silence with `silenceremove` and lightly speeds it with `atempo` from `story.json > pacing.speed` (keep ≤ ~1.2× for intelligibility). In practice, 8 segments narrated by `Ryan` at default pace came in at 71.7s raw; silence-trim + `atempo=1.15` landed at 56.6s.

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

> **Note:** `/tmp/opencode` is often root-owned/unwritable inside devcontainers. Default all intermediate and output paths to `/tmp/shorts` for one-off work; story builds always write inside `stories/<id>/`.

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

Qwen CustomVoice uses preset speakers, so no reference audio or voice cloning is required. The DevContainer image ships `git`, `curl`, `ffmpeg`, `python3-venv`, `python3-pip`, and `espeak-ng` so this works inside the container.

### Step 5: Capture Screen Recordings

```bash
npm run short:capture -- <slug>           # all segments
npm run short:capture -- <slug> --only s1,s3   # re-record selected segments
```

The `capture.mjs` driver visits each `scene.url`, applies the story's `frameCss`, drives the `scene.actions`, and records one 1080×1920 VP8 `.webm` per segment into `stories/<slug>/segments/`. Record time derives from the paced narration durations (+ tail + safety), so shots line up with the audio. Output: `segments/captured.json`.

Key mechanics baked into the driver:
- **No `page.screencast()`** in Playwright ≥1.5x — it uses `context.recordVideo` (`dir` + `size`), producing one webm per page.
- **Wall-clock padding:** recorded webms can stop short of the in-page clock, so lengths are driven by node-side `Date.now()` with a generous overshoot, trimmed later. Never `performance.now()`.
- **Canvas node targeting:** an injected wrapper around `canvas.getContext('2d')` snapshots circles/diamonds/texts per `restore()` and exposes `RESOLVE_ME(title, kind)`, letting `graphFish`/`graphDoubleClick` hit exact pixels (used when `capture.canvasId` is set, e.g. `wiki-graph`).
- The dist site must be reachable at `http://127.0.0.1:4322` (build-short starts it if `dist/` exists); the DevContainer's `npm run build` produces it.

### Step 6: Assemble with FFmpeg

```bash
npm run short:assemble -- <slug>
```

Trims each webm to its narration window (+ tail), concatenates the video segments, concatenates the paced WAVs, and muxes audio+video into `stories/<slug>/output/final_short.mp4`.

> **Gotcha (muxing):** do **not** use `-shortest` together with an infinite `apad` in a `filter_complex` graph — the muxer hangs forever waiting for audio EOF. The script reads the video duration with ffprobe and passes it to `-t` instead.

### Step 7: Verify

```bash
npm run short:verify -- <slug>
```

Programmatic QA on the finished file: duration ≤ 60s, resolution 1080×1920, audio stream present and **not silent** (`volumedetect` mean > −40 dB), and a frame-luminance smoke test (no blank frames on dark backgrounds). It cannot watch the video — if in doubt, extract frames and describe them to the user.

## Output

Final deliverable: `stories/<slug>/output/final_short.mp4`.

Report back to the user with:
- The narration script (from `stories/<slug>/script.md`) so they can review/edit
- The video file path
- Duration and resolution
- Any known issues (e.g., "the rickroll embed shows an error headlessly")

## Reusing a story for a longer walkthrough

`stories/<slug>/story.json` and `script.md` are the input for **longer (landscape) walkthrough videos**:
- Merge `segments[].text` back into a single script (or extend it) for the landscape narration.
- Reuse the `scene.actions` as the starting point for a 16:9 recording pass (change `capture.videoSize` to `[1920, 1080]` in a copy of the story).
- The same Voicebox profile and pacing rules apply; a walkthrough under 60s is not required, so `pacing.speed` can drop to `1.0`.

---

# Walkthrough videos (widescreen, multi-language, ~5 min)

A **walkthrough** is a long-form (16:9, `1920×1080`, ~5 min) video that tours the whole site, narrated by the AI that built it. It reuses the same story pipeline with a few extensions: every segment carries narration in **five languages** (`en`, `de`, `fr`, `de-CH`, `hi`), and the output MP4 carries **five audio streams** (English default + 4 alternates) so the viewer can switch languages in their player.

## Walkthrough pipeline (npm scripts)

| Command | What it does |
|---|---|
| `npm run walkthrough:new -- <id> "Title" "Desc"` | Scaffold a widescreen story with a `languages` array (en/de/fr/de-CH/hi) instead of a single voice |
| `npm run walkthrough:scan -- --story <id>` | **Auto-extension:** diff the build log (phases + feature table) against the story's `coveredFeatures` and list what's NEW that a re-walkthrough should cover |
| `npm run walkthrough:narration -- <id>` | Synthesize + pace every segment **per language** (Voicebox) |
| `npm run walkthrough:capture -- <id> [--only s1,s3]` | Record one `1920×1080` `.webm` per segment (Playwright) |
| `npm run walkthrough:assemble -- <id>` | Trim/concat/mux video + all 5 language audio tracks into `output/walkthrough.mp4` |
| `npm run walkthrough:verify -- <id>` | QA: duration 4:00–5:30, resolution 1920×1080, 5 audio streams + language tags, not silent (plus the slot-aligned sync gates) |
| `npm run walkthrough:build -- <id> [--force]` | Run the whole chain (`narration → capture → assemble → verify`) |

## Story schema for walkthroughs

- `kind: "walkthrough"`, `capture.videoSize: [1920, 1080]`, `assembly.tailSeconds: 0.5`.
- `languages: [{ code, label, voice: { engine, presetVoiceId, modelSize, profileName, language } }]` — one Voicebox profile per language.
- `segments[].texts.{en,de,fr,de-CH,hi}` — one narration per segment per language (keep every language within ±10% of the longest so captures line up; `durations.json` stores the per-segment **max** across languages and drives capture + assembly).
- `coveredFeatures: []` — labels of build-log phases/features already narrated (updated after each walkthrough).

## Workflow

1. **Scaffold:** `npm run walkthrough:new -- <id> "Title" "Desc"`.
2. **Script** `stories/<id>/story.json`: ~12 segments (~25 s each → ~5 min) covering the build-log highlights; fill `segments[].texts` for all five languages and `segments[].scene.*` with the same action DSL as Shorts (see the action table above).
3. **Extend automatically:** `npm run walkthrough:scan -- --story <id>` lists build-log phases/features that aren't yet in `coveredFeatures`. New functionality since the last walkthrough → add a segment for each and append the label to `coveredFeatures`.
4. **Narration:** `npm run walkthrough:narration -- <id>`.
5. **Capture:** `npm run walkthrough:capture -- <id>` (records at 1920×1080; `corner`-based actions are viewport-aware).
6. **Assemble:** `npm run walkthrough:assemble -- <id>` → `output/walkthrough.mp4` (audio streams tagged `en`/`de`/`fr`/`de-CH`/`hi`, first stream default).
7. **Verify + ship:** `npm run walkthrough:verify -- <id>`, then copy the final file to `video-output/`.

## Language support (Voicebox / Qwen CustomVoice)

Qwen CustomVoice natively supports `zh, en, ja, ko, de, fr, ru, pt, es, it, hi, he, ar, da, el, fi, ms, nl, no, pl, sv, sw, tr` (the Voicebox `POST /generate` `language` regex). The walkthrough uses:

| code | label | `voice.language` | Note |
|---|---|---|---|
| `en` | English | `en` | Ryan, native |
| `de` | Deutsch | `de` | German via the multilingual voice |
| `fr` | Français | `fr` | French via the multilingual voice |
| `de-CH` | Schwiizerdütsch | `de` | **No native Swiss-German model exists** — narrated in the Swiss-German dialect text, spoken by the German-capable voice. State this caveat to the user. |
| `hi` | हिन्दी | `hi` | Hindi (Devanagari) via the multilingual voice. **No Hindi-native preset exists** — the shared `Ryan` preset reads the Devanagari text (same pattern as de/fr). State this caveat to the user. |

Tone rules are the same as Shorts: funny, enthusiastic, self-aware, "I built this, own the bugs and the wins".**

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