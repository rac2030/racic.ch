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
```

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
- **opencode session sharing:** the devcontainer bind-mounts host opencode data for shared sessions.
- **Node version:** Host uses Node 22, devcontainer uses Node 24 — both work identically.


<!-- open-mem-context -->
## Project Activity (auto-generated by open-mem)

### ./
| ID | Type | Title | Date |
|----|------|-------|------|
| fe8eb538-3601-425b-b97c-0c5260f45ade | ✅ change | Working tree has untracked skills and AGENTS.md change | 2026-09-03 |
| e7f78249-2c1a-456e-ad2e-723bc7077078 | 🔵 discovery | Scripts directory holds build, migration, and scaffolding tooling | 2026-09-03 |
| 7c92c45e-5bdc-4b3b-9de0-1e72d3a33f05 | 🔵 discovery | Project is ESM-only Astro 7 static site with composite build chain | 2026-09-03 |
| c9125b3d-0426-4bb9-8d87-0e86287295c1 | 🔵 discovery | Astro config: sitemap, shiki theme, collections backcompat | 2026-09-03 |

**Key concepts:** git-status, workspace, skills, uncommitted, how-it-works, pattern, astro-config, sitemap, shiki

### src/
| ID | Type | Title | Date |
|----|------|-------|------|
| c7ca6245-5354-455e-bfdb-227b0aa8af44 | 🔵 discovery | Routing structure: dedicated routes per collection plus easter eggs | 2026-09-03 |
| 2689f509-a794-4c2e-a8a3-7d1d50ebcf5b | 🔵 discovery | Four content collections defined with Zod schemas | 2026-09-03 |
| 0acff27b-6e85-44d3-a89e-9a78dce94d7a | 🔵 discovery | Four content collections share near-identical Zod schemas | 2026-09-03 |

**Key concepts:** how-it-works, pattern, content-collections, zod-schema, trade-off

### src/components/
| ID | Type | Title | Date |
|----|------|-------|------|
| 680bb34f-2b95-4a98-972a-f0d09152af81 | 🔵 discovery | SearchBar.astro: client-side dropdown with keyboard nav | 2026-09-03 |
| ef197529-ef1b-4b96-8de0-f3556187afe7 | 🔵 discovery | SearchBar dropdown: client-side results with keyboard nav and Enter redirect | 2026-09-03 |
| 3f630abe-bfb5-421c-afa3-728aebf06fc6 | 🔵 discovery | Search index consumed by SearchBar, search page, and 404 | 2026-09-03 |
| 72277dc7-2a1f-43d0-a781-d27169eb51f3 | 🔵 discovery | Three UI entry points fetch the shared search index | 2026-09-03 |
| 4d4107fa-f886-4103-ad72-fb07bd9379cc | 🔵 discovery | Three UI entry points fetch the shared search index | 2026-09-03 |

**Key concepts:** how-it-works, search-bar, ui-interactions, gotcha, pattern, search-index, client-side, trade-off

### src/content/blog/
| ID | Type | Title | Date |
|----|------|-------|------|
| 2c97712e-5485-47af-8591-20a02969c05c | 🔵 discovery | Blog documents AGENTS.md role and YouTube Short creation skill workflow | 2026-09-03 |
| 85815e19-c2a4-479a-8481-138937d2ee08 | 🔵 discovery | Blog post documents site search architecture and scoring algorithms | 2026-09-03 |

**Key concepts:** how-it-works, why-it-exists, pattern, fuzzy-search, search-index

### src/lib/
| ID | Type | Title | Date |
|----|------|-------|------|
| 751aaead-6ee2-483e-a837-cf525956e571 | ✅ change | Bookmarks priority work refined to section-based weighting | 2026-09-03 |
| 34035b51-b2f7-443f-9cb3-a55b504d9ea7 | ✅ change | Exploration done; bookmarks weighting task now in progress | 2026-09-03 |
| cd2ecc3b-1871-4b4f-a2ed-8029baca13ad | 🔵 discovery | Search module: dual-mode fuzzy search with browser IIFE bundle | 2026-09-03 |
| 75024180-8b3c-4b87-853c-2981b01f8551 | 🔵 discovery | Search module: dual-mode fuzzy search with browser bundle | 2026-09-03 |

**Key concepts:** search-index, bookmarks, task-planning, ranking, how-it-works, fuzzy-search, search-module, pattern, trade-off

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

### tests/e2e/
| ID | Type | Title | Date |
|----|------|-------|------|
| 558954c0-c3dc-4fef-a655-5f9e96aa3021 | 🔵 discovery | Search page e2e covers state, URL param, cards, and navigation | 2026-09-03 |
| 4151c4e7-eb8b-481d-b9ff-95755141486f | 🔵 discovery | Fuzzy search e2e spec verifies ranking, dedup, and 404 SearchLib | 2026-09-03 |
| 0d014ba2-999f-4bd3-ad00-0d60325d7791 | 🔵 discovery | features.spec already expects Bookmarks section in search index | 2026-09-03 |
| fa15c4c0-a1e9-46a5-9542-731e3e01992b | 🔵 discovery | features.spec.ts: broad cross-feature e2e coverage | 2026-09-03 |
| 0ccd6598-45c0-4491-b9db-3b778f7ca5e2 | 🔵 discovery | Search feature has unit and e2e test coverage | 2026-09-03 |
| 2cc7bb02-0863-4fb1-bd63-98b3a499f8cc | 🔵 discovery | Search page e2e spec: full UI interaction coverage | 2026-09-03 |
| b9abb35e-d992-48fd-aa88-7635c8a9c131 | 🔵 discovery | Search header e2e coverage: fallback locators + index validation | 2026-09-03 |
| 3352ea29-23f0-458b-9bba-2788572dc304 | 🔵 discovery | Fuzzy search e2e spec verifies ranking, dedup, and 404 SearchLib | 2026-09-03 |
| f2521a06-1c8a-46bb-89e5-5c1299883f95 | 🔵 discovery | Search header e2e spec: locator fallback patterns and index validation | 2026-09-03 |
| 712f8f53-28ba-46e7-98e7-5c8d3822d83d | 🔵 discovery | Search module has unit and e2e test coverage | 2026-09-03 |

**Key concepts:** how-it-works, e2e-testing, search-page, fuzzy-search, e2e-tests, search-index, bookmarks, pattern, test-coverage, search-module

### tests/unit/
| ID | Type | Title | Date |
|----|------|-------|------|
| 0ccd6598-45c0-4491-b9db-3b778f7ca5e2 | 🔵 discovery | Search feature has unit and e2e test coverage | 2026-09-03 |
| 0a02a746-c81a-4516-b472-10670a57f769 | 🔵 discovery | Search unit tests cover all module behaviors | 2026-09-03 |
| 712f8f53-28ba-46e7-98e7-5c8d3822d83d | 🔵 discovery | Search module has unit and e2e test coverage | 2026-09-03 |

**Key concepts:** test-coverage, search-module, unit-tests, e2e-tests, how-it-works, fuzzy-search, pattern

💡 *Use `mem-find` to search full details. Use `mem-create` to save important decisions.*
<!-- /open-mem-context -->
