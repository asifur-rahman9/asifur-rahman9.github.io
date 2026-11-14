import { useState } from 'react';

// Click a tool to see where it was used.
export default function Toolbox({ groups, usedIn }: { groups: [string, string[]][]; usedIn: Record<string, string> }) {
  const [tool, setTool] = useState<string | null>(null);
  return (
    <div className="tools">
      {groups.map(([name, items]) => (
        <div key={name} className="trow">
          <span className="n">{name}</span>
          <div className="trow-items">
            {items.map((t) => (
              <button key={t} type="button" className={`chip tool ${t === tool ? 'on' : ''}`} aria-pressed={t === tool}
                onClick={() => setTool(tool === t ? null : t)}>{t}</button>
            ))}
          </div>
        </div>
      ))}
      <div className="tout mono" aria-live="polite">
        {tool ? (<><span className="acc">&gt;</span> <span>{tool} → used in {usedIn[tool] ?? 'ask me about it'}</span></>) : '> pick a tool to see where I used it'}
      </div>
    </div>
  );
}
