import { useState } from 'react';

// Toolbox rendered as a package.json. Hover or focus a tool to preview where it was used;
// click to pin it. The "used in" line reads like an editor's inline hint.
export default function Toolbox({ groups, usedIn }: { groups: [string, string[]][]; usedIn: Record<string, string> }) {
  const [pinned, setPinned] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const tool = hover ?? pinned;

  return (
    <div className="pkg mono">
      <div className="pkg-top"><span>asifur/package.json</span><span>{groups.reduce((n, [, t]) => n + t.length, 0)} deps</span></div>
      <div className="pkg-body" onMouseLeave={() => setHover(null)}>
        <span className="pun">{'{'}</span>
        {groups.map(([key, items], gi) => (
          <div key={key} className="pkg-row">
            <span className="key">"{key}"</span><span className="pun">: [</span>
            <span className="vals">
              {items.map((t, i) => (
                <span key={t}>
                  <button
                    type="button"
                    className={`str ${t === pinned ? 'on' : ''}`}
                    aria-pressed={t === pinned}
                    onMouseEnter={() => setHover(t)}
                    onFocus={() => setHover(t)}
                    onBlur={() => setHover(null)}
                    onClick={() => setPinned(pinned === t ? null : t)}
                  >"{t}"</button>
                  {i < items.length - 1 && <span className="pun">, </span>}
                </span>
              ))}
            </span>
            <span className="pun">]{gi < groups.length - 1 ? ',' : ''}</span>
          </div>
        ))}
        <span className="pun">{'}'}</span>
      </div>
      <div className="pkg-hint" aria-live="polite">
        {tool ? <><span className="cm">// {tool}:</span> used in {usedIn[tool] ?? 'ask me about it'}</> : <span className="cm">// hover a dependency to see where I used it</span>}
      </div>
    </div>
  );
}
