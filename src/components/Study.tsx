import { useEffect, useState } from "react";
import type { CertPack, Letter, Question } from "../content-model";
import type { Confidence } from "../progress";
import { Visual } from "./Visual";

interface Props {
  readonly pack: CertPack;
  readonly questions: readonly Question[];
  readonly onAnswer: (question: Question, answer: Letter, confidence: Confidence, durationMs: number) => void;
  readonly onExit: () => void;
}

export function Study({ pack, questions, onAnswer, onExit }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Letter | null>(null);
  const [confidence, setConfidence] = useState<Confidence>("unsure");
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const question = questions[index];

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (question === undefined || revealed) return;
      const option = question.options[Number(event.key) - 1];
      if (option !== undefined) setSelected(option.l);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [question, revealed]);

  if (question === undefined) {
    return (
      <main className="completion-view">
        <div className="completion-orbit" aria-hidden="true"><span /></div>
        <p className="eyebrow">SESSION COMPLETE</p>
        <h1>You made the unknown smaller.</h1>
        <p>Your readiness map now reflects this evidence. Take a breath before deciding what comes next.</p>
        <button className="button button--primary" onClick={onExit}>Return to mission control</button>
      </main>
    );
  }

  const enrichment = pack.enrichment[question.id];
  const correct = selected === question.answer;
  const submit = () => {
    if (selected === null || revealed) return;
    setRevealed(true);
    onAnswer(question, selected, confidence, Date.now() - startedAt);
  };
  const next = () => {
    setIndex((current) => current + 1);
    setSelected(null);
    setConfidence("unsure");
    setRevealed(false);
    setStartedAt(Date.now());
  };

  return (
    <main className="study-shell">
      <header className="study-topbar">
        <button className="icon-button" onClick={onExit} aria-label="Exit study session">×</button>
        <div className="study-progress" aria-label={`Question ${index + 1} of ${questions.length}`}>
          <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>
        <span className="study-count">{String(index + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}</span>
      </header>

      <div className="study-layout">
        <section className="question-panel" aria-labelledby="question-heading">
          <div className="question-meta">
            <span>{pack.name}</span>
            <span>{question.domain}</span>
            <span className={enrichment === undefined ? "quality quality--caveat" : "quality"}>
              {enrichment === undefined ? "Key not yet explained" : "Source-backed explanation"}
            </span>
          </div>
          <h1 id="question-heading">{question.stem}</h1>
          {question.figure !== undefined && <Visual model={question.figure} compact={!revealed} />}

          <fieldset className="answer-list" disabled={revealed}>
            <legend className="sr-only">Choose one answer</legend>
            {question.options.map((option, optionIndex) => {
              const state = revealed
                ? option.l === question.answer
                  ? "is-correct"
                  : option.l === selected
                    ? "is-wrong"
                    : ""
                : selected === option.l
                  ? "is-selected"
                  : "";
              return (
                <label className={`answer-option ${state}`} key={option.l}>
                  <input type="radio" name="answer" checked={selected === option.l} onChange={() => setSelected(option.l)} />
                  <span className="answer-key">{option.l}</span>
                  <span className="answer-text">{option.t}</span>
                  <kbd>{optionIndex + 1}</kbd>
                </label>
              );
            })}
          </fieldset>

          {!revealed && (
            <div className="confidence-row">
              <span>Before revealing: how certain are you?</span>
              <div className="segmented" role="group" aria-label="Confidence">
                {(["guessing", "unsure", "confident"] as const).map((value) => (
                  <button className={confidence === value ? "is-active" : ""} onClick={() => setConfidence(value)} key={value}>{value}</button>
                ))}
              </div>
            </div>
          )}

          {!revealed ? (
            <button className="button button--primary submit-answer" disabled={selected === null} onClick={submit}>Check reasoning</button>
          ) : (
            <Feedback
              correct={correct}
              selected={selected}
              question={question}
              enrichment={enrichment}
              onNext={next}
              isLast={index === questions.length - 1}
            />
          )}
        </section>

        <aside className="study-aside">
          <p className="eyebrow">WORKING NOTE</p>
          <p>Look for the requirement word—<em>best</em>, <em>first</em>, or <em>most direct</em>—before evaluating the technologies.</p>
          <div className="aside-rule" />
          <span>Keyboard</span>
          <p><kbd>1–4</kbd> chooses an answer. Focus remains visible throughout.</p>
        </aside>
      </div>
    </main>
  );
}

interface FeedbackProps {
  readonly correct: boolean;
  readonly selected: Letter | null;
  readonly question: Question;
  readonly enrichment: CertPack["enrichment"][string] | undefined;
  readonly onNext: () => void;
  readonly isLast: boolean;
}

function Feedback({ correct, selected, question, enrichment, onNext, isLast }: FeedbackProps) {
  return (
    <section className={`feedback-panel ${correct ? "feedback-panel--correct" : "feedback-panel--wrong"}`} aria-live="polite">
      <div className="feedback-verdict">
        <span>{correct ? "✓" : "↗"}</span>
        <div>
          <p className="eyebrow">{correct ? "REASONING HOLDS" : "LET'S REPAIR THIS"}</p>
          <h2>{correct ? "Correct—and now make it transferable." : `The stronger answer is ${question.answer}.`}</h2>
        </div>
      </div>

      {enrichment !== undefined ? (
        <>
          <p className="feedback-why">{correct ? enrichment.why : (selected === null ? enrichment.why : enrichment.wrong[selected] ?? enrichment.why)}</p>
          {!correct && <div className="repair-box"><span>Why the key holds</span><p>{enrichment.why}</p></div>}
          <div className="feedback-grid">
            <div><span>Transferable concept</span><p>{enrichment.concept}</p></div>
            <div><span>Exam trap</span><p>{enrichment.trap}</p></div>
          </div>
          {enrichment.disputed !== undefined && (
            <div className="content-caveat"><strong>Disputed source key</strong><p>{enrichment.disputed.argument}</p></div>
          )}
          {enrichment.visual !== undefined && <Visual model={enrichment.visual} />}
          {enrichment.refs.length > 0 && (
            <div className="references"><span>Primary trail</span>{enrichment.refs.map((reference) => <a href={reference.url} target="_blank" rel="noreferrer" key={reference.url}>{reference.label}</a>)}</div>
          )}
        </>
      ) : (
        <div className="content-caveat"><strong>Explanation pending editorial review</strong><p>This answer follows the current bank key. It contributes less trustworthy evidence until a source-backed explanation is added.</p></div>
      )}

      <button className="button button--primary" onClick={onNext}>{isLast ? "Finish session" : "Continue"}</button>
    </section>
  );
}
