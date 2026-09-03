# AGENTS.md — racic.ch Project Context

## Project Overview

This is a **portfolio, blog, and semantic wiki** built with **Astro 7** (static site generator), hosted on **GitHub Pages** with optional Firebase Hosting. The site combines content from two legacy sites: [rac.su](https://rac.su) (Hugo) and [racic.ch](https://racic.ch) (Hugo).

**Live site:** [racic.ch](https://racic.ch)  
**Repo:** [github.com/rac2030/racic.ch](https://github.com/rac2030/racic.ch)

## Tech Stack

- **Framework:** Astro 7.2.4 (Node 22.12+ required, devcontainer uses Node 24)
- **Language:** TypeScript, Astro components (.astro), Markdown
- **Styling:** CSS (no Tailwind — custom hologram/sci-fi theme)
- **Testing:** Jest (unit, 162 tests), Playwright (e2e, 182 tests)
- **Search:** Build-time JSON index + custom fuzzy search module
- **Comments:** Giscus (GitHub Discussions)
- **CI/CD:** GitHub Actions → GitHub Pages
- **AI Tool:** opencode (mimo-v2.5-free model)

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
heroImage: /images/bookmark-hero.jpg
tags: ["tag1", "tag2"]
---

- [Link Title](https://example.com) — Description
- [Another Link](https://example.com) — Description
```

## Project Structure

```
racic.ch/
  src/
    content/
      blog/           # 4 posts
      projects/       # 6 entries
      wiki/           # 9 entries
      bookmarks/      # 8 collections
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
      search.ts       # Search module (compiled to public/search.js)
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
    build-search.js   # Compiles search.ts → public/search.js
    stamp-sw.js       # Cache-hashes the service worker
  .devcontainer/      # DevContainer (Node 24 + opencode)
  .github/workflows/  # CI/CD
```

## Key Commands

```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # Production build (137 pages)
npm run preview      # Preview production build
npm run test:unit    # Run Jest unit tests (162 tests)
npm run test:e2e     # Run Playwright e2e tests (182 tests)
npm run test:coverage # Generate coverage report (100% threshold)
```

## Content Authoring

- **AI-generated content:** When content is generated or heavily assisted by AI, set `author: "AI-generated"` in the frontmatter to clearly indicate the source

## Important Notes

- **Schema changes require cache clear:** `rm -rf .astro && npm run dev`
- **Content IDs include `.md` extension** in Astro 5+ — use `.replace(/\.md$/, '')` for URL generation
- **Playwright tests need the built site** — run `npm run build` before `npm run test:e2e`
- **opencode session sharing:** The devcontainer bind-mounts host opencode data for shared sessions
- **Node version:** Host uses Node 22, devcontainer uses Node 24 — both work identically
