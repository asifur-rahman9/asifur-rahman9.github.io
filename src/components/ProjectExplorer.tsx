import { useEffect, useState } from 'react';
import type { Project } from '../data/site';
import { fetchActivity, fetchRepos, rawUrl, repoSlug, shortDate, timeAgo, type Activity, type Repos } from '../lib/github';

type Minor = { hash: string; title: string; repo: string };
type Sync = 'build' | 'live' | 'stale';

const CACHE_KEY = 'gh-activity-v1'; // also read by the terminal's `git log`
const REPOS_KEY = 'gh-repos-v1';
const CACHE_MS = 10 * 60 * 1000; // stay well under GitHub's 60 unauthenticated requests/hour

const lastPush = (cs: Activity, slug: string) => Date.parse(cs[slug]?.[0]?.date ?? '') || 0;

/** Oldest push first, newest at the bottom. Repos with no data keep their site.ts order. */
function byPush<T>(items: T[], slugOf: (x: T) => string, cs: Activity): T[] {
  return [...items].sort((a, b) => (lastPush(cs, slugOf(a)) || Infinity) - (lastPush(cs, slugOf(b)) || Infinity));
}

function readCache<T>(key: string): T | null {
  try {
    const c = JSON.parse(sessionStorage.getItem(key) || 'null');
    return c && Date.now() - c.at < CACHE_MS ? c.data : null;
  } catch { return null; }
}
function writeCache(key: string, data: unknown) {
  try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch { /* ignore */ }
}

// Commit-graph project picker. Every project's panel is rendered into the static HTML
// (only the selected one is visible). Commits and repo descriptions ship from the last build,
// then refresh from the GitHub API in the browser so they reflect the latest pushes.
export default function ProjectExplorer({ projects, minor, github, initial, initialRepos }: {
  projects: Project[]; minor: Minor[]; github: string; initial: Activity; initialRepos: Repos;
}) {
  const user = repoSlug(github);
  const slugOf = (p: Project) => repoSlug(p.repo);
  const minorSlug = (m: Minor) => `${user}/${m.repo}`;

  const [activity, setActivity] = useState<Activity>(initial);
  const [repos, setRepos] = useState<Repos>(initialRepos);
  const [sel, setSel] = useState(() => byPush(projects, slugOf, initial)[0].id);
  const [sync, setSync] = useState<Sync>(Object.keys(initial).length ? 'build' : 'stale');
  const [now, setNow] = useState<number | null>(null); // null until mounted: SSR shows absolute dates
  const [shot, setShot] = useState<Record<string, number>>({}); // selected screenshot per project

  useEffect(() => {
    setNow(Date.now());
    const pick = (e: Event) => setSel((e as CustomEvent<string>).detail);
    const pending = (window as any).__pendingProject;
    if (pending && projects.some((p) => p.id === pending)) setSel(pending);
    window.addEventListener('select-project', pick); // from the terminal's `open <name>`
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    const cleanup = () => { clearInterval(tick); window.removeEventListener('select-project', pick); };

    // reuse a recent result from this tab to save rate limit
    const cachedActivity = readCache<Activity>(CACHE_KEY);
    const cachedRepos = readCache<Repos>(REPOS_KEY);
    if (cachedActivity && cachedRepos) {
      setActivity((a) => ({ ...a, ...cachedActivity }));
      setRepos((r) => ({ ...r, ...cachedRepos }));
      setSync('live');
      return cleanup;
    }

    const slugs = [...projects.map(slugOf), ...minor.map(minorSlug)];
    Promise.all([fetchActivity(slugs, undefined, 5), fetchRepos(user)]).then(([data, info]) => {
      if (Object.keys(info).length) { setRepos((r) => ({ ...r, ...info })); writeCache(REPOS_KEY, info); }
      if (!Object.keys(data).length) return; // rate limited or offline: keep build data
      setActivity((a) => ({ ...a, ...data }));
      setSync('live');
      writeCache(CACHE_KEY, data);
    });
    return cleanup;
  }, []);

  const when = (iso: string) => (now ? timeAgo(iso, now) : shortDate(iso));
  const latest = (slug: string) => activity[slug]?.[0];
  const describe = (p: Project) => repos[slugOf(p)]?.description || p.summary;

  return (
    <div className="projects">
      <div className="graph" role="group" aria-label="Choose a project">
        <span className="mono muted small gl"><span className="acc">$</span> git log --graph --oneline</span>
        {sync !== 'stale' && (
          <span className={`sync ${sync}`} aria-live="polite">
            <i aria-hidden="true" />
            {sync === 'live' ? 'live from GitHub' : 'from the last deploy'}
          </span>
        )}
        <span className="rail" aria-hidden="true" />
        <div className="commits">
          {byPush(projects, slugOf, activity).map((p) => {
            const on = p.id === sel, c = latest(slugOf(p));
            return (
              <button key={p.id} type="button" className={`commit ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => setSel(p.id)}>
                <span className="dot" aria-hidden="true"><i /></span>
                <span className="commit-text">
                  <span className="small muted">
                    <span className={on ? 'acc' : ''}>{c?.sha ?? p.hash}</span>{' '}
                    {c ? `pushed ${when(c.date)}` : p.date}
                  </span>
                  <span className="t">{p.title}</span>
                  <span className="s">{describe(p)}</span>
                </span>
              </button>
            );
          })}
        </div>
        <span className="small muted older">older commits</span>
        {byPush(minor, minorSlug, activity).map((m) => {
          const c = latest(minorSlug(m));
          return (
            <a key={m.repo} className="minor" href={c?.url ?? `${github}/${m.repo}`}>
              <span className="dot" aria-hidden="true"><i /></span>
              <span className="minor-text">
                <span><span className="muted">{c?.sha ?? m.hash}</span> {m.title}</span>
                {c && <span className="small muted">{when(c.date)}</span>}
              </span>
            </a>
          );
        })}
      </div>

      {projects.map((p) => {
        const commits = activity[slugOf(p)] ?? [];
        return (
          <article key={p.id} className="detail" hidden={p.id !== sel} aria-labelledby={`p-${p.id}`}>
            <div className="detail-top mono">
              <span>commit {commits[0]?.sha ?? p.hash}</span>
              <span className="badges">{p.badges.map((b) => <span key={b} className="badge">✓ {b}</span>)}</span>
            </div>
            <div className="detail-head">
              <h3 id={`p-${p.id}`}>{p.title}</h3>
              <p className="lead">{describe(p)}</p>
              <div className="tags">{p.stack.map((s) => <span key={s} className="tag">{s}</span>)}</div>
              <a className="repo" href={p.repo}>View code on GitHub ↗</a>
            </div>
            {p.images.length > 0 && (() => {
              const i = Math.min(shot[p.id] ?? 0, p.images.length - 1), img = p.images[i];
              return (
                <>
                  <img className="shot" src={rawUrl(p.repo, img.path)} alt={img.alt} width={1280} height={800} loading="lazy" decoding="async" />
                  {p.images.length > 1 && (
                    <div className="thumbs" role="group" aria-label={`${p.title} screenshots`}>
                      {p.images.map((m, j) => (
                        <button key={m.path} type="button" className={j === i ? 'on' : ''} aria-pressed={j === i}
                          aria-label={m.alt} onClick={() => setShot((s) => ({ ...s, [p.id]: j }))}>
                          <img src={rawUrl(p.repo, m.path)} alt="" width={96} height={60} loading="lazy" decoding="async" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
            <div className="detail-body">
              <dl className="metrics">
                {p.metrics.map((m) => (
                  <div key={m.label}><dt>{m.value}</dt><dd>{m.label}</dd></div>
                ))}
              </dl>
              <p>{p.body}</p>
              {p.part && <p className="part"><b>My part: </b>{p.part}</p>}
              {commits.length > 0 && (
                <div className="recent">
                  <span className="recent-h">Recent commits</span>
                  <ol>
                    {commits.map((c) => (
                      <li key={c.sha}>
                        <a className="mono" href={c.url}>{c.sha}</a>
                        <span className="msg">{c.message}</span>
                        <time className="mono" dateTime={c.date}>{when(c.date)}</time>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
