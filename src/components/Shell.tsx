import type { ReactNode } from "react";
import type { CertPack, Progress } from "../types";
import { accentById, examReadiness, initialsOf, levelFromXp, totalXp, weeklyXp } from "../lib/game";

export type Tab = "base" | "drill" | "exercises" | "cards" | "browse" | "profile";

export interface NavItem {
  id: Tab;
  label: string;
}

/** Short badge letters for a track, derived rather than stored per pack. */
function trackBadge(pack: CertPack): string {
  const compact = pack.name.replace(/[^A-Za-z0-9+]/g, "");
  return compact.slice(0, 3).toUpperCase();
}

function TrackRow({
  pack,
  progress,
  active,
  onSelect,
}: {
  pack: CertPack;
  progress: Progress;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button className="track-item" aria-current={active} onClick={onSelect}>
      <span className="track-badge">{trackBadge(pack)}</span>
      <span className="track-meta">
        <b>{pack.name}</b>
        <span>{examReadiness(pack, progress)}% ready</span>
      </span>
    </button>
  );
}

export function Shell({
  packs,
  pack,
  progress,
  tab,
  nav,
  onTab,
  onSelectPack,
  children,
}: {
  packs: CertPack[];
  pack: CertPack;
  progress: Progress;
  tab: Tab;
  nav: NavItem[];
  onTab: (t: Tab) => void;
  onSelectPack: (id: string) => void;
  children: ReactNode;
}) {
  const xp = totalXp(progress);
  const level = levelFromXp(xp);
  const week = weeklyXp(progress);
  const accent = accentById(progress.profile.accent);
  const profileName = progress.profile.name.trim();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            C
          </span>
          <span>CERT QUEST</span>
        </div>

        <nav className="topnav" aria-label="Primary">
          {nav.map((n) => (
            <button key={n.id} aria-current={tab === n.id} onClick={() => onTab(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="topbar-spacer" />

        <div className="hud-chip optional" title={`Best streak ${progress.bestStreakDays} days`}>
          <span className="hud-dot" aria-hidden />
          <b>{progress.streakDays}d</b>
          <span>streak</span>
        </div>

        {progress.restDays > 0 && (
          <div
            className="hud-chip optional"
            title={`${progress.restDays} rest day${progress.restDays === 1 ? "" : "s"} banked — spent automatically if you miss a day`}
          >
            <span className="hud-rest" aria-hidden />
            <b>{progress.restDays}</b>
            <span>rest</span>
          </div>
        )}

        <div
          className="hud-level"
          title={`${profileName || "Level"} ${level} · ${xp.toLocaleString()} XP total`}
          style={{ background: accent.hex, color: "var(--bg)", borderColor: accent.hex }}
        >
          {initialsOf(progress.profile.name) === "··" ? level : initialsOf(progress.profile.name)}
        </div>
      </header>

      <div className="app">
        <aside className="rail">
          <div>
            <div className="nav-label">Enrolled</div>
            <div className="track-list">
              {packs.map((p) => (
                <TrackRow
                  key={p.id}
                  pack={p}
                  progress={progress}
                  active={p.id === pack.id}
                  onSelect={() => onSelectPack(p.id)}
                />
              ))}
            </div>
          </div>

          {/* The rail owns tracks, the topbar owns modes. Rendering the mode
              nav in both places made the user choose which nav bar to use. */}
          <div style={{ flex: 1 }} />

          <div className="goal-panel">
            <div className="eyebrow">Weekly goal</div>
            <div className="meter xp" style={{ marginTop: 9 }}>
              <i style={{ width: `${Math.min(100, week.pct)}%` }} />
            </div>
            <p>
              {week.goal.toLocaleString()} XP target — <b>{week.xp.toLocaleString()}</b> in
              {week.best > week.xp && ` · best ${week.best.toLocaleString()}`}
            </p>
          </div>
        </aside>

        <main className="main">{children}</main>
      </div>
    </div>
  );
}
