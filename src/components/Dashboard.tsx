import { useMemo, useState } from "react";
import type { CertPack, Progress } from "../types";
import {
  DOMAIN_CLEAR_AT,
  dailyQuests,
  domainMastery,
  dueForReview,
  examReadiness,
  examRunway,
  msUntilQuestReset,
  questXpRemaining,
  weeklyXp,
  xpForAnswer,
} from "../lib/game";
import { buildQueue, masteryOf, MASTERY_LABEL, MASTERY_ORDER } from "../lib/srs";
import type { Mastery } from "../types";

function countdown(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function overdueLabel(daysOverdue: number): { text: string; tone: string } {
  if (daysOverdue >= 1) return { text: "overdue", tone: "warn" };
  if (daysOverdue >= 0) return { text: "today", tone: "" };
  return { text: `+${Math.abs(daysOverdue)}d`, tone: "quiet" };
}

export function Dashboard({
  pack,
  packs,
  progress,
  onStartDrill,
  onSetExamDate,
}: {
  pack: CertPack;
  packs: CertPack[];
  progress: Progress;
  onStartDrill: () => void;
  onSetExamDate: (packId: string, date: string | null) => void;
}) {
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const readiness = examReadiness(pack, progress);
  const domains = useMemo(() => domainMastery(pack, progress), [pack, progress]);
  const due = useMemo(() => dueForReview(pack, progress), [pack, progress]);
  const spread = useMemo(() => {
    const c: Record<Mastery, number> = { unseen: 0, missed: 0, learning: 0, solid: 0, mastered: 0 };
    for (const q of pack.questions) c[masteryOf(progress.records[q.id])]++;
    return c;
  }, [pack, progress]);

  const quests = dailyQuests(progress);
  const questsDone = quests.filter((q) => q.cleared).length;
  const week = weeklyXp(progress);

  // The next set is the weakest slice of the pool, which is what the hero offers.
  const nextUp = useMemo(() => buildQueue(pack.questions, progress, "weak", 12), [pack, progress]);
  const focusDomain = nextUp[0]?.domain ?? domains[0]?.name ?? "the pool";
  // Priced per card rather than at a flat rate — the weak queue is mostly
  // unseen and missed cards, which are the ones worth the most.
  const setValue = useMemo(
    () => nextUp.reduce((sum, q) => sum + xpForAnswer(true, 0, masteryOf(progress.records[q.id])), 0),
    [nextUp, progress]
  );
  const clearedCount = domains.filter((d) => d.cleared).length;

  return (
    <div className="dash">
      <div className="dash-main">
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="hero-crumb">
                <span className="eyebrow">Resume run</span>
                <span className="sep" aria-hidden />
                <span className="where">
                  {pack.name} · {focusDomain}
                </span>
              </div>
              <h2>
                {nextUp.length === 0
                  ? "Everything here is scheduled"
                  : `${nextUp.length} questions queued on your weakest ground`}
              </h2>
              <p>
                {nextUp.length === 0
                  ? "Nothing is due on this track right now. Switch tracks or drill anyway to push mastery higher."
                  : "Adaptive set weighted to the objectives you are shakiest on. Clearing it moves this track toward exam ready."}
              </p>
              <div className="hero-actions">
                <button className="btn primary" onClick={onStartDrill}>
                  Continue drill · {Math.max(1, nextUp.length)} Q
                </button>
                <span className="hero-cost">
                  ~{Math.max(1, Math.round(nextUp.length * 0.75))} min · up to +
                  {setValue.toLocaleString()} XP
                </span>
              </div>
            </div>

            <div className="dial" style={{ ["--pct" as string]: readiness }}>
              <div className="dial-core">
                <div>
                  <b>
                    {readiness}
                    <i>%</i>
                  </b>
                  <span>EXAM READY</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The portfolio view of every track lives on the profile. This page is
            about the track you are actually on, and the rail switches between
            them — no third place showing the same readiness bars. */}
        <section className="tile">
          <div className="tile-head">
            <div className="tile-title">Domain mastery · {pack.name}</div>
            <span className="pill quiet">
              {clearedCount} / {domains.length} cleared
            </span>
          </div>
          {domains.map((d) => (
            <div className="domain-row" key={d.name}>
              <span className="txt">{d.name}</span>
              <span className="bar">
                <i
                  style={{
                    width: `${d.readiness}%`,
                    background: d.cleared ? "var(--pass)" : "var(--accent)",
                  }}
                />
              </span>
              <span className="pct">{d.readiness}%</span>
            </div>
          ))}
          <div className="mastery-bar" style={{ marginTop: 14 }}>
            {MASTERY_ORDER.map((m) =>
              spread[m] > 0 ? (
                <div
                  key={m}
                  style={{ flexGrow: spread[m], background: `var(--${m})` }}
                  title={`${MASTERY_LABEL[m]}: ${spread[m]}`}
                />
              ) : null
            )}
          </div>
          <div className="legend">
            {MASTERY_ORDER.map((m) => (
              <span key={m}>
                <i style={{ background: `var(--${m})` }} />
                {MASTERY_LABEL[m]} {spread[m]}
              </span>
            ))}
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--dim)" }}>
            A domain clears at {DOMAIN_CLEAR_AT}% readiness. Unseen and missed questions count zero,
            so this only moves when you actually get things right.
          </p>
        </section>
      </div>

      <div className="dash-side">
        <section className="tile">
          <div className="tile-head">
            <div className="tile-title">Daily quests</div>
            <span className="pill quiet">resets in {countdown(msUntilQuestReset())}</span>
          </div>
          {quests.map((q) => (
            <div className={`quest-row${q.cleared ? " done" : ""}`} key={q.id}>
              <span className="quest-check" aria-hidden>
                {q.cleared ? "✓" : ""}
              </span>
              <span className="quest-body">
                <b>{q.label}</b>
                {!q.cleared && (
                  <span className="meter">
                    <i style={{ width: `${(q.done / q.target) * 100}%` }} />
                  </span>
                )}
              </span>
              <span className="quest-reward">+{q.reward}</span>
            </div>
          ))}
          <div className="track-card-foot">
            <span>
              {questsDone} / {quests.length} cleared
            </span>
            <span>{questXpRemaining(progress).toLocaleString()} XP left</span>
          </div>
        </section>

        <section className="tile">
          <div className="tile-head">
            <div className="tile-title">Due for review</div>
            <span className="pill">{due.total} cards</span>
          </div>
          {due.total === 0 ? (
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
              Nothing is due on this track. Cards appear here once you have answered them and their
              interval comes round.
            </p>
          ) : (
            due.groups.slice(0, 5).map((g) => {
              const label = overdueLabel(g.daysOverdue);
              return (
                <div className="side-row" key={g.domain}>
                  <span className="track-meta">
                    <b>{g.domain}</b>
                    <span>{g.count} cards</span>
                  </span>
                  <span className={`pill ${label.tone}`}>{label.text}</span>
                </div>
              );
            })
          )}
        </section>

        <section className="tile">
          <div className="tile-head">
            <div className="tile-title">Exam runway</div>
          </div>
          {packs.map((p) => {
            const run = examRunway(progress, p.id);
            const editing = editingDate === p.id;
            return (
              <div className="side-row" key={p.id}>
                <span className="track-meta">
                  <b>{p.name}</b>
                  <span>
                    {run.daysLeft === null
                      ? "no date set"
                      : run.daysLeft >= 0
                        ? `${run.date} · booked`
                        : `${run.date} · passed`}
                  </span>
                </span>
                {editing ? (
                  <input
                    className="date-input"
                    type="date"
                    autoFocus
                    defaultValue={run.date ?? ""}
                    aria-label={`Exam date for ${p.name}`}
                    onBlur={() => setEditingDate(null)}
                    onChange={(e) => {
                      onSetExamDate(p.id, e.target.value || null);
                      setEditingDate(null);
                    }}
                  />
                ) : (
                  <button className="runway-set" onClick={() => setEditingDate(p.id)}>
                    {run.daysLeft === null ? "set date" : `${Math.abs(run.daysLeft)}d`}
                  </button>
                )}
              </div>
            );
          })}
          <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--dim)" }}>
            At {Math.round(week.xp / 7).toLocaleString()} XP/day this week.
          </p>
        </section>
      </div>
    </div>
  );
}
