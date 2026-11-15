import { useEffect, useState } from 'react';
import type { Project } from '../data/site';
import { fetchActivity, repoSlug, shortDate, timeAgo, type Activity } from '../lib/github';

type Minor = { hash: string; title: string; repo: string };
type Sync = 'build' | 'live' | 'stale';

const CACHE_KEY = 'gh-activity-v1';
const CACHE_MS = 10 * 60 * 1000; // stay well under GitHub's 60 unauthenticated requests/hour

// Commit-graph project picker. Every project's panel is rendered into the static HTML
// (only the selected one is visible). Commit data ships from the last build, then
// refreshes from the GitHub API in the browser so it reflects the latest pushes.
export default function ProjectExplorer({ projects, minor, github, initial }: {
  projects: Project[]; minor: Minor[]; github: string; initial: Activity;
}) {
  const [sel, setSel] = useState(projects[0].id);
  const [activity, setActivity] = useState<Activity>(initial);
  const [sync, setSync] = useState<Sync>(Object.keys(initial).length ? 'build' : 'stale');
  const [now, setNow] = useState<number | null>(null); // null until mounted: SSR shows absolute dates

  useEffect(() => {
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    const slugs = projects.map((p) => repoSlug(p.repo));

    // reuse a recent result from this tab to save rate limit
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.at < CACHE_MS) {
        setActivity((a) => ({ ...a, ...cached.data }));
        setSync('live');
        return () => clearInterval(tick);
      }
    } catch { /* storage unavailable */ }

    fetchActivity(slugs).then((data) => {
      if (!Object.keys(data).length) return; // rate limited or offline: keep build data
      setActivity((a) => ({ ...a, ...data }));
      setSync('live');
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })); } catch { /* ignore */ }
    });
    return () => clearInterval(tick);
  }, []);

  const when = (iso: string) => (now ? timeAgo(iso, now) : shortDate(iso));
  const latest = (p: Project) => activity[repoSlug(p.repo)]?.[0];

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
          {projects.map((p) => {
            const on = p.id === sel, c = latest(p);
            return (
              <button key={p.id} type="button" className={`commit ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => setSel(p.id)}>
                <span className="dot" aria-hidden="true"><i /></span>
                <span className="commit-text">
                  <span className="small muted">
                    <span className={on ? 'acc' : ''}>{c?.sha ?? p.hash}</span>{' '}
                    {c ? `pushed ${when(c.date)}` : p.date}
                  </span>
                  <span className="t">{p.title}</span>
                  <span className="s">{p.summary}</span>
                </span>
              </button>
            );
          })}
        </div>
        <span className="small muted older">older commits</span>
        {minor.map((m) => (
          <a key={m.hash} className="minor" href={`${github}/${m.repo}`}>
            <span className="dot" aria-hidden="true"><i /></span>
            <span><span className="muted">{m.hash}</span> {m.title}</span>
          </a>
        ))}
      </div>

      {projects.map((p) => {
        const commits = activity[repoSlug(p.repo)] ?? [];
        return (
          <article key={p.id} className="detail" hidden={p.id !== sel} aria-labelledby={`p-${p.id}`}>
            <div className="detail-top mono">
              <span>commit {commits[0]?.sha ?? p.hash}</span>
              <span className="badges">{p.badges.map((b) => <span key={b} className="badge">✓ {b}</span>)}</span>
            </div>
            <img className="shot" src={p.image} alt={p.imageAlt} width={1200} height={700} loading="lazy" decoding="async" />
            <div className="detail-body">
              <h3 id={`p-${p.id}`}>{p.title}</h3>
              <dl className="metrics">
                {p.metrics.map((m) => (
                  <div key={m.label}><dt>{m.value}</dt><dd>{m.label}</dd></div>
                ))}
              </dl>
              <p>{p.body}</p>
              {p.part && <p className="part"><b>My part: </b>{p.part}</p>}
              <div className="tags">{p.stack.map((s) => <span key={s} className="tag">{s}</span>)}</div>
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
              <a className="repo" href={p.repo}>View code on GitHub ↗</a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
