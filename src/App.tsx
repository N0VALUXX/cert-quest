import { useCallback, useMemo, useState } from "react";
import { defaultPack, packById, packs } from "./data";
import { useActivePackId, useProgress } from "./lib/store";
import { Session } from "./components/Session";
import { Shell, type NavItem, type Tab } from "./components/Shell";
import { Dashboard } from "./components/Dashboard";
import { Browse, Flashcards, Stats } from "./components/Views";

const NAV: NavItem[] = [
  { id: "base", label: "Base" },
  { id: "drill", label: "Drill" },
  { id: "cards", label: "Flashcards" },
  { id: "browse", label: "Browse" },
  { id: "stats", label: "Progress" },
];

const HEADINGS: Partial<Record<Tab, { h1: string; p: string }>> = {
  drill: {
    h1: "Question drill",
    p: "Answer under a running clock. Correct answers build a combo, and the combo multiplies the XP each answer is worth.",
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
    p: "Where this track stands across the pool, and which domains are dragging.",
  },
};

export default function App() {
  const [packId, setPackId] = useActivePackId(defaultPack.id);
  const pack = useMemo(() => packById(packId), [packId]);
  const { progress, answer, toggleFlag, setExamDate, reset, exportJSON, importJSON } = useProgress();
  const [tab, setTab] = useState<Tab>("base");
  // Bumped when the dashboard hands off to the drill, so the session starts
  // immediately with the set the hero advertised instead of the setup screen.
  const [handoff, setHandoff] = useState(0);

  const startDrill = useCallback(() => {
    setHandoff((n) => n + 1);
    setTab("drill");
  }, []);

  // Reaching a tab from the nav is a deliberate navigation, never a hero
  // handoff — otherwise Drill would skip its setup screen forever after the
  // first time the dashboard sent the user there.
  const goTab = useCallback((t: Tab) => {
    setHandoff(0);
    setTab(t);
  }, []);

  const head = HEADINGS[tab];

  return (
    <Shell
      packs={packs}
      pack={pack}
      progress={progress}
      tab={tab}
      nav={NAV}
      onTab={goTab}
      onSelectPack={setPackId}
    >
      {head && (
        <div className="page-head">
          <h1>{head.h1}</h1>
          <p>{head.p}</p>
        </div>
      )}

      {tab === "base" && (
        <Dashboard
          key={pack.id}
          pack={pack}
          packs={packs}
          progress={progress}
          onSelectPack={setPackId}
          onStartDrill={startDrill}
          onSetExamDate={setExamDate}
        />
      )}

      {tab === "drill" && (
        <Session
          key={`drill-${pack.id}-${handoff}`}
          pack={pack}
          progress={progress}
          onAnswer={answer}
          onToggleFlag={toggleFlag}
          mode="weak"
          title="Question drill"
          blurb="Sorted by weakness: recent misses, then cards falling due, then the unseen."
          autoStart={handoff > 0 ? 12 : 0}
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
    </Shell>
  );
}
