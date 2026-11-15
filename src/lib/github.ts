// Recent commits per project repo, from GitHub's public REST API.
// Used twice: at build time (Astro frontmatter, optionally with a token) and in the
// browser on page load, so the page ships with real data and then refreshes it.

export type Commit = { sha: string; message: string; date: string; url: string };
export type Activity = Record<string, Commit[]>; // keyed by "owner/repo"
export type RepoInfo = { description: string; pushedAt: string };
export type Repos = Record<string, RepoInfo>; // keyed by "owner/repo"

const API = 'https://api.github.com';

/** "https://github.com/owner/repo" -> "owner/repo" (or just "owner" for a profile URL) */
export const repoSlug = (url: string) => url.replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');

/** A file in a repo's default branch, served by GitHub (updates when the repo does). */
export const rawUrl = (repo: string, path: string) =>
  `https://raw.githubusercontent.com/${repoSlug(repo)}/HEAD/${path.replace(/^\/+/, '')}`;

/** Keep only what the page needs from the /commits response. */
export function parseCommits(json: unknown, limit = 3): Commit[] {
  if (!Array.isArray(json)) return [];
  return json.slice(0, limit).map((c: any) => ({
    sha: String(c.sha ?? '').slice(0, 7),
    message: String(c.commit?.message ?? '').split('\n')[0].slice(0, 90),
    date: c.commit?.committer?.date ?? c.commit?.author?.date ?? '',
    url: c.html_url ?? '',
  })).filter((c) => c.sha && c.date);
}

const headersFor = (token?: string) => {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

/** Keep only the description and last push of each repo from /users/:user/repos. */
export function parseRepos(json: unknown): Repos {
  if (!Array.isArray(json)) return {};
  const out: Repos = {};
  for (const r of json as any[]) {
    if (r?.full_name) out[r.full_name] = { description: String(r.description ?? '').trim(), pushedAt: r.pushed_at ?? '' };
  }
  return out;
}

/** Descriptions for every public repo in one request. Empty on failure, never thrown. */
export async function fetchRepos(user: string, token?: string): Promise<Repos> {
  try {
    const res = await fetch(`${API}/users/${user}/repos?per_page=100&sort=pushed`, { headers: headersFor(token) });
    return res.ok ? parseRepos(await res.json()) : {};
  } catch { return {}; }
}

/** Fetch recent commits for each repo. Failed repos are left out, never thrown. */
export async function fetchActivity(slugs: string[], token?: string, limit = 3): Promise<Activity> {
  const headers = headersFor(token);
  const out: Activity = {};
  await Promise.all(slugs.map(async (slug) => {
    try {
      const res = await fetch(`${API}/repos/${slug}/commits?per_page=${limit}`, { headers });
      if (!res.ok) return;
      const commits = parseCommits(await res.json(), limit);
      if (commits.length) out[slug] = commits;
    } catch { /* offline or rate limited: keep build-time data */ }
  }));
  return out;
}

/** "just now", "5 min ago", "3 hours ago", "2 days ago", then a short date. */
export function timeAgo(iso: string, now = Date.now()): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
  return shortDate(iso);
}

/** Stable, timezone-independent date for server-rendered HTML (avoids hydration mismatch). */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
