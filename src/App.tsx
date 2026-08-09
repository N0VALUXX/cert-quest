import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultPack, packById, packs } from "./data";
import { useActivePackId, useProgress } from "./lib/store";
import { accentById } from "./lib/game";
import { Session } from "./components/Session";
import { Shell, type NavItem, type Tab } from "./components/Shell";
import { Dashboard } from "./components/Dashboard";
import { Profile } from "./components/Profile";
import { MilestoneToast } from "./components/Milestone";
import { Browse, Flashcards } from "./components/Views";

const NAV: NavItem[] = [
  { id: "base", label: "Base" },
  { id: "drill", label: "Drill" },
  { id: "cards", label: "Flashcards" },
  { id: "browse", label: "Browse" },
  { id: "profile", label: "Profile" },
];

const HEADINGS: Partial<Record<Tab, { h1: string; p: string }>> = {
  drill: {
    h1: "Question drill",
    p: "Answer under a running clock. New cards are worth the most and never break your combo — the queue and the scoring both point at what you do not know yet.",
  },
  cards: {
    h1: "Flashcard drill",
    p: "Read the question, commit to an answer in your head, reveal, then grade yourself honestly. Self-grading feeds the same scheduler as the other modes.",
  },
  browse: {
    h1: "Browse everything",
    p: "Search the full pool by keyword, question number, or domain. Every question shows its answer and explanation when opened.",
  },
  profile: {
    h1: "Profile",
    p: "Who you are, what you are working toward, and everything you have cleared so far.",
  },
};

export default function App() {
  const [packId, setPackId] = useActivePackId(defaultPack.id);
  const pack = useMemo(() => packById(packId), [packId]);
  const {
    progress,
    answer,
    toggleFlag,
    setExamDate,
    setProfile,
    milestone,
    dismissMilestone,
    reset,
    exportJSON,
    importJSON,
  } = useProgress();
  const [tab, setTab] = useState<Tab>("base");
  // Bumped when the dashboard hands off to the drill, so the session starts
  // immediately with the set the hero advertised instead of the setup screen.
  const [handoff, setHandoff] = useState(0);

  // The chosen accent retints everything, because every surface colour in the
  // stylesheet derives from --accent rather than a literal.
  useEffect(() => {
    const a = accentById(progress.profile.accent);
    const root = document.documentElement;
    root.style.setProperty("--accent", a.hex);
    root.style.setProperty("--accent-deep", a.deep);
  }, [progress.profile.accent]);

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

      {tab === "profile" && (
        <Profile
          packs={packs}
          progress={progress}
          onSetProfile={setProfile}
          onSetExamDate={setExamDate}
          onReset={reset}
          onExport={exportJSON}
          onImport={importJSON}
        />
      )}

      {milestone && <MilestoneToast milestone={milestone} onDismiss={dismissMilestone} />}
    </Shell>
  );
}
