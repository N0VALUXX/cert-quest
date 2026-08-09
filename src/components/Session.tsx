import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CertPack, Letter, Progress, Question } from "../types";
import { buildQueue, masteryOf, type QueueMode } from "../lib/srs";
import { comboAfter, comboMultiplier, nextComboTier, xpForAnswer, xpReason } from "../lib/game";
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

function elapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function Session({
  pack,
  progress,
  onAnswer,
  onToggleFlag,
  mode,
  title,
  blurb,
  autoStart = 0,
}: {
  pack: CertPack;
  progress: Progress;
  onAnswer: (id: string, correct: boolean, ctx: { pack: CertPack; combo: number }) => void;
  onToggleFlag: (id: string) => void;
  mode: QueueMode;
  title: string;
  blurb: string;
  /** When non-zero, skip the setup screen and start a run of this size. */
  autoStart?: number;
}) {
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<Letter | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);

  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [runXp, setRunXp] = useState(0);
  const [lastAward, setLastAward] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const questionShownAt = useRef(0);
  const [times, setTimes] = useState<number[]>([]);

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
      setCombo(0);
      setBestCombo(0);
      setRunXp(0);
      setLastAward(null);
      setTimes([]);
      const t = Date.now();
      setStartedAt(t);
      setNow(t);
      questionShownAt.current = t;
    },
    [pack, progress]
  );

  // Kick off immediately when the dashboard sent us here to drill.
  const startRef = useRef(start);
  startRef.current = start;
  useEffect(() => {
    if (autoStart > 0) startRef.current({ size: autoStart, mode });
  }, [autoStart, mode]);

  // Session clock. One interval for the whole run, not one per question.
  useEffect(() => {
    if (!queue || startedAt === 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [queue, startedAt]);

  const q = queue?.[i];

  const choose = useCallback(
    (l: Letter) => {
      if (!q || revealed) return;
      const correct = l === q.answer;
      const cardMastery = masteryOf(progress.records[q.id]);
      const award = xpForAnswer(correct, combo, cardMastery);
      const next = comboAfter(correct, combo, cardMastery);

      setChosen(l);
      setRevealed(true);
      setResults((r) => [...r, { id: q.id, correct }]);
      setCombo(next);
      setBestCombo((b) => Math.max(b, next));
      setRunXp((x) => x + award);
      setLastAward(award);
      setTimes((t) => [...t, Date.now() - questionShownAt.current]);

      onAnswer(q.id, correct, { pack, combo });
    },
    [q, revealed, combo, onAnswer, pack, progress.records]
  );

  const next = useCallback(() => {
    setChosen(null);
    setRevealed(false);
    setLastAward(null);
    questionShownAt.current = Date.now();
    setI((n) => n + 1);
  }, []);

  const quit = useCallback(() => setQueue(null), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!q) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;

      if (e.key === "Escape") {
        e.preventDefault();
        quit();
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        onToggleFlag(q.id);
        return;
      }

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
  }, [q, revealed, choose, next, quit, onToggleFlag]);

  if (!queue) {
    return (
      <SetupScreen title={title} blurb={blurb} available={available} mode={mode} onStart={start} />
    );
  }

  if (!q) {
    const correct = results.filter((r) => r.correct).length;
    const pct = results.length ? Math.round((correct / results.length) * 100) : 0;
    const missed = results.filter((r) => !r.correct);
    return (
      <div className="result">
        <div
          className="score"
          style={{
            color: pct >= 80 ? "var(--pass)" : pct >= 60 ? "var(--xp)" : "var(--fail)",
          }}
        >
          {pct}%
        </div>
        <p>
          {correct} of {results.length} correct
          {missed.length > 0 && ` · ${missed.length} went back into the weak pile`}
        </p>
        <div className="run-stats" style={{ maxWidth: 300, margin: "0 auto 20px" }}>
          <div className="run-stat">
            <b style={{ color: "var(--xp)" }}>+{runXp.toLocaleString()}</b>
            <span>xp earned</span>
          </div>
          <div className="run-stat">
            <b style={{ color: "var(--accent-light)" }}>×{bestCombo}</b>
            <span>best combo</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn primary" onClick={quit}>
            New session
          </button>
        </div>
      </div>
    );
  }

  const pct = Math.round((i / queue.length) * 100);
  const multiplier = comboMultiplier(combo);
  const tier = nextComboTier(combo);
  const correctCount = results.filter((r) => r.correct).length;
  const avgMs = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  const flagged = progress.flagged.includes(q.id);
  const cardMastery = masteryOf(progress.records[q.id]);
  const cardWorth = xpForAnswer(true, combo, cardMastery);
  const comboSafe = cardMastery === "unseen";

  return (
    <>
      <div className="drill-head">
        <span className="eyebrow">{pack.name}</span>
        <span className="where">{q.domain}</span>
        {/* Run stats live here rather than in a fourth side tile — this strip is
            glanceable, the side panel was competing with the question. */}
        <span className="mono run-inline" style={{ marginLeft: "auto" }}>
          <b style={{ color: "var(--pass)" }}>{correctCount}</b> correct
        </span>
        <span className="mono run-inline">
          <b style={{ color: "var(--fail)" }}>{results.length - correctCount}</b> missed
        </span>
        <span className="mono run-inline">
          <b style={{ color: "var(--xp)" }}>+{runXp.toLocaleString()}</b> xp
        </span>
        <span className="mono run-inline">
          <b>{avgMs ? elapsed(avgMs) : "—"}</b> avg
        </span>
        <span className="mono run-inline">
          {i + 1} / {queue.length}
        </span>
        <span className="mono run-inline" style={{ color: "var(--dim)" }}>
          {elapsed(Math.max(0, now - startedAt))}
        </span>
        <button
          className="flag-btn"
          aria-pressed={flagged}
          onClick={() => onToggleFlag(q.id)}
          title="Flag this question (F)"
        >
          {flagged ? "flagged" : "F to flag"}
        </button>
      </div>

      <div className="progress-bar">
        <i style={{ width: `${pct}%` }} />
      </div>

      <div className="drill-grid" style={{ marginTop: 16 }}>
        <div style={{ minWidth: 0 }}>
          <QuestionCard
            q={q}
            enrichment={pack.enrichment[q.id]}
            mastery={masteryOf(progress.records[q.id])}
            chosen={chosen}
            revealed={revealed}
            onChoose={choose}
            bannerRight={`Q${q.num}`}
          />

          {revealed && (
            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn primary" onClick={next} autoFocus>
                {i + 1 === queue.length ? "Finish session" : "Next question"}
              </button>
              <button className="btn ghost" onClick={quit}>
                End session
              </button>
            </div>
          )}

          <div className="drill-exit">
            {revealed ? "↵ next" : "1–4 or A–D to answer"} · F flags · Esc saves and exits
          </div>
        </div>

        <aside className="drill-side">
          <div className="tile">
            <div className="tile-head" style={{ marginBottom: 10 }}>
              <span className="eyebrow">Combo</span>
              {lastAward !== null && (
                <span className="xp-pop">
                  +{lastAward}
                  <small>XP</small>
                </span>
              )}
            </div>
            <div className={`combo${multiplier > 1 ? " hot" : ""}`}>
              <span className="combo-x">×{combo}</span>
              <span className="combo-note">
                {tier
                  ? `${tier.at - combo} more for ×${tier.at} · ${tier.multiplier}× XP`
                  : `${multiplier}× XP — maxed`}
                {comboSafe && (
                  <>
                    <br />
                    New cards never break the run.
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="tile worth">
            <div className="eyebrow">This card is worth</div>
            <div className="worth-row">
              <span className="worth-xp">+{cardWorth}</span>
              <span className="worth-why">
                {xpReason(cardMastery)}
                <br />
                {cardMastery === "mastered"
                  ? "you already know this one"
                  : cardMastery === "unseen" || cardMastery === "missed"
                    ? "worth more than a card you have nailed"
                    : "keep going to lock it in"}
              </span>
            </div>
          </div>

          <div className="reward-strip">
            <span className="eyebrow">Sector reward</span>
            <b>Clear {queue.length} to bank the run</b>
            <p>
              Finishing the set locks in the XP and pushes {q.domain} toward cleared. Missed
              questions come back in this session rather than days later.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
