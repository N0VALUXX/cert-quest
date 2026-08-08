import { useMemo, useState } from "react";
import { defaultPack, packById, packs } from "./data";
import { useActivePackId, useProgress } from "./lib/store";
import { masteryOf } from "./lib/srs";
import { Session } from "./components/Session";
import { Browse, Flashcards, Stats } from "./components/Views";

type Tab = "drill" | "focus" | "missed" | "cards" | "browse" | "stats";

const HEADINGS: Record<Tab, { h1: string; p: string }> = {
  drill: {
    h1: "Practice test",
    p: "Pull a random set from the pool and work through it. Pick how many you want — 10 for a quick pass, or build a longer sitting.",
  },
  focus: {
    h1: "Weak first",
    p: "Questions are ordered by how shaky you are on them: recent misses first, then things falling due, then everything you have never seen.",
  },
  missed: {
    h1: "Most missed",
    p: "Only questions you have gotten wrong before, ordered by how many times you have missed them.",
  },
  cards: {
    h1: "Flashcard drill",
    p: "Read the question, commit to an answer in your head, reveal, then grade yourself honestly. Self-grading feeds the same scheduler as the other modes.",
  },
  browse: {
    h1: "Browse everything",
    p: "Search the full pool by keyword, question number, or domain. Every question shows its answer and explanation when opened.",
  },
  stats: {
    h1: "Progress",
    p: "Where your clearance stands across the pool, and which domains are dragging.",
  },
};

export default function App() {
  const [packId, setPackId] = useActivePackId(defaultPack.id);
  const pack = useMemo(() => packById(packId), [packId]);
  const { progress, answer, reset, exportJSON, importJSON } = useProgress();
  const [tab, setTab] = useState<Tab>("drill");

  const counts = useMemo(() => {
    let missed = 0;
    let unseen = 0;
    for (const q of pack.questions) {
      const m = masteryOf(progress.records[q.id]);
      if (m === "missed") missed++;
      if (m === "unseen") unseen++;
    }
    return { missed, unseen };
  }, [pack, progress]);

  const nav: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "drill", label: "Practice test", icon: "◈" },
    { id: "focus", label: "Weak first", icon: "◐" },
    { id: "missed", label: "Most missed", icon: "✕", count: counts.missed },
    { id: "cards", label: "Flashcards", icon: "▤" },
    { id: "browse", label: "Browse", icon: "⌕" },
    { id: "stats", label: "Progress", icon: "▲" },
  ];

  const head = HEADINGS[tab];

  return (
    <div className="app">
      <aside className="rail">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <span>
            cert-quest
            <small>{pack.blurb}</small>
          </span>
        </div>

        <div className="pack-switch">
          <label className="nav-label" htmlFor="pack-select">
            Certification
          </label>
          <select
            id="pack-select"
            className="pack-select"
            // The visible label is hidden in the narrow rail, so name it here too.
            aria-label="Certification"
            value={pack.id}
            onChange={(e) => setPackId(e.target.value)}
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.questions.length} q
              </option>
            ))}
          </select>
        </div>

        <nav className="nav">
          <div className="nav-label">Study</div>
          {nav.map((n) => (
            <button
              key={n.id}
              aria-current={tab === n.id}
              onClick={() => setTab(n.id)}
            >
              <span aria-hidden style={{ width: 16, color: "var(--dim)" }}>
                {n.icon}
              </span>
              {n.label}
              {n.count !== undefined && n.count > 0 && <span className="count">{n.count}</span>}
            </button>
          ))}
        </nav>

        <div className="rail-foot">
          <div className="streak-chip">
            <b>{progress.streakDays}</b>
            <span>
              day streak
              <br />
              {counts.unseen} never seen
            </span>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="page-head">
          <h1>{head.h1}</h1>
          <p>{head.p}</p>
        </div>

        {tab === "drill" && (
          <Session
            key={`drill-${pack.id}`}
            pack={pack}
            progress={progress}
            onAnswer={answer}
            mode="random"
            title="Practice test"
            blurb="A random draw from the whole pool."
          />
        )}

        {tab === "focus" && (
          <Session
            key={`focus-${pack.id}`}
            pack={pack}
            progress={progress}
            onAnswer={answer}
            mode="weak"
            title="Weak first"
            blurb="Sorted by weakness: recent misses, then cards falling due, then the unseen."
          />
        )}

        {tab === "missed" && (
          <Session
            key={`missed-${pack.id}`}
            pack={pack}
            progress={progress}
            onAnswer={answer}
            mode="missed"
            title="Most missed"
            blurb="Answer some questions wrong first and they will collect here, worst offenders at the top."
          />
        )}

        {tab === "cards" && (
          <Flashcards key={pack.id} pack={pack} progress={progress} onAnswer={answer} />
        )}

        {tab === "browse" && <Browse key={pack.id} pack={pack} progress={progress} />}

        {tab === "stats" && (
          <Stats
            key={pack.id}
            pack={pack}
            progress={progress}
            onReset={reset}
            onExport={exportJSON}
            onImport={importJSON}
          />
        )}
      </main>
    </div>
  );
}
