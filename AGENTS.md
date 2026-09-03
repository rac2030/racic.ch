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
- **opencode session sharing:** the devcontainer bind-mounts host opencode data for shared sessions.
- **Node version:** Host uses Node 22, devcontainer uses Node 24 — both work identically.


<!-- open-mem-context -->
## Project Activity (auto-generated by open-mem)

### src/content/bookmarks/
| ID | Type | Title | Date |
|----|------|-------|------|
| b392e10f-838f-4aca-a86a-ca1eb09dff35 | 🔵 discovery | Bookmarks collection contains 8 entries | 2026-09-03 |
| f17eaf4f-843a-4ef1-b176-01d912c0c1e9 | 🔵 discovery | Bookmarks collection saved to project memory (ID 0a20ab4b) | 2026-09-03 |
| 7bd41dbf-d8a5-4e26-af55-06f427c8e888 | 🔵 discovery | Bookmarks collection contains 8 entries | 2026-09-03 |
| 0a20ab4b-6f5d-447f-bf6b-c0ee5e9a30a6 | 🔵 discovery | Bookmarks collection contains 8 entries | 2026-09-03 |
| d410ebba-0e58-4f19-b199-c3335fb3da2d | 🔵 discovery | Bookmarks collection contains 8 entries | 2026-09-03 |

**Key concepts:** content-collection, bookmarks, curated-links, pattern

💡 *Use `mem-find` to search full details. Use `mem-create` to save important decisions.*
<!-- /open-mem-context -->
