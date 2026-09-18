# Graph Report - racic.ch-portfolio-blog  (2026-09-17)

## Corpus Check
- 164 files · ~913,319 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 5, .css 1)

## Summary
- 1033 nodes · 1382 edges · 99 communities (75 shown, 24 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a12655d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- pipeline-util.mjs
- brick-breaker.ts
- astro:content
- scripts
- package.json
- @jest/globals
- timeline.ts
- @playwright/test
- search.ts
- Base.astro
- wiki-graph.test.ts
- graphify
- build-brickbreaker.js
- new-post.mjs
- generate-migration-report.mjs
- ref_astro_content
- content.config.ts
- 404.astro
- pieiter
- ref_fs
- migration-report.mjs
- generate-git-log.mjs
- new-story.mjs
- jest.globalSetup.cjs
- update-build-log.ts
- wiki/index.astro
- tsconfig.json
- stamp-sw.js
- build-sw.js
- search.astro
- screenshot-comparison.mjs
- What You Must Do When Invoked
- jest.config.cjs
- git.md
- AGENTS.md — racic.ch Project Context
- makezurich-2018-badge.md
- Workflow
- History
- using-google.md
- utils.ts
- ubuntu-font-rendering-mono-emoji-fix.md
- from-build-log-to-video-ai-youtube-pipeline.md
- makezurich-mobifloc.md
- Ingredient Breakdown
- building-this-site-with-ai.md
- arduino.md
- Narration (approved)
- ant.md
- racic.ch — Portfolio, Wiki & Blog
- graphify reference: extra exports and benchmark
- Phase 11: Post-Launch Iterations
- Firebase
- Matt Pocock - Skills for Real Engineers
- Phase 16: The YouTube Video Experiment
- makezurich-pakman.md
- nina-w102-minimal-breakout.md
- Development Workflow
- Phase 19: A New Voice — The Wiki Graph Short with Voicebox TTS
- graphify reference: query, path, explain
- Phase 10: Easter Eggs
- enabling-offline-usage-hugo-pwa.md
- DevContainer — racic.ch with opencode
- Phase 15: Migration Leftover Fixes and a Reusable Report Target
- Phase 14: Accessibility, Scaffolding, and Test Hardening
- Phase 13: Content Polish — Tags, Wide Hero Images, and Bookmark Cleanup
- Phase 8: Content System Features
- Phase 12: Content Migration Fixes
- timeline.astro
- stories/
- Story: The raic.ch Site Walkthrough
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- Phase 7: Upgrading to Astro 7
- Aliexpress
- sensirion-sdp3x-driver.md
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- Phase 17: Agent Tooling — AGENTS.md and the YouTube Short Skill
- Manual Changes Required
- displaying-git-metadata-hugo-templates.md
- stm32.md
- post-checkout
- post-commit
- extraction-spec.md
- computer-vision.md
- golang.md
- hugo-links.md

## God Nodes (most connected - your core abstractions)
1. `scripts` - 36 edges
2. `@playwright/test` - 21 edges
3. `Phase 9: Interactive Features` - 14 edges
4. `BrickBreaker` - 13 edges
5. `What You Must Do When Invoked` - 12 edges
6. `AGENTS.md — racic.ch Project Context` - 12 edges
7. `main()` - 11 edges
8. `resolveStory()` - 11 edges
9. `loadStory()` - 11 edges
10. `main()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Repeatability: the scripted pipeline` --references--> `pan()`  [INFERRED]
  src/content/blog/building-this-site-with-ai.md → .agents/skills/youtube-short/scripts/capture.mjs
- `Recently Updated` --references--> `effectiveUpdatedDate()`  [INFERRED]
  src/content/blog/building-this-site-with-ai.md → src/lib/utils.ts
- `Workflow` --references--> `corner()`  [INFERRED]
  .agents/skills/youtube-short/SKILL.md → .agents/skills/youtube-short/scripts/capture.mjs
- `TypeScript Search Module` --references--> `FuzzyMatchResult`  [INFERRED]
  src/content/blog/building-this-site-with-ai.md → src/lib/search.ts
- `TypeScript Search Module` --references--> `ExactResult`  [INFERRED]
  src/content/blog/building-this-site-with-ai.md → src/lib/search.ts

## Import Cycles
- None detected.

## Communities (99 total, 24 thin omitted)

### Community 0 - "pipeline-util.mjs"
Cohesion: 0.10
Nodes (53): LANG_2_TO_3, main(), run(), tracksFor(), ensureBase(), ensureVoicebox(), main(), SCRIPTS (+45 more)

### Community 1 - "brick-breaker.ts"
Cohesion: 0.06
Nodes (41): Ball, BALL_R, bounceWalls(), Brick, BRICK_COLORS, BrickBreaker, BrickColorSpec, circleRectHit() (+33 more)

### Community 2 - "astro:content"
Cohesion: 0.18
Nodes (4): tocHeadings, src_data_git_log, canonicalURL, extractHeadings()

### Community 3 - "scripts"
Cohesion: 0.06
Nodes (36): scripts, astro, build, build:brickbreaker, build:git, build:search, build:sw, dev (+28 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (33): dependencies, astro, @astrojs/rss, marked, devDependencies, @astrojs/sitemap, esbuild, husky (+25 more)

### Community 5 - "@jest/globals"
Cohesion: 0.11
Nodes (18): astro, @jest/globals, ref_zod, Service Worker (Offline Support), CACHE_NAME, getVersion(), normalizePath(), notifyClients() (+10 more)

### Community 6 - "timeline.ts"
Cohesion: 0.09
Nodes (29): log(), Article Change Timeline, Code Block Enhancements, Content Resizer, Dedicated Search Page (`/search`), Edit Link, Full-Text Search with Fuzzy Matching, Heading Anchor Links (+21 more)

### Community 8 - "search.ts"
Cohesion: 0.21
Nodes (18): TypeScript Search Module, escapeHtml(), ExactResult, fuzzyMatch(), FuzzyMatchResult, FuzzyResult, getExcerpt(), highlight() (+10 more)

### Community 9 - "Base.astro"
Cohesion: 0.22
Nodes (4): NAV, SITE, canonicalURL, src_styles_global

### Community 10 - "wiki-graph.test.ts"
Cohesion: 0.09
Nodes (27): getMax(), onDrag(), onMove(), onUp(), viewportSafe(), Complete Feature List, ContentResizer now sizes the card, Filter Reactivity (+19 more)

### Community 11 - "graphify"
Cohesion: 0.10
Nodes (19): command, cwd, enabled, type, models, name, npm, options (+11 more)

### Community 12 - "build-brickbreaker.js"
Cohesion: 0.15
Nodes (12): esbuild, ref_url, cleaned, __dirname, outPath, src, srcPath, cleaned (+4 more)

### Community 13 - "new-post.mjs"
Cohesion: 0.22
Nodes (12): ref_node_readline, ALLOWS_CATEGORY, COLLECTION_NAME, COLLECTIONS, DIRS, interactivelyAsk(), IS_PROJECT(), main() (+4 more)

### Community 14 - "generate-migration-report.mjs"
Cohesion: 0.19
Nodes (11): categories, diffLines(), __dirname, escapeHtml(), FILE_MAP, FILE_MAP_PATH, getStats(), MIGRATION_PLAN (+3 more)

### Community 15 - "ref_astro_content"
Cohesion: 0.10
Nodes (14): ref_astro_content, @astrojs/rss, allCategories, allTags, posts, tagCounts, allCategories, allTags (+6 more)

### Community 16 - "content.config.ts"
Cohesion: 0.33
Nodes (5): blog, bookmarks, collections, projects, wiki

### Community 17 - "404.astro"
Cohesion: 0.31
Nodes (6): drawDuck(), drawGround(), drawMountain(), gameLoop(), getDuckColors(), lerpColor()

### Community 18 - "pieiter"
Cohesion: 0.31
Nodes (4): convergedDecimals(), equalDecimals(), pieiter(), piestart()

### Community 19 - "ref_fs"
Cohesion: 0.21
Nodes (8): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path, ref_playwright, ARTICLES, main(), screenshotPage(), ARTICLES

### Community 20 - "migration-report.mjs"
Cohesion: 0.33
Nodes (8): ref_http, __dirname, ensureOldRepo(), main(), NEW_REPO, run(), serveDist(), stopServer()

### Community 21 - "generate-git-log.mjs"
Cohesion: 0.25
Nodes (6): CONTENT_DIR, findMdFiles(), gitLog, mdFiles, OUTPUT_DIR, OUTPUT_FILE

### Community 22 - "new-story.mjs"
Cohesion: 0.38
Nodes (6): main(), REPO, slugify(), STORIES, template(), WALKTHROUGH_LANGUAGES

### Community 23 - "jest.globalSetup.cjs"
Cohesion: 0.29
Nodes (5): { execSync }, findMdFiles(), { join, relative }, { readdirSync, statSync, mkdirSync, writeFileSync }, ref_child_process

### Community 25 - "wiki/index.astro"
Cohesion: 0.25
Nodes (7): resize(), allCategories, allTags, bookmarkEntries, entries, tagCounts, wikiGraph

### Community 26 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): astro/tsconfigs/strict, compilerOptions, baseUrl, paths, extends

### Community 27 - "stamp-sw.js"
Cohesion: 0.33
Nodes (5): ref_crypto, content, hash, stamped, swPath

### Community 28 - "build-sw.js"
Cohesion: 0.33
Nodes (5): cleaned, __dirname, outPath, src, srcPath

### Community 29 - "search.astro"
Cohesion: 0.53
Nodes (4): doSearch(), render(), renderCard(), syncFromInput()

### Community 30 - "screenshot-comparison.mjs"
Cohesion: 0.60
Nodes (4): ARTICLES, forceImagesLoaded(), main(), screenshotPage()

### Community 31 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 35 - "git.md"
Cohesion: 0.09
Nodes (22): add changes, Add them to the ignore list, Adding a submodule to a project, Adding upstream to your fork, clone a git for local changes that can be pushed again to origin master, create local branch, do your work and merge it back to local master, Fetch changes from submodule, Forking (+14 more)

### Community 36 - "AGENTS.md — racic.ch Project Context"
Cohesion: 0.10
Nodes (20): Adding New Content, AGENTS.md — racic.ch Project Context, Blog Post, Bookmark Collection, Content Authoring, Content Collections, Draft Mode, Frontmatter Reference (+12 more)

### Community 37 - "makezurich-2018-badge.md"
Cohesion: 0.10
Nodes (20): AT command list, AT commands, BOM, Buttons, E-Paper display, E.T. calling home, I2C devices, LEDs (+12 more)

### Community 38 - "Workflow"
Cohesion: 0.10
Nodes (19): Language support (Voicebox / Qwen CustomVoice), Output, Pipeline scripts & story manifests, Reusing a story for a longer walkthrough, Running the Voicebox server (Linux, from source), Step 1: Extract Features from the Build Log, Step 2: Topic Selection, Step 3: Script the Short (+11 more)

### Community 39 - "History"
Cohesion: 0.11
Nodes (18): Backstage is Named (2017–2019), CNCF Incubating Project (March 2022), Current State (2026), History, Key Features in 2026, Long-Term Vision, Medium-Term (2026–2027), Near-Term (2026) (+10 more)

### Community 40 - "using-google.md"
Cohesion: 0.12
Nodes (15): eBook, Frontpage, Links / Referenzen, Music, Netzwerk Kameras, Pages that are hidden for google robots, Passwords, PHP PHOTO ALBUMS (+7 more)

### Community 41 - "utils.ts"
Cohesion: 0.28
Nodes (13): buildBlogUrl(), buildProjectUrl(), buildTagUrl(), buildWikiUrl(), effectiveUpdatedDate(), extractAllTags(), filterDrafts(), formatDate() (+5 more)

### Community 42 - "ubuntu-font-rendering-mono-emoji-fix.md"
Cohesion: 0.13
Nodes (14): 1. Check Current Monospace Font Match, 2. Check Font Settings, 3. Verify Available Monospace Fonts, Diagnosis Steps, Environment, Prevention, Related Commands, Root Cause (+6 more)

### Community 43 - "from-build-log-to-video-ai-youtube-pipeline.md"
Cohesion: 0.14
Nodes (13): 1. Scaffold, 2. Auto-extension, 3. Narration (the slow part), 4. Capture, 5. Assemble, 6. Verify, The Failure Log (do not skip this), The Problem (+5 more)

### Community 44 - "makezurich-mobifloc.md"
Cohesion: 0.15
Nodes (12): Challenge, Day 1 - Friday, 3rd February, Day 2 - Saturday, 4th February, First outdoor trials with the prototype, Idea, LoraWAN data receiver web GUI in action, Night from Friday to Saturday, Presentation on the end of the hackathon (+4 more)

### Community 45 - "Ingredient Breakdown"
Cohesion: 0.15
Nodes (12): 🫘 Chickpea Flour (Besan), How to Mix, How to Use — Full Body Scrub, Ingredient Breakdown, Ingredients, 🍋 Lemon Juice, 🌿 Neem Powder, 🟠 Red Lentils (Ground) (+4 more)

### Community 46 - "building-this-site-with-ai.md"
Cohesion: 0.17
Nodes (11): Conclusion, Phase 1: Reconnaissance, Phase 2: Scaffolding the Astro Project, Phase 3: Content Migration, Phase 4: Theme Replication, Phase 5: Design Enhancements — The Hologram Panels, Phase 6: Debugging (The Hard Part), The Model and the Harness (+3 more)

### Community 47 - "arduino.md"
Cohesion: 0.17
Nodes (11): Audio, Input, Inventory tracking, LED Strips, Lora, MOSFETS, Power, Project Cases (+3 more)

### Community 48 - "Narration (approved)"
Cohesion: 0.17
Nodes (11): Narration (approved), Reuse, Segment 1 — Hook, Segment 2 — Setup, Segment 3 — Deep dive: live filters, Segment 4 — Deep dive: bookmark diamonds, Segment 5 — Deep dive: double-click navigation, Segment 6 — Punchline 1 (+3 more)

### Community 49 - "ant.md"
Cohesion: 0.18
Nodes (10): Abhängikeit, Aufbau von Ant-Files, Ausführen von Java Code, Classpath definieren, Erstellen von Ordnern, Jar File erstellen, Java Compilieren, JUnit Tests (+2 more)

### Community 50 - "racic.ch — Portfolio, Wiki & Blog"
Cohesion: 0.20
Nodes (9): CI/CD with GitHub Actions (optional), Comments, Deployment, Development, Firebase Hosting (alternative, not configured for this repo), GitHub Pages (default), racic.ch — Portfolio, Wiki & Blog, Sections (+1 more)

### Community 51 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 52 - "Phase 11: Post-Launch Iterations"
Cohesion: 0.22
Nodes (9): About Page SVG World Map, Content Migration: Sensirion SDP3x, Dependency Audit, Favicon Update, Firebase Documentation, Git History Modal, Phase 11: Post-Launch Iterations, Security Review (+1 more)

### Community 53 - "Firebase"
Cohesion: 0.22
Nodes (8): CI Setup, Configure CI runner, Deploy, Firebase, Gitlab.com, Map a custom domain to a Firebase project, Reference links, Setup

### Community 54 - "Matt Pocock - Skills for Real Engineers"
Cohesion: 0.22
Nodes (8): Engineering Skills, Installation, Matt Pocock - Skills for Real Engineers, Model-invoked, Model-invoked, Productivity Skills, User-invoked, User-invoked

### Community 55 - "Phase 16: The YouTube Video Experiment"
Cohesion: 0.25
Nodes (8): Open Points, Phase 16: The YouTube Video Experiment, The Iterations (and the honest glitches), The Process, The Prompt, The Result, The Toolchain, The Verdict

### Community 56 - "makezurich-pakman.md"
Cohesion: 0.25
Nodes (7): Challenge, Hacking the Miromico SOS Button, Idea, Source code, Team members, Used Hardware, What we hacked together

### Community 57 - "nina-w102-minimal-breakout.md"
Cohesion: 0.25
Nodes (7): BOM, Making of, PCB Layout, Pinout, Schematics, Sources, Team contributions

### Community 58 - "Development Workflow"
Cohesion: 0.29
Nodes (7): Adding a Blog Post, Adding a New Content Type, Build and Deployment, DevContainer, Development Workflow, Project Structure, Running Locally

### Community 59 - "Phase 19: A New Voice — The Wiki Graph Short with Voicebox TTS"
Cohesion: 0.29
Nodes (7): Assembly and Verification, Capturing the Graph (Playwright changed the rules), Known Issues, Phase 19: A New Voice — The Wiki Graph Short with Voicebox TTS, The Script (approved, then reality-checked), The Verdict, Why Voicebox

### Community 60 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 61 - "Phase 10: Easter Eggs"
Cohesion: 0.33
Nodes (6): Backstage.io Brick Breaker, Phase 10: Easter Eggs, The 404 Page, The 💩 Page (`/💩/`), The π Page (`/π/`), Yoda Source Code Hologram

### Community 62 - "enabling-offline-usage-hugo-pwa.md"
Cohesion: 0.33
Nodes (5): Adding initializer to template, Basic tools I used, Gulp build file, Other resources, Results

### Community 63 - "DevContainer — racic.ch with opencode"
Cohesion: 0.40
Nodes (4): DevContainer — racic.ch with opencode, Resuming THIS session inside the container, Versions, What is shared with the host

### Community 64 - "Phase 15: Migration Leftover Fixes and a Reusable Report Target"
Cohesion: 0.40
Nodes (5): A Reusable Migration-Report npm Target, Phase 15: Migration Leftover Fixes and a Reusable Report Target, The `{{< figure >}}` Leftover in the Badge Article, The Migration Report as a Permanent Archive, The `{{< ref >}}` Leftover in the MoBiFloC Article

### Community 65 - "Phase 14: Accessibility, Scaffolding, and Test Hardening"
Cohesion: 0.40
Nodes (5): Accessibility & Readability Pass, Flaky Test Hunt, Fresh Migration Report, Phase 14: Accessibility, Scaffolding, and Test Hardening, Scaffold Commands for New Content

### Community 66 - "Phase 13: Content Polish — Tags, Wide Hero Images, and Bookmark Cleanup"
Cohesion: 0.40
Nodes (5): Bookmark Cleanup, Phase 13: Content Polish — Tags, Wide Hero Images, and Bookmark Cleanup, Tagging the Whole Site, Test Note, Wide Hero Images

### Community 67 - "Phase 8: Content System Features"
Cohesion: 0.40
Nodes (5): Bookmarks Collection, Category System, Draft Mode, Four Content Collections, Phase 8: Content System Features

### Community 68 - "Phase 12: Content Migration Fixes"
Cohesion: 0.40
Nodes (5): How the Fix Was Verified, Lessons Learned, Phase 12: Content Migration Fixes, The Fix Prompts and Manual Fixes, What Went Wrong in the First Conversion

### Community 69 - "timeline.astro"
Cohesion: 0.80
Nodes (4): check(), onScroll(), reveal(), teardown()

### Community 70 - "stories/"
Cohesion: 0.40
Nodes (4): Commands, Layout, Reuse, stories/

### Community 71 - "Story: The raic.ch Site Walkthrough"
Cohesion: 0.40
Nodes (4): Coverage, Narration (final), Reuse, Story: The raic.ch Site Walkthrough

### Community 72 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 73 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 74 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 75 - "Phase 7: Upgrading to Astro 7"
Cohesion: 0.50
Nodes (4): Breaking Changes Encountered, Build Performance, Mermaid Diagram Fixes, Phase 7: Upgrading to Astro 7

### Community 76 - "Aliexpress"
Cohesion: 0.50
Nodes (3): Aliexpress, Chrome extension, Refunds

### Community 77 - "sensirion-sdp3x-driver.md"
Cohesion: 0.50
Nodes (3): Installation, Sourcecode, Usage example

### Community 80 - "Phase 17: Agent Tooling — AGENTS.md and the YouTube Short Skill"
Cohesion: 0.67
Nodes (3): AGENTS.md, Phase 17: Agent Tooling — AGENTS.md and the YouTube Short Skill, YouTube Short Skill

### Community 81 - "Manual Changes Required"
Cohesion: 0.67
Nodes (3): HTML5 UP Copyright Notice, Manual Changes Required, Other Manual Tasks

## Knowledge Gaps
- **549 isolated node(s):** `LANG_2_TO_3`, `SCRIPTS`, `VOICEBOX_URL`, `REPO`, `STORIES` (+544 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 650 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@jest/globals` connect `@jest/globals` to `pipeline-util.mjs`, `brick-breaker.ts`, `package.json`, `timeline.ts`, `search.ts`, `Base.astro`, `utils.ts`, `wiki-graph.test.ts`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `esbuild` connect `build-brickbreaker.js` to `package.json`, `build-sw.js`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `effectiveUpdatedDate()` connect `utils.ts` to `pipeline-util.mjs`, `timeline.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `LANG_2_TO_3`, `SCRIPTS`, `VOICEBOX_URL` to the rest of the system?**
  _549 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `pipeline-util.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09783183500793231 - nodes in this community are weakly interconnected._
- **Should `brick-breaker.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05660377358490566 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._