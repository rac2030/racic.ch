import { describe, test, expect } from '@jest/globals';
import { stripHtml } from '../../src/utils/stripHtml';

describe('stripHtml', () => {
  test('strips HTML tags', () => {
    expect(stripHtml('<p>hello</p>')).toBe('hello');
  });

  test('strips nested HTML tags', () => {
    expect(stripHtml('<div><span>hello</span> <b>world</b></div>')).toBe('hello world');
  });

  test('strips code blocks', () => {
    expect(stripHtml('text ```code here``` more')).toBe('text more');
  });

  test('strips inline code', () => {
    expect(stripHtml('use `npm install` to install')).toBe('use to install');
  });

  test('collapses whitespace', () => {
    expect(stripHtml('  hello   world  ')).toBe('hello world');
  });

  test('truncates to 3000 chars', () => {
    const long = 'a'.repeat(5000);
    expect(stripHtml(long).length).toBe(3000);
  });

  test('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  test('handles string with only tags', () => {
    expect(stripHtml('<br><hr><img src="x">')).toBe('');
  });
});
