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
- **Build tooling:** esbuild compiles `src/lib/*.ts` → `public/*.js` (search + service worker)
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
  tests/
    unit/             # Jest tests
    e2e/              # Playwright specs (13 files)
  scripts/
    build-search.js     # esbuild: src/lib/search.ts → public/search.js
    build-sw.js         # esbuild: src/lib/sw.ts → public/sw.js
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
npm run preview         # Preview production build (serves dist/)
npm run new:<blog|project|wiki|bookmark>   # Scaffold a new DRAFT content file
npm run test:unit       # Jest unit tests
npm run test:coverage   # Jest with coverage (80% threshold)
npm run test:e2e        # Playwright e2e (builds + serves dist/, see note below)
npm run test:e2e:ui     # Playwright UI mode
npm run release         # Run semantic-release locally (dry-run: --dry-run --no-ci)
```

**Semantic versioning & releases:** versioning uses **semantic-release** (`.releaserc.json`) with **conventional commits** (`feat` → minor, `fix` → patch, `BREAKING CHANGE` → major). It runs as a step in the `build` job of `.github/workflows/deploy.yml` before `astro build`, so the deployed site reflects the new version. It bumps `package.json`/`package-lock.json`, creates a git tag, and publishes a GitHub Release with notes generated from commit messages. **Commit messages should follow conventional-commit format** so releases are correct. The current version is displayed in the footer (`Footer.astro`, read from `package.json`) as a link to the matching GitHub release notes (`/releases/tag/vX.Y.Z`).

**The `build` script is a chain**, not a single `astro build`:
`generate-git-log.mjs → build-sw.js → stamp-sw.js → build-search.js → astro build`. The first step shells out to `git log`, so the repo needs a git history; it writes `src/data/git-log.json` (also generated by Jest's `globalSetup` if missing). If `git log` fails it degrades gracefully (empty commits).

**Local e2e requirements:**
- `playwright.config.ts` runs `npm run build && python3 -m http.server 4322 --directory dist` as its webServer (baseURL `http://localhost:4322`), so a built `dist/` and `python3` are required.
- Install browsers first: `npx playwright install --with-deps chromium`.

## Content Authoring

- **AI-generated content:** When content is generated or heavily assisted by AI, set `author: "AI-generated"` in the frontmatter. Note the Zod schema defaults `author` to `"Michel Racic"`, and `npm run new:*` scaffolding does not set it, so it must be added explicitly for AI-written posts.

## Important Notes

- **Compiled assets are git-ignored:** `public/search.js` and `public/sw.js` are build artifacts — always edit `src/lib/search.ts` / `src/lib/sw.ts` and run `npm run build:search` / `npm run build:sw` to regenerate.
- **`src/data/` is git-ignored:** `git-log.json` is regenerated on build (and by Jest's `globalSetup` when missing).
- **Schema changes require cache clear:** after editing `src/content.config.ts`, run `rm -rf .astro && npm run dev`.
- **Content IDs include the `.md` extension** — always use `.replace(/\.md$/, '')` when deriving URL slugs (see `src/lib/utils.ts`).
- **Search section priority:** search results are ranked by section via `SECTION_PRIORITY` / `SECTION_WEIGHT` in `src/lib/search.ts` — Blog > Projects > Wiki > Page > Bookmarks. Bookmarks are deliberately the **lowest priority match** (weight 0.5, sorted last in both exact and fuzzy results) since they are link collections, not authored content.
- **Build log:** The build log is the continuously updated blog entry `src/content/blog/building-this-site-with-ai.md`. Whenever you add, change, or fix a site feature (e.g. search scoring/priorities), update the build log in two places: **(1)** the relevant technical narrative section (e.g. "Full-Text Search with Fuzzy Matching") describing the exact behavior, and **(2)** the feature-summary table near the "What I Built" section if it lists the feature. Keep it in sync with the actual implementation in `src/lib/*` — write down the precise scoring/weights (e.g. `SECTION_PRIORITY`, `SECTION_WEIGHT`) so future agents can reconstruct behavior from the log alone. Verify the post still renders after edits (it is a real content page) and dedupe any repeated lines you touch.
- **opencode session sharing:** the devcontainer bind-mounts host opencode data for shared sessions.
- **Node version:** Host uses Node 22, devcontainer uses Node 24 — both work identically.


<!-- open-mem-context -->
## Project Activity (auto-generated by open-mem)

### ./
| ID | Type | Title | Date |
|----|------|-------|------|
| 3c2e58cf-63c2-4145-888c-68829647ed13 | 🟣 feature | Footer release-notes modal renders bodies as markdown via bundled marked | 2026-09-04 |
| 6ad88855-97ba-4a34-bf54-027940a090ec | 🔵 discovery | Playwright config serves dist over python http.server on 4322 | 2026-09-04 |
| 3d6cea1d-b010-4011-b86e-f4cb9c6f3486 | ✅ change | AGENTS.md now documents semantic-release versioning setup | 2026-09-04 |
| 2c556465-177c-4a03-8bce-3ff74715a5f8 | 🔵 discovery | Single deploy workflow and package scripts for build chain | 2026-09-04 |
| 7f9b2e77-d710-426e-b5c7-b0e72d01f58b | 🔵 discovery | semantic-release and plugins already declared in package.json | 2026-09-04 |
| ebbdf14f-b295-47a7-b67c-c1420e48d690 | 🔵 discovery | Single deploy workflow and package scripts for build chain | 2026-09-04 |
| e4e735df-9f87-499f-bc66-229dc973268b | 🔵 discovery | Build log convention requires dual update and dedup | 2026-09-04 |
| dc6f9c22-3744-4ce6-966f-3d5f82bba142 | 🔵 discovery | Build log documents search architecture in blog post | 2026-09-04 |
| 24c9922d-50fb-451c-8595-2a7d1629ca22 | ✅ change | Build cache and search index requirements | 2026-09-03 |
| 2e1b3e36-70ba-44dd-9981-24d0a58c2975 | ✅ change | Build cache and search index requirements | 2026-09-03 |

**Key concepts:** feature, markdown, marked, how-it-works, ui-interactions, e2e-testing, what-changed, ci-cd, build-tooling, build-log

### .github/workflows/
| ID | Type | Title | Date |
|----|------|-------|------|
| 4b589fa6-7e52-47e9-ace9-7f1f0b1ace43 | ✅ change | GitHub Actions bumped to v5 majors for Node 24 | 2026-09-04 |
| b9031ee7-8a59-4572-915b-bbe93527cf45 | ✅ change | Semantic-release step added to deploy workflow before build | 2026-09-04 |
| c0ad2cd5-13a3-491c-bd2d-d51f180b4eed | ✅ change | Build job scopes contents write permission for release step | 2026-09-04 |
| 3077dba2-7551-4dfa-9e21-3681162bd4db | ✅ change | Semantic-release step added to deploy workflow before build | 2026-09-04 |
| c474ab0b-cbe9-4e5e-8ff9-fa9ca966623b | 🔵 discovery | Deploy workflow: three sequential jobs, master-only build | 2026-09-04 |
| 38c00d7b-885f-40ea-9aae-7f265a2f6ef4 | 🔵 discovery | Deploy workflow: three sequential jobs, master-only build | 2026-09-04 |

**Key concepts:** what-changed, ci-cd, how-it-works, build-tooling

### .opencode/
| ID | Type | Title | Date |
|----|------|-------|------|
| a17c7d4d-b429-4a6b-b174-dc9d1d85135b | ✅ change | opencode.json adds LM Studio local provider with Qwen models | 2026-09-04 |

**Key concepts:** what-changed, config

### src/
| ID | Type | Title | Date |
|----|------|-------|------|
| c6bc15f7-7840-4d6d-84be-114c9b04e477 | 🔵 discovery | Site constants: SITE metadata and NAV links | 2026-09-04 |
| c7ca6245-5354-455e-bfdb-227b0aa8af44 | 🔵 discovery | Routing structure: dedicated routes per collection plus easter eggs | 2026-09-03 |
| 2689f509-a794-4c2e-a8a3-7d1d50ebcf5b | 🔵 discovery | Four content collections defined with Zod schemas | 2026-09-03 |
| 0acff27b-6e85-44d3-a89e-9a78dce94d7a | 🔵 discovery | Four content collections share near-identical Zod schemas | 2026-09-03 |

**Key concepts:** pattern, site-config, how-it-works, content-collections, zod-schema, trade-off

### src/components/
| ID | Type | Title | Date |
|----|------|-------|------|
| e81637d4-3a6d-4ee3-93bc-208765999466 | 🔴 bugfix | Release-modal not centered / drag-resize broken: full-height clamp + delayed centering | 2026-09-04 |
| 0115f3e8-ddf0-437a-83b3-50974f9f3ed9 | 🔄 refactor | Release-notes modal script converted to bundled marked import | 2026-09-04 |
| 1ad536ab-8527-4993-aa80-78b595c1b160 | 🟣 feature | Release-notes modal markup: dialog with header/body/footer | 2026-09-04 |
| 9ddd3147-f65e-451e-bb6a-24cca776662f | 🟣 feature | Release-notes modal: link, code, blockquote, footer styles | 2026-09-04 |
| ba4b17c6-4cdf-4996-9ed1-fbe1c1e46c07 | 🟣 feature | Release-notes modal CSS: dialog, header, title, markdown styles | 2026-09-04 |
| 3c2e58cf-63c2-4145-888c-68829647ed13 | 🟣 feature | Footer release-notes modal renders bodies as markdown via bundled marked | 2026-09-04 |
| 6eafa57c-a226-476d-bae4-a170b0e49407 | 🟣 feature | Release-notes modal: styled release-date/notes and states | 2026-09-04 |
| de9cf6cd-f643-4cd3-890f-83b1806be364 | 🟣 feature | Footer release-notes modal wiring and API fetch confirmed | 2026-09-04 |
| bb8a1f5a-22df-43ea-8a6e-e1270806880b | 🟣 feature | Footer release-notes modal styles defined | 2026-09-04 |
| cc8d444d-0f3a-4460-a863-c8b1b6820641 | 🟣 feature | Footer: version link href retained but renders hidden modal markup | 2026-09-04 |

**Key concepts:** how-it-works, gotcha, ui-interactions, e2e-testing, refactor, markdown, feature, ui-design, pattern, marked

### src/content/blog/
| ID | Type | Title | Date |
|----|------|-------|------|
| 5404b785-8713-4605-826d-c4ab0767af09 | ✅ change | Build log updated to document release-notes modal behavior | 2026-09-04 |
| 341e0480-d0e6-4c10-8f4c-28614721a638 | ✅ change | Build log semantic-versioning table row stale for modal | 2026-09-04 |
| ecbc347d-1e98-40b6-a27f-273008075f66 | 🔵 discovery | Build log lessons: migration, Zod defaults, Astro quirks, cache | 2026-09-04 |
| 2fdd3c4d-dd20-42cc-88a5-7afbb509be69 | ✅ change | Build log footer-version description now stale for modal | 2026-09-04 |
| dd7f2b0c-70dc-4be5-a211-a3aed0e495f1 | 🔵 discovery | Build log documents SW, semantic-release, migration details | 2026-09-04 |
| 5ea6e6fb-e13c-4c65-852e-b79a676c5d84 | 🔵 discovery | Build log references CI/CD at several points | 2026-09-04 |
| 01be707b-6c72-48a1-a0f3-ceb34f78f2c4 | 🔵 discovery | Build and Deployment section documents CI/CD with stale numbers | 2026-09-04 |
| c8ac2097-9971-4263-8a63-b2384abf0cc8 | 🔵 discovery | Build log table of contents shows full build narrative | 2026-09-04 |
| 953ffeaa-4f41-4bcd-87c9-e12acb725eac | 🔵 discovery | Build log feature table tracks search, search page, and navigation | 2026-09-04 |
| a83c9dca-0aa6-4208-9f20-3d17a4caaef0 | 🔴 bugfix | Duplicate Highlighting paragraph in build log | 2026-09-04 |

**Key concepts:** documentation, what-changed, feature, ui-interactions, gotcha, pattern, service-worker, build-log, how-it-works, ci-cd

### src/layouts/
| ID | Type | Title | Date |
|----|------|-------|------|
| c5c9556c-5b05-4d11-a743-fa5003f55e1e | 🔵 discovery | Post and GitHistory layouts use inline JS modals | 2026-09-04 |

**Key concepts:** how-it-works, ui-interactions, gotcha

### src/lib/
| ID | Type | Title | Date |
|----|------|-------|------|
| c2d8d07a-84c6-47fb-82c0-d7f5bd588c9b | 🔵 discovery | Service worker: passport-style lazy caching with version diff | 2026-09-04 |
| 6ade7a1e-7584-46ad-93e8-edcca988ae25 | 🔵 discovery | Service worker fetch handler intercepts all GETs with cache/respondWith | 2026-09-04 |
| 26acea2e-2ce3-402f-a3f1-98b391856d53 | 🔴 bugfix | Playwright page.route does not intercept SW-originated fetches; use serviceWorkers:'block' | 2026-09-04 |
| 917c9910-1505-4e8e-83f2-9b395c36d15e | 🔵 discovery | Search module: dual-mode fuzzy search with browser IIFE bundle | 2026-09-04 |
| caf53d8c-68ff-4edd-9af5-7959730e2815 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| 9b4d6d4d-6346-4c5c-9cbb-1c06133c31a7 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| ff24f42b-d4c9-4350-a232-5a47c5ae41be | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| 82bdb07c-518b-4323-8116-e0dbdfe729e0 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| 751aaead-6ee2-483e-a837-cf525956e571 | ✅ change | Bookmarks priority work refined to section-based weighting | 2026-09-03 |
| 34035b51-b2f7-443f-9cb3-a55b504d9ea7 | ✅ change | Exploration done; bookmarks weighting task now in progress | 2026-09-03 |

**Key concepts:** how-it-works, service-worker, caching, gotcha, e2e-testing, playwright, route-interception, search-module, fuzzy-search, search-index

### src/pages/
| ID | Type | Title | Date |
|----|------|-------|------|
| 5b974182-bac6-48c3-aca8-75e8b918ed1b | 🔵 discovery | Search index already includes bookmarks with author field | 2026-09-03 |
| fb972c4c-e0fd-4e69-bf55-81c68dabe692 | ✅ change | Search index entries gained author field from frontmatter | 2026-09-03 |
| 3f630abe-bfb5-421c-afa3-728aebf06fc6 | 🔵 discovery | Search index consumed by SearchBar, search page, and 404 | 2026-09-03 |
| e987c486-2e82-4fdc-a435-91f7c7d2500d | 🔵 discovery | Search index already includes bookmarks and static pages | 2026-09-03 |
| 72277dc7-2a1f-43d0-a781-d27169eb51f3 | 🔵 discovery | Three UI entry points fetch the shared search index | 2026-09-03 |
| 4d4107fa-f886-4103-ad72-fb07bd9379cc | 🔵 discovery | Three UI entry points fetch the shared search index | 2026-09-03 |
| 21249530-b236-4df8-a593-dee4aba94330 | 🔵 discovery | Search page: client-side UI shell with URL state sync | 2026-09-03 |
| 2aee516a-d9b8-46f9-8f73-3893a84555a8 | 🔵 discovery | Search page: client-side UI shell with URL state sync | 2026-09-03 |

**Key concepts:** what-changed, search-index, bookmarks, author, pattern, client-side, how-it-works, trade-off, search-page, url-state-sync

### src/styles/
| ID | Type | Title | Date |
|----|------|-------|------|
| 9e19285d-814b-42b2-87f2-fbf0bed01398 | 🔵 discovery | Site theme CSS variables: text, accent, panel, glow | 2026-09-04 |

**Key concepts:** ui-design, how-it-works, pattern

### tests/
| ID | Type | Title | Date |
|----|------|-------|------|
| 9b4d6d4d-6346-4c5c-9cbb-1c06133c31a7 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| 82bdb07c-518b-4323-8116-e0dbdfe729e0 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |

**Key concepts:** search-index, bookmarks

### tests/e2e/
| ID | Type | Title | Date |
|----|------|-------|------|
| 98d44aa5-97cf-40a5-b441-73b7709cfea2 | 🔴 bugfix | Resize-via-handle test now passes; all 11 modal tests green | 2026-09-04 |
| 4c2b560e-7b79-43be-b843-0d16c3f2466e | ✅ change | Modal holodeck e2e: 10 pass, resize test skipped | 2026-09-04 |
| c6ef3b3c-021f-4872-bede-d3a18aab9c29 | 🔵 discovery | Release-notes modal suite: markdown + dismissal tests | 2026-09-04 |
| 633324c1-d902-444c-ac69-9f66f0a190f7 | 🟣 feature | Release-notes modal new test: dialog centered and in-viewport | 2026-09-04 |
| 01394075-6619-4f1c-8d2c-9b1cf9c62e2e | 🔵 discovery | Release-notes modal markdown and close-button test lines | 2026-09-04 |
| 37b4ad5c-8fe9-40e3-9890-51d8a3388837 | 🔵 discovery | Release-notes modal e2e: count, href, view-all, markdown assertions | 2026-09-04 |
| 02ef2eb6-ab7f-4812-853f-04072d43ee36 | 🔵 discovery | Release-notes modal test: 5 links and View-all assertions | 2026-09-04 |
| 73adb9ab-9184-4ae7-af6d-4b6f6ba1ebc6 | 🔵 discovery | site.spec.ts broad cross-feature e2e coverage | 2026-09-04 |
| 3c2e58cf-63c2-4145-888c-68829647ed13 | 🟣 feature | Footer release-notes modal renders bodies as markdown via bundled marked | 2026-09-04 |
| 3dfc8ff9-f65e-4fdd-8e3b-152cd9b50070 | ✅ change | Release-notes modal e2e: 7 tests now all pass | 2026-09-04 |

**Key concepts:** bugfix, e2e-testing, what-changed, ui-interactions, feature, test-coverage, markdown, marked, how-it-works

### tests/unit/
| ID | Type | Title | Date |
|----|------|-------|------|
| 9b4d6d4d-6346-4c5c-9cbb-1c06133c31a7 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| 82bdb07c-518b-4323-8116-e0dbdfe729e0 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| 0ccd6598-45c0-4491-b9db-3b778f7ca5e2 | 🔵 discovery | Search feature has unit and e2e test coverage | 2026-09-03 |
| 0a02a746-c81a-4516-b472-10670a57f769 | 🔵 discovery | Search unit tests cover all module behaviors | 2026-09-03 |
| 712f8f53-28ba-46e7-98e7-5c8d3822d83d | 🔵 discovery | Search module has unit and e2e test coverage | 2026-09-03 |

**Key concepts:** search-index, bookmarks, test-coverage, search-module, unit-tests, e2e-tests, how-it-works, fuzzy-search, pattern

💡 *Use `mem-find` to search full details. Use `mem-create` to save important decisions.*
<!-- /open-mem-context -->
