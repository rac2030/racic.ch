# stories/

Generated **YouTube Short stories** for the `youtube-short` skill. Each subfolder is one short: a machine-readable `story.json` (manifest: narration segments, voice, pacing, capture scenes, assembly) plus a human-readable `script.md` (the approved narration).

## Layout

```
stories/<story-id>/
  story.json          # manifest — the single source of truth (tracked)
  script.md           # approved narration for humans (tracked)
  narration/          # raw TTS wavs (generated, git-ignored)
  narration_final/    # silence-trimmed + sped-up wavs (generated, git-ignored)
  segments/           # captured webms, trimmed mp4s, concat list (generated, git-ignored)
  durations.json      # paced narration durations (generated, git-ignored)
  output/final_short.mp4  # the deliverable (generated, git-ignored)
```

## Commands

```bash
npm run new:story -- <id> "Title" "Description"     # scaffold a new story
npm run short:narration -- <id>                     # synthesize + pace narration
npm run short:capture  -- <id> [--only s1,s3]       # record the segments
npm run short:assemble -- <id>                      # trim/concat/mux
npm run short:verify   -- <id>                      # QA (duration/resolution/audio/frames)
npm run short:build    -- <id>                      # narration → capture → assemble → verify
```

`<id>` may be the bare id, `stories/<id>`, or a full path. Re-running a step is
idempotent (existing assets are reused); pass `--force` to regeneration.

## Reuse

The `story.json` `segments[].text` plus `script.md` are the input for **longer
walkthrough videos**: merge the per-segment lines into one (landscape) script
and reuse the scene actions as the start point for a 16:9 capture pass.