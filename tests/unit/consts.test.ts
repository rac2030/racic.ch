import { describe, test, expect } from '@jest/globals';
import { SITE, NAV } from '../../src/consts';

describe('SITE config', () => {
  test('has required fields', () => {
    expect(SITE.title).toBe('Michel Racic');
    expect(SITE.description).toBeTruthy();
    expect(SITE.url).toMatch(/^https?:\/\//);
    expect(SITE.author).toBe('Michel Racic');
  });

  test('has social links', () => {
    expect(SITE.social.github).toMatch(/^https:\/\/github\.com\//);
    expect(SITE.social.twitter).toMatch(/^https:\/\/twitter\.com\//);
    expect(SITE.social.linkedin).toMatch(/^https:\/\/.*linkedin\.com\//);
  });
});

describe('NAV config', () => {
  test('has all navigation items', () => {
    const labels = NAV.map((n) => n.label);
    expect(labels).toContain('Home');
    expect(labels).toContain('Blog');
    expect(labels).toContain('Projects');
    expect(labels).toContain('Wiki');
    expect(labels).toContain('Bookmarks');
    expect(labels).toContain('About');
  });

  test('all items have href and label', () => {
    for (const item of NAV) {
      expect(item.href).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.href.startsWith('/')).toBe(true);
    }
  });

  test('home link is root', () => {
    const home = NAV.find((n) => n.label === 'Home');
    expect(home?.href).toBe('/');
  });
});
