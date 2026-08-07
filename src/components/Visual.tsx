import { useState } from "react";
import type { Tone, Visual as V } from "../types";

function Detail({ title, body, tone }: { title: string; body: string; tone?: Tone }) {
  return (
    <div className={`detail ${tone && tone !== "neutral" ? tone : ""}`}>
      <b>{title}</b>
      {body}
    </div>
  );
}

function Frame({ caption, children }: { caption?: string; children: React.ReactNode }) {
  return (
    <div className="visual">
      {caption && <div className="visual-cap">{caption}</div>}
      {children}
    </div>
  );
}

/** Click through an ordered process. */
function Steps({ v }: { v: Extract<V, { kind: "steps" }> }) {
  const [i, setI] = useState(0);
  return (
    <Frame caption={v.caption}>
      <div className="steps">
        {v.steps.map((s, n) => (
          <button
            key={s.label}
            className="step"
            aria-pressed={i === n}
            onClick={() => setI(n)}
          >
            <span className="n">STEP {n + 1}</span>
            {s.label}
          </button>
        ))}
      </div>
      <Detail title={v.steps[i].label} body={v.steps[i].body} tone="info" />
    </Frame>
  );
}

/** A grid where each cell is a distinct answer. */
function Matrix({ v }: { v: Extract<V, { kind: "matrix" }> }) {
  const [sel, setSel] = useState<string>(`${v.rows[0]}|${v.cols[0]}`);
  const cell = v.cells[sel];
  return (
    <Frame caption={v.caption}>
      <div
        className="grid-matrix"
        style={{ gridTemplateColumns: `minmax(70px, 0.7fr) repeat(${v.cols.length}, 1fr)` }}
      >
        <div />
        {v.cols.map((c) => (
          <div key={c} className="matrix-h">
            {c}
          </div>
        ))}
        {v.rows.map((r) => (
          <Fragment key={r} row={r} cols={v.cols} sel={sel} setSel={setSel} cells={v.cells} />
        ))}
      </div>
      {cell ? (
        <Detail title={cell.title} body={cell.body} tone={cell.tone} />
      ) : (
        <div className="detail">That combination is not a defined report type.</div>
      )}
    </Frame>
  );
}

function Fragment({
  row,
  cols,
  sel,
  setSel,
  cells,
}: {
  row: string;
  cols: string[];
  sel: string;
  setSel: (s: string) => void;
  cells: Extract<V, { kind: "matrix" }>["cells"];
}) {
  return (
    <>
      <div className="matrix-h" style={{ justifyContent: "flex-start" }}>
        {row}
      </div>
      {cols.map((c) => {
        const key = `${row}|${c}`;
        return (
          <button
            key={key}
            className="cell"
            aria-pressed={sel === key}
            onClick={() => setSel(key)}
          >
            {cells[key]?.title ?? "—"}
          </button>
        );
      })}
    </>
  );
}

/** A time axis with an incident marker and draggable-looking pins. */
function Timeline({ v }: { v: Extract<V, { kind: "timeline" }> }) {
  const [i, setI] = useState(0);
  const p = v.points[i];
  return (
    <Frame caption={v.caption}>
      <div className="track">
        <div className="track-fill" style={{ width: `${p.at}%` }} />
        <div className="track-event" style={{ left: "50%" }}>
          <span>{v.event}</span>
        </div>
        {v.points.map((pt, n) => (
          <button
            key={pt.label}
            className="pin"
            style={{ left: `${pt.at}%` }}
            aria-pressed={i === n}
            aria-label={pt.label}
            onClick={() => setI(n)}
          >
            <span className="pin-label">{pt.label}</span>
          </button>
        ))}
      </div>
      <Detail title={p.label} body={p.body} tone={p.tone} />
    </Frame>
  );
}

/** Containment relationships: each layer sits inside the one above. */
function Nested({ v }: { v: Extract<V, { kind: "nested" }> }) {
  const [i, setI] = useState(0);
  return (
    <Frame caption={v.caption}>
      <div className="layers">
        {v.layers.map((l, n) => (
          <button
            key={l.label}
            className="layer"
            aria-pressed={i === n}
            onClick={() => setI(n)}
            style={{ marginLeft: n * 14 }}
          >
            {l.label}
          </button>
        ))}
      </div>
      <Detail title={v.layers[i].label} body={v.layers[i].body} tone="info" />
    </Frame>
  );
}

/** Side-by-side alternatives. */
function Compare({ v }: { v: Extract<V, { kind: "compare" }> }) {
  const [i, setI] = useState(0);
  return (
    <Frame caption={v.caption}>
      <div className="chips">
        {v.items.map((it, n) => (
          <button key={it.label} className="chip" aria-pressed={i === n} onClick={() => setI(n)}>
            {it.label}
          </button>
        ))}
      </div>
      <Detail title={v.items[i].label} body={v.items[i].body} tone={v.items[i].tone} />
    </Frame>
  );
}

/** A strict priority order, highest first. */
function Ladder({ v }: { v: Extract<V, { kind: "ladder" }> }) {
  const [i, setI] = useState(0);
  return (
    <Frame caption={v.caption}>
      <div className="ladder">
        {v.rungs.map((r, n) => (
          <button key={r.label} className="rung" aria-pressed={i === n} onClick={() => setI(n)}>
            <span className="n">{n + 1}</span>
            {r.label}
          </button>
        ))}
      </div>
      <Detail title={v.rungs[i].label} body={v.rungs[i].body} tone="info" />
    </Frame>
  );
}

export function VisualBlock({ visual }: { visual: V }) {
  switch (visual.kind) {
    case "steps":
      return <Steps v={visual} />;
    case "matrix":
      return <Matrix v={visual} />;
    case "timeline":
      return <Timeline v={visual} />;
    case "nested":
      return <Nested v={visual} />;
    case "compare":
      return <Compare v={visual} />;
    case "ladder":
      return <Ladder v={visual} />;
  }
}
