import { useMemo, useState } from "react";
import type { CertPack, Mastery, Progress } from "../types";
import { MASTERY_LABEL, masteryOf, shuffle } from "../lib/srs";
import { Explanation, QuestionCard } from "./QuestionCard";

const TONE: Record<Mastery, string> = {
  unseen: "var(--unseen)",
  missed: "var(--missed)",
  learning: "var(--learning)",
  solid: "var(--solid)",
  mastered: "var(--mastered)",
};

/* ------------------------------- flashcards ------------------------------- */

export function Flashcards({
  pack,
  progress,
  onAnswer,
}: {
  pack: CertPack;
  progress: Progress;
  onAnswer: (id: string, correct: boolean, ctx: { pack: CertPack; combo: number }) => void;
}) {
  const [order, setOrder] = useState(() => shuffle(pack.questions).map((q) => q.id));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const q = pack.questions.find((x) => x.id === order[i])!;
  const mastery = masteryOf(progress.records[q.id]);

  function grade(correct: boolean) {
    // Self-graded cards pay flat XP: there is no combo to build when you are
    // marking your own work.
    onAnswer(q.id, correct, { pack, combo: 0 });
    setRevealed(false);
    setI((n) => (n + 1) % order.length);
  }

  return (
    <>
      <div className="toolbar">
        <button
          className="btn ghost"
          onClick={() => {
            setOrder(shuffle(pack.questions).map((x) => x.id));
            setI(0);
            setRevealed(false);
          }}
        >
          Reshuffle deck
        </button>
        <span className="meta-row" style={{ margin: 0 }}>
          Card {i + 1} of {order.length}
        </span>
      </div>

      <div className="card">
        <div className={`banner tone-${mastery}`}>
          <span>{MASTERY_LABEL[mastery]}</span>
          <span className="banner-right">Q{q.num}</span>
        </div>
        <div className="card-body">
          <span className="domain-tag">{q.domain}</span>
          <p className="stem">{q.stem}</p>

          {!revealed ? (
            <>
              <div className="options">
                {q.options.map((o) => (
                  <div key={o.l} className="opt" style={{ cursor: "default" }}>
                    <span className="key">{o.l}</span>
                    <span>{o.t}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18 }}>
                <button className="btn primary" onClick={() => setRevealed(true)}>
                  Reveal answer
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="options">
                {q.options.map((o) => (
                  <div
                    key={o.l}
                    className={`opt ${o.l === q.answer ? "correct" : "muted"}`}
                    style={{ cursor: "default" }}
                  >
                    <span className="key">{o.l}</span>
                    <span>{o.t}</span>
                    {o.l === q.answer && <span className="verdict">Correct</span>}
                  </div>
                ))}
              </div>
              <Explanation q={q} enrichment={pack.enrichment[q.id]} />
              <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn danger" onClick={() => grade(false)}>
                  I got it wrong
                </button>
                <button className="btn primary" onClick={() => grade(true)}>
                  I knew it
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* --------------------------------- browse -------------------------------- */

export function Browse({ pack, progress }: { pack: CertPack; progress: Progress }) {
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<"all" | Mastery | "explained" | "flagged">("all");
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    const t = term.trim().toLowerCase();
    return pack.questions.filter((q) => {
      const m = masteryOf(progress.records[q.id]);
      if (filter === "explained" && !pack.enrichment[q.id]) return false;
      if (filter === "flagged" && !progress.flagged.includes(q.id)) return false;
      if (filter !== "all" && filter !== "explained" && filter !== "flagged" && m !== filter)
        return false;
      if (!t) return true;
      if (String(q.num) === t) return true;
      return (
        q.stem.toLowerCase().includes(t) ||
        q.domain.toLowerCase().includes(t) ||
        q.options.some((o) => o.t.toLowerCase().includes(t))
      );
    });
  }, [pack, progress, term, filter]);

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <span style={{ color: "var(--dim)" }}>⌕</span>
          <input
            placeholder={`Search all ${pack.questions.length} questions…`}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <select
          className="btn"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="all">All statuses</option>
          <option value="missed">Missed</option>
          <option value="unseen">Unseen</option>
          <option value="learning">Learning</option>
          <option value="solid">Solid</option>
          <option value="mastered">Mastered</option>
          <option value="explained">Has deep explanation</option>
          <option value="flagged">Flagged ({progress.flagged.length})</option>
        </select>
      </div>

      <div className="meta-row">
        {list.length} {list.length === 1 ? "match" : "matches"}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <h3>No matches</h3>
          <p>Try a shorter term, or clear the status filter.</p>
        </div>
      ) : (
        <div className="browse-list">
          {list.slice(0, 200).map((q) => {
            const m = masteryOf(progress.records[q.id]);
            const isOpen = open === q.id;
            return (
              <div className="browse-item" key={q.id}>
                <button
                  className="browse-head"
                  onClick={() => setOpen(isOpen ? null : q.id)}
                  aria-expanded={isOpen}
                >
                  <span className="dot" style={{ ["--tone" as string]: TONE[m] }} />
                  <span className="num">Q{q.num}</span>
                  <span className="txt">{q.stem}</span>
                </button>
                {isOpen && (
                  <div className="browse-open">
                    <QuestionCard
                      q={q}
                      enrichment={pack.enrichment[q.id]}
                      mastery={m}
                      chosen={null}
                      revealed
                      onChoose={() => {}}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {list.length > 200 && (
            <div className="meta-row">Showing the first 200. Narrow your search to see more.</div>
          )}
        </div>
      )}
    </>
  );
}
