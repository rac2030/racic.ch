# Story: The raic.ch Site Walkthrough

> site-walkthrough

| | |
|---|---|
| id | `site-walkthrough` |
| kind | walkthrough |
| feature | The raic.ch Site Walkthrough |
| languages | en, de, fr, de-CH |
| pacing | 1.05x (+silence trim) |
| video | 1920x1080, 4 audio streams (fr = French voice, de-CH = German voice + Swiss dialect text) |
| created | 2026-09-16 |
| output | output/walkthrough.mp4 |

## Narration (final)

| # | Segment | Scene | EN/DE/FR/DE-CH |
|---|---|---|---|
| s1 | Intro | `/` scroll + pan | "AI built this site; brag in 4 languages" |
| s2 | Hologram theme | `/` hover hero + recent | Frosted glass hologram panels over scrolling sky |
| s3 | Full-text search | `/` type "hugo" → Enter | Fuzzy matching, live dropdown, section ranking |
| s4 | Blog & word cloud | `/blog/` toggle cloud, tag hugo | Frequency-weighted tag word cloud (bigger = more used) |
| s5 | Wiki graph | `/wiki/` fish + dbl-click "GIT" | Force-directed graph; circles=wiki, diamonds=bookmarks |
| s6 | Article UX | build-log post: TOC + resizer | TOC slides out (Tron border), drag resizer remembers |
| s7 | PWA / offline | `/` scroll | Service worker cache, installable offline app |
| s8 | 404 duck | `/404.html` | Duck Easter egg on the 404 page |
| s9 | Pi calculator | `/π/` | Hidden URL renders millions of pi digits |
| s10 | Mr. Poop | `/💩/` | Click → poops; more engagement than half the features |
| s11 | Brick Breaker + Yoda | `/about/` play + footer hover | Hidden Canvas game on About; Yoda hover hologram |
| s12 | Outro | build-log post | "Read the build log — every decision documented" |

## Coverage

The build log phases/deliverables this walkthrough narrates are recorded in
`story.json` → `coveredFeatures`. Run `npm run walkthrough:scan -- site-walkthrough`
to diff them against the latest build log and extend the story when the site grows.

## Reuse

Run `npm run walkthrough:build -- site-walkthrough` to regenerate all assets
(narration, capture, assemble, verify) after changing any segment.