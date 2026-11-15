// Toolbox as a package.json open in an editor: every dependency shows where it was used.
// Static content (no client JS needed); rows highlight on hover via CSS.
export default function Toolbox({ groups }: { groups: [string, [string, string][]][] }) {
  let n = 2; // line numbers continue through the file
  const total = groups.reduce((k, [, d]) => k + d.length, 0);
  const half = Math.ceil(groups.length / 2);
  const cols = [groups.slice(0, half), groups.slice(half)];

  return (
    <div className="editor mono">
      <div className="editor-top">
        <span className="tab"><i aria-hidden="true" />package.json</span>
        <span className="muted">{total} dependencies</span>
      </div>
      <div className="code">
        <div className="ln-row"><span className="ln">1</span><span><span className="pun">{'{ '}</span><span className="key">"dependencies"</span><span className="pun">{': {'}</span></span></div>
        <div className="code-cols">
          {cols.map((col, ci) => (
            <div key={ci} className="code-col">
              {col.map(([group, deps]) => (
                <div key={group} className="dep-group">
                  <div className="ln-row"><span className="ln">{n++}</span><span className="cm">{`// ${group}`}</span></div>
                  {deps.map(([tool, where], di) => (
                    <div key={tool} className="ln-row dep">
                      <span className="ln">{n++}</span>
                      <span className="dep-line">
                        <span className="key">{`"${tool}"`}</span><span className="pun">: </span>
                        <span className="str">"{where}"</span>{!(ci === cols.length - 1 && group === col[col.length - 1][0] && di === deps.length - 1) && <span className="pun">,</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="ln-row"><span className="ln">{n++}</span><span className="pun">{'} }'}</span></div>
      </div>
    </div>
  );
}
