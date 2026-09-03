# DevContainer for racic.ch — Astro 7 on Node 24 + opencode with host-session sharing.
#
# This image intentionally runs opencode pinned to the SAME version as the host
# (1.18.21) so that the host and container read/write the same SQLite session
# store without a schema mismatch. See .devcontainer/devcontainer.json for the
# bind mounts that share ~/.local/share/opencode and ~/.config/opencode with the
# host, which is what lets you resume THIS session from inside the container.
#
# Node is upgraded to the current LTS track (Node 24) so the container builds
# with a newer runtime than the site's baseline Node 22.

FROM node:24-bookworm

# Base tooling for building/running the site and its toolchain.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        curl \
        ca-certificates \
        python3 \
        make \
        g++ \
        ripgrep \
    && rm -rf /var/lib/apt/lists/*

# opencode, pinned to the host's version. npm global install puts the `opencode`
# binary in /usr/local/bin so it stays on PATH for every user.
RUN npm install -g opencode-ai@1.18.21

# Playwright browsers at build time so `npm run test:e2e` works in the container
# without a first-run download. Pin to the project's Playwright major.
RUN npx --yes playwright@1.62.1 install --with-deps chromium

# Reuse the base image's `node` user (uid/gid 1000) — the same uid that owns the
# host's opencode data dirs, which are bind-mounted below. Pre-create the mount
# targets as `node` (not root) so the bind mounts stay writable after attach.
RUN mkdir -p /home/node/.local/share/opencode \
             /home/node/.config/opencode \
             /home/node/.cache/ms-playwright \
 && chown -R node:node /home/node

ENV OPENCODE_DISABLE_AUTOUPDATE=1

USER node
WORKDIR /workspaces/racic.ch-portfolio-blog
