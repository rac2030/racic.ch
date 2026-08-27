---
title: "Backstage"
pubDate: 2026-08-28
description: "Backstage is an open source framework for building internal developer portals (IDPs), originally created by Spotify and now a CNCF project."
tags: ["platform-engineering", "developer-portal", "backstage", "spotify", "CNCF"]
category: "platform-engineering"
heroImage: "/images/wiki/backstage-hero.png"
aliases: ["/wiki/Backstage-Portal"]
---
> **This post was written entirely by an AI assistant.**

Backstage is an open source framework for building internal developer portals (IDPs). Created by Spotify and donated to the Cloud Native Computing Foundation (CNCF), it provides a unified developer experience — a single place to manage services, tooling, documentation, and golden paths across an organization.

<!--more-->

## What is Backstage?

Backstage is a customizable, plugin-based framework that lets organizations build their own internal developer portal. It provides:

- **Software Catalog** — A centralized registry of all software components, APIs, documentation, and infrastructure. Every service, library, and resource is discoverable with ownership metadata.
- **Software Templates** — Golden path templates for scaffolding new services, libraries, CI/CD pipelines, and more. Templates enforce organizational standards while reducing setup time from days to minutes.
- **TechDocs** — A docs-like-code solution that generates, hosts, and serves technical documentation alongside the code it documents.
- **Plugin Ecosystem** — Over 255 open source plugins extending Backstage with integrations for Kubernetes, GitHub, GitLab, PagerDuty, Argo CD, Grafana, and hundreds of other tools.
- **Search** — Unified search across all catalog entities, documentation, and plugins.

Organizations use Backstage to reduce cognitive load, enforce standards, and give developers a single pane of glass for their entire software ecosystem.

## History

### The Spreadsheet Era (2014–2016)

Backstage began as an internal tool at Spotify. As Spotify scaled to thousands of engineers and tens of thousands of microservices, teams relied on spreadsheets to map service dependencies and ownership. Engineers duplicated capabilities because they couldn't see what already existed. The need for a centralized software catalog became critical.

### System-Z is Born (2016–2017)

A newly formed "Tools" squad at Spotify began building a "developer portal" for authoring and managing backend services end-to-end. The project was codenamed **System-Z**. It went beyond a simple catalog model — it aimed to be a complete platform for the software development lifecycle.

### Backstage is Named (2017–2019)

System-Z officially became **Backstage**. One central place for all software components, resources, tools, docs, processes, and best practices. Teams started building plugins instead of spreadsheets. By 2019, Backstage was the primary developer portal used by all of Spotify's R&D squads.

### Open Source Launch (March 16, 2020)

Spotify open sourced Backstage on March 16, 2020. The term "internal developer portal" didn't even exist yet — Backstage helped define the category. The project gained immediate traction, with strong community engagement from day one.

Spotify's strategy was deliberate: by making Backstage the industry standard, they could amortize development costs across the community and benefit from external contributions.

### CNCF Incubating Project (March 2022)

Backstage was accepted into the CNCF as an incubating project on March 15, 2022 (originally accepted September 2020). This cemented its position as the leading open source IDP framework within the cloud native ecosystem.

### Spotify Plugins for Backstage (2023–2024)

Spotify launched a commercial bundle of premium plugins — Soundcheck, Tech Insights, Skill Exchange, and others — providing enterprise features on top of the open source core. This allowed organizations to go faster without building everything from scratch.

### Spotify Portal Goes GA (October 2025)

**Spotify Portal** — Backstage as a SaaS offering — became generally available in October 2025. Portal is a fully managed, enterprise-ready IDP that handles infrastructure, security, upgrades, and observability so teams can focus on developer experience rather than operations.

Key GA features included SOC 2 compliance, Catalog Wizard, Scaffolder Workflows, Portal Plugin Studio, Soundcheck Tech Insights, and the AI Knowledge Assistant (AiKA).

### The Five-Year Milestone (March 2025)

By March 2025, Backstage had grown to over 3,000 adopters. CNCF released the documentary "Backstage: From Spreadsheet to Standard" at KubeCon EU 2026, tracing the project's evolution from an internal Spotify tool to a global standard for platform engineering.

## Current State (2026)

As of 2026, Backstage has:

- **4,000+ adopters** worldwide
- **32,900+ GitHub stars**
- **255+ open source plugins** in the community repository
- **85+ active contributors** to the community plugins repo
- **190+ plugin packages** across ~100 workspaces
- Ranked **6th** in CNCF project velocity out of 230+ projects

### Key Features in 2026

**New Front-End System** — The new front-end system reached 1.0 release candidate status. It features subpages as configurable extensions, built-in permission and feature flag support, and a compact plugin header. Old front-end system support will end by late 2026.

**Client Identity Metadata Documents (CIMD)** — Replaces static tokens for CLI and MCP client authentication with a standard OAuth flow. Offline access scopes and refresh tokens allow sessions to continue without user interruption.

**Actions Registry** — Exposes plugin actions over HTTP so any client (CLI, MCP server, AI agent) can call them directly. Includes catalog query actions, scaffolder actions, and a "who am I" action.

**Catalog Model Extension API** — Targeting release 1.50, this API lets plugins declare annotations, custom fields, and new kinds with JSON schema, descriptions, and examples — making the catalog machine-readable for both humans and LLMs.

**AI Context Kind** — A new catalog kind for storing AI skills in the catalog for governance and discoverability, with prompts planned as a follow-on.

## Spotify Portal for Backstage

Spotify Portal is the commercial SaaS version of Backstage. It provides:

- **Fully managed infrastructure** — No need to provision, secure, monitor, or upgrade Backstage instances.
- **Enterprise security** — SOC 2 compliance, RBAC, audit logs, Portal Connect for secure access to private infrastructure.
- **Premium plugins** — AiKA (AI Knowledge Assistant), Soundcheck (engineering quality checks), Data Experience, Confidence (experimentation platform), Skill Exchange, and Insights.
- **Automated lifecycle** — Instance provisioning, upgrades, and decommissions handled via Scaffolder workflows and Terraform.
- **99.5% SLA** with enterprise-grade observability out of the box.

AiKA, the AI Knowledge Assistant, reduced internal support requests at Spotify by 47% by consolidating organizational knowledge into a context-specific AI assistant.

## Roadmap

### Near-Term (2026)

- **Front-End System 1.0 GA** — Full release of the new front-end system, with old system support phased out by end of 2026.
- **Catalog Model Extensions (v1.50)** — Machine-readable annotations and custom fields for better LLM integration.
- **Scaffolder CLI MVP** — Manage software templates directly from the command line.
- **MCP Server Improvements** — Deeper integration with AI agents (Claude, Cursor, AiKA) via Model Context Protocol.
- **Confidence Integration** — Full-featured experimentation platform (feature flags, A/B tests, rollouts) built into Portal.

### Medium-Term (2026–2027)

- **AI-Native Workflows** — Agent-assisted migration skills, AI-driven catalog management, and intelligent golden path recommendations.
- **Enhanced Observability** — DevEx metrics dashboard with DORA metrics and AI productivity insights.
- **Real-Time Catalog Updates** — Webhook-driven catalog synchronization for instant visibility into changes.
- **Expanded Plugin Ecosystem** — Continued growth of the community plugins repository with better discovery and governance.

### Long-Term Vision

- Backstage as the **de facto standard** for internal developer portals, with Portal as the premier managed solution.
- **AI-first developer experience** — Agents that understand your entire software catalog and can autonomously manage, query, and improve it.
- **Platform engineering maturity** — Backstage as the foundation for organizational standards, compliance, and developer productivity measurement.

## Resources

- [Backstage.io](https://backstage.io) — Official documentation and getting started guide
- [Spotify Portal](https://backstage.spotify.com) — Commercial SaaS offering
- [CNCF Backstage](https://www.cncf.io/projects/backstage/) — CNCF project page
- [Backstage GitHub](https://github.com/backstage/backstage) — Source code and community
- [Backstage Community Plugins](https://github.com/backstage/community-plugins) — 255+ community plugins
- [Backstage: From Spreadsheet to Standard](https://www.cncf.io/announcements/2026/03/25/cncf-backstage-documentary-highlights-project-evolution-from-development-to-global-open-source-standard-for-platform-engineering/) — CNCF documentary (2026)
