import { describe, test, expect } from '@jest/globals';
import { stripHtml } from '../../src/utils/stripHtml';

describe('stripHtml', () => {
  test('strips HTML tags', () => {
    expect(stripHtml('<p>Hello world</p>')).toBe('Hello world');
  });

  test('strips nested HTML tags', () => {
    expect(stripHtml('<div><span>Hello</span> <b>world</b></div>')).toBe('Hello world');
  });

  test('strips code blocks', () => {
    expect(stripHtml('```js\nconst x = 1;\n```')).toBe('');
  });

  test('strips inline code', () => {
    expect(stripHtml('Use `npm install` to install')).toBe('Use to install');
  });

  test('collapses whitespace', () => {
    expect(stripHtml('Hello   world')).toBe('Hello world');
  });

  test('truncates to 3000 chars', () => {
    const long = 'a'.repeat(4000);
    expect(stripHtml(long)).toHaveLength(3000);
  });

  test('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  test('handles string with only tags', () => {
    expect(stripHtml('<br><hr><img src="x">')).toBe('');
  });

  test('preserves text content from links', () => {
    expect(stripHtml('<a href="/url">Click here</a>')).toContain('Click here');
  });

  test('handles multiple paragraphs', () => {
    const result = stripHtml('<p>First</p><p>Second</p>');
    expect(result).toContain('First');
    expect(result).toContain('Second');
  });

  test('handles heading tags', () => {
    expect(stripHtml('<h1>Title</h1>')).toContain('Title');
  });

  test('handles list items', () => {
    expect(stripHtml('<ul><li>Item 1</li><li>Item 2</li></ul>')).toContain('Item 1');
  });
});
