import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { stripHtml } from '../utils/stripHtml';

export const prerender = true;

interface SearchEntry {
  title: string;
  description: string;
  tags: string[];
  url: string;
  section: string;
  date: string;
  body: string;
}

export const GET: APIRoute = async () => {
  const isProd = import.meta.env.MODE === 'production';
  const entries: SearchEntry[] = [];

  const blog = (await getCollection('blog')).filter((p) => isProd ? !p.data.draft : true);
  for (const post of blog) {
    entries.push({
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags,
      url: `/blog/${post.id.replace(/\.md$/, '')}`,
      section: 'Blog',
      date: post.data.pubDate.toISOString(),
      body: stripHtml(post.body ?? ''),
    });
  }

  const projects = (await getCollection('projects')).filter((p) => isProd ? !p.data.draft : true);
  for (const project of projects) {
    entries.push({
      title: project.data.title,
      description: project.data.description,
      tags: project.data.tags,
      url: `/projects/${project.id.replace(/\.md$/, '')}`,
      section: 'Projects',
      date: project.data.pubDate.toISOString(),
      body: stripHtml(project.body ?? ''),
    });
  }

  const wiki = (await getCollection('wiki')).filter((e) => isProd ? !e.data.draft : true);
  for (const entry of wiki) {
    entries.push({
      title: entry.data.title,
      description: entry.data.description,
      tags: entry.data.tags,
      url: `/wiki/${entry.id.replace(/\.md$/, '')}`,
      section: 'Wiki',
      date: entry.data.pubDate?.toISOString() ?? '',
      body: stripHtml(entry.body ?? ''),
    });
  }

  const bookmarks = (await getCollection('bookmarks')).filter((e) => isProd ? !e.data.draft : true);
  for (const entry of bookmarks) {
    entries.push({
      title: entry.data.title,
      description: entry.data.description,
      tags: entry.data.tags,
      url: `/bookmarks/${entry.id.replace(/\.md$/, '')}`,
      section: 'Bookmarks',
      date: entry.data.pubDate?.toISOString() ?? '',
      body: stripHtml(entry.body ?? ''),
    });
  }

  // Also add static pages
  entries.push(
    { title: 'Home', description: 'Michel Racic — Software Engineer, Automation Specialist', tags: [], url: '/', section: 'Page', date: '', body: '' },
    { title: 'About', description: 'About Michel Racic', tags: [], url: '/about', section: 'Page', date: '', body: '' },
    { title: 'Blog', description: 'Blog listing', tags: [], url: '/blog', section: 'Page', date: '', body: '' },
    { title: 'Projects', description: 'Projects listing', tags: [], url: '/projects', section: 'Page', date: '', body: '' },
    { title: 'Wiki', description: 'Wiki listing', tags: [], url: '/wiki', section: 'Page', date: '', body: '' },
    { title: 'Tags', description: 'All tags', tags: [], url: '/tags', section: 'Page', date: '', body: '' },
  );

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};
