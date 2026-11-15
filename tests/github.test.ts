import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchActivity, fetchRepos, parseCommits, parseRepos, rawUrl, repoSlug, shortDate, timeAgo } from '../src/lib/github';

const raw = [
  { sha: 'abcdef1234567', html_url: 'https://github.com/o/r/commit/abcdef1', commit: { message: 'feat: add risk board\n\nlong body', committer: { date: '2026-11-14T20:00:00Z' } } },
  { sha: '1234567abcdef', html_url: 'u2', commit: { message: 'fix: typo', author: { date: '2026-11-13T20:00:00Z' } } },
];

describe('github helpers', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('extracts owner/repo from a GitHub URL', () => {
    expect(repoSlug('https://github.com/asifur-rahman9/hammerfall-grove')).toBe('asifur-rahman9/hammerfall-grove');
  });

  it('keeps short sha, first message line, date and url', () => {
    expect(parseCommits(raw)[0]).toEqual({ sha: 'abcdef1', message: 'feat: add risk board', date: '2026-11-14T20:00:00Z', url: 'https://github.com/o/r/commit/abcdef1' });
    expect(parseCommits(raw)[1].date).toBe('2026-11-13T20:00:00Z'); // falls back to author date
  });

  it('ignores non-array responses such as rate-limit errors', () => {
    expect(parseCommits({ message: 'API rate limit exceeded' })).toEqual([]);
  });

  it('formats relative times', () => {
    const now = Date.parse('2026-11-14T21:00:00Z');
    expect(timeAgo('2026-11-14T20:59:30Z', now)).toBe('just now');
    expect(timeAgo('2026-11-14T20:55:00Z', now)).toBe('5 min ago');
    expect(timeAgo('2026-11-14T20:00:00Z', now)).toBe('1 hour ago');
    expect(timeAgo('2026-11-12T21:00:00Z', now)).toBe('2 days ago');
    expect(timeAgo('2026-08-01T00:00:00Z', now)).toBe('Aug 1, 2026');
  });

  it('formats short dates in UTC', () => {
    expect(shortDate('2026-11-14T23:30:00Z')).toBe('Nov 14, 2026');
  });

  it('skips repos that fail instead of throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) =>
      url.includes('good') ? new Response(JSON.stringify(raw)) : new Response('nope', { status: 403 })));
    const out = await fetchActivity(['o/good', 'o/bad'], 'token');
    expect(Object.keys(out)).toEqual(['o/good']);
    expect(out['o/good']).toHaveLength(2);
  });

  it('keeps each repo description and last push, keyed by full name', () => {
    const repos = parseRepos([
      { full_name: 'o/a', description: ' Booking app ', pushed_at: '2026-11-15T09:00:00Z' },
      { full_name: 'o/b', description: null, pushed_at: '2026-11-01T00:00:00Z' },
    ]);
    expect(repos['o/a']).toEqual({ description: 'Booking app', pushedAt: '2026-11-15T09:00:00Z' });
    expect(repos['o/b'].description).toBe('');
    expect(parseRepos({ message: 'API rate limit exceeded' })).toEqual({});
  });

  it('returns no repos instead of throwing when GitHub is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    expect(await fetchRepos('o')).toEqual({});
  });

  it('builds raw file URLs on the default branch', () => {
    expect(rawUrl('https://github.com/o/r', 'docs/media/a.jpg')).toBe('https://raw.githubusercontent.com/o/r/HEAD/docs/media/a.jpg');
    expect(rawUrl('https://github.com/o/r/', '/docs/a.png')).toBe('https://raw.githubusercontent.com/o/r/HEAD/docs/a.png');
  });
});
