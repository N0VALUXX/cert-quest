import { useMemo, useState } from "react";
import type { CertPack, Progress, UserProfile } from "../types";
import {
  ACCENTS,
  accentById,
  domainMastery,
  earnedTitle,
  examReadiness,
  examRunway,
  initialsOf,
  levelFromXp,
  packXp,
  totalXp,
  weeklyXp,
  xpIntoLevel,
} from "../lib/game";
import { REST_DAY_CAP, todayKey } from "../lib/srs";

function idleLabel(progress: Progress, pack: CertPack): string {
  let last = 0;
  for (const q of pack.questions) {
    const rec = progress.records[q.id];
    if (rec && rec.last > last) last = rec.last;
  }
  if (last === 0) return "not started";
  const days = Math.floor((Date.now() - last) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export function Profile({
  packs,
  progress,
  onSetProfile,
  onSetExamDate,
  onReset,
  onExport,
  onImport,
}: {
  packs: CertPack[];
  progress: Progress;
  onSetProfile: (patch: Partial<UserProfile>) => void;
  onSetExamDate: (packId: string, date: string | null) => void;
  onReset: () => void;
  onExport: () => string;
  onImport: (raw: string) => void;
}) {
  const [msg, setMsg] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const xp = totalXp(progress);
  const level = levelFromXp(xp);
  const ring = xpIntoLevel(xp);
  const week = weeklyXp(progress);
  const accent = accentById(progress.profile.accent);
  const title = useMemo(() => earnedTitle(packs, progress), [packs, progress]);

  const clears = useMemo(() => {
    const out: { pack: string; domain: string }[] = [];
    for (const pack of packs) {
      for (const d of domainMastery(pack, progress)) {
        if (d.cleared) out.push({ pack: pack.name, domain: d.name });
      }
    }
    return out;
  }, [packs, progress]);

  // Trailing 30 days, oldest first, for the activity strip.
  const heat = useMemo(() => {
    const out: { key: string; xp: number; answered: number }[] = [];
    for (let d = 29; d >= 0; d--) {
      const key = todayKey(new Date(Date.now() - d * 86_400_000));
      const stat = progress.days[key];
      out.push({ key, xp: stat?.xp ?? 0, answered: stat?.answered ?? 0 });
    }
    return out;
  }, [progress]);
  const peak = Math.max(1, ...heat.map((h) => h.xp));

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

  return (
    <div className="dash">
      <div className="dash-main">
        <section className="identity">
          <div className="identity-badge" style={{ background: accent.hex }}>
            {initialsOf(progress.profile.name)}
          </div>
          <div className="identity-body">
            <input
              className="name-input"
              value={progress.profile.name}
              placeholder="Add your name"
              aria-label="Display name"
              maxLength={32}
              onChange={(e) => onSetProfile({ name: e.target.value })}
            />
            <div className="identity-title">{title}</div>
            <div className="accent-row" role="group" aria-label="Accent colour">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  className="accent-dot"
                  style={{ background: a.hex }}
                  aria-label={a.label}
                  aria-pressed={a.id === progress.profile.accent}
                  onClick={() => onSetProfile({ accent: a.id })}
                />
              ))}
            </div>
          </div>
          <div className="identity-level">
            <b className="mono">{level}</b>
            <span className="eyebrow">level</span>
            <div className="meter" style={{ width: 108, marginTop: 8 }}>
              <i style={{ width: `${ring.pct}%` }} />
            </div>
            <span className="mono identity-xp">
              {ring.into.toLocaleString()} / {ring.span.toLocaleString()} XP
            </span>
          </div>
        </section>

        <div className="stat-grid">
          <div className="stat">
            <b style={{ color: "var(--xp)" }}>{progress.streakDays}</b>
            <span>day streak</span>
          </div>
          <div className="stat">
            <b>{progress.bestStreakDays}</b>
            <span>best streak</span>
          </div>
          <div className="stat">
            <b style={{ color: "var(--accent-hi)" }}>
              {progress.restDays} / {REST_DAY_CAP}
            </b>
            <span>rest days banked</span>
          </div>
          <div className="stat">
            <b>{xp.toLocaleString()}</b>
            <span>total xp</span>
          </div>
          <div className="stat">
            <b style={{ color: "var(--pass)" }}>{clears.length}</b>
            <span>domains cleared</span>
          </div>
          <div className="stat">
            <b>×{progress.bestCombo}</b>
            <span>best combo</span>
          </div>
        </div>

        <section className="tile">
          <div className="tile-head">
            <div className="tile-title">Last 30 days</div>
            <span className="pill quiet">{week.xp.toLocaleString()} XP this week</span>
          </div>
          <div className="heat">
            {heat.map((h) => (
              <i
                key={h.key}
                title={`${h.key} · ${h.answered} answered · ${h.xp} XP`}
                style={{ opacity: h.xp === 0 ? 0.12 : 0.25 + (h.xp / peak) * 0.75 }}
              />
            ))}
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--dim)" }}>
            A rest day is banked for every week you hold the streak, up to {REST_DAY_CAP}. They are
            spent automatically when you miss a day, so one bad day does not end a run.
          </p>
        </section>

        <section className="tile">
          <div className="tile-head">
            <div className="tile-title">Tracks</div>
            <span className="pill quiet">{packs.length} enrolled</span>
          </div>
          {packs.map((p) => {
            const doms = domainMastery(p, progress);
            const cleared = doms.filter((d) => d.cleared).length;
            const run = examRunway(progress, p.id);
            return (
              <div className="side-row" key={p.id}>
                <span className="track-meta">
                  <b>{p.name}</b>
                  <span>
                    LV {levelFromXp(packXp(progress, p.id))} · {cleared}/{doms.length} domains ·{" "}
                    {idleLabel(progress, p)}
                  </span>
                </span>
                <span className="track-readiness">
                  <span className="meter" style={{ width: 84 }}>
                    <i style={{ width: `${examReadiness(p, progress)}%` }} />
                  </span>
                  <input
                    className="date-input"
                    type="date"
                    value={run.date ?? ""}
                    aria-label={`Exam date for ${p.name}`}
                    onChange={(e) => onSetExamDate(p.id, e.target.value || null)}
                  />
                </span>
              </div>
            );
          })}
        </section>
      </div>

      <div className="dash-side">
        <section className="tile">
          <div className="tile-head">
            <div className="tile-title">Cleared</div>
            <span className="pill good">{clears.length}</span>
          </div>
          {clears.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
              Nothing cleared yet. A domain clears once it reaches 80% readiness — that is the
              milestone worth chasing, not the XP total.
            </p>
          ) : (
            clears.map((c) => (
              <div className="side-row" key={`${c.pack}-${c.domain}`}>
                <span className="clear-mark" aria-hidden>
                  ✓
                </span>
                <span className="track-meta">
                  <b>{c.domain}</b>
                  <span>{c.pack}</span>
                </span>
              </div>
            ))
          )}
        </section>

        <section className="tile">
          <div className="tile-head">
            <div className="tile-title">Your data</div>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--muted)" }}>
            Everything lives in this browser and nothing is sent anywhere. Export before clearing
            site data — it is the only copy.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn" onClick={download}>
              Export
            </button>
            <label className="btn" style={{ cursor: "pointer" }}>
              Import
              <input type="file" accept="application/json" hidden onChange={upload} />
            </label>
            {confirmReset ? (
              <>
                <button
                  className="btn danger"
                  onClick={() => {
                    onReset();
                    setConfirmReset(false);
                    setMsg("Progress cleared.");
                  }}
                >
                  Erase everything
                </button>
                <button className="btn ghost" onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn ghost" onClick={() => setConfirmReset(true)}>
                Reset
              </button>
            )}
          </div>
          {msg && (
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--accent-hi)" }}>{msg}</p>
          )}
        </section>
      </div>
    </div>
  );
}
