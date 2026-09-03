---
title: "AI Agent Skills"
pubDate: 2026-09-03
description: "Collections of skills & tooling for AI coding agents"
author: "AI-generated"
tags: ["ai", "agents", "skills", "development", "links"]
heroImage: "/images/bookmarks/ai-agent-skills-hero.svg"
---

A curated collection of skills and tooling for working with AI coding agents. More entries to follow.

<!--more-->

## Matt Pocock - Skills for Real Engineers

Matt Pocock's collection of composable skills for AI coding agents. These focus on engineering fundamentals rather than vibe coding - better-aligned, better-tested, and better-structured code.

### Installation

Installed in opencode via the skills installer:

```bash
npx skills@latest add mattpocock/skills
```

This copies the editable skill files straight into the project's `.agents/skills/` so they can be adapted freely.

### Engineering Skills

#### User-invoked

* [ask-matt](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md) - Router that helps pick the right skill or flow
* [grill-with-docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) - Grilling session that builds your project's domain model
* [triage](https://github.com/mattpocock/skills/blob/main/skills/engineering/triage/SKILL.md) - Move issues through a state machine of triage roles
* [improve-codebase-architecture](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md) - Scan a codebase for deepening opportunities with visual HTML report
* [setup-matt-pocock-skills](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md) - Configure repo for the engineering skills
* [to-spec](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md) - Turn a conversation into a spec on the issue tracker
* [to-tickets](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md) - Break plans into tracer-bullet tickets with blocking edges
* [implement](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md) - Build work from specs or tickets, driving TDD and code review
* [wayfinder](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md) - Plan huge chunks of work as a shared map of decision tickets

#### Model-invoked

* [prototype](https://github.com/mattpocock/skills/blob/main/skills/engineering/prototype/SKILL.md) - Build throwaway prototypes for design questions
* [diagnosing-bugs](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md) - Disciplined diagnosis loop for hard bugs and regressions
* [research](https://github.com/mattpocock/skills/blob/main/skills/engineering/research/SKILL.md) - Investigate questions against primary sources, captured as Markdown
* [tdd](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md) - Test-driven development with red-green-refactor
* [domain-modeling](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md) - Build and sharpen a project's domain model
* [codebase-design](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md) - Design deep modules with small interfaces
* [code-review](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md) - Two-axis review: Standards and Spec, run as parallel sub-agents
* [resolving-merge-conflicts](https://github.com/mattpocock/skills/blob/main/skills/engineering/resolving-merge-conflicts/SKILL.md) - Work through git merge conflicts hunk by hunk
* [wizard](https://github.com/mattpocock/skills/blob/main/skills/engineering/wizard/SKILL.md) - Interactive bash wizards for human-only steps

### Productivity Skills

#### User-invoked

* [grill-me](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md) - Relentless interview about a plan or design
* [handoff](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md) - Compact conversations into handoff documents for other agents
* [teach](https://github.com/mattpocock/skills/blob/main/skills/productivity/teach/SKILL.md) - Multi-session skill teaching using the workspace as a classroom
* [to-questionnaire](https://github.com/mattpocock/skills/blob/main/skills/productivity/to-questionnaire/SKILL.md) - Turn decisions into Markdown questionnaires
* [wait-what](https://github.com/mattpocock/skills/blob/main/skills/productivity/wait-what/SKILL.md) - Re-pitch messages that didn't land, with context

#### Model-invoked

* [grilling](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) - The reusable interview primitive behind grill-me, grill-with-docs, triage, and more
* [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md) - Writing documents designed for agents to consume
