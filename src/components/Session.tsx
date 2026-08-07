import { useCallback, useEffect, useMemo, useState } from "react";
import type { CertPack, Letter, Progress, Question } from "../types";
import { buildQueue, masteryOf, type QueueMode } from "../lib/srs";
import { QuestionCard } from "./QuestionCard";

interface Setup {
  size: number;
  mode: QueueMode;
}

const SIZES = [10, 20, 40, 100];

function SetupScreen({
  title,
  blurb,
  available,
  mode,
  onStart,
}: {
  title: string;
  blurb: string;
  available: number;
  mode: QueueMode;
  onStart: (s: Setup) => void;
}) {
  const [size, setSize] = useState(10);
  const [custom, setCustom] = useState("");

  const chosen = custom ? Math.max(1, Math.min(available, Number(custom) || 1)) : size;

  if (available === 0) {
    return (
      <div className="empty">
        <h3>Nothing queued here yet</h3>
        <p>{blurb}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="banner tone-solid">
        <span>{title}</span>
        <span className="banner-right">{available} available</span>
      </div>
      <div className="card-body">
        <p style={{ marginTop: 0, color: "var(--muted)" }}>{blurb}</p>
        <div className="size-row" style={{ marginTop: 18 }}>
          {SIZES.filter((s) => s <= available).map((s) => (
            <button
              key={s}
              className="chip"
              aria-pressed={!custom && size === s}
              onClick={() => {
                setSize(s);
                setCustom("");
              }}
            >
              {s} questions
            </button>
          ))}
          <button
            className="chip"
            aria-pressed={!custom && size === available}
            onClick={() => {
              setSize(available);
              setCustom("");
            }}
          >
            All {available}
          </button>
          <input
            className="num-input"
            type="number"
            min={1}
            max={available}
            placeholder="Custom"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            aria-label="Custom number of questions"
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <button className="btn primary" onClick={() => onStart({ size: chosen, mode })}>
            Start {chosen} {chosen === 1 ? "question" : "questions"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Session({
  pack,
  progress,
  onAnswer,
  mode,
  title,
  blurb,
}: {
  pack: CertPack;
  progress: Progress;
  onAnswer: (id: string, correct: boolean) => void;
  mode: QueueMode;
  title: string;
  blurb: string;
}) {
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<Letter | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);

  const available = useMemo(
    () => buildQueue(pack.questions, progress, mode, 100_000).length,
    // Recomputed only when the mode or pack changes; progress churn during a
    // session should not resize the pool underneath the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pack, mode]
  );

  const start = useCallback(
    (s: Setup) => {
      setQueue(buildQueue(pack.questions, progress, s.mode, s.size));
      setI(0);
      setChosen(null);
      setRevealed(false);
      setResults([]);
    },
    [pack, progress]
  );

  const q = queue?.[i];

  const choose = useCallback(
    (l: Letter) => {
      if (!q || revealed) return;
      const correct = l === q.answer;
      setChosen(l);
      setRevealed(true);
      setResults((r) => [...r, { id: q.id, correct }]);
      onAnswer(q.id, correct);
    },
    [q, revealed, onAnswer]
  );

  const next = useCallback(() => {
    setChosen(null);
    setRevealed(false);
    setI((n) => n + 1);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!q) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;

      if (!revealed) {
        const idx = "1234".indexOf(e.key);
        const alpha = "abcdef".indexOf(e.key.toLowerCase());
        const pick = idx >= 0 ? idx : alpha;
        if (pick >= 0 && pick < q.options.length) {
          e.preventDefault();
          choose(q.options[pick].l);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, revealed, choose, next]);

  if (!queue) {
    return (
      <SetupScreen
        title={title}
        blurb={blurb}
        available={available}
        mode={mode}
        onStart={start}
      />
    );
  }

  if (!q) {
    const correct = results.filter((r) => r.correct).length;
    const pct = results.length ? Math.round((correct / results.length) * 100) : 0;
    const missed = results.filter((r) => !r.correct);
    return (
      <div className="result">
        <div className="score" style={{ color: pct >= 80 ? "var(--mastered)" : pct >= 60 ? "var(--learning)" : "var(--missed)" }}>
          {pct}%
        </div>
        <p>
          {correct} of {results.length} correct
          {missed.length > 0 && ` · ${missed.length} went back into the weak pile`}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn primary" onClick={() => setQueue(null)}>
            New session
          </button>
        </div>
      </div>
    );
  }

  const pct = Math.round((i / queue.length) * 100);

  return (
    <>
      <div className="progress-bar">
        <i style={{ width: `${pct}%` }} />
      </div>
      <div className="meta-row">
        <span>
          {i + 1} / {queue.length}
        </span>
        <span>
          {results.filter((r) => r.correct).length} correct
        </span>
        <span style={{ marginLeft: "auto" }}>
          {revealed ? (
            <>
              <span className="kbd">Enter</span> next
            </>
          ) : (
            <>
              <span className="kbd">1</span>–<span className="kbd">4</span> to answer
            </>
          )}
        </span>
      </div>

      <QuestionCard
        q={q}
        enrichment={pack.enrichment[q.id]}
        mastery={masteryOf(progress.records[q.id])}
        chosen={chosen}
        revealed={revealed}
        onChoose={choose}
        bannerRight={`Q${q.num} · ${i + 1} of ${queue.length}`}
      />

      {revealed && (
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button className="btn primary" onClick={next} autoFocus>
            {i + 1 === queue.length ? "Finish session" : "Next question"}
          </button>
          <button className="btn ghost" onClick={() => setQueue(null)}>
            End session
          </button>
        </div>
      )}
    </>
  );
}
