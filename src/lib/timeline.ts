import { effectiveUpdatedDate, stripMdExtension } from './utils';

export interface GitCommit {
  hash: string;
  date: string;
  message: string;
  url: string;
}

export interface GitLogEntry {
  lastCommitDate: string;
  commits: GitCommit[];
}

export type GitLog = Record<string, GitLogEntry>;

export const TIMELINE_SECTIONS = ['Blog', 'Projects', 'Wiki'] as const;
export type TimelineSection = (typeof TIMELINE_SECTIONS)[number];

export const TIMELINE_EXCLUDED_KEYS: string[] = ['blog/building-this-site-with-ai'];

export interface TimelineSourceItem {
  section: TimelineSection;
  id: string;
  title: string;
  description: string;
  url: string;
  pubDate: Date;
  updatedDate?: Date;
}

export interface TimelineEvent {
  title: string;
  description: string;
  url: string;
  section: TimelineSection;
  date: Date;
  commitMessage: string;
  commitUrl: string;
  commitHash: string;
  hasGitHistory: boolean;
}

export function timelineKey(collection: string, id: string): string {
  return `${collection}/${stripMdExtension(id)}`;
}

export function isTimelineExcluded(key: string): boolean {
  return TIMELINE_EXCLUDED_KEYS.includes(key);
}

export function expandGitCommits(
  item: TimelineSourceItem,
  gitLog: GitLog,
): TimelineEvent[] {
  const key = timelineKey(item.section.toLowerCase(), item.id);
  if (isTimelineExcluded(key)) return [];
  const entry = gitLog[key];

  if (!entry || !Array.isArray(entry.commits) || entry.commits.length === 0) {
    return [
      {
        title: item.title,
        description: item.description,
        url: item.url,
        section: item.section,
        date: effectiveUpdatedDate(item.pubDate, item.updatedDate, undefined),
        commitMessage: '',
        commitUrl: '',
        commitHash: '',
        hasGitHistory: false,
      },
    ];
  }

  return entry.commits.map((commit) => ({
    title: item.title,
    description: item.description,
    url: item.url,
    section: item.section,
    date: new Date(commit.date),
    commitMessage: commit.message,
    commitUrl: commit.url,
    commitHash: commit.hash,
    hasGitHistory: true,
  }));
}

export function buildTimelineEvents(
  items: TimelineSourceItem[],
  gitLog: GitLog,
): TimelineEvent[] {
  return items
    .flatMap((item) => expandGitCommits(item, gitLog))
    .sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export function shortCommitHash(hash: string | undefined): string {
  return hash ? hash.slice(0, 7) : '';
}