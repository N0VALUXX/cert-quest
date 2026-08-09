import { useMemo, useState } from "react";
import type { FormulaTerm, Visual as VisualModel } from "../content-model";

interface Props {
  readonly model: VisualModel;
  readonly compact?: boolean;
}

export function Visual({ model, compact = false }: Props) {
  if (model.kind === "formula") return <FormulaVisual model={model} />;

  const entries = model.kind === "steps"
    ? model.steps
    : model.kind === "cycle"
      ? model.stages
      : model.kind === "ladder"
        ? model.rungs
        : model.kind === "nested"
          ? model.layers
          : model.kind === "compare"
            ? model.items
            : model.kind === "timeline"
              ? model.points
              : model.rows.map((row, index) => ({ label: row, body: model.cols.map((_, column) => model.cells[`${index}:${column}`]?.body ?? "").filter(Boolean).join(" · ") }));

  return (
    <figure className={`concept-visual concept-visual--${model.kind}${compact ? " is-compact" : ""}`}>
      {model.caption !== undefined && <figcaption>{model.caption}</figcaption>}
      <div className="visual-flow">
        {entries.map((entry, index) => (
          <article className="visual-node" key={`${entry.label}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{entry.label}</strong>
            {!compact && <p>{entry.body}</p>}
          </article>
        ))}
      </div>
    </figure>
  );
}

function FormulaVisual({ model }: { readonly model: Extract<VisualModel, { readonly kind: "formula" }> }) {
  const [values, setValues] = useState<Record<string, number>>(() => Object.fromEntries(model.inputs.map((input) => [input.key, input.value])));
  const outputs = useMemo(() => model.outputs.map((output) => ({ ...output, result: evaluate(output.term, values) })), [model.outputs, values]);

  return (
    <figure className="concept-visual formula-visual">
      {model.caption !== undefined && <figcaption>{model.caption}</figcaption>}
      <div className="formula-expression">{model.expression}</div>
      <div className="formula-controls">
        {model.inputs.map((input) => (
          <label key={input.key}>
            <span>{input.label}</span>
            <output>{input.prefix}{values[input.key]}{input.unit}</output>
            <input
              type="range"
              min={input.min}
              max={input.max}
              step={input.step}
              value={values[input.key]}
              onChange={(event) => setValues((current) => ({ ...current, [input.key]: Number(event.target.value) }))}
            />
          </label>
        ))}
      </div>
      <div className="formula-results">
        {outputs.map((output) => (
          <div className={output.headline === true ? "is-headline" : ""} key={output.label}>
            <span>{output.label}</span>
            <strong>{output.result.toFixed(output.decimals ?? 0)}{output.unit}</strong>
            {output.note !== undefined && <small>{output.note}</small>}
          </div>
        ))}
      </div>
    </figure>
  );
}

function evaluate(term: FormulaTerm, values: Readonly<Record<string, number>>): number {
  if ("ref" in term) return values[term.ref] ?? 0;
  if ("value" in term) return term.value;
  const args = term.args.map((arg) => evaluate(arg, values));
  if (term.op === "add") return args.reduce((sum, value) => sum + value, 0);
  if (term.op === "mul") return args.reduce((product, value) => product * value, 1);
  if (term.op === "sub") return args.slice(1).reduce((value, next) => value - next, args[0] ?? 0);
  if (term.op === "div") return args.slice(1).reduce((value, next) => value / next, args[0] ?? 0);
  return Math.pow(args[0] ?? 0, args[1] ?? 1);
}
