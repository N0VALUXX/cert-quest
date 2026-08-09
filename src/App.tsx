import { useEffect, useMemo, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Labs } from "./components/Labs";
import { Study } from "./components/Study";
import type { Letter, Question } from "./content-model";
import { packs, packById } from "./data";
import { domainMetrics, studyQueue } from "./model";
import { emptyProgress, exportProgress, importProgress, loadProgress, saveProgress, type Confidence, type ProgressData } from "./progress";

type Screen = "dashboard" | "study" | "labs";

export default function App() {
  const [progress, setProgress] = useState<ProgressData>(() => loadProgress(packs[0]?.id ?? ""));
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [session, setSession] = useState<readonly Question[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const pack = useMemo(() => packById(progress.preferences.selectedPackId), [progress.preferences.selectedPackId]);

  useEffect(() => {
    try {
      saveProgress(progress);
    } catch {
      setNotice("Progress could not be saved. Download a backup before continuing.");
    }
  }, [progress]);

  useEffect(() => {
    if (navigator.storage?.persist !== undefined) {
      void navigator.storage.persist();
    }
  }, []);

  const selectPack = (packId: string) => setProgress((current) => ({ ...current, preferences: { ...current.preferences, selectedPackId: packId } }));
  const setExamDate = (date: string) => setProgress((current) => ({ ...current, preferences: { ...current.preferences, examDates: { ...current.preferences.examDates, [pack.id]: date } } }));

  const start = (mode: "priority" | "new" | "weak") => {
    const priorIds = new Set(progress.attempts.filter((attempt) => attempt.packId === pack.id).map((attempt) => attempt.questionId));
    const weakDomain = domainMetrics(pack, progress)[0]?.domain;
    const questions = mode === "new"
      ? pack.questions.filter((question) => !priorIds.has(question.id)).slice(0, 10)
      : mode === "weak" && weakDomain !== undefined
        ? studyQueue(pack, progress, pack.questions.length).filter((question) => question.domain === weakDomain).slice(0, 10)
        : studyQueue(pack, progress, 10);
    setSession(questions.length === 0 ? studyQueue(pack, progress, 10) : questions);
    setScreen("study");
  };

  const recordAnswer = (question: Question, answer: Letter, confidence: Confidence, durationMs: number) => {
    setProgress((current) => {
      const previous = [...current.attempts].reverse().find((attempt) => attempt.questionId === question.id);
      const priorMastery = previous === undefined ? 0.2 : previous.correct ? 0.9 : 0.4;
      const correct = answer === question.answer;
      const xp = Math.round(2 + 8 * Math.max(0.05, 1 - priorMastery) * (0.6 + 0.4 * Number(correct)));
      return {
        ...current,
        attempts: [...current.attempts, {
          id: crypto.randomUUID(),
          questionId: question.id,
          packId: pack.id,
          domain: question.domain,
          answer,
          correct,
          confidence,
          xp,
          occurredAt: Date.now(),
          durationMs,
        }],
      };
    });
  };

  const restore = async (file: File) => {
    try {
      setProgress(await importProgress(file));
      setNotice("Backup restored. Your readiness map has been rebuilt.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The backup could not be restored.");
    }
  };

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      {screen === "dashboard" && <div id="main-content"><Dashboard packs={packs} pack={pack} progress={progress} onSelectPack={selectPack} onStart={start} onOpenLabs={() => setScreen("labs")} onSetExamDate={setExamDate} onExport={() => exportProgress(progress)} onImport={(file) => { void restore(file); }} /></div>}
      {screen === "study" && <div id="main-content"><Study pack={pack} questions={session} onAnswer={recordAnswer} onExit={() => setScreen("dashboard")} /></div>}
      {screen === "labs" && <div id="main-content"><Labs packs={packs} activePackId={pack.id} onExit={() => setScreen("dashboard")} /></div>}
      {notice !== null && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice(null)} aria-label="Dismiss message">×</button></div>}
    </>
  );
}

export function resetForDevelopment(): void {
  saveProgress(emptyProgress(packs[0]?.id ?? ""));
}
