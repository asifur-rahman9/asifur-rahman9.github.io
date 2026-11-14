import { useEffect, useRef, useState } from 'react';
import { chips, runCommand } from '../lib/commands';

type Line = { c: string; o: string };

export default function Terminal() {
  const [log, setLog] = useState<Line[]>(() => [{ c: 'whoami', o: runCommand('whoami')!.output }]);
  const [value, setValue] = useState('');
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // keep the newest output in view
  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [log]);

  function run(cmd: string) {
    const res = runCommand(cmd, log.map((l) => l.c));
    if (!res) return;
    const a = res.action;
    if (a?.type === 'clear') return setLog([]);
    if (a?.type === 'open') a.url.startsWith('mailto:') ? (location.href = a.url) : window.open(a.url, '_blank', 'noopener');
    if (a?.type === 'scroll') document.getElementById(a.id)?.scrollIntoView({ behavior: 'smooth' });
    if (a?.type === 'pet') window.dispatchEvent(new Event('pet-dog'));
    setLog((l) => [...l, { c: cmd.trim(), o: res.output }].slice(-12));
  }

  return (
    <div className="term-wrap">
      <div className="term" role="region" aria-label="Interactive terminal">
        <div className="term-top">
          <span className="lights" aria-hidden="true"><i /><i /><i /></span>
          <span>asifur@concordia: ~</span>
          <span>zsh</span>
        </div>
        <div className="term-body" ref={body} aria-live="polite" onClick={() => input.current?.focus({ preventScroll: true })}>
          {log.map((l, i) => (
            <div key={i}>
              <div><span className="acc">$</span> <span className="ink">{l.c}</span></div>
              <div className="out">{l.o}</div>
            </div>
          ))}
          <form
            className="prompt"
            onSubmit={(e) => { e.preventDefault(); run(value); setValue(''); }}
          >
            <span className="acc">$</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-label="Type a command"
              autoComplete="off"
              spellCheck={false}
              placeholder="type a command, or help"
            />
          </form>
        </div>
      </div>
      <div className="chips">
        <span className="mono muted small">try:</span>
        {chips.map((k) => (
          <button key={k} type="button" className="chip" onClick={() => run(k)}>{k}</button>
        ))}
      </div>
    </div>
  );
}
