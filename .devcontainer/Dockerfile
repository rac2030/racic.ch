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
        ffmpeg \
        python3-venv \
        python3-pip \
        espeak-ng \
    && rm -rf /var/lib/apt/lists/*

# Media & TTS support for the youtube-short skill (.agents/skills/youtube-short):
# - ffmpeg: narration processing (silencetrim/atempo), per-segment encodes, concat + mux
# - python3-venv + python3-pip: build the local Voicebox TTS backend from source at runtime
# - espeak-ng: the skill's last-resort fallback voice (Piper is fetched separately if needed)
# Kept OUT of the image on purpose: the Voicebox repo clone, its venv deps (~2GB torch),
# and the ~1.2GB Qwen model cache are installed lazily at runtime into /tmp/voicebox and
# ~/.cache/huggingface — see the "Running the Voicebox server" section of the skill.

# opencode, pinned to the host's version. npm global install puts the `opencode`
# binary in /usr/local/bin so it stays on PATH for every user.
RUN npm install -g opencode-ai@1.18.21

# graphify knowledge graph CLI (https://github.com/Graphify-Labs/graphify).
# uv is the recommended installer; the `graphify` command lands in
# /home/node/.local/bin so it stays on PATH for the `node` user. HOME is
# redirected because the RUN shell runs as root (default uv home is /root).
# Rebuilt with the `mcp` extra so the graph.json can be served to opencode as
# a local MCP stdio server (.opencode/opencode.json "mcp.graphify").
RUN HOME=/home/node curl -LsSf https://astral.sh/uv/install.sh | sh && \
    HOME=/home/node /home/node/.local/bin/uv tool install "graphifyy[mcp]" && \
    chown -R node:node /home/node/.local

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
