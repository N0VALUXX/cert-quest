import { useState } from "react";
import type { FormulaTerm, Tone, Visual as V } from "../types";

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

/** A loop rather than a line: the last stage feeds the first. */
function Cycle({ v }: { v: Extract<V, { kind: "cycle" }> }) {
  const [i, setI] = useState(0);
  const n = v.stages.length;
  return (
    <Frame caption={v.caption}>
      <div className="cycle-ring" style={{ ["--n" as string]: n }}>
        <div className="cycle-hub" aria-hidden>
          ↻
        </div>
        {v.stages.map((s, k) => (
          <button
            key={s.label}
            className="cycle-node"
            style={{ ["--i" as string]: k }}
            aria-pressed={i === k}
            onClick={() => setI(k)}
          >
            <span className="n">{k + 1}</span>
            {s.label}
          </button>
        ))}
      </div>
      <Detail title={v.stages[i].label} body={v.stages[i].body} tone="info" />
    </Frame>
  );
}

/** Safe evaluation of the little expression tree. No parsing, no eval. */
function evalTerm(t: FormulaTerm, vals: Record<string, number>): number {
  if ("ref" in t) return vals[t.ref] ?? 0;
  if ("value" in t) return t.value;
  const a = t.args.map((x) => evalTerm(x, vals));
  switch (t.op) {
    case "add":
      return a.reduce((x, y) => x + y, 0);
    case "mul":
      return a.reduce((x, y) => x * y, 1);
    case "sub":
      return a.slice(1).reduce((x, y) => x - y, a[0] ?? 0);
    case "div":
      return a.slice(1).reduce((x, y) => (y === 0 ? 0 : x / y), a[0] ?? 0);
    case "pow":
      return Math.pow(a[0] ?? 0, a[1] ?? 0);
  }
}

/** Move the inputs, watch the result move. Beats a worked example in prose. */
function Formula({ v }: { v: Extract<V, { kind: "formula" }> }) {
  const [vals, setVals] = useState<Record<string, number>>(() =>
    Object.fromEntries(v.inputs.map((i) => [i.key, i.value]))
  );

  return (
    <Frame caption={v.caption}>
      <div className="formula-expr">{v.expression}</div>

      <div className="formula-inputs">
        {v.inputs.map((input) => (
          <label key={input.key} className="formula-input">
            <span className="formula-label">
              {input.label}
              <b>
                {input.prefix ?? ""}
                {vals[input.key].toLocaleString()}
                {input.unit ? ` ${input.unit}` : ""}
              </b>
            </span>
            <input
              type="range"
              min={input.min}
              max={input.max}
              step={input.step}
              value={vals[input.key]}
              onChange={(e) =>
                setVals((prev) => ({ ...prev, [input.key]: Number(e.target.value) }))
              }
            />
          </label>
        ))}
      </div>

      <div className="formula-outputs">
        {v.outputs.map((out) => {
          const n = evalTerm(out.term, vals);
          const shown = Number.isFinite(n)
            ? n.toLocaleString(undefined, {
                minimumFractionDigits: out.decimals ?? 0,
                maximumFractionDigits: out.decimals ?? 0,
              })
            : "—";
          return (
            <div key={out.label} className={`formula-out${out.headline ? " headline" : ""}`}>
              <span className="formula-out-label">{out.label}</span>
              <b>
                {shown}
                {out.unit ? <i> {out.unit}</i> : null}
              </b>
              {out.note && <span className="formula-note">{out.note}</span>}
            </div>
          );
        })}
      </div>
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
    case "cycle":
      return <Cycle v={visual} />;
    case "formula":
      return <Formula v={visual} />;
  }
}
