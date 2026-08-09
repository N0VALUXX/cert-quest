import { useCallback, useEffect, useMemo, useState } from "react";
import type { CertPack, Exercise, ExerciseMode, ExerciseType } from "../types";
import { allExercises, countByType, slotCount, TYPE_LABEL } from "../lib/exercises";
import { MODE_BLURB, MODE_LABEL, scoreExercise, type Score } from "../lib/scoring";
import { shuffle } from "../lib/srs";
import { ExerciseRenderer } from "./exercise/Types";
import { FeedbackPanel, HintPanel } from "./exercise/Primitives";
import { VisualBlock } from "./Visual";

type Filter = "all" | ExerciseType;

/* --------------------------------- setup ---------------------------------- */

function Setup({ all, onStart }: { all: Exercise[]; onStart: (list: Exercise[]) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const counts = countByType(all);
  const pool = filter === "all" ? all : all.filter((e) => e.type === filter);

  if (all.length === 0) {
    return (
      <div className="empty">
        <h3>No exercises on this track yet</h3>
        <p>
          Exercises come from two places: hand-authored ones in the pack, and ones derived
          automatically from the explainers attached to deep explanations. This pack has neither
          yet.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="banner tone-solid">
        <span>Exercises</span>
        <span className="banner-right">{all.length} available</span>
      </div>
      <div className="card-body">
        <p style={{ marginTop: 0, color: "var(--muted)" }}>
          Several ways to work the same material: order it, sort it, match it, label it, or find it
          on a diagram. Multiple choice is one type among these rather than the only one.
        </p>
        <div className="size-row" style={{ marginTop: 18 }}>
          <button className="chip" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            All {all.length}
          </button>
          {(Object.keys(counts) as ExerciseType[]).map((t) => (
            <button key={t} className="chip" aria-pressed={filter === t} onClick={() => setFilter(t)}>
              {TYPE_LABEL[t]} {counts[t]}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <button className="btn primary" disabled={pool.length === 0} onClick={() => onStart(shuffle(pool))}>
            Start {pool.length} {pool.length === 1 ? "exercise" : "exercises"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- runner --------------------------------- */

export function Exercises({
  pack,
  onComplete,
}: {
  pack: CertPack;
  onComplete: (pack: CertPack, rounds: number, correct: number, xp: number) => void;
}) {
  const all = useMemo(() => allExercises(pack), [pack]);
  const [queue, setQueue] = useState<Exercise[] | null>(null);
  const [i, setI] = useState(0);
  const [salt] = useState(() => Date.now() >>> 0);

  const [hintsShown, setHintsShown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState<Score | null>(null);
  const [tally, setTally] = useState<{ correct: number; total: number; xp: number }[]>([]);

  const ex = queue?.[i];

  const reset = useCallback(() => {
    setHintsShown(0);
    setAttempts(0);
    setScore(null);
  }, []);

  const quit = useCallback(() => {
    setQueue(null);
    reset();
  }, [reset]);

  useEffect(() => {
    if (!queue) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "Escape") {
        e.preventDefault();
        quit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queue, quit]);

  const handleDone = useCallback(
    (correct: number) => {
      if (!ex || score) return;
      const total = slotCount(ex);
      const s = scoreExercise(ex, { correct, total, wrongAttempts: attempts, hintsUsed: hintsShown });
      setScore(s);
      setTally((t) => [...t, { correct, total, xp: s.xp }]);
      onComplete(pack, total, correct, s.xp);
    },
    [ex, score, attempts, hintsShown, onComplete, pack]
  );

  const next = () => {
    reset();
    setI((n) => n + 1);
  };

  if (!queue) {
    return (
      <Setup
        all={all}
        onStart={(list) => {
          setQueue(list);
          setI(0);
          setTally([]);
          reset();
        }}
      />
    );
  }

  if (!ex) {
    const total = tally.reduce((a, t) => a + t.total, 0);
    const correct = tally.reduce((a, t) => a + t.correct, 0);
    const xp = tally.reduce((a, t) => a + t.xp, 0);
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="result">
        <div className="score" style={{ color: pct >= 80 ? "var(--pass)" : pct >= 60 ? "var(--xp)" : "var(--fail)" }}>
          {pct}%
        </div>
        <p>
          {correct} of {total} decisions right across {tally.length}{" "}
          {tally.length === 1 ? "exercise" : "exercises"} · +{xp.toLocaleString()} XP
        </p>
        <button className="btn primary" onClick={quit}>
          New set
        </button>
      </div>
    );
  }

  const mode: ExerciseMode = ex.difficulty;
  const hints = ex.hints.slice(0, hintsShown);
  const figure = "figure" in ex.content ? ex.content.figure : undefined;

  return (
    <>
      <div className="drill-head">
        <span className="eyebrow">{TYPE_LABEL[ex.type]}</span>
        <span className="where">{ex.metadata.domain}</span>
        <span className={`pill mode-${mode}`} title={MODE_BLURB[mode]}>
          {MODE_LABEL[mode]}
        </span>
        <span className="mono run-inline" style={{ marginLeft: "auto" }}>
          {i + 1} / {queue.length}
        </span>
        <button className="flag-btn" onClick={quit} title="End the set (Esc)">
          End set
        </button>
      </div>

      <div className="progress-bar">
        <i style={{ width: `${Math.round((i / queue.length) * 100)}%` }} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-body">
          <span className="domain-tag">{ex.learningObjective}</span>
          <h3 className="ex-title">{ex.title}</h3>
          <p className="ex-instructions">{ex.instructions}</p>

          {figure && (
            <div className="figure prompt">
              <VisualBlock visual={figure} />
            </div>
          )}

          <ExerciseRenderer
            key={ex.id}
            ex={ex}
            salt={salt}
            done={!!score}
            hintsLeft={Math.max(0, ex.hints.length - hintsShown)}
            onHint={() => setHintsShown((n) => n + 1)}
            onAttempt={() => setAttempts((n) => n + 1)}
            onDone={handleDone}
          />

          <HintPanel hints={hints} />

          {score && (
            <>
              <FeedbackPanel
                correct={tally[tally.length - 1]?.correct ?? 0}
                total={slotCount(ex)}
                explanation={ex.explanation}
              />
              <div className="ex-score-lines">
                {score.lines.map((l, n) => (
                  <div key={n} className="ex-score-line">
                    <span>{l.label}</span>
                    <b className={l.delta < 0 ? "neg" : ""}>
                      {l.delta > 0 ? "+" : ""}
                      {l.delta}
                    </b>
                  </div>
                ))}
                <div className="ex-score-line total">
                  <span>Score</span>
                  <b>
                    {score.points} / {score.max}
                  </b>
                </div>
              </div>
              <div className="ex-foot">
                <span className="xp-pop">
                  +{score.xp}
                  <small>XP</small>
                </span>
                <button className="btn primary" onClick={next} autoFocus>
                  {i + 1 === queue.length ? "Finish set" : "Next exercise"}
                </button>
                <span className="drill-exit" style={{ margin: 0 }}>
                  Esc ends the set
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
