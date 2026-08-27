---
title: "Building This Site with AI: A Behind-the-Scenes Account"
pubDate: 2026-08-23
description: "An AI-generated blog post documenting how this very page was built — the prompts, the thinking, the design choices, and the development workflow."
category: "generated"
tags: ["ai", "astro", "opencode", "experiment"]
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

Bookmark entries (10 curated link collections originally in the wiki's `links/` section) were moved to their own `bookmarks` collection. They appear only on the `/bookmarks/` page in an alphabetical tree layout. Each bookmark item supports a hero image that spans the full width of the row with a CSS gradient mask fading from the left. Bookmark detail pages use the same Post layout with ContentResizer.

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
B1 --> B1a["blog - 5 posts"]
B1 --> B1b["projects - 6 entries"]
B1 --> B1c["wiki - 9 entries"]
B1 --> B1d["bookmarks - 10 entries"]
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
T1 -->|"All 97 pass"| B{"Is push to main?"}
T2 -->|"All 125 pass"| B
B -->|"Yes"| Build["Astro Build"]
B -->|"No (PR only)"| Stop["Tests pass, no deploy"]
Build --> Upload["Upload dist/ artifact"]
Upload --> Deploy["Deploy to GitHub Pages"]
Deploy --> Live["Site live at racic.ch"]
</div>

**Unit tests** (Jest) validate utility functions, content schemas, site constants, and git log data — 97 tests that run in under a second.

**E2E tests** (Playwright) spin up the built site and verify every page renders correctly, navigation works, all links resolve, the sitemap/RSS feeds are valid, the git history modal works, and backstage.io easter egg — 146 tests across 13 spec files.

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

**Cache-busting on every build** — The build script `scripts/stamp-sw.js` generates an MD5 hash of the SW file content and stamps it into `CACHE_NAME` (e.g., `racic-ch-d6057eff`). This means every build produces a unique cache name. When the new SW activates, it deletes all old caches that don't match the current hash. The registration script calls `reg.update()` on every page load to check for a new SW file.

**Caching strategy:**

1. **First visit** — the page loads normally, the service worker installs and caches all assets. If the network fails on first visit (no cache yet), a 503 is returned — no banner is shown.
2. **Subsequent visits** — the cached version is served immediately while the SW fetches fresh content in the background.
3. **Update detected** — if the new response body differs from the cached version (byte-by-byte comparison), the SW increments a version counter in localStorage and posts a `NEW_VERSION` message to all clients, triggering a blue banner ("New version available — click to refresh"). Clicking the banner reloads the page.
4. **Offline with cache** — when the network is unavailable but a cached version exists, the cached page loads silently. No offline banner is shown.

**E2E tests** (`tests/e2e/service-worker.spec.ts` — 13 tests) verify: SW registration, script content (install/fetch/activate listeners, localStorage usage, version tracking, client notification), update banner existence/visibility/text/toggle/reload, and page functionality after SW activation.

## The Sources

- **Rac.su GitHub repo** ([rac2030/rac.su](https://github.com/rac2030/rac.su)) — Original Hugo content and Aerial theme assets
- **Racic.ch GitHub repo** ([rac2030/racic.ch](https://github.com/rac2030/racic.ch)) — Original WordPress export and theme
- **HTML5 UP** ([html5up.net/aerial](https://html5up.net/aerial)) — Aerial theme design (CC BY 3.0 license)
- **Astro documentation** — Content collections, static site generation, deployment guides
- **MDN Web Docs** — CSS `@keyframes`, z-index stacking contexts, `backface-visibility`

## Conclusion

This entire site — every component, every page, every CSS rule, and this very blog post — was built through a conversation between a human and an AI. The human provided direction, taste, and feedback. The AI provided execution, research, and debugging. Neither could have done it alone in the same timeframe.

The site is live at [racic.ch](https://racic.ch). The source code is on GitHub. And this blog post exists because you asked an AI to be honest about how it works.
