import { useState } from 'react';
import type { Project } from '../data/site';

type Minor = { hash: string; title: string; repo: string };

// Commit-graph project picker. Every project's detail panel is rendered into
// the static HTML (only the selected one is visible), so crawlers and link
// previews see all projects even before React hydrates.
export default function ProjectExplorer({ projects, minor, github }: { projects: Project[]; minor: Minor[]; github: string }) {
  const [sel, setSel] = useState(projects[0].id);

  return (
    <div className="projects">
      <div className="graph" role="group" aria-label="Choose a project">
        <span className="mono muted small gl"><span className="acc">$</span> git log --graph --oneline</span>
        <span className="rail" aria-hidden="true" />
        <div className="commits">
          {projects.map((p) => {
            const on = p.id === sel;
            return (
              <button key={p.id} type="button" className={`commit ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => setSel(p.id)}>
                <span className="dot" aria-hidden="true"><i /></span>
                <span className="commit-text">
                  <span className="small muted"><span className={on ? 'acc' : ''}>{p.hash}</span> · {p.date}</span>
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

      {projects.map((p) => (
        <article key={p.id} className="detail" hidden={p.id !== sel} aria-labelledby={`p-${p.id}`}>
          <div className="detail-top mono">
            <span>commit {p.hash}</span>
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
            <a className="repo" href={p.repo}>View code on GitHub ↗</a>
          </div>
        </article>
      ))}
    </div>
  );
}
