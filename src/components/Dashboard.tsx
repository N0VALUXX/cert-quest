import { useRef, useState } from "react";
import type { CertPack } from "../content-model";
import { attemptsForPack, daysUntil, domainMetrics, packReadiness } from "../model";
import type { ProgressData } from "../progress";

interface Props {
  readonly packs: readonly CertPack[];
  readonly pack: CertPack;
  readonly progress: ProgressData;
  readonly onSelectPack: (packId: string) => void;
  readonly onStart: (mode: "priority" | "new" | "weak") => void;
  readonly onOpenLabs: () => void;
  readonly onSetExamDate: (date: string) => void;
  readonly onExport: () => void;
  readonly onImport: (file: File) => void;
}

export function Dashboard({ packs, pack, progress, onSelectPack, onStart, onOpenLabs, onSetExamDate, onExport, onImport }: Props) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const metrics = domainMetrics(pack, progress);
  const readiness = packReadiness(pack, progress);
  const attempts = attemptsForPack(progress, pack.id);
  const latestSeven = progress.attempts.filter((attempt) => attempt.occurredAt >= Date.now() - 7 * 86_400_000);
  const xp = progress.attempts.reduce((sum, attempt) => sum + attempt.xp, 0);
  const level = 1 + Math.floor(xp / 250);
  const todayKey = localDay(Date.now());
  const today = progress.attempts.filter((attempt) => localDay(attempt.occurredAt) === todayKey);
  const todayDomains = new Set(today.map((attempt) => attempt.domain)).size;
  const examDate = progress.preferences.examDates[pack.id] ?? "";
  const remaining = daysUntil(examDate);
  const explained = pack.questions.filter((question) => pack.enrichment[question.id] !== undefined).length;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "is-open" : ""}`}>
        <div className="brand"><span className="brand-mark">CQ</span><div><strong>CERT QUEST</strong><small>Competence, mapped.</small></div></div>
        <nav aria-label="Primary navigation">
          <a className="nav-item is-active" href="#overview"><span>⌁</span>Mission control</a>
          <a className="nav-item" href="#domains"><span>◫</span>Domain map</a>
          <button className="nav-item" onClick={onOpenLabs}><span>◇</span>Field labs</button>
        </nav>
        <div className="sidebar-section">
          <p>YOUR TRACKS</p>
          {packs.map((candidate) => {
            const candidateReadiness = packReadiness(candidate, progress);
            return (
              <button className={`track-button ${candidate.id === pack.id ? "is-active" : ""}`} onClick={() => { onSelectPack(candidate.id); setMobileMenu(false); }} key={candidate.id}>
                <span className="track-monogram">{candidate.name.slice(0, 2).toUpperCase()}</span>
                <span><strong>{candidate.name}</strong><small>{candidate.questions.length} items</small></span>
                <em>{candidateReadiness}%</em>
              </button>
            );
          })}
        </div>
        <div className="sidebar-footer">
          <div className="level-chip"><span>LV</span><strong>{level}</strong><div><small>{xp % 250} / 250 evidence XP</small><i><b style={{ width: `${((xp % 250) / 250) * 100}%` }} /></i></div></div>
          <button className="text-button" onClick={onExport}>Download progress backup</button>
          <button className="text-button" onClick={() => fileInput.current?.click()}>Restore a backup</button>
          <input className="sr-only" ref={fileInput} type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file !== undefined) onImport(file); }} />
        </div>
      </aside>

      <main className="dashboard" id="overview">
        <header className="dashboard-topbar">
          <button className="mobile-menu" onClick={() => setMobileMenu((current) => !current)} aria-expanded={mobileMenu} aria-label="Toggle navigation">☰</button>
          <div><span>ACTIVE TRACK</span><strong>{pack.name}</strong></div>
          <div className="privacy-badge"><span>●</span> Progress stays on this device</div>
        </header>

        <section className="hero-grid">
          <article className="hero-copy">
            <p className="eyebrow">MISSION BRIEF · {formatDay()}</p>
            <h1>Make the uncertain<br /><em>smaller.</em></h1>
            <p className="hero-lede">You do not need to feel ready all at once. Today’s route targets the evidence gaps that matter most.</p>
            <div className="hero-actions">
              <button className="button button--primary" onClick={() => onStart("priority")}>Begin today’s route <span>→</span></button>
              <button className="button button--ghost" onClick={onOpenLabs}>Open a field lab</button>
            </div>
            <div className="session-note"><span className="pulse-dot" />Suggested session: <strong>10 questions · about 14 min</strong></div>
          </article>

          <article className="readiness-card">
            <div className="readiness-card__top"><span>READINESS SIGNAL</span><span className="signal-status">{readiness >= 75 ? "STEADY" : readiness > 0 ? "FORMING" : "UNCALIBRATED"}</span></div>
            <div className="readiness-core">
              <div className="readiness-ring" style={{ "--readiness": `${readiness * 3.6}deg` } as React.CSSProperties}>
                <div><strong>{readiness}</strong><span>%</span><small>conservative</small></div>
              </div>
              <div className="readiness-context">
                <span>{attempts.length} observations</span>
                <strong>{explained} source-backed explanations</strong>
                <p>Readiness reflects correct, independent answers and coverage—not time spent or XP.</p>
              </div>
            </div>
            <div className="exam-row">
              <div><span>EXAM WINDOW</span><strong>{remaining === null ? "Not set" : remaining === 0 ? "Today" : `${remaining} days`}</strong></div>
              <label><span className="sr-only">Exam date</span><input type="date" value={examDate} onChange={(event) => onSetExamDate(event.target.value)} /></label>
            </div>
          </article>
        </section>

        <section className="route-section">
          <div className="section-heading"><div><p className="eyebrow">TODAY’S ROUTE</p><h2>Three useful moves</h2></div><span>Chosen from your weakest evidence</span></div>
          <div className="route-grid">
            <RouteCard index="01" tone="amber" title="Repair weak signals" description={metrics[0] === undefined ? "Start mapping your first domain." : `${metrics[0].domain} is your least certain domain.`} meta={`${metrics[0]?.readiness ?? 0}% current signal`} action="Start repair set" onClick={() => onStart("weak")} />
            <RouteCard index="02" tone="teal" title="Expand coverage" description={`${Math.max(0, pack.questions.length - new Set(attempts.map((attempt) => attempt.questionId)).size)} questions remain unseen.`} meta="Novel material earns more XP" action="Learn something new" onClick={() => onStart("new")} />
            <RouteCard index="03" tone="violet" title="Apply, don’t recite" description={`${pack.exercises?.length ?? 0} authored labs turn concepts into decisions.`} meta="Multiple interaction formats" action="Enter field lab" onClick={onOpenLabs} />
          </div>
        </section>

        <section className="lower-grid" id="domains">
          <article className="domain-card">
            <div className="section-heading compact"><div><p className="eyebrow">DOMAIN MAP</p><h2>Where confidence is forming</h2></div><span>Conservative estimates</span></div>
            <div className="domain-list">
              {metrics.map((metric, index) => (
                <div className="domain-row" key={metric.domain}>
                  <span className="domain-index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="domain-label"><strong>{metric.domain}</strong><small>{metric.seen} of {metric.total} mapped</small></div>
                  <div className="domain-bar"><i style={{ width: `${metric.readiness}%` }} /></div>
                  <strong className={`domain-score is-${metric.status}`}>{metric.readiness}%</strong>
                </div>
              ))}
            </div>
          </article>

          <aside className="quest-card">
            <div className="quest-orbit" aria-hidden="true"><i /><i /><i /></div>
            <p className="eyebrow">DAILY FIELD NOTES</p>
            <h2>Consistency without punishment.</h2>
            <p>Your rhythm is measured over a week. Missing a day does not erase the work behind you.</p>
            <div className="week-dots">
              {lastSevenDays().map((day) => <span className={latestSeven.some((attempt) => localDay(attempt.occurredAt) === day.key) ? "is-done" : day.key === todayKey ? "is-today" : ""} key={day.key}><i>{day.label}</i><b /></span>)}
            </div>
            <div className="quest-list">
              <Quest label="Map five questions" value={today.length} target={5} />
              <Quest label="Touch two domains" value={todayDomains} target={2} />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

interface RouteCardProps {
  readonly index: string;
  readonly tone: string;
  readonly title: string;
  readonly description: string;
  readonly meta: string;
  readonly action: string;
  readonly onClick: () => void;
}

function RouteCard({ index, tone, title, description, meta, action, onClick }: RouteCardProps) {
  return <article className={`route-card route-card--${tone}`}><span className="route-index">{index}</span><div className="route-glyph" aria-hidden="true"><i /></div><h3>{title}</h3><p>{description}</p><small>{meta}</small><button onClick={onClick}>{action}<span>→</span></button></article>;
}

function Quest({ label, value, target }: { readonly label: string; readonly value: number; readonly target: number }) {
  const complete = value >= target;
  return <div className={complete ? "quest is-complete" : "quest"}><span>{complete ? "✓" : "○"}</span><div><strong>{label}</strong><i><b style={{ width: `${Math.min(100, (value / target) * 100)}%` }} /></i></div><em>{Math.min(value, target)}/{target}</em></div>;
}

function localDay(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function lastSevenDays(): readonly { readonly key: string; readonly label: string }[] {
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    return { key: localDay(date.getTime()), label: date.toLocaleDateString(undefined, { weekday: "narrow" }) };
  });
}

function formatDay(): string {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
}
