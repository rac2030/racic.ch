# DevContainer — racic.ch with opencode

This container provides a **Node 24** + Astro 7 toolchain (upgraded from the
site's baseline Node 22) and a pinned opencode install, wired so that opencode
inside the container shares the same session store, credentials, configuration,
and skills as opencode on the host.

## What is shared with the host

The following host directories are bind-mounted into the container (read-write)
so both sides see the exact same data. The container runs as `node` (uid/gid
1000), matching the uid that owns these directories on the host.

| Host path | Container path | Contents |
|---|---|---|
| `~/.local/share/opencode` | `/home/node/.local/share/opencode` | **Sessions (SQLite), auth/API keys, snapshots, repos** |
| `~/.config/opencode` | `/home/node/.config/opencode` | Global opencode config |
| `~/.cache/ms-playwright` | `/home/node/.cache/ms-playwright` | Playwright browsers (no re-download) |

> Because both sides use the same `opencode.db`, only keep one actively writing
> session open at a time between the host and the container. Reading/resuming is
> always safe.

## Resuming THIS session inside the container

The session you already have on the host lives in the shared `opencode.db`, so
inside the container you can pick it straight back up:

```bash
# continue the most recent session
opencode --continue

# or target this exact session by id
opencode --session <sessionId>
```

The project-level config (`.opencode/plugin/update-build-log.ts`) is part of the
repo, so it is active in the container too.

## Versions

- **Node 24** (`node:24-bookworm`) — the container build runs on the current
  Node LTS track, a step above the host's Node 22. `npm run build` and
  `npm run test:unit`/`npm run test:e2e` are the same commands as on the host.
- **opencode-ai pinned** to `1.18.21` (the host's version) to avoid a
  session-store schema mismatch. If you upgrade either side, keep them in sync:

```bash
npm install -g opencode-ai@<host.version>
```
