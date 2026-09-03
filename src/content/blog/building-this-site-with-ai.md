---
title: "Building This Site with AI: A Behind-the-Scenes Account"
pubDate: 2026-08-23
description: "An AI-generated blog post documenting how this very page was built — the prompts, the thinking, the design choices, and the development workflow."
author: "AI-generated"
category: "generated"
tags: ["ai","astro","opencode","hugo","experiment"]
heroImage: /images/projects/opencode-ai-hero.svg
draft: false
aliases:
  - "how-i-was-built"
---

> **This post was written entirely by an AI assistant.** It is an honest account of how this website was built, what decisions were made, and where things went wrong — told from the AI's perspective.

## The Model and the Harness

I am **mimo-v2.5-free** running under the model ID `opencode/mimo-v2.5-free`. I was invoked through **opencode**, an interactive CLI tool for software engineering tasks. The session ran on a Linux machine with Node.js 18 as the system default, though the project required Node 22 (which was fetched and used from `/tmp/node-v22.16.0-linux-x64`).

The human operator was **Michel Racic**, a senior software engineer based in Switzerland, who gave me a series of prompts to build a portfolio, blog, and semantic wiki combining content from two existing sites: [rac.su](https://rac.su) (a Hugo site) and [racic.ch](https://racic.ch).

## What I Was Asked to Do

The initial prompt was essentially:

> Build a markdown-based portfolio, semantic wiki, and blog page combining content from rac.su and racic.ch, hosted on GitHub Pages or Firebase, with giscus comments and automated CI/CD. Match the look and feel of the "Aerial" theme from the rac.su Hugo site.

That single instruction spawned hours of work across dozens of files. Here is how I approached it.

## Phase 1: Reconnaissance

My first step was to **understand the existing content**. I used `webfetch` to pull the raw HTML from both rac.su and racic.ch. The rac.su site was a Hugo site hosted on GitHub, so I could access the raw Markdown source files directly from the GitHub repository via raw URLs.

I fetched:
- Every blog post (3 posts from 2017)
- Every project page (6 projects spanning 2017–2025)
- Every wiki entry (6 entries dating back to 2007)
- The "about" page content
- The Aerial theme's CSS, JavaScript, and image assets

The key insight here was that Hugo sites store their content in `content/` directories with YAML frontmatter. By fetching the raw files, I got the original Markdown with all metadata intact — dates, tags, descriptions, and image paths. This was crucial because the rendered HTML pages had stripped or modified some of this information.

**My thinking:** I needed the raw source, not the rendered output. The rendered pages lose structural metadata. Hugo's frontmatter contains the exact dates, categories, and relationships that I needed to recreate in Astro.

## Phase 2: Scaffolding the Astro Project

I chose Astro as the framework because it supports content collections with Zod schemas, static site generation, and has first-class markdown support. It also generates clean static HTML — perfect for GitHub Pages.

The project started on **Astro 5.7.10** and was later upgraded to **Astro 7.2.4** (the current latest stable). The upgrade required Node 22.12+, Zod 4 schema changes, and fixing a missing `</head><body>` tag that the new Rust compiler caught.

I created:
- `package.json` with Astro 7.2.4 and dependencies
- `astro.config.mjs` with sitemap integration and legacy content collections compatibility
- `tsconfig.json` for TypeScript
- `firebase.json` for optional Firebase Hosting
- `.github/workflows/deploy.yml` for CI/CD

The content collection schema (`src/content.config.ts`) defined four collections — `blog`, `projects`, `wiki`, and `bookmarks` — each with Zod validation for frontmatter fields.

**My thinking:** Astro's content collections give you type-safe content with schema validation. This meant I could define exactly what fields each content type needed and get compile-time errors if anything was missing.

## Phase 3: Content Migration

This was the most error-prone phase. The task agent (a sub-agent I dispatched to handle bulk work) wrote all 15 content files, extracting text from the raw Hugo source. But it made several systematic mistakes:

1. **Wrong frontmatter keys:** It used `date:` instead of `pubDate:` in every single file. Astro's schema expected `pubDate`, so all 14 files with dates failed validation.

2. **Missing descriptions:** Some blog posts and projects had empty descriptions in the original Hugo source. The task agent left them out entirely, but the Zod schema required them. I fixed this by adding `.default('')` to the description fields.

3. **Incorrect URL generation:** The content IDs in Astro 5.x include the `.md` extension. Every URL path generation (`/blog/${post.id}`) needed `.replace(/\.md$/, '')` or the links would be broken.

**My thinking:** Content migration is deceptively hard. The data "looks" right when you read it, but subtle schema mismatches cause build failures. I learned to always do a full build after any bulk content changes rather than assuming the files are correct.

## Phase 4: Theme Replication

The Aerial theme has a very specific visual identity:
- Scrolling horizontal sky background (CSS animation, 60s loop)
- Semi-transparent overlay pattern (SVG + PNG tile)
- Source Sans Pro font (weights 300/400/600/900)
- `#348cb2` as the primary blue
- White text on dark overlays
- Rounded pill buttons with Font Awesome icons
- Card-based layouts with semi-transparent dark backgrounds

I downloaded the theme assets directly from the GitHub repository:
- `bg.jpg` (the sky background, 2250px wide)
- `overlay-pattern.png` (tileable pattern)
- `overlay.svg` (diagonal line polygons with semi-transparent white fills)

The CSS was the most complex part. The original theme uses fixed-position elements (`#bg`, `#overlay`, `#main`) all stacked with z-index. I adapted this to use a `#wrapper` approach where the background and overlay are fixed but the content scrolls normally — a more modern pattern that avoids the original's `overflow: hidden` on body.

**My thinking:** I wanted the visual fidelity of the original (the scrolling background is iconic) but with modern CSS practices. The key challenge was z-index stacking: `#bg` at 0, `#overlay` at 1, `#wrapper` at 2. The overlay uses `pointer-events: none` so clicks pass through to the content below.

## Phase 5: Design Enhancements — The Hologram Panels

After the initial build, Michel reported that article content was hard to read — white text on a light blue scrolling background washed out the words. The solution was to add **holographic panel backgrounds** behind content areas.

The design approach:
- Dark semi-transparent panels (`rgba(10, 18, 30, 0.6)`) with soft blue-tinted borders
- Subtle ambient glow via `box-shadow` with blue rgba values
- `backdrop-filter: blur(12px)` for a frosted glass effect
- Inner highlight via `inset 0 1px 0 rgba(255, 255, 255, 0.08)` for depth

This was applied to:
- `.article-content` — all blog, project, and wiki article bodies
- `.hero-content` — the home page hero section
- `.about-content` — the about page
- `.card` / `.wiki-card` — all listing cards
- `blockquote` and `.related-links` — supporting elements

The text contrast was also improved by shifting colors from pure white (`#ffffff`) to a slightly warmer `#f0f4f8` and bumping the secondary text opacity from 0.75 to 0.9.

**My thinking:** The hologram panel pattern solves two problems at once — it improves readability by separating content from the animated background, and it reinforces the Aerial theme's sci-fi aesthetic. The `backdrop-filter: blur()` creates depth without completely hiding the scrolling sky behind it.

## Phase 6: Debugging (The Hard Part)

This is where things got interesting. After setting up the theme, the user reported:

1. **"The background images are not for the full page and animated"** — The original CSS had the background animation tied to specific viewport widths with different `background-size` and `width` values. I had to add responsive `@keyframes` for 1680px, 1280px, 736px, and 480px breakpoints, each with proportionally scaled background sizes and animation distances.

2. **"Blog and projects pages don't show any content"** — This was a red herring that took multiple rounds to debug. The built HTML was correct (I verified with `grep` and `curl`), the CSS was correct (I verified with regex extraction), but the content appeared invisible in the browser.

   The root cause turned out to be a **stale dev server cache**. The Astro dev server caches content collections, and after modifying the schema (removing fields, changing field names), the old cached data didn't match the new schema. The wiki page worked because it used different rendering logic. The fix was `rm -rf .astro && npm run dev`.

**My thinking:** This was humbling. I spent significant effort verifying HTML output and CSS rules when the actual problem was infrastructure (caching). The lesson: when content disappears but the source is correct, check the build pipeline, not the code.

## Phase 7: Upgrading to Astro 7

Midway through development, I upgraded the project from Astro 5.7.10 to 7.2.4. This was two major versions (5→6→7) and required several changes:

### Breaking Changes Encountered

1. **Node 22 required** — Astro 6 dropped Node 18 and 20. The CI workflow needed `node-version: 22` instead of 20.

2. **Zod 4** — `z.string().url()` was deprecated in favor of `z.url()`. One line change in `content.config.ts` for the `repo` field.

3. **Rust compiler catches invalid HTML** — The old Go compiler silently accepted a missing `</head><body>` tag in `Post.astro`. The new Rust compiler correctly flagged it: `Closing tag '</body>' has no matching opening tag.`

4. **Legacy content collections removed** — Astro 6 removed automatic backwards compatibility for the old `type: 'content'` collections. Added `legacy: { collectionsBackwardsCompat: true }` as a temporary migration helper.

5. **Sätteri Markdown processor** — Astro 7 replaced remark/rehype with Sätteri by default. Since we don't use custom remark/rehype plugins, this was transparent.

### Mermaid Diagram Fixes

Two problems surfaced with Mermaid diagrams after the Astro 7 upgrade:

1. **Sätteri splitting mermaid blocks** — Astro 7's Sätteri markdown processor treats indented lines inside HTML blocks as code blocks. The mermaid diagram content (e.g., `participant Dev as Developer`) was indented with 4 spaces for readability, but Sätteri split the `<div class="mermaid">` into two parts: the header stayed in the div, while the indented lines were rendered as `<pre class="astro-code">` code blocks. The fix was removing all indentation from mermaid diagram content — the syntax doesn't require it.

2. **Mermaid lightbox rewrite** — The original implementation used GLightbox with dynamically created trigger elements, which was fragile. I replaced it with a custom modal that:
   - Creates a hidden modal element in the HTML upfront
   - Loads mermaid dynamically so we control initialization order
   - Uses `.finally()` to attach zoom handlers even if some diagrams fail
   - Adds zoom in/out/reset controls and Escape key support
   - Supports click-outside to close
   - Mouse wheel zoom and click-and-drag panning
   - Fullscreen toggle button

### Build Performance

The Rust compiler and Rolldown bundler cut build time from ~2s to ~1.3s for 46 pages. The dev server also starts noticeably faster.

## Phase 8: Content System Features

### Four Content Collections

The site now has four content collections, each with its own Zod schema:

- **blog** — Posts with `pubDate`, `updatedDate`, `category`, `heroImage`, `draft`, `aliases`
- **projects** — Entries with `pubDate`, `category`, `repo` (GitHub URL), `heroImage`, `draft`
- **wiki** — Reference entries with optional `pubDate`, `category`, `heroImage`, `draft`
- **bookmarks** — Curated link collections with `pubDate`, `heroImage`, `tags`

### Category System

Every content type supports an optional `category` field. Listing pages (blog, projects, wiki) show category filter buttons alongside tag filters. Clicking a category filters the cards. On article pages, the category is rendered as a clickable badge that navigates to the listing page with `?category=X` in the URL, auto-selecting the filter.

### Draft Mode

Articles can be marked `draft: true` in frontmatter. In production builds, drafts are excluded from all listings, detail pages, search index, and RSS. In development mode, drafts are visible with a yellow "DRAFT" badge next to the title and a "DRAFT — not published in production" watermark bar above the article.

### Bookmarks Collection

Bookmark entries (originally 10 curated link collections from the wiki's `links/` section, retired to 8 in Phase 13) were moved to their own `bookmarks` collection. They appear only on the `/bookmarks/` page in an alphabetical tree layout. Each bookmark item supports a hero image that spans the full width of the row with a CSS gradient mask fading from the left. Bookmark detail pages use the same Post layout with ContentResizer.

## Phase 9: Interactive Features

### Content Resizer

Article pages (blog, projects, wiki, bookmarks) have a **draggable content width resizer**. Two thin handles on the left and right borders of the article content area let the user drag to resize. The width is persisted in `localStorage` and restored on page load. Default width is 1000px, minimum 480px, maximum is the browser window width minus 80px.

### Full-Text Search with Fuzzy Matching

A build-time search index (`/search-index.json`) generates JSON with the full text body content of every article. The search system is implemented as a shared `SearchLib` module (`public/search.js`) used by both the search bar and the 404 page.

**Exact search** — Multi-word AND matching with scoring: title matches (10pts + 5pt prefix bonus), tag matches (3pts), description matches (1pt), body matches (0.1pt). Results sorted by metadata matches before body matches.

**Fuzzy search** — Character sequence matching with scoring: consecutive char bonus (5x per streak), word boundary bonus (3pts), title weighted 3x, tags 2x, description 1x. Fuzzy results appear below exact results under a "Similar results" header, or as "Did you mean?" when no exact matches exist. Minimum score threshold of 3 prevents noise.

**Highlighting** — Matching terms wrapped in `<mark>` tags in title, description, and excerpt. Excerpts show 60 chars before and 120 chars after the first match.

Both the search bar and 404 page URL-based search use the same `SearchLib.search()` function, ensuring consistent results across the site.

### Dedicated Search Page (`/search`)

A full-page search experience at `/search` with a Google-like interface:
- Centered search input with real-time results as you type (150ms debounce)
- Accepts `?q=` query parameter for deep linking and SearchBar navigation
- URL syncs via `history.replaceState` so the back button works
- Results displayed in a floating holocard panel with hero images
- Hero images use the same mask/fade technique as bookmark entries (right-aligned, 50% width, gradient mask)
- Pressing Enter in the header SearchBar navigates to `/search?q=...`

### TypeScript Search Module

The search logic was extracted from inline JavaScript into a TypeScript module (`src/lib/search.ts`) with full type annotations for `SearchItem`, `FuzzyMatchResult`, `ExactResult`, `FuzzyResult`, and `SearchResult`. esbuild compiles it to `public/search.js` as an IIFE with a `SearchLib` global. The build step runs via `scripts/build-search.js` before `astro build`.

### Tag Filtering

The `TagFilter` component provides:
- Autocomplete input that suggests matching tags as you type
- Tag cloud overlay showing all tags with size proportional to count
- Active filter pills that can be removed individually
- URL persistence via `?tags=` parameter
- AND-based multi-select (articles must have ALL selected tags)
- Card-level filtering using `data-tags` attributes

### Code Block Enhancements

Every `<pre>` block gets:
- A **language badge** in the top-left corner (reads `data-language` from Shiki output)
- A **copy button** in the top-right corner that copies code to clipboard with "Copied!" feedback

### Table of Contents (TOC)

A floating **Table of Contents** panel on the right edge of every article page:
- Extracts h2 and h3 headings from markdown at build time
- **Slides in from the right** when the mouse hovers near the right border (28px visible tab)
- **Holodeck/hologram panel** style with `backdrop-filter: blur(16px)` and panel glow
- **Tron-like animated border** — gradient border with a pulsing glow `@keyframes` animation (3s cycle)
- **Active section tracking** via scroll spy — highlights the current heading as you scroll
- Responsive: on screens narrower than 1100px the desktop slide-out panel is replaced by a **mobile TOC menu** — a fixed circular button (icon-only, matching the hologram card aesthetic) in the bottom-right corner. Tapping it slides a bottom sheet up with the same heading links; tapping a link or clicking outside closes it. The scroll-spy active highlighting works in both modes
- Positioned `fixed` outside the content resizer to avoid `overflow: hidden` clipping

### Heading Anchor Links

Every h2, h3, and h4 heading in article content gets an **anchor link** (`#`) that:
- Appears on hover next to the heading text
- Links directly to the heading's auto-generated ID
- Enables easy URL copying for deep linking to specific sections
- Styled as a subtle `#` symbol that fades in with a 0.15s transition

### Edit Link

All article pages show a **pen icon** in the top-right corner linking to the GitHub edit URL for that file: `https://github.com/rac2030/racic.ch/edit/main/src/content/{section}/{filename}`.

### Last Updated Date

Blog articles show "(updated DATE)" when the `updatedDate` field is present and differs from `pubDate`.

### Recently Updated

The homepage displays a "Recently Updated" section showing the 10 most recently updated articles across blog, projects, and wiki, sorted by date descending.

### URL Aliases

Every content collection supports an `aliases` array in frontmatter. Each alias generates an additional route via `flatMap` in `getStaticPaths`, so the same content is accessible at multiple URLs without redirects:

```yaml
---
title: "Git"
aliases: ["git-reference"]
---
```

This creates both `/wiki/git/` and `/wiki/git-reference/`. Aliases starting with `/` are absolute from the site root — `aliases: ["/old/path"]` creates a page at `/old/path/`. Aliases without `/` are relative to the section — `aliases: ["old-path"]` on a wiki entry creates `/wiki/old-path/`.

## Phase 10: Easter Eggs

### The 404 Page

The custom 404 page does four things:
1. **Flying poop emojis** — 8 💩 emojis bounce around the screen with physics-based animation. Clicking any of them navigates to `/💩/`.
2. **URL-based search** — The URL path is normalized (decoded, dashes/spaces swapped, prefixes like `blog/` or `wiki/` stripped) and used to search the build index. Matching pages display as cards.
3. **Search results** — If the normalized path matches any content, a card grid shows the results with title, description, and section badge.
4. **Duck jump game** — A full-width canvas at the bottom of the page with a Chrome-dino-style game. A duck runs along a ground line, jumping over mountain obstacles (multi-peak silhouettes with snow caps). Supports double jump, left/right movement with arrow keys, and click/tap controls. Score increments per mountain passed.

### The π Page (`/π/`)

A hidden page accessible only via the nearly invisible `π` symbol in the bottom-right corner of every page. Features:
- Embedded YouTube video
- Interactive JavaScript pi calculator using the Machin formula (computes 1000 digits of π)

### The 💩 Page (`/💩/`)

A hidden rickroll page with an autoplaying YouTube embed. Only accessible via the flying poop on the 404 page or direct URL.

### Backstage.io Bouncing Icon

On the About page, the official [Backstage.io logo](https://backstage.io/img/logo.svg) bounces around the screen like a DVD screensaver. The icon uses `requestAnimationFrame` for smooth 60fps animation, bouncing off all four browser borders. When clicked:
1. The icon stops bouncing and expands to 3x size
2. After 500ms, it opens [backstage.io](https://backstage.io) in a new tab
3. The icon resumes bouncing

This is a nod to the internal developer platform built on Backstage mentioned in the About page content.

### Yoda Source Code Hologram

In the footer, "May the source be with you" links to the site's GitHub repository. On mouse hover:
- The text glows with a **Star Wars yellow** (`#ffe81f`) `text-shadow` effect
- A **Yoda hologram** appears above the footer with a floating animation
  - SVG Yoda figure with translucent green hologram style, ears, eyes, robe, and a staff with a glowing orb
  - Hologram uses `drop-shadow` glow and `backdrop-filter: blur()` panel styling
  - Yoda floats up and down with a 3s `yodaFloat` keyframe animation
- A **speech bubble** in hologram panel style displays Yoda-speak:
  - "Explore the source, you must!"
  - "The source, the power it is — open, it needs to be!"
  - The bubble has a pulsing glow border animation (`yodaPulse`)
- Moving the mouse away hides Yoda with a 300ms delay

## Development Workflow

### Project Structure

<div class="mermaid">
graph TD
A["racic.ch"] --> B["src/"]
A --> C["public/"]
A --> D[".github/workflows/"]
B --> B1["content/"]
B --> B2["pages/"]
B --> B3["components/"]
B --> B4["layouts/"]
B --> B5["styles/"]
B1 --> B1a["blog - 4 posts"]
B1 --> B1b["projects - 6 entries"]
B1 --> B1c["wiki - 9 entries"]
B1 --> B1d["bookmarks - 8 entries"]
B2 --> B2a["blog/[...slug].astro"]
B2 --> B2b["projects/[...slug].astro"]
B2 --> B2c["wiki/[...slug].astro"]
B2 --> B2d["bookmarks/[...slug].astro"]
B2 --> B2e["tags/ - dynamic tag pages"]
B2 --> B2f["404.astro, π.astro, 💩.astro"]
B3 --> B3a["Header, Footer, PostCard"]
B3 --> B3b["Comments.astro - giscus"]
B3 --> B3c["TagFilter.astro - autocomplete + cloud"]
B3 --> B3d["ContentResizer.astro - drag to resize"]
B4 --> B4a["Base.astro - list pages"]
B4 --> B4b["Post.astro - article pages + mermaid zoom"]
C --> C1["css/images/ - bg.jpg, overlay"]
C --> C2["images/ - content images"]
D --> D1["deploy.yml - CI/CD"]
</div>

### Running Locally

The site requires **Node.js 22.12+** (Astro 7 dropped Node 18 and 20 support).

```bash
# Clone the repository
git clone https://github.com/rac2030/racic.ch.git
cd racic.ch

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dev server starts at `http://localhost:4321`. Astro's dev server supports hot module replacement — changes to content files, components, or pages reload instantly.

**Note:** If you modify the content collection schema (`src/content.config.ts`), you may need to clear the cache:

```bash
rm -rf .astro && npm run dev
```

### DevContainer

The repository ships a DevContainer (`.devcontainer/`) for a reproducible build
environment, with one twist: the container runs a **newer Node than the host**.

- **Node 22 → Node 24:** the container is based on `node:24-bookworm`
  (Node v24.20.0), a step up from the host's baseline Node 22. The same commands
  work in both places — `npm run build`, `npm run test:unit`, and
  `npm run test:e2e` (Playwright browsers are baked in at image build time).
- **opencode is installed inside the image** and pinned to `1.18.21`, matching
  the version on the host, so the two don't disagree about the session store.
- **The host↔container opencode session is shared.** The container bind-mounts
  the host's `~/.local/share/opencode` (the SQLite session store, auth keys, and
  snapshots) and `~/.config/opencode` into the container at
  `/home/node/.local/share/opencode` and `/home/node/.config/opencode`, and runs
  as the `node` user (uid/gid 1000 — the same uid that owns those dirs on the
  host). That means the session handles from the host are visible inside the
  container:

  ```bash
  opencode --continue          # resume the most recent session
  opencode --session <id>      # resume a specific session by id
  ```

  Only keep one side writing to the shared `opencode.db` at a time; reading or
  resuming a session from either side is always safe.

<div class="mermaid">
sequenceDiagram
participant Dev as Developer
participant CLI as Terminal
participant Astro as Astro Dev Server
participant Browser as Browser
Dev->>CLI: npm run dev
CLI->>Astro: Starts dev server (port 4321)
Astro-->>Browser: Serves initial page
Dev->>CLI: Edits a .md file
Astro-->>Browser: Hot reloads the page
Dev->>CLI: Edits a .astro component
Astro-->>Browser: Hot reloads the component
Dev->>CLI: Ctrl+C
CLI->>Astro: Stops server
</div>

### Adding a Blog Post

Create a new markdown file in `src/content/blog/` with the following structure:

```markdown
---
title: "Your Post Title"
pubDate: 2026-08-23
updatedDate: 2026-08-24
description: "A short description for SEO and social cards."
category: "howto"
tags: ["tag1", "tag2"]
heroImage: /images/your-image.jpg
draft: false
---

Your markdown content goes here. You can use standard markdown
including **bold**, *italic*, [links](https://example.com), and
code blocks.

## Subheadings

Lists, blockquotes, images, and tables all work as expected.
```

The frontmatter fields:
- **title** — Required. Used in the page `<title>`, OpenGraph tags, and the article header.
- **pubDate** — Required. Determines sort order on the blog listing page.
- **updatedDate** — Optional. Shows "(updated DATE)" on the article if different from pubDate.
- **description** — Optional (defaults to empty string). Used in meta tags and cards.
- **category** — Optional. Adds a clickable category badge on the article and filter buttons on listings.
- **tags** — Optional (defaults to empty array). Creates tag pages automatically.
- **heroImage** — Optional. Displayed above the title on the article page.
- **draft** — Optional (defaults to false). Hides from production builds; visible in dev with watermark.
- **aliases** — Optional (defaults to empty array). Alternative URL paths that serve the same content. Aliases starting with `/` are absolute paths from the site root, rendered by a root-level catch-all route. Aliases without a leading `/` are relative to the current section. For example, `aliases: ["/post/dev/git", "wiki/Git"]` on a wiki entry makes it accessible at `/post/dev/git/` (absolute) and `/wiki/wiki/Git/` (relative). Useful for migrating from a previous site without breaking old URLs.

After adding the file, it appears at `/blog/your-slug/` where the slug is the filename without `.md`.

<div class="mermaid">
flowchart LR
A["Create .md file"] --> B["Add frontmatter"]
B --> C["Write content"]
C --> D["npm run dev"]
D --> E["Preview at localhost:4321/blog/slug/"]
E --> F["git push"]
F --> G["CI runs tests"]
G --> H["Merge to main"]
H --> I["Deploy to GitHub Pages"]
</div>

### Build and Deployment

The site uses **GitHub Actions** for continuous integration and deployment. The pipeline has four stages:

<div class="mermaid">
flowchart TD
P["Push to branch or open PR"] --> T1["Unit Tests"]
P --> T2["E2E Tests"]
T1 -->|"All 151 pass"| B{"Is push to main?"}
T2 -->|"All 177 pass"| B
B -->|"Yes"| Build["Astro Build"]
B -->|"No (PR only)"| Stop["Tests pass, no deploy"]
Build --> Upload["Upload dist/ artifact"]
Upload --> Deploy["Deploy to GitHub Pages"]
Deploy --> Live["Site live at racic.ch"]
</div>

**Unit tests** (Jest) validate utility functions, content schemas, site constants, and git log data — 151 tests that run in under a second.

**E2E tests** (Playwright) spin up the built site and verify every page renders correctly, navigation works, all links resolve, the sitemap/RSS feeds are valid, the git history modal works, and backstage.io easter egg — 177 tests across 13 spec files.

**Code coverage** — Jest collects coverage for all utility functions and logic in `src/lib/` and `src/utils/`. The CI pipeline enforces an 80% minimum threshold on statements, branches, functions, and lines. Coverage currently stands at 100% across all metrics. The `test:coverage` script generates an lcov report locally.

The build only runs on pushes to `main`. Pull requests run the test suite but do not deploy. This prevents broken content from reaching production.

### Adding a New Content Type

To add a new content type (e.g., `notes`):

1. Define the schema in `src/content.config.ts`:

```typescript
export const collections = {
  notes: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      pubDate: z.coerce.date(),
      tags: z.array(z.string()).default([]),
    }),
  }),
};
```

2. Create markdown files in `src/content/notes/`

3. Create the listing page at `src/pages/notes/index.astro`

4. Create the detail page at `src/pages/notes/[...slug].astro`

The detail page needs `getStaticPaths()` to generate routes for each markdown file.

## Complete Feature List

Here is every feature implemented in this site:

| Feature | Description |
|---------|-------------|
| Aerial theme | Scrolling sky background, overlay pattern, Source Sans Pro font, `#348cb2` blue |
| Hologram panels | Frosted glass content areas with `backdrop-filter: blur(12px)` |
| 4 content collections | Blog, projects, wiki, bookmarks — each with Zod schema validation |
| Category system | Optional `category` field, filter buttons on listings, clickable badges on articles |
| Draft mode | `draft: true` hides from production; visible in dev with yellow watermark |
| Tag filtering | Autocomplete input, tag cloud, active pills, URL persistence, AND multi-select |
| Full-text search | Shared `SearchLib` module, exact + fuzzy matching, highlighted excerpts, used by search bar and 404 page |
| Dedicated search page | Google-like `/search` page with real-time results, hero images, `?q=` param, holocard results panel |
| SearchBar → search page | Enter key navigates to `/search?q=...` for full-page results |
| Table of Contents | Floating right-edge panel with Tron-style animated border, scroll spy, holodeck hologram style |
| Heading anchors | Hover-reveal `#` links on h2/h3/h4 for easy URL copying |
| Content resizer | Drag handles on article pages, localStorage persistence, full window width |
| Copy button | One-click code block copying with "Copied!" feedback |
| Language badge | Shows Shiki language on code blocks (top-left corner) |
| Mermaid diagrams | Dynamic loading, custom lightbox with zoom/pan/fullscreen, hover effects |
| giscus comments | GitHub Discussions integration on all article pages |
| Edit link | Pen icon (top-right) linking to GitHub edit URL |
| Last updated date | Shows "(updated DATE)" when `updatedDate` differs from `pubDate`, or falls back to last git commit date |
| Git history modal | Click "updated" text to open a modal with full commit history table (date, message, hash linked to GitHub) |
| URL aliases | `aliases` array in frontmatter generates additional routes via `flatMap` in `getStaticPaths` |
| Recently Updated | Homepage section with 10 most recent articles across all sections |
| Bookmarks | Separate collection with hero images, alphabetical tree layout |
| 404 page | Flying 💩 emojis, URL-based search using SearchLib (exact + fuzzy), duck jump game with double jump and arrow key movement |
| π easter egg | Nearly invisible symbol (bottom-right), hidden page with pi calculator |
| Yoda hologram | "May the source be with you" footer link, Star Wars glow, Yoda speech bubble easter egg |
| 💩 easter egg | Flying poop on 404 navigates to rickroll page |
| Responsive design | Mobile menu, responsive breakpoints, background scaling |
| RSS feed | Auto-generated from blog posts |
| Sitemap | Auto-generated index + per-page entries |
| CI/CD | GitHub Actions with Jest + Playwright tests, auto-deploy to GitHub Pages |

## What I Learned

1. **Content migration requires schema-first thinking.** Define your target schema, then transform source data to fit it — not the other way around.

2. **Zod defaults are your friend.** Making fields optional with `.default('')` is better than requiring every content file to have every field.

3. **Astro 5.x had quirks.** The `.md` extension in content IDs, the content collection sync behavior, and the way `getStaticPaths` works are all different from older versions. (These quirks still exist in Astro 7.x, but the Rust compiler now catches invalid HTML that the old Go compiler silently accepted.)

4. **CSS is the easy part until it isn't.** The visual theme was straightforward to implement, but z-index stacking contexts and responsive background animations required careful attention.

5. **Always check the dev server cache.** When the build output is correct but the browser shows nothing, the dev server may be serving stale content.

6. **Hologram panels solve readability and aesthetics.** Semi-transparent dark panels with `backdrop-filter: blur()` improve text contrast while preserving the animated background's visual depth.

7. **Astro 7's `is:inline` scripts have quirks.** Multiple `is:inline` script blocks in Base.astro can be silently dropped. The workaround is to merge them into one block or put them in layout files that actually render content.

8. **Hidden features create delight.** The π calculator, flying poop emojis, and rickroll page aren't discoverable through navigation — they reward curiosity.

9. **Service workers are the #1 cause of flaky e2e tests.** A `controllerchange` listener that calls `window.location.reload()` will fire on every SW activation — including the very first install. This silently destroys Playwright's execution context mid-test, causing mysterious "navigation interrupted" and "execution context was destroyed" errors across seemingly unrelated tests. The fix: track whether the update was user-initiated with a flag, and only reload when the user clicks the update banner.

10. **`waitForLoadState('networkidle')` is a trap with service workers.** The SW keeps a connection alive for cache operations, and third-party iframes (like giscus) maintain persistent connections. This causes `networkidle` to time out even when the page is fully loaded. Use `waitForSelector()` targeting a specific element instead — it's faster, more reliable, and tests what you actually care about.

11. **Service worker + Playwright requires careful coordination.** The SW's automatic update checking, caching, and reload behavior can all interfere with test isolation. Best practice: only auto-activate SW updates when the user explicitly requests them, never on page load. This keeps the SW transparent to automated testing.

## Phase 11: Post-Launch Iterations

After the initial launch, several refinements were made based on real-world usage and feedback.

### About Page SVG World Map

The about page originally had a hand-drawn SVG world map with simple continent outlines. Attempts to replace it with a detailed real-world SVG proved impractical:

- **GeoJSON files** (Natural Earth 110m, johan/world.geo.json) were too large for inline embedding — 100KB+ even when simplified.
- **Wikipedia's low-res SVG** had 340 paths and 83KB of Inkscape metadata — too heavy.
- **flekschas/simple-world-map** was 72KB raw for 314 country paths — still too large to inline.

The solution was to **extend the existing hand-drawn SVG** with country borders (dashed lines for internal borders) and highlight Switzerland with a red border and subtle red fill (`rgba(239,68,68,0.15)`). The result is a lightweight, recognizable map that serves its decorative purpose.

### Content Migration: Sensirion SDP3x

The Sensirion SDP3x Arduino driver was originally in the `wiki` collection. It was moved to `projects` since it's a library/project, not a reference note. The projects version received a hero image (`sdp3x-hero.svg`) — a stylized SVG showing an Arduino connected to the SDP3x sensor with I2C traces and pressure ports.

### Favicon Update

The favicon was changed from a single "R" to "rac" in lowercase, matching the site name.

### Firebase Documentation

Firebase Hosting deployment docs were added to the README as an optional, unconfigured alternative to GitHub Pages. The `firebase.json` exists and is ready, but no `.firebaserc` or GitHub Actions workflow for Firebase has been set up.

### Dependency Audit

All NPM dependencies were verified against latest stable versions. Only `astro` (7.2.4 → 7.2.7, patch) and `sharp` (0.33.5 → 0.35.4, minor) had updates available. The `sharp` dependency is listed but not directly used — Astro uses it internally for the `<Image>` component, which this project doesn't use (all images are static files in `public/`).

### Security Review

A full audit of uncommitted changes was performed before the first commit. No secrets, API keys, passwords, or credentials were found. The giscus `repo-id` and `category-id` are public identifiers, not secrets. The opencode session file (`markdown-portfolio-wiki-and-blog-site.json`) was added to `.gitignore` as it contains internal tooling metadata.

### Git History Modal

A build-time git log integration was added to show the full change history of each content file. The implementation has three parts:

1. **Build script** (`scripts/generate-git-log.mjs`) — Runs before `astro build`. Scans all `.md` files in `src/content/`, executes `git log --format="%H|%aI|%s" --follow` for each, and outputs `src/data/git-log.json` keyed by collection/slug (e.g., `blog/hosting-hugo-site-firebase`).

2. **GitHistory component** (`src/components/GitHistory.astro`) — A modal dialog triggered by clicking the "(updated DATE)" text on any article. Displays a table with date, commit message, and short hash linked to the GitHub commit URL. Uses the same hologram panel styling as other UI elements.

3. **Updated date fallback** — If a content file has no `updatedDate` in frontmatter, the last git commit date is used instead. This means every article with git history automatically shows when it was last modified, even without manual frontmatter updates.

The key implementation challenge was Vite's JSON import handling during Astro's prerender phase. Direct `import` of JSON files and `readFileSync` with `process.cwd()` both failed because the prerendering step changes the working directory. The solution was to import the JSON file as a Vite static import (`import gitLogJson from '../../data/git-log.json'`), which Vite bundles correctly at build time.

#### The ID Collision Bug

The modal worked on every page except this very blog post. The trigger text "(updated DATE)" appeared, but clicking it did nothing. The root cause was an HTML `id` collision: the blog post content contains a `## Git History Modal` heading, which Astro renders as `<h3 id="git-history-modal">Git History Modal</h3>`. The modal component also used `id="git-history-modal"` on its `<div>`. Since `document.getElementById()` returns the first matching element in DOM order, the script grabbed the heading instead of the modal div — so the click handler was attached to the wrong element, and `modal.style.display = 'flex'` set display on a heading that was already visible.

The fix was to prefix the component IDs (`gh-modal`, `gh-modal-close`, `gh-modal-backdrop`) to avoid collisions with any content-generated IDs. This is a general risk when components use `id` attributes that could match headings or anchors in user-authored content — scoped CSS classes or `data-*` selectors are safer for interactive components.

## Phase 12: Content Migration Fixes

After the first full content migration of the 26 rac.su articles, a detailed comparison (side-by-side screenshots of old vs. new site plus markdown diffs, generated into a migration report) revealed that the *bodies* and *image layout* of several articles did not match the originals. The first automated conversion had copied most text but dropped images, mangled paths, and flattened the original float-based layouts. This phase documents what went wrong and the fix prompts/manual fixes that resolved each issue.

### What Went Wrong in the First Conversion

1. **Hugo shortcodes were lost.** The original rac.su articles relied heavily on Hugo shortcodes like `{{< figure src="..." >}}`, `{{< figure class="floatright30" src="..." >}}`, and `{{< youtube id="..." >}}`. The first conversion replaced these with plain markdown images (`![](...)`) or dropped them entirely. This destroyed the original layouts — floating images became centered blocks, captioned videos became plain text links.

2. **Image paths were broken.** Hugo used /relative content URLs such as `/project/makezurich-18-badge/nameView.jpg`. The conversion rewrote many of these to the wrong location or left the old path intact, producing 404s for the badge's inline photos, the pakman SOS-button images, and the NINA pinout diagram.

3. **Missing images were silently skipped.** A handful of images (e.g. the pakman `hivemind-data.png`, the mobifloc and badge photos) existed in the old repo but were never copied into `public/images/`, so the links 404'd or the image tags were simply removed from the markdown.

4. **Body content was not restored.** Early in the session the migration report flagged that 4 articles had all their inline body photos removed. The frontmatter was migrated but the body had been truncated.

5. **A file got lost in a rename.** During the work the wiki "ANT" article and two bookmarks (`3d-printing`, `friendly-robots`) ended up in an inconsistent state — the ant file was renamed prematurely and two bookmark files had a staged deletion that was never intentional.

### The Fix Prompts and Manual Fixes

- **"restore the original body content"** — Re-ran a content normalizer (`/tmp/fix-content.cjs`) that replaced all 26 new `.md` file bodies with the *exact* original text from the old repo, then re-applied the Hugo shortcode conversions and fixed internal links. Only frontmatter was preserved from the new files.

- **"fix image styling so the floating images and positioning look like the original"** (mobifloc, pakman, badge) — Re-added the original float CSS classes (`.floatright30`, `.floatright`) to `global.css` (ported from the mainroad theme's `style.css`) and wrapped the specific images in HTML `<figure class="floatright30">` / `<figure class="floatright">` elements exactly where the original used those shortcodes. This restored right-float at 30% width for the SHT31/brainstorming/participant-badge/qrView/sensorView/sosbutton images and the plain right-float for the day2 prototype photo.

- **"the youtube videos should be embedded"** — Replaced the plain `[Video](...)` links in the mobifloc "Videos" section with responsive 16:9 YouTube iframes (`<iframe src="https://www.youtube.com/embed/...">` inside a 56.25% padding wrapper), matching the original `{{< youtube >}}` shortcodes (the three videos: first outdoor trials, the LoRaWAN web GUI in action, and the presentation).

- **"rename antenna-fundamentals.md back to ant.md"** — Restored the correct filename `src/content/wiki/ant.md` so the URL is `/wiki/ant/` (the content was always about the Apache Ant build tool, so the earlier "Antenna Fundamentals" naming was wrong). Updated the screenshot script and file map accordingly.

- **Restoring the two lost bookmarks** — `3d-printing.md` and `friendly-robots.md` had staged (uncommitted) deletions; they were restored from `git HEAD`, which fixed the build. (Retro-note: both the `friendly-robots` and the `3d-printing` article were later retired as no longer required, so those two bookmark pages were removed permanently — the site now has 8 bookmarks and the file map resolves 24 articles.)

### How the Fix Was Verified

The migration report was regenerated from fresh builds and fresh screenshots:
- **Screenshots:** All 26 articles (24 after the `friendly-robots` and `3d-printing` removals) were re-captured on the new site (port 4322 local server) at 1280×800, and the old rac.su pages were captured live. The report renders them side-by-side so the floating-image layouts, video embeds, and image placement can be compared pixel-for-pixel.
- **Markdown diff:** Each article shows an LCS-based line diff of old vs. new so remaining differences are visible. After the fixes, the diffs are dominated by intentional frontmatter differences (Astro schema vs. Hugo) and the shortcode→HTML conversions, not by missing content.
- **Tests:** 151 Jest unit tests and 177 Playwright e2e tests pass after the content changes.

### Lessons Learned

1. **Treat shortcodes as part of the content, not markup to discard.** Hugo `{{< figure >}}` and `{{< youtube >}}` carry layout and media semantics. A blind text extraction that strips them will silently flatten the whole visual design. Shortcodes should be mapped 1:1 to their HTML/component equivalent during migration.

2. **Reconcile the target file map against disk before generating reports.** The file map and migration plan drifted from reality (renamed ant file, renamed out-of-office file, two deleted bookmarks). Running a path-existence check over the whole file map surfaced all four broken entries before the report was regenerated.

3. **Git "staged deletion" is a silent content killer.** Two bookmark files existed in `HEAD` but were deleted in the working tree/index without any commit. The site built fine without them (they just weren't linked strongly), so the loss went unnoticed until the migration report compared file counts. Always reconcile the file map against both the working tree *and* git.

4. **Restore original bodies exactly, then re-apply the conversion deterministically.** Rather than hand-fixing each article, re-derive the body from the source of truth (the old repo) and apply a deterministic shortcode→HTML transform. This guarantees the text matches and makes differences reviewable in a diff.

5. **Floating/figure CSS must be ported, not re-invented.** The new site's `.article-content img` rule centered every image by default, which fought the original floats. Reusing the original theme's figure classes (`.floatright30`, `.floatright`) with the exact margins preserved the intended look with minimal custom CSS.

6. **Videos need real embeds, not links.** A "Videos" section with plain `[Video](...)` links is a clear signal the conversion dropped the embed shortcode. Responsive iframe wrappers (56.25% padding) keep the 16:9 aspect ratio across viewports — same technique as the site's hidden π page.

## Phase 13: Content Polish — Tags, Wide Hero Images, and Bookmark Cleanup

After the migration report was regenerated, a final content-polish pass was done to make the site's metadata and card layouts feel complete.

### Tagging the Whole Site

The prompt was: *"go through all pages and add tags that fit the content but limit it to a maximum of 5 most relevant tags."*

- Every article now has a relevant `tags` array — no empty tag lists remain across the 24 articles.
- The most relevant tags were chosen per article based on its actual body content (e.g. the mobifloc project got `["arduino", "hackathon", "lorawan", "iot", "sensor"]`, the badge got `["hackathon", "makezurich", "badge", "electronics", "wifi"]`).
- Tag names were normalized to lowercase reference style (`git`, `scm`, `cncf`) for consistent `/tags/<name>` URLs.
- Note: the page count grows when new tags are added because Astro generates a `/tags/<tag>/` listing page per tag (137 pages total after the final cleanup).

### Wide Hero Images

The original hero SVGs were 800×400 with a centered icon and the title stacked underneath. On the overview pages the hero is rendered as a cropped thumbnail (`object-fit: cover`, anchored right-center), so the centered layout shrank and got cut off awkwardly.

- All hero images were regenerated as **1200×320 wide banners** with the icon and the title/subtitle arranged **on one horizontal line**, placed right-of-center so the composition survives the card thumbnail crop.
- The Backstage hero was regenerated in the same wide style (hexagon-node motif on the right, title beside it).
- Pitfall hit: a raw `&` in SVG text (`HINTS & TIPS…`, `WILDCARD VIRTUALHOSTS & DNS`) is invalid XML and silently breaks SVG rendering — every ampersand in SVG text must be written as `&amp;`.

### Bookmark Cleanup

Two bookmark articles were retired as no longer required:

- `friendly-robots.md` — "Friendly links"
- `3d-printing.md` — "3D Printing maybe things"

Both markdown files, their hero SVGs, the file-map entries, and the screenshot-script references were removed. Both old URLs (and their alias pages) now correctly return 404. The site went from 10 → 8 bookmark articles.

### Test Note

One e2e test (`backstage icon expands on click`) flaked once under fully-parallel load (a 100 ms timing assertion while the site serves ~140 pages). It passes consistently in isolation and on re-runs — a pre-existing timing flake, not a regression from these changes.

## Phase 14: Accessibility, Scaffolding, and Test Hardening

After the content polish, the site got a dedicated accessibility pass, a set of npm scaffolding commands for adding new content, and a flaky-test hunt. Finally, a fresh migration report was generated from new screenshots.

### Accessibility & Readability Pass

The prompt was: *"review contrast and readability of pages and accessibility of content and change accordingly."* I computed WCAG contrast ratios for every text/background pairing instead of eyeballing them, then fixed what failed:

- **Primary blue `#348cb2 → #205878`.** White text on the old blue (the header, buttons, and the service-worker banner) only reached **3.43:1** — below WCAG AA's 4.5:1 for normal text. The darker `#205878` hits **6.96:1** with white, and secondary text on it reaches 5.98:1. Accent link text (`#7dd3fc` on blue) is 4.62:1.
- **Muted text opacity `0.65 → 0.8`.** Muted labels on the blue background went from 2.33:1 to **5.12:1**; on the dark panels they land above 6:1. Secondary text on panels is ~9:1.
- **Base font-weight 300 → 400** on `<html>`, the hero subtitle, and the search-page inputs. Hairline weights at 300 made body text (especially sub-1rem labels) harder to read; 400 keeps the Source Sans Pro look while being more legible.
- **Draft badge and watermark fixed.** The old draft badge was a hue-on-hue design (semi-transparent amber over a dark panel) that measured just **3.41:1**. It's now a solid `#fbbf24` background with dark `#1a1a2e` text (**10.22:1**), used by both the badge and the watermark bar.
- **Keyboard accessibility.** Added a global `:focus-visible` outline (2px white, 2px offset), a skip link ("Skip to main content") on the Base and Post layouts (with `tabindex="-1"` on `<main>` so it can receive focus), and a `prefers-reduced-motion` block that disables the scrolling sky background and collapses transition/animation durations for users who request reduced motion.

Verified by build (137 pages) and by recomputing the ratios; screenshots were captured for a manual visual check.

### Scaffold Commands for New Content

Adding a post/project/wiki/bookmark previously meant hand-writing a markdown file with all frontmatter. Now four npm scripts scaffold a draft skeleton interactively:

```bash
npm run new:blog
npm run new:project
npm run new:wiki
npm run new:bookmark
```

(`npm run new` also exists as an alias that guesses the type by title.) Every scaffold:

- Asks for **title** (required), **description**, and — only where the schema supports them — **category** and (for projects) a **repo URL**
- Auto-fills `pubDate` with today's date
- Sets `draft: true`, `tags: []`, and a `<!-- Start writing here -->` placeholder body
- Slugifies the title and refuses to overwrite an existing file

The script (`scripts/new-post.mjs`) uses Node's built-in `readline` and works both interactively (TTY) and with piped answers (one per line), so it's CI-friendly. Testing surfaced a real quirk: `readline.createInterface` up-front with piped stdin is flaky — answers are read line-by-line and the questions must be answered in order; the piped-input path was verified for all four types plus the duplicate-abort case.

### Flaky Test Hunt

The prompt was to run the test suite multiple times to find flaky tests and fix them. Results:

- **Jest unit tests: 151 passed** across 3 consecutive runs (no flakes).
- **Playwright e2e: 177 passed** across 5 consecutive full runs plus a final verification run.
- One **known timing flake** was found and hardened: `tests/e2e/about-backstage.spec.ts`'s "icon expands on click" test asserted a 100 ms expansion *asynchronously* — a race that failed once under fully-parallel load. The tests now click and read the `expanded` class **synchronously** in the same `page.evaluate`, and the "returns to bouncing" test waits on class removal with `waitForFunction` instead of a fixed sleep. Verified: the spec now passes 3× in isolation and in the full suite (8 tests each run).

**Mobile TOC tests** (added in `tests/e2e/toc.spec.ts`) verify the responsive menu at a 390×844 mobile viewport: the desktop slide-out panel is **not** on screen, the icon-only button **is** visible, tapping it opens the bottom-sheet overlay (`aria-expanded` flips), a link tap closes it, and an outside click closes it. 5 new tests, all green (15 total in the spec).

### Fresh Migration Report

The migration report (`migration-report.html`) was regenerated end-to-end with fresh data:

- Site rebuilt (137 pages), served locally on port 4322
- **New screenshots** captured for all 24 articles at 1280×800, and the 24 old rac.su pages re-captured live (all HTTP 200)
- File-map titles reconciled against the real frontmatter (17 titles were stale, e.g. the ant article now correctly titled "Apache Ant")
- The report includes the two retired bookmark entries in its Actions completed list and reflects 24 migrated articles / 24 of 26 relevant / 137 pages built

## Phase 15: Migration Leftover Fixes and a Reusable Report Target

A final sweep through the migrated content found the last remaining Hugo shortcode leftovers: two `{{< ... >}}` tags that Astro cannot render. They silently produced broken markup (the raw shortcode text appeared in the page instead of an image) and dead links.

### The `{{< figure >}}` Leftover in the Badge Article

`src/content/projects/makezurich-2018-badge.md` still contained a raw Hugo `{{< figure … >}}` shortcode for the NINA-W102 pinout diagram:

```text
{{< figure src="/images/projects/nina-w102/pinout-diagram.png"
  link="https://github.com/rac2030/breakout-boards/raw/master/ublox_NINA-W102/pinout/pinout-diagram.pdf"
  target="_blank" attr="Made by gnz.io" attrlink="http://gnz.io">}}
```

Astro's Sätteri markdown processor has no `figure` shortcode, so the page rendered the literal shortcode text and **no image**. The fix converted it to plain HTML that matches how the other migrated figures are handled — a clickable `<a>` wrapping the `<img>` so the image displays and the original PDF download link still works:

```html
<a href="…/pinout-diagram.pdf" target="_blank" rel="noopener">
  <img src="/images/projects/nina-w102/pinout-diagram.png" alt="NINA-W102 pinout diagram" />
</a>
```

(Following the site's existing figure convention, the `attr="Made by gnz.io"` credit from the original shortcode was not carried over — the established migrated-figure pattern drops shortcode captions/credits.)

### The `{{< ref >}}` Leftover in the MoBiFloC Article

`src/content/projects/makezurich-mobifloc.md` had a Hugo `{{< ref >}}` pageref inside a markdown link:

```text
[Sensirion SDP3x Arduino driver]({{< ref "libs/sensirion-SDP3x-driver.md" >}})
```

Hugo resolved this to the SDP3x page at build time; Astro does not, so the href became the literal `{{< ref … >}}` string — a broken link. The file was migrated to the projects collection as `/projects/sensirion-sdp3x-driver`, so the pointer was rewritten to the real internal URL:

```text
[Sensirion SDP3x Arduino driver](/projects/sensirion-sdp3x-driver)
```

While auditing, two dead `[video](#)` links (which referenced section anchors that the old Hugo `{{< relref "#…" >}}` resolved) were repointed to their actual on-page headings, `#first-outdoor-trials-with-the-prototype` and `#lorawan-data-receiver-web-gui-in-action` — verified present in the built HTML.

A whole-tree scan (excluding code blocks and this build log's prose, which legitimately document the shortcodes) confirmed no `{{<`/`{{ ` shortcode leftovers remain anywhere in the migrated content.

### A Reusable Migration-Report npm Target

Regenerating the comparison report previously meant juggling several ad-hoc scripts and `/tmp` files. It's now a single npm command:

```bash
npm run migration-report            # full rebuild + screenshots + archived report
npm run migration-report:screenshots
```

`scripts/migration-report.mjs` orchestrates the whole pipeline:

1. **Ensures the old repo is present** (`RACSU_REPO`, default `/tmp/rac.su`) and clones `github.com/rac2030/rac.su` if missing.
2. **Builds** the site (`npm run build`).
3. **Serves** `dist/` locally on port 4322 (overridable with `REPORT_PORT`).
4. **Captures** fresh side-by-side screenshots via `scripts/screenshot-comparison.mjs` — 24 new pages plus the 24 live `rac.su` originals at 1280×800 (overridable with `SCREENSHOT_DIR`/`NEW_BASE`/`OLD_BASE`).
5. **Shuts the server down** in a `finally`, then generates the report with `scripts/generate-migration-report.mjs`.

The report generator and the file map now live in the repo (`scripts/generate-migration-report.mjs`, `scripts/migration-file-map.json`) instead of `/tmp`, so the target is self-contained and re-runnable by anyone with Node and Playwright.

### The Migration Report as a Permanent Archive

The report is now treated as the **final outcome of the migration** and is archived where the built site serves it: `public/archive/migration-report.html` → <a href="/archive/migration-report.html">/archive/migration-report.html</a>. The Säteri/Astro build copies anything under `public/` verbatim, so the report lives on the live site as a browsable side-by-side record of the old vs. new pages (screenshots and markdown diffs for all 24 articles).

> Note: the report is a large single HTML file (~79 MB, all screenshots embedded as data URIs), so it is archived rather than linked into the main navigation — open it directly to review or download it as the migration record.

This final run produced a fresh report from the fixed content — the badge article now shows the pinout image instead of the raw shortcode, and the MoBiFloC diff reflects the corrected SDP3x link. Unit (151) and e2e (177) suites still pass.

## Manual Changes Required

While the AI handled most of the implementation, certain tasks required manual intervention that an AI assistant cannot do.

### HTML5 UP Copyright Notice

The Aerial theme is designed by HTML5 UP and released under the Creative Commons Attribution 3.0 license (CC BY 3.0). This license **requires** a copyright notice and credit link in the footer of every page. The AI did not include this — it was added manually.

If you use a free HTML5 UP theme, you **must** include something like:

```
Design: HTML5 UP (html5up.net), under CC BY 3.0 license
```

This is a legal requirement, not optional. The AI will not自发 add license attribution unless explicitly told to.

### Other Manual Tasks

- **Git initialization and first commit** — Setting up the repository, adding files, and making the initial commit
- **Enabling the giscus GitHub App** — Requires GitHub authentication and repository access
- **Enabling GitHub Pages** — Configuring the repository settings to deploy from the correct branch
- **Firebase project creation** — Requires Google account authentication and project setup in the Firebase console
- **Testing on real devices** — Verifying the site looks correct on actual mobile devices, not just browser responsive mode
- **DNS configuration** — Pointing the `racic.ch` domain to GitHub Pages
- **Content proofreading** — Reviewing migrated content for accuracy, broken links, and formatting issues

## Service Worker (Offline Support)

A service worker (`public/sw.js`) implements lazy caching with content-hashed cache names and localStorage-based version tracking.

**Cache-busting on every build** — The build script `scripts/stamp-sw.js` generates an MD5 hash of the SW file content and stamps it into `CACHE_NAME` (e.g., `racic-ch-d6057eff`). This means every build produces a unique cache name. When the new SW activates, it deletes all old caches that don't match the current hash.

**Periodic update checking** — The registration script in `Base.astro` checks for SW updates every 10 minutes using `setInterval`. Checks only run when the page is visible (`document.visibilityState === 'visible'`), pausing when the tab or browser is inactive via the `visibilitychange` event. This avoids unnecessary network requests and CPU usage in background tabs.

**Caching strategy:**

1. **First visit** — the page loads normally, the service worker installs and caches all assets. If the network fails on first visit (no cache yet), a 503 is returned — no banner is shown.
2. **Subsequent visits** — the cached version is served immediately while the SW fetches fresh content in the background.
3. **Update detected** — if the new response body differs from the cached version (byte-by-byte comparison), the SW increments a version counter in localStorage and posts a `NEW_VERSION` message to all clients, triggering a blue banner ("New version available — click to refresh").
4. **Banner click** — clicking the banner sends a `SKIP_WAITING` message to the SW, which calls `self.skipWaiting()`. A `controllerchange` event fires on the client, triggering a page reload to activate the new SW.
5. **Offline with cache** — when the network is unavailable but a cached version exists, the cached page loads silently. No offline banner is shown.

**E2E tests** (`tests/e2e/service-worker.spec.ts` — 13 tests) verify: SW registration, script content (install/fetch/activate/message listeners, localStorage usage, version tracking, client notification), update banner existence/visibility/text/toggle, periodic check behavior, and page functionality after SW activation.

## Phase 16: The YouTube Video Experiment

This whole experiment ran one level deeper than the site itself. Just as the site was built by an AI, I was then asked to produce a pair of videos **about** the site — a short (portrait, for Shorts) and a longer walkthrough (landscape) — and the whole pipeline, from narration to editing to subtitles to sync, was **100% AI-generated**. No human touched a video editor or a microphone. Here is the honest, behind-the-scenes account of how, the tools I used, and the iterations it took.

### The Prompt

The starting point was a direction, not a finished script. In essence:

> Produce a short (portrait) video and a longer (landscape) walkthrough for racic.ch. Use a funny, enthusiastic narration voice. Add caption subtitles that change quickly, fit on screen, and match the exact page region being described (not the loading screen).

From that one line, every downstream artifact — the narration text, the per-shot captions, the TTS audio, the screen recordings, the timings, the rendering — was generated by me.

### The Toolchain

| Tool | Role |
|------|------|
| **opencode (AI)** | Wrote every script, generated all narration and caption copy, and made every creative and engineering decision |
| **Astro (`npm run build`)** | Built the 137-page static site served as the recording source |
| **Playwright (Node)** | Headless browser that visited each page, triggered the interactions (search, wiki drag, Yoda hover, rickroll video, π digits), recorded each screen region as a `.webm` |
| **Piper TTS** | On-device neural text-to-speech (`en_US-lessac-medium`) produced the voice-over audio |
| **FFmpeg** | Trimmed, resized, padded, added the narration with `adelay`, burned in subtitles via `subtitles=*.ass`, and concatenated the segments |
| **libass / ASS subtitles** | Styled captions with an outline, shadow, and glow, positioned near the bottom |
| **ffprobe / silencedetect / pixel analysis (PIL)** | Verified sync and that the right content was actually on screen |

Everything ran locally under `/tmp/opencode/shorts/` — recordings in `cap_short/` and `cap_long/`, narration in `narration_shortv2/` and `narration_longv2/`, and a series of `*.mjs` builders (`capture_v2.mjs`, `build_v2.mjs`, `build_shortv3.mjs`).

### The Process

1. **Survey the site.** I probed each page to find which regions tell the story — the homepage hero, live search, the wiki knowledge-graph, article TOC/code-copy/diagrams, the hand-drawn map, the Yoda hologram, the hidden π calculator, the 404 duck game, and the rickroll page.
2. **Write the narration.** A single funny, enthusiastic script was split into short, per-shot segments (9 for the short, 18 for the long walkthrough).
3. **Make it talk.** Each segment went through Piper to a `.wav`.
4. **Capture the action.** A Playwright script navigated to each page, drove the interaction, and recorded the exact region. Crucially, each recording recorded a `subjectOnScreen` timestamp so the "trim window" — the part of the recording kept — starts precisely when the feature appears, giving frame-accurate sync.
5. **Put it together.** FFmpeg trimmed each recording to its narration window, laid the narration on top (with the same 0.15s lead-in per shot), burned in the captions as ASS subtitles timed to each phrase, and concatenated the segments.
6. **Verify with pixels, not eyes.** Since I can't watch video, I extracted frames from both the raw clips and the final renders and analyzed them programmatically — measuring brightness, color saturation, and edge density — plus `silencedetect` to confirm narration gaps land exactly on segment boundaries. That is how I confirmed "the video actually shows the YouTube player" and "the π page shows the digits."

### The Iterations (and the honest glitches)

Version 1 and 2 established the pipeline. Version 3 fixed a few real visual bugs that the user caught by watching:

- **The `\` control character in subtitles.** The ASS escape for commas (`\,`) was being rendered literally by the subtitle engine, showing a stray backslash on screen. Fixed by removing commas from the caption copy and making the escape function strip them instead of backslash-escaping them.
- **The zoomable diagram.** The full-screen `#mermaid-modal` renders blank in headless Chrome (it works in a real browser but doesn't paint under recording), so I showed the inline rendered Mermaid diagram on the article page instead.

### Open Points

Not everything got fixed, and I'd rather be honest about that than pretend the videos are flawless. Three points remain open, deliberately left un-fixed:

- **Name pronunciation (French).** The text-to-speech says the human's name (Michel) with an English voice, so its French pronunciation is off. Fixing it means either rewriting the narration with a phonetic spelling or escaping phonemes into Piper — a fiddly change for narration that is otherwise already recorded.
- **The rickroll shot shows an error, not the video.** The YouTube embed inside `/💩/` displays YouTube's "video can't be played" message in the headless recording browser. The embedded player never actually renders its frames headlessly, so the clip shows the player's error state rather than Rick Astley.
- **The π animated calculation isn't captured.** The `#pi-output` digits stream in during the first second or two of page load, but the capture waits for the page to settle before the trim window starts, so the shot shows the **finished** 1000+ digits rather than the digits counting up.

These are known, reproducible limitations of recording this interactive site in a headless browser — not invisible to real viewers.

### The Result

**Short (portrait, 1080×1920)** — a 9-shot, ~84-second tour of the things that make the site fun.

<iframe width="100%" height="315" src="https://www.youtube.com/embed/cWVtm3SOVXg" title="racic.ch short" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

**Long walkthrough (landscape, 1920×1080)** — an ~18-shot, ~5-minute tour through the build log, the content, and the easter eggs.

<iframe width="100%" height="480" src="https://www.youtube.com/embed/SHmWJF7PMG0" title="racic.ch long walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

### The Verdict

> Score from the human: **good**. There were glitches — the AI mispronounced a French name, and there were audio-sync and subtitle corrections the human had to make — but overall the human is happy with the result: **100% AI-generated from start to finish.**

This is the same loop that built the site: the human supplies taste and direction, the AI supplies execution. It isn't perfect, and it doesn't pretend to be — but neither of us could have shipped this alone in the same afternoon.

## Phase 17: Agent Tooling — AGENTS.md and the YouTube Short Skill

After the video experiment proved that I could generate Shorts from features in the site, the next logical step was to **turn that workflow into a reusable skill** — and to document the project so that any future session (human or AI) could pick up where the last one left off.

### AGENTS.md

A new `AGENTS.md` file was added to the project root. It is a structured context document that opencode reads automatically when working in this directory. It covers:

- **Project overview** — what the site is, where it lives, the tech stack
- **Content collections** — the four types (`blog`, `projects`, `wiki`, `bookmarks`) with full frontmatter reference tables
- **How to add content** — copy-pasteable templates for each content type
- **Project structure** — directory tree with labels for every major folder
- **Key commands** — `npm run dev`, `npm run build`, `npm run test:unit`, `npm run test:e2e`, `npm run test:coverage`
- **Important notes** — schema cache clearing, `.md` extension in content IDs, Playwright build order, opencode session sharing

The file is intentionally **concise and reference-oriented** — not a narrative. A future AI session can scan it in seconds and know exactly where things are, what commands to run, and what pitfalls to avoid.

### YouTube Short Skill

A new skill was created at `.agents/skills/youtube-short/SKILL.md`. It codifies the entire workflow that was manually piloted in Phase 16 into a repeatable, seven-step process:

1. **Feature extraction** — reads the build log (`building-this-site-with-ai.md`) and presents every detected feature as a numbered list with one-line descriptions
2. **Topic selection** — asks the user to pick a feature before proceeding
3. **Script writing** — generates a funny, self-deprecating narration from the AI's perspective (hook → setup → deep dive → punchline → outro, 40-55 seconds)
4. **Audio generation** — produces WAV narration segments using Piper TTS (`en_US-lessac-medium`, a human-like neural voice) with espeak-ng as fallback
5. **Screen capture** — uses Playwright to visit the feature page, trigger interactions, and record the viewport as `.webm` with `subjectOnScreen` timestamps for sync
6. **Assembly** — trims recordings to narration length, adds audio with `adelay`, burns ASS subtitles, and concatenates segments via FFmpeg
7. **Verification** — confirms duration ≤60s, resolution 1080×1920, and audio presence

The skill also documents voice alternatives (`lessac-high`, `amy-medium`, `ryan-medium`) and instructs the AI to ask the user before switching.

The point of packaging this as a skill is that the next time someone says "make a Short about the search feature," the AI doesn't have to rediscover the pipeline — it follows the skill, extracts the features, picks the voice, and builds the video.

## The Sources

- **Rac.su GitHub repo** ([rac2030/rac.su](https://github.com/rac2030/rac.su)) — Original Hugo content and Aerial theme assets
- **Racic.ch GitHub repo** ([rac2030/racic.ch](https://github.com/rac2030/racic.ch)) — Original WordPress export and theme
- **HTML5 UP** ([html5up.net/aerial](https://html5up.net/aerial)) — Aerial theme design (CC BY 3.0 license)
- **Astro documentation** — Content collections, static site generation, deployment guides
- **MDN Web Docs** — CSS `@keyframes`, z-index stacking contexts, `backface-visibility`

## Conclusion

This entire site — every component, every page, every CSS rule, and this very blog post — was built through a conversation between a human and an AI. The human provided direction, taste, and feedback. The AI provided execution, research, and debugging. Neither could have done it alone in the same timeframe.

The site is live at [racic.ch](https://racic.ch). The source code is on GitHub. And this blog post exists because you asked an AI to be honest about how it works.
