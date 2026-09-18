# AGENTS.md — racic.ch Project Context

## Project Overview

This is a **portfolio, blog, and semantic wiki** built with **Astro 7** (static site generator), hosted on **GitHub Pages** with optional Firebase Hosting. The site combines content from two legacy sites: [rac.su](https://rac.su) (Hugo) and [racic.ch](https://racic.ch) (Hugo).

**Live site:** [racic.ch](https://racic.ch)  
**Repo:** [github.com/rac2030/racic.ch](https://github.com/rac2030/racic.ch)

## Tech Stack

- **Framework:** Astro 7.2.4 (Node 22.12+ required, devcontainer uses Node 24)
- **Language:** TypeScript, Astro components (.astro), Markdown
- **Styling:** CSS (no Tailwind — custom hologram/sci-fi theme)
- **Testing:** Jest (unit, coverage threshold 80%), Playwright (e2e)
- **Search:** Build-time JSON index + custom fuzzy search module
- **Comments:** Giscus (GitHub Discussions)
- **CI/CD:** GitHub Actions → GitHub Pages (test/build/deploy on `master`)
- **Build tooling:** esbuild compiles `src/lib/*.ts` → `public/*.js` (search + service worker + brick-breaker)
- **AI Tool:** opencode

## Content Collections

The site has **four content collections**, each with its own Zod schema in `src/content.config.ts`:

| Collection | Directory | Purpose | Key Fields |
|---|---|---|---|
| `blog` | `src/content/blog/` | Blog posts | `pubDate`, `updatedDate`, `category`, `tags`, `heroImage`, `draft`, `aliases` |
| `projects` | `src/content/projects/` | Project showcases | `pubDate`, `category`, `repo` (GitHub URL), `heroImage`, `draft` |
| `wiki` | `src/content/wiki/` | Knowledge base entries | `pubDate`, `category`, `heroImage`, `draft` |
| `bookmarks` | `src/content/bookmarks/` | Curated link collections | `pubDate`, `heroImage`, `tags` |

### Frontmatter Reference

```yaml
---
title: "Required — used in <title>, OpenGraph, and article header"
pubDate: 2026-08-23           # Required — determines sort order
updatedDate: 2026-08-24       # Optional — shows "(updated DATE)" if different from pubDate
description: "Optional (defaults to '') — used in meta tags and cards"
category: "howto"             # Optional — adds clickable badge and filter button
tags: ["tag1", "tag2"]        # Optional (defaults to []) — creates tag pages automatically
heroImage: /images/your.jpg   # Optional — displayed above title on article page
draft: false                  # Optional (defaults to false) — hidden in production builds
aliases: ["/old/path"]        # Optional (defaults to []) — alternative URL paths
---
```

### Draft Mode

- `draft: true` articles are **excluded from production builds** (listings, detail pages, search index, RSS)
- In development mode, drafts show a yellow "DRAFT" badge and a watermark bar
- To preview drafts: `npm run dev` (they appear with visual indicators)

### URL Aliases

Aliases generate additional routes without redirects:
- **Absolute:** `aliases: ["/post/dev/git"]` → accessible at `/post/dev/git/`
- **Relative:** `aliases: ["old-path"]` on a wiki entry → accessible at `/wiki/old-path/`

## Adding New Content

### Blog Post

Create `src/content/blog/your-slug.md`:

```markdown
---
title: "Your Post Title"
pubDate: 2026-08-23
updatedDate: 2026-08-24
description: "Short description for SEO."
category: "howto"
tags: ["astro", "tutorial"]
heroImage: /images/your-image.jpg
draft: false
---

Your markdown content here.

## Subheadings work

Lists, blockquotes, images, tables, and code blocks all work.
```

The post appears at `/blog/your-slug/`.

### Project Entry

Create `src/content/projects/your-project.md`:

```markdown
---
title: "Project Name"
pubDate: 2026-08-23
category: "electronics"
repo: "https://github.com/rac2030/project-name"
heroImage: /images/project-hero.jpg
draft: false
---

Description of the project.
```

### Wiki Entry

Create `src/content/wiki/your-topic.md`:

```markdown
---
title: "Topic Name"
pubDate: 2026-08-23
category: "reference"
heroImage: /images/wiki-hero.jpg
draft: false
---

Reference content here.
```

### Bookmark Collection

Create `src/content/bookmarks/your-collection.md`:

```markdown
---
title: "Collection Name"
pubDate: 2026-08-23
heroImage: /images/bookmark-hero.svg
tags: ["tag1", "tag2"]
---

- [Link Title](https://example.com) — Description
- [Another Link](https://example.com) — Description
```

**Bookmark conventions (follow for all new entries):**
- **Hero images:** create an SVG at `public/images/bookmarks/<slug>-hero.svg` (1200x320, gradient + accent motif matching existing ones), not the shared logo files — they render a masked thumbnail on the bookmarks overview tab.
- **No `aliases:`** — do not add link aliases to new bookmark articles (unlike legacy entries).
- **Collection pages over one-off links:** make the page a topic collection (e.g. "AI Agent Skills") with each source (e.g. "Matt Pocock — Skills for Real Engineers") as a sub-level `##` entry with its own sub-links beneath it, so more sources can be added later.
- **Author:** set `author: "AI-generated"` when the content was generated or heavily assisted by AI (see Content Authoring below).
- **Installation:** limit install/how-to sections to the single relevant method actually used (e.g. opencode: `npx skills@latest add mattpocock/skills`), not every possible option.

## Project Structure

```
racic.ch/
  src/
    content/
      blog/           # 4 posts
      projects/       # 6 entries
      wiki/           # 10 entries
      bookmarks/      # 9 collections
    content.config.ts # Zod schemas for all collections
    pages/
      blog/[...slug].astro
      projects/[...slug].astro
      wiki/[...slug].astro
      bookmarks/[...slug].astro
      tags/           # Dynamic tag pages
      search.astro
      404.astro
      pi.astro        # Hidden pi calculator
      poop.astro      # Hidden rickroll
    components/
      Header.astro, Footer.astro, PostCard.astro
      Comments.astro     # Giscus
      TagFilter.astro    # Autocomplete + tag cloud
      ContentResizer.astro
      TOC.astro          # Table of contents
      SearchBar.astro
    layouts/
      Base.astro      # List pages
      Post.astro      # Article pages + mermaid zoom
    lib/
      search.ts       # Search module (compiles to public/search.js — edit this, not the .js)
      sw.ts           # Service worker source (compiles to public/sw.js)
    utils/            # Utility functions (Jest tested)
  public/
    css/images/       # bg.jpg, overlay assets
    images/           # Content images
    search.js         # Compiled search module
    sw.js             # Service worker
    brick-breaker.js  # Brick Breaker easter egg (compiled)
  tests/
    unit/             # Jest tests
    e2e/              # Playwright specs (13 files)
  scripts/
    build-search.js     # esbuild: src/lib/search.ts → public/search.js
    build-sw.js         # esbuild: src/lib/sw.ts → public/sw.js
    build-brickbreaker.js # esbuild: src/lib/brick-breaker.ts → public/brick-breaker.js
    stamp-sw.js         # MD5-hashes sw.js into CACHE_NAME for cache-busting
    generate-git-log.mjs # git log per content file → src/data/git-log.json
    new-post.mjs        # Scaffolds new draft content (npm run new:*)
    migration-report.mjs  # Migration tooling (reports/screenshots)
  .devcontainer/      # DevContainer (Node 24 + opencode)
  .github/workflows/  # CI/CD
```

## Key Commands

```bash
npm run dev             # Start dev server (localhost:4321)
npm run build           # Full production build (~145 pages) — runs the script chain, then astro build
npm run build:git       # Only generate src/data/git-log.json (git history for pages)
npm run build:sw        # Compile + cache-hash the service worker
npm run build:search    # Compile src/lib/search.ts → public/search.js
npm run build:brickbreaker # Compile src/lib/brick-breaker.ts → public/brick-breaker.js
npm run preview         # Preview production build (serves dist/)
npm run new:<blog|project|wiki|bookmark>   # Scaffold a new DRAFT content file
npm run test:unit       # Jest unit tests
npm run test:coverage   # Jest with coverage (80% threshold)
npm run test:e2e        # Playwright e2e (builds + serves dist/, see note below)
npm run test:e2e:ui     # Playwright UI mode
npm run release         # Run semantic-release locally (dry-run: --dry-run --no-ci)
```

**Semantic versioning & releases:** versioning uses **semantic-release** (`.releaserc.json`) with **conventional commits** (`feat` → minor, `fix` → patch, `BREAKING CHANGE` → major). It runs as a step in the `build` job of `.github/workflows/deploy.yml` before `astro build`, so the deployed site reflects the new version. It bumps `package.json`/`package-lock.json`, creates a git tag, and publishes a GitHub Release with notes generated from commit messages. **Commit messages should follow conventional-commit format** so releases are correct. The current version is displayed in the footer (`Footer.astro`, read from `package.json`) as a link to the matching GitHub release notes (`/releases/tag/vX.Y.Z`).

## Site Videos (youtube-short skill)

The `youtube-short` skill (`.agents/skills/youtube-short/`) produces narrated site videos from `stories/<id>/` manifests:

| Type | Output | Format |
|---|---|---|
| Short | `stories/<id>/output/final_short.mp4` | 1080×1920, ≤60s, single EN narration |
| Walkthrough | `stories/<id>/output/walkthrough.mp4` | 1920×1080, 4:00–5:30, **5 audio streams** (en default + de/fr/de-CH/hi) |

**Walkthrough pipeline:**

```bash
npm run walkthrough:new -- <id> "Title" "Desc"           # scaffold story.json + script.md
npm run walkthrough:scan -- <id>                          # auto-extension: diff build log vs coveredFeatures
npm run walkthrough:narration -- <id>                     # Voicebox TTS, paced per segment × 5 langs
npm run walkthrough:capture -- <id>                       # Playwright screen-records each segment at 1920×1080
npm run walkthrough:assemble -- <id>                      # trim/concat + mux 5 language-tagged audio tracks
npm run walkthrough:verify -- <id>                        # QA, then copy the file to video-output/
```

Story signal flow: `story.json` (segments, 5-language texts, scene actions, `coveredFeatures`, voicebox profiles) → `narration/<lang>/` wavs + `durations.json` (per-segment max across langs) → `segments/*.webm` + `captured.json` → `output/walkthrough.mp4`.

**Gotchas (documented from real failures — do not "simplify" blindly):**
- **MP4 language tags must be ISO-639-2/B 3-letter codes** (`eng`/`ger`/`fra`/`hin`). The `assemble.mjs` `LANG_2_TO_3` map converts `en`→`eng`, `de`/`de-CH`→`ger`, `fr`→`fra`, `hi`→`hin`; `verify.mjs` applies the same mapping when matching tags. Using 2-letter tags silently drops all but the video stream's tag.
- **`-metadata:s:a:N` is broken with `-c:v copy`** in this ffmpeg 7.0.2 build (tags land on the video stream instead). Use `-c:v libx264` (assemble.mjs does). MP4 also ignores duplicate `language` entries unless the args are `'-metadata:s:a:N', 'language=X'` (two argv entries, ascending stream order when video is present).
- **Keep every language track slot-aligned to the video timeline.** The video's per-segment duration is `max` across languages (`durations.json`) + `tailSeconds`, but the narrated wavs are shorter per language. Concatenating each language track back-to-back (`concat` with no padding) drifts that language's narration ahead of the visuals by the accumulated difference — the symptom is speech running ~20s early with a silent tail. `assemble.mjs` pads each segment with `apad,atrim` to its video slot before concatenation, so every track spans the full timeline. `verify.mjs` enforces this with PCM-based sync gates: "narration ends on time" (last-slot start + last narration duration vs measured audio offset ≤ 1.0s) and "normally starts on cue" (first voice island within the last slot ≤ 1.0s of slot start). Never remove those checks or re-introduce back-to-back concatenation.
- **Local tools:** Voicebox TTS at `http://127.0.0.1:17493` (CPU, model loads lazily on first synth); ffmpeg/ffprobe resolve from `/tmp/shorts/bin` via `pipeline-util.mjs`. These are developer-machine prerequisites, not repo dependencies.
- The build-log post `src/content/blog/building-this-site-with-ai.md` describes the same pipeline from the author's perspective; keep the skill scripts and that post consistent.

**The `build` script is a chain**, not a single `astro build`:
`generate-git-log.mjs → build-sw.js → stamp-sw.js → build-search.js → build-brickbreaker.js → astro build`. The first step shells out to `git log`, so the repo needs a git history; it writes `src/data/git-log.json` (also generated by Jest's `globalSetup` if missing). If `git log` fails it degrades gracefully (empty commits).

**Local e2e requirements:**
- `playwright.config.ts` runs `npm run build && python3 -m http.server 4322 --directory dist` as its webServer (baseURL `http://localhost:4322`), so a built `dist/` and `python3` are required.
- Install browsers first: `npx playwright install --with-deps chromium`.

**Pre-commit hook:** husky runs `npm run test:unit` (the full Jest suite) on every `git commit`; a failing test aborts the commit. Bypass only with `git commit --no-verify`. Installed via the `prepare` script (`husky`) which runs on `npm install`.

## Content Authoring

- **AI-generated content:** When content is generated or heavily assisted by AI, set `author: "AI-generated"` in the frontmatter. Note the Zod schema defaults `author` to `"Michel Racic"`, and `npm run new:*` scaffolding does not set it, so it must be added explicitly for AI-written posts.

## Important Notes

- **Compiled assets are git-ignored:** `public/search.js`, `public/sw.js`, and `public/brick-breaker.js` are build artifacts — always edit `src/lib/search.ts` / `src/lib/sw.ts` / `src/lib/brick-breaker.ts` and run `npm run build:search` / `npm run build:sw` / `npm run build:brickbreaker` to regenerate.
- **`src/data/` is git-ignored:** `git-log.json` is regenerated on build (and by Jest's `globalSetup` when missing).
- **Schema changes require cache clear:** after editing `src/content.config.ts`, run `rm -rf .astro && npm run dev`.
- **Content IDs include the `.md` extension** — always use `.replace(/\.md$/, '')` when deriving URL slugs (see `src/lib/utils.ts`).
- **Search section priority:** search results are ranked by section via `SECTION_PRIORITY` / `SECTION_WEIGHT` in `src/lib/search.ts` — Blog > Projects > Wiki > Page > Bookmarks. Bookmarks are deliberately the **lowest priority match** (weight 0.5, sorted last in both exact and fuzzy results) since they are link collections, not authored content.
- **Build log:** The build log is the continuously updated blog entry `src/content/blog/building-this-site-with-ai.md`. Whenever you add, change, or fix a site feature (e.g. search scoring/priorities), update the build log in two places: **(1)** the relevant technical narrative section (e.g. "Full-Text Search with Fuzzy Matching") describing the exact behavior, and **(2)** the feature-summary table near the "What I Built" section if it lists the feature. Keep it in sync with the actual implementation in `src/lib/*` — write down the precise scoring/weights (e.g. `SECTION_PRIORITY`, `SECTION_WEIGHT`) so future agents can reconstruct behavior from the log alone. Verify the post still renders after edits (it is a real content page) and dedupe any repeated lines you touch.
- **opencode session sharing:** the devcontainer bind-mounts host opencode data for shared sessions.
- **Node version:** Host uses Node 22, devcontainer uses Node 24 — both work identically.


<!-- open-mem-context -->
## Project Activity (auto-generated by open-mem)

### src/lib/
| ID | Type | Title | Date |
|----|------|-------|------|
| ec142f0f-832d-48f7-bae5-e03be94891d4 | 🔵 discovery | Search scoring: section priority and weight system | 2026-09-14 |

**Key concepts:** how-it-works, pattern, search-scoring

💡 *Use `mem-find` to search full details. Use `mem-create` to save important decisions.*
<!-- /open-mem-context -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- The semantic/LLM pass (docs enrichment, community labeling) is **intentionally disabled**. Big Pickle on OpenCode Zen is free-tier-only and returns `403 FreeTierError: can only be used from within OpenCode` to external callers; there is no Zen API key in `auth.json` (only huggingface/openrouter/google/lmstudio). If a backend is ever configured, it goes through `--backend openai` with `OPENAI_BASE_URL` + `OPENAI_MODEL` (or the `claude` backend + `ANTHROPIC_BASE_URL`). Don't attempt the semantic pass until a paid/billing-enabled key exists.
