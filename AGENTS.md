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
| 3d6cea1d-b010-4011-b86e-f4cb9c6f3486 | ✅ change | AGENTS.md now documents semantic-release versioning setup | 2026-09-04 |
| 2c556465-177c-4a03-8bce-3ff74715a5f8 | 🔵 discovery | Single deploy workflow and package scripts for build chain | 2026-09-04 |
| 7f9b2e77-d710-426e-b5c7-b0e72d01f58b | 🔵 discovery | semantic-release and plugins already declared in package.json | 2026-09-04 |
| ebbdf14f-b295-47a7-b67c-c1420e48d690 | 🔵 discovery | Single deploy workflow and package scripts for build chain | 2026-09-04 |
| e4e735df-9f87-499f-bc66-229dc973268b | 🔵 discovery | Build log convention requires dual update and dedup | 2026-09-04 |
| dc6f9c22-3744-4ce6-966f-3d5f82bba142 | 🔵 discovery | Build log documents search architecture in blog post | 2026-09-04 |
| 24c9922d-50fb-451c-8595-2a7d1629ca22 | ✅ change | Build cache and search index requirements | 2026-09-03 |
| 2e1b3e36-70ba-44dd-9981-24d0a58c2975 | ✅ change | Build cache and search index requirements | 2026-09-03 |
| 29b2c7fb-b8ef-41fb-a9c1-99a1780efe62 | ✅ change | Search index build cache and section weighting notes | 2026-09-03 |
| 9b4d6d4d-6346-4c5c-9cbb-1c06133c31a7 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |

**Key concepts:** what-changed, ci-cd, build-tooling, how-it-works, build-log, pattern, search-index, build-cache, bookmarks

### .github/workflows/
| ID | Type | Title | Date |
|----|------|-------|------|
| c0ad2cd5-13a3-491c-bd2d-d51f180b4eed | ✅ change | Build job scopes contents write permission for release step | 2026-09-04 |
| 3077dba2-7551-4dfa-9e21-3681162bd4db | ✅ change | Semantic-release step added to deploy workflow before build | 2026-09-04 |
| c474ab0b-cbe9-4e5e-8ff9-fa9ca966623b | 🔵 discovery | Deploy workflow: three sequential jobs, master-only build | 2026-09-04 |
| 38c00d7b-885f-40ea-9aae-7f265a2f6ef4 | 🔵 discovery | Deploy workflow: three sequential jobs, master-only build | 2026-09-04 |

**Key concepts:** what-changed, ci-cd, build-tooling, how-it-works

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
| 9b3cd9a2-282a-4828-89a4-417595d1fe51 | ✅ change | Footer-version link and its CSS styles in place | 2026-09-04 |
| c08bd5b9-3ddb-48a4-8c41-58b31fffe84d | ✅ change | Footer now shows version linking to GitHub release notes | 2026-09-04 |
| cc5306bc-7e85-4df2-8616-16c9a86b2509 | 🔵 discovery | Footer.astro shows copyright, source link, and Yoda hologram | 2026-09-04 |
| dee07a8e-e302-4d17-a21d-d57141eee67a | 🔵 discovery | Footer-related files identified for version display work | 2026-09-04 |
| 680bb34f-2b95-4a98-972a-f0d09152af81 | 🔵 discovery | SearchBar.astro: client-side dropdown with keyboard nav | 2026-09-03 |
| ef197529-ef1b-4b96-8de0-f3556187afe7 | 🔵 discovery | SearchBar dropdown: client-side results with keyboard nav and Enter redirect | 2026-09-03 |
| 3f630abe-bfb5-421c-afa3-728aebf06fc6 | 🔵 discovery | Search index consumed by SearchBar, search page, and 404 | 2026-09-03 |
| 72277dc7-2a1f-43d0-a781-d27169eb51f3 | 🔵 discovery | Three UI entry points fetch the shared search index | 2026-09-03 |
| 4d4107fa-f886-4103-ad72-fb07bd9379cc | 🔵 discovery | Three UI entry points fetch the shared search index | 2026-09-03 |

**Key concepts:** what-changed, ui-interactions, build-tooling, how-it-works, task-planning, search-bar, gotcha, pattern, search-index, client-side

### src/content/blog/
| ID | Type | Title | Date |
|----|------|-------|------|
| 5ea6e6fb-e13c-4c65-852e-b79a676c5d84 | 🔵 discovery | Build log references CI/CD at several points | 2026-09-04 |
| 01be707b-6c72-48a1-a0f3-ceb34f78f2c4 | 🔵 discovery | Build and Deployment section documents CI/CD with stale numbers | 2026-09-04 |
| c8ac2097-9971-4263-8a63-b2384abf0cc8 | 🔵 discovery | Build log table of contents shows full build narrative | 2026-09-04 |
| 953ffeaa-4f41-4bcd-87c9-e12acb725eac | 🔵 discovery | Build log feature table tracks search, search page, and navigation | 2026-09-04 |
| a83c9dca-0aa6-4208-9f20-3d17a4caaef0 | 🔴 bugfix | Duplicate Highlighting paragraph in build log | 2026-09-04 |
| c4bf013a-6067-4ca7-953b-4c6af7570f91 | 🔵 discovery | Search architecture and scoring weights documented in build log | 2026-09-04 |
| 2c97712e-5485-47af-8591-20a02969c05c | 🔵 discovery | Blog documents AGENTS.md role and YouTube Short creation skill workflow | 2026-09-03 |
| 85815e19-c2a4-479a-8481-138937d2ee08 | 🔵 discovery | Blog post documents site search architecture and scoring algorithms | 2026-09-03 |

**Key concepts:** build-log, how-it-works, ci-cd, pattern, search-index, deduplication, bugfix, fuzzy-search, why-it-exists

### src/lib/
| ID | Type | Title | Date |
|----|------|-------|------|
| 917c9910-1505-4e8e-83f2-9b395c36d15e | 🔵 discovery | Search module: dual-mode fuzzy search with browser IIFE bundle | 2026-09-04 |
| caf53d8c-68ff-4edd-9af5-7959730e2815 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| 9b4d6d4d-6346-4c5c-9cbb-1c06133c31a7 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| ff24f42b-d4c9-4350-a232-5a47c5ae41be | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| 82bdb07c-518b-4323-8116-e0dbdfe729e0 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| 751aaead-6ee2-483e-a837-cf525956e571 | ✅ change | Bookmarks priority work refined to section-based weighting | 2026-09-03 |
| 34035b51-b2f7-443f-9cb3-a55b504d9ea7 | ✅ change | Exploration done; bookmarks weighting task now in progress | 2026-09-03 |
| cd2ecc3b-1871-4b4f-a2ed-8029baca13ad | 🔵 discovery | Search module: dual-mode fuzzy search with browser IIFE bundle | 2026-09-03 |
| 75024180-8b3c-4b87-853c-2981b01f8551 | 🔵 discovery | Search module: dual-mode fuzzy search with browser bundle | 2026-09-03 |

**Key concepts:** how-it-works, search-module, fuzzy-search, search-index, bookmarks, task-planning, ranking, pattern, trade-off

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

### tests/
| ID | Type | Title | Date |
|----|------|-------|------|
| 9b4d6d4d-6346-4c5c-9cbb-1c06133c31a7 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |
| 82bdb07c-518b-4323-8116-e0dbdfe729e0 | ✅ change | Bookmarks added to search index with section-based weighting | 2026-09-03 |

**Key concepts:** search-index, bookmarks

### tests/e2e/
| ID | Type | Title | Date |
|----|------|-------|------|
| f99d240b-d5be-458b-929f-8c555d59dca2 | ✅ change | New e2e test asserts footer version link to GitHub releases | 2026-09-04 |
| a599b2e9-0356-4f40-b5cf-73d25e7f292c | 🔵 discovery | site.spec.ts: broad cross-feature e2e coverage | 2026-09-04 |
| 1cfec4da-05c7-480c-9b3c-e377821bab8a | 🔵 discovery | Yoda easter egg e2e spec covers link and hologram behavior | 2026-09-04 |
| 558954c0-c3dc-4fef-a655-5f9e96aa3021 | 🔵 discovery | Search page e2e covers state, URL param, cards, and navigation | 2026-09-03 |
| 4151c4e7-eb8b-481d-b9ff-95755141486f | 🔵 discovery | Fuzzy search e2e spec verifies ranking, dedup, and 404 SearchLib | 2026-09-03 |
| 0d014ba2-999f-4bd3-ad00-0d60325d7791 | 🔵 discovery | features.spec already expects Bookmarks section in search index | 2026-09-03 |
| fa15c4c0-a1e9-46a5-9542-731e3e01992b | 🔵 discovery | features.spec.ts: broad cross-feature e2e coverage | 2026-09-03 |
| 0ccd6598-45c0-4491-b9db-3b778f7ca5e2 | 🔵 discovery | Search feature has unit and e2e test coverage | 2026-09-03 |
| 2cc7bb02-0863-4fb1-bd63-98b3a499f8cc | 🔵 discovery | Search page e2e spec: full UI interaction coverage | 2026-09-03 |
| b9abb35e-d992-48fd-aa88-7635c8a9c131 | 🔵 discovery | Search header e2e coverage: fallback locators + index validation | 2026-09-03 |

**Key concepts:** what-changed, e2e-testing, test-coverage, ui-interactions, how-it-works, search-page, fuzzy-search, e2e-tests, search-index, bookmarks

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
