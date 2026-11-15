import { useEffect, useRef, useState } from 'react';
import { commandNames, cycleCommand, formatGitLog, helpCommands, runCommand } from '../lib/commands';
import { projects } from '../data/site';
import { fetchActivity, repoSlug, timeAgo, type Activity } from '../lib/github';

// Output lines starting with "  • " get a hanging indent so wrapped bullets line up.
function Out({ text }: { text: string }) {
  return <div className="out">{text.split('\n').map((ln, i) =>
    ln.startsWith('  • ') ? <div key={i} className="bul">{ln.slice(2)}</div> : <div key={i}>{ln || '\u00a0'}</div>)}</div>;
}

async function gitLog(): Promise<string> {
  let data: Activity = {};
  try { // reuse what the Projects section already fetched
    const cached = JSON.parse(sessionStorage.getItem('gh-activity-v1') || 'null');
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) data = cached.data;
  } catch { /* ignore */ }
  if (!Object.keys(data).length) data = await fetchActivity(projects.map((p) => repoSlug(p.repo)));
  const rows = Object.entries(data).flatMap(([slug, cs]) => cs.slice(0, 2).map((c) => ({
    repo: slug.split('/')[1], sha: c.sha, message: c.message, when: timeAgo(c.date), t: Date.parse(c.date),
  }))).sort((a, b) => b.t - a.t);
  return formatGitLog(rows);
}

type Line = { c: string; o: string };

// The hero: a small interactive shell. Enter runs, Tab completes, Up/Down walk history.
export default function Terminal() {
  const [log, setLog] = useState<Line[]>(() => [{ c: 'whoami', o: runCommand('whoami')!.output }]);
  const [value, setValue] = useState('');
  const [cIdx, setCIdx] = useState<number | null>(null); // position while browsing commands with the arrow keys
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState<string[]>(['whoami']); // command history, survives `clear`

  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [log]);

  // focus the prompt on desktop only (avoids popping the keyboard on phones)
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) input.current?.focus({ preventScroll: true });
  }, []);

  function run(cmd: string) {
    setCIdx(null);
    const res = runCommand(cmd, typed);
    if (!res) return;
    setTyped((t) => [...t, cmd.trim()].slice(-50));
    const a = res.action;
    if (a?.type === 'clear') return setLog([]);
    if (a?.type === 'open') a.url.startsWith('mailto:') ? (location.href = a.url) : window.open(a.url, '_blank', 'noopener');
    if (a?.type === 'scroll') document.getElementById(a.id)?.scrollIntoView({ behavior: 'smooth' });
    if (a?.type === 'pet') window.dispatchEvent(new Event('pet-dog'));
    if (a?.type === 'sip') window.dispatchEvent(new Event('sip-coffee'));
    if (a?.type === 'project') {
      (window as any).__pendingProject = a.id; // in case Projects hasn't hydrated yet
      window.dispatchEvent(new CustomEvent('select-project', { detail: a.id }));
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    }
    const entry = { c: cmd.trim(), o: res.output };
    setLog((l) => [...l, entry].slice(-30));
    if (a?.type === 'gitlog') gitLog().then((o) => setLog((l) => l.map((x) => (x === entry ? { ...x, o } : x))));
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const v = value.trim().toLowerCase();
      if (!v) return;
      const hits = commandNames().filter((n) => n.startsWith(v));
      if (hits.length === 1) setValue(hits[0]);
      else if (hits.length > 1) setLog((l) => [...l, { c: value, o: hits.join('  ') }]);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const i = cycleCommand(cIdx, e.key === 'ArrowDown' ? 1 : -1);
      setCIdx(i);
      setValue(helpCommands[i]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLog([]);
    }
  }

  return (
    <div className="term" role="region" aria-label="Interactive terminal">
      <div className="term-top">
        <span>guest@asifur-rahman9.github.io: ~</span>
        <span>zsh</span>
      </div>
      <div className="term-body" ref={body} aria-live="polite" onClick={() => input.current?.focus({ preventScroll: true })}>
        {log.map((l, i) => (
          <div key={i}>
            {l.c && <div><span className="acc">$</span> <span className="cmd">{l.c}</span></div>}
            <Out text={l.o} />
          </div>
        ))}
        <form className="prompt" onSubmit={(e) => { e.preventDefault(); run(value); setValue(''); }}>
          <span className="acc">$</span>
          <input
            ref={input}
            value={value}
            onChange={(e) => { setValue(e.target.value); setCIdx(null); }}
            onKeyDown={onKey}
            aria-label="Type a command"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder="type a command, or help"
          />
        </form>
      </div>
    </div>
  );
}
