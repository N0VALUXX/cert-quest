import { useMemo, useState } from "react";
import type { CertPack, Letter, Mastery, Progress } from "../types";
import { MASTERY_LABEL, masteryOf, shuffle, todayKey } from "../lib/srs";
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
  onAnswer: (id: string, correct: boolean) => void;
}) {
  const [order, setOrder] = useState(() => shuffle(pack.questions).map((q) => q.id));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const q = pack.questions.find((x) => x.id === order[i])!;
  const mastery = masteryOf(progress.records[q.id]);

  function grade(correct: boolean) {
    onAnswer(q.id, correct);
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
  const [filter, setFilter] = useState<"all" | Mastery | "explained">("all");
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    const t = term.trim().toLowerCase();
    return pack.questions.filter((q) => {
      const m = masteryOf(progress.records[q.id]);
      if (filter === "explained" && !pack.enrichment[q.id]) return false;
      if (filter !== "all" && filter !== "explained" && m !== filter) return false;
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

/* --------------------------------- stats --------------------------------- */

export function Stats({
  pack,
  progress,
  onReset,
  onExport,
  onImport,
}: {
  pack: CertPack;
  progress: Progress;
  onReset: () => void;
  onExport: () => string;
  onImport: (raw: string) => void;
}) {
  const [msg, setMsg] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<Mastery, number> = {
      unseen: 0,
      missed: 0,
      learning: 0,
      solid: 0,
      mastered: 0,
    };
    for (const q of pack.questions) c[masteryOf(progress.records[q.id])]++;
    return c;
  }, [pack, progress]);

  // Scoped to the active pack. Progress records for every pack share one map,
  // so iterating all of them would bleed Security+ answers into CISSP totals.
  const totals = useMemo(() => {
    let answered = 0;
    let correct = 0;
    for (const q of pack.questions) {
      const r = progress.records[q.id];
      if (!r) continue;
      answered += r.seen;
      correct += r.correct;
    }
    return { answered, correct, pct: answered ? Math.round((correct / answered) * 100) : 0 };
  }, [pack, progress]);

  const byDomain = useMemo(() => {
    const m = new Map<string, { seen: number; correct: number }>();
    for (const q of pack.questions) {
      const r = progress.records[q.id];
      if (!r || r.seen === 0) continue;
      const cur = m.get(q.domain) ?? { seen: 0, correct: 0 };
      cur.seen += r.seen;
      cur.correct += r.correct;
      m.set(q.domain, cur);
    }
    return [...m.entries()]
      .map(([name, v]) => ({ name, ...v, pct: Math.round((v.correct / v.seen) * 100) }))
      .sort((a, b) => a.pct - b.pct);
  }, [pack, progress]);

  const last30 = useMemo(() => {
    const out: { key: string; stat: { answered: number; correct: number } | undefined }[] = [];
    for (let d = 29; d >= 0; d--) {
      const key = todayKey(new Date(Date.now() - d * 86_400_000));
      out.push({ key, stat: progress.days[key] });
    }
    return out;
  }, [progress]);

  function download() {
    const blob = new Blob([onExport()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cert-quest-progress-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file
      .text()
      .then((t) => {
        onImport(t);
        setMsg("Progress restored.");
      })
      .catch((err: Error) => setMsg(err.message));
    e.target.value = "";
  }

  const order: Mastery[] = ["mastered", "solid", "learning", "missed", "unseen"];

  return (
    <>
      <div className="stat-grid">
        <div className="stat">
          <b style={{ color: "var(--gold)" }}>{progress.streakDays}</b>
          <span>Day streak</span>
        </div>
        <div className="stat">
          <b>{totals.answered}</b>
          <span>Answers logged</span>
        </div>
        <div className="stat">
          <b style={{ color: totals.pct >= 75 ? "var(--mastered)" : "var(--learning)" }}>
            {totals.pct}%
          </b>
          <span>Lifetime accuracy</span>
        </div>
        <div className="stat">
          <b style={{ color: "var(--mastered)" }}>{counts.mastered}</b>
          <span>Mastered</span>
        </div>
        <div className="stat">
          <b style={{ color: "var(--missed)" }}>{counts.missed}</b>
          <span>In the weak pile</span>
        </div>
        <div className="stat">
          <b>{progress.bestStreakDays}</b>
          <span>Best streak</span>
        </div>
      </div>

      <h3 style={{ fontFamily: "var(--display)", fontSize: 16, margin: "0 0 12px" }}>
        Clearance across the pool
      </h3>
      <div className="mastery-bar">
        {order.map((m) =>
          counts[m] > 0 ? (
            <div
              key={m}
              style={{ flexGrow: counts[m], background: TONE[m] }}
              title={`${MASTERY_LABEL[m]}: ${counts[m]}`}
            />
          ) : null
        )}
      </div>
      <div className="legend">
        {order.map((m) => (
          <span key={m}>
            <i style={{ background: TONE[m] }} />
            {MASTERY_LABEL[m]} · {counts[m]}
          </span>
        ))}
      </div>

      <h3 style={{ fontFamily: "var(--display)", fontSize: 16, margin: "0 0 12px" }}>
        Last 30 days
      </h3>
      <div className="heat">
        {last30.map(({ key, stat }) => {
          const n = stat?.answered ?? 0;
          const intensity = n === 0 ? 0 : Math.min(1, n / 25);
          return (
            <i
              key={key}
              title={n ? `${key}: ${n} answered, ${stat!.correct} correct` : `${key}: nothing`}
              style={
                n
                  ? {
                      background: `color-mix(in srgb, var(--mastered) ${Math.round(
                        20 + intensity * 80
                      )}%, var(--raised))`,
                      borderColor: "transparent",
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
      <div className="meta-row" style={{ marginBottom: 26 }}>
        Each square is a day. Brighter means more answered.
      </div>

      {byDomain.length > 0 && (
        <>
          <h3 style={{ fontFamily: "var(--display)", fontSize: 16, margin: "0 0 6px" }}>
            Accuracy by domain
          </h3>
          <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "0 0 12px" }}>
            Weakest first. Domains you have not touched yet are not listed.
          </p>
          <div style={{ marginBottom: 26 }}>
            {byDomain.map((d) => (
              <div className="domain-row" key={d.name}>
                <div>
                  {d.name}
                  <div className="bar">
                    <i
                      style={{
                        width: `${d.pct}%`,
                        background: d.pct >= 75 ? "var(--mastered)" : d.pct >= 50 ? "var(--learning)" : "var(--missed)",
                      }}
                    />
                  </div>
                </div>
                <div className="pct">{d.pct}%</div>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 style={{ fontFamily: "var(--display)", fontSize: 16, margin: "0 0 12px" }}>
        Your data
      </h3>
      <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "0 0 14px" }}>
        Progress is stored in this browser only. Export before clearing site data or switching
        machines.
      </p>
      <div className="toolbar">
        <button className="btn" onClick={download}>
          Export progress
        </button>
        <label className="btn" style={{ display: "inline-block" }}>
          Import progress
          <input type="file" accept="application/json" onChange={upload} style={{ display: "none" }} />
        </label>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm("Erase all progress? This cannot be undone.")) {
              onReset();
              setMsg("Progress erased.");
            }
          }}
        >
          Erase progress
        </button>
        {msg && <span style={{ color: "var(--muted)", fontSize: 13.5 }}>{msg}</span>}
      </div>
    </>
  );
}

export function letterOf(l: string): Letter {
  return l as Letter;
}
