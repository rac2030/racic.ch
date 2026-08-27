import type { Plugin } from "@opencode-ai/plugin"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const BLOG_POST = "src/content/blog/building-this-site-with-ai.md"
const SOURCES_HEADING = "## The Sources"
const CHANGELOG_HEADING = "## Development Changelog"
const CHANGELOG_INTRO = "This section is automatically updated by an opencode hook after each file change.\n"

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function summarizeEdit(args: Record<string, unknown>): string {
  const filePath = (args.filePath as string) || ""
  const shortPath = filePath.replace(/^.*?\/(src|tests|scripts|public)\//, "$1/")
  const oldStr = (args.oldString as string) || ""
  const newStr = (args.newString as string) || ""
  if (args.replaceAll) return `replaceAll in \`${shortPath}\``
  if (oldStr && newStr) {
    const firstNewLine = newStr.split("\n")[0]?.trim().slice(0, 60)
    return `edit \`${shortPath}\` — ${firstNewLine}${newStr.split("\n").length > 1 ? "…" : ""}`
  }
  return `edit \`${shortPath}\``
}

function summarizeWrite(args: Record<string, unknown>): string {
  const filePath = (args.filePath as string) || ""
  const shortPath = filePath.replace(/^.*?\/(src|tests|scripts|public|\.opencode)\//, "$1/")
  return `write \`${shortPath}\``
}

function summarizeBash(args: Record<string, unknown>): string {
  const cmd = (args.command as string) || ""
  const short = cmd.length > 70 ? cmd.slice(0, 67) + "…" : cmd
  return `ran \`${short}\``
}

const READ_ONLY_RE = /^(ls|pwd|cat|head|tail|grep|find|echo|which|tree|export|source|cd|env|printenv|type|file)\b/

export default (async ({ project }) => {
  const root = project.path

  return {
    "tool.execute.after": async (input) => {
      const { tool, args } = input as { tool: string; args: Record<string, unknown> }
      if (tool !== "edit" && tool !== "write" && tool !== "bash") return

      let summary: string | null = null

      if (tool === "edit") {
        const filePath = (args.filePath as string) || ""
        if (filePath.includes(BLOG_POST)) return
        if (!filePath) return
        summary = summarizeEdit(args)
      } else if (tool === "write") {
        const filePath = (args.filePath as string) || ""
        if (filePath.includes(BLOG_POST)) return
        if (!filePath) return
        summary = summarizeWrite(args)
      } else if (tool === "bash") {
        const cmd = (args.command as string) || ""
        if (cmd.includes(BLOG_POST)) return
        if (READ_ONLY_RE.test(cmd)) return
        summary = summarizeBash(args)
      }

      if (!summary) return

      const postPath = join(root, BLOG_POST)
      if (!existsSync(postPath)) return

      const content = readFileSync(postPath, "utf-8")
      const date = formatDate()
      const entry = `- **${date}** — ${summary}\n`

      let updated: string
      if (content.includes(CHANGELOG_HEADING)) {
        const idx = content.indexOf(SOURCES_HEADING)
        updated = content.slice(0, idx) + entry + "\n" + content.slice(idx)
      } else {
        const idx = content.indexOf(SOURCES_HEADING)
        const section = `\n${CHANGELOG_HEADING}\n\n${CHANGELOG_INTRO}\n${entry}\n`
        updated = content.slice(0, idx) + section + content.slice(idx)
      }

      writeFileSync(postPath, updated, "utf-8")
    },
  }
}) satisfies Plugin
