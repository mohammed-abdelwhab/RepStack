import type { PREntry, WorkoutSession } from '../types/mock';
import { WorkoutHistory } from './WorkoutHistory';

interface WeeklyDashboardShellProps {
  sessions: WorkoutSession[];
  prFeed: PREntry[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Derive weekly volume bars from real sessions ─────────────────────────────
function getWeekBars(sessions: WorkoutSession[]): { dayLabel: string; date: string; volume: number }[] {
  // Build Mon–Sun for the current week
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-GB', { weekday: 'short' });
    const volume = sessions
      .filter((s) => s.date === iso)
      .reduce((acc, s) => acc + s.totalVolume, 0);
    return { dayLabel: label, date: iso, volume };
  });
}

// ─── Volume Bar Chart ─────────────────────────────────────────────────────────
function VolumeChart({ sessions }: { sessions: WorkoutSession[] }) {
  const bars = getWeekBars(sessions);
  const maxVol = Math.max(...bars.map((b) => b.volume), 1);
  const today = new Date().toISOString().split('T')[0];

  return (
    <section aria-label="Weekly volume chart">
      <div className="flex items-baseline justify-between mb-3">
        <h3
          className="font-body font-semibold text-chalk"
          style={{ fontSize: 13, letterSpacing: '-0.01em' }}
        >
          Volume This Week
        </h3>
        <span
          className="font-body"
          style={{ fontSize: 11, color: '#565C66', letterSpacing: '0.04em' }}
        >
          kg × reps
        </span>
      </div>

      <div
        className="flex items-end gap-1.5"
        style={{ height: 110 }}
        role="img"
        aria-label="Weekly volume bar chart"
      >
        {bars.map((bar) => {
          const pct = bar.volume / maxVol;
          const isRest = bar.volume === 0;
          const isToday = bar.date === today;

          return (
            <div
              key={bar.dayLabel}
              className="flex-1 flex flex-col items-center gap-1"
              style={{ height: '100%' }}
            >
              <div className="flex-1 flex items-end w-full group/bar relative">
                <div
                  className="w-full rounded-t-md relative overflow-hidden transition-all duration-500"
                  style={{
                    height: `${Math.max(pct * 100, isRest ? 0 : 3)}%`,
                    background: isRest
                      ? 'rgba(86,92,102,0.1)'
                      : isToday
                      ? 'linear-gradient(180deg, #e07035 0%, rgba(196,98,45,0.55) 100%)'
                      : 'linear-gradient(180deg, #C4622D 0%, rgba(196,98,45,0.45) 100%)',
                    border: isRest ? '1px solid rgba(86,92,102,0.12)' : 'none',
                    boxShadow: isToday && !isRest ? '0 0 12px rgba(196,98,45,0.3)' : 'none',
                  }}
                  aria-label={`${bar.dayLabel}: ${bar.volume.toLocaleString()} kg total`}
                >
                  {!isRest && (
                    <div
                      aria-hidden
                      className="absolute top-0 left-0 right-0"
                      style={{ height: '30%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px 4px 0 0' }}
                    />
                  )}
                </div>

                {/* Hover tooltip */}
                {!isRest && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-150 pointer-events-none"
                    aria-hidden
                  >
                    <div
                      className="rounded px-1.5 py-0.5 font-display whitespace-nowrap"
                      style={{
                        fontSize: 10, fontWeight: 600,
                        background: '#1E2126',
                        border: '1px solid rgba(86,92,102,0.3)',
                        color: '#EDEDEA',
                      }}
                    >
                      {(bar.volume / 1000).toFixed(1)}k
                    </div>
                  </div>
                )}
              </div>

              {/* Day label — bold + iron if today */}
              <span
                className="font-body"
                style={{
                  fontSize: 10,
                  color: isToday ? '#C4622D' : '#565C66',
                  fontWeight: isToday ? 600 : 400,
                  letterSpacing: '0.04em',
                }}
              >
                {bar.dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── PR Feed ──────────────────────────────────────────────────────────────────
function PRFeed({ entries }: { entries: PREntry[] }) {
  return (
    <section aria-label="Recent personal records">
      <h3
        className="font-body font-semibold text-chalk mb-3"
        style={{ fontSize: 13, letterSpacing: '-0.01em' }}
      >
        Recent PRs
      </h3>
      <ul className="flex flex-col gap-2" role="list">
        {entries.map((pr) => (
          <li
            key={pr.id}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-150 hover:-translate-y-0.5"
            style={{
              background: 'rgba(86,92,102,0.08)',
              border: '1px solid rgba(86,92,102,0.12)',
            }}
          >
            <div className="flex-1 min-w-0">
              <p
                className="font-body font-medium text-chalk truncate"
                style={{ fontSize: 13, letterSpacing: '-0.01em' }}
              >
                {pr.exerciseName}
              </p>
              <p
                className="font-body"
                style={{ fontSize: 10, color: '#565C66', marginTop: 1 }}
              >
                {formatDate(pr.date)}
              </p>
            </div>
            <div className="flex items-baseline gap-0.5 ml-3 flex-shrink-0">
              <span className="font-display" style={{ fontSize: 20, fontWeight: 700, color: '#EDEDEA', lineHeight: 1 }}>
                {pr.weight}
              </span>
              <span className="font-body" style={{ fontSize: 10, color: '#565C66', marginBottom: 1 }}>kg</span>
              <span className="font-body mx-1" style={{ fontSize: 10, color: '#565C66', marginBottom: 1 }}>×</span>
              <span className="font-display" style={{ fontSize: 20, fontWeight: 700, color: '#EDEDEA', lineHeight: 1 }}>
                {pr.reps}
              </span>
              <span className="font-body" style={{ fontSize: 10, color: '#565C66', marginBottom: 1 }}>rep</span>
            </div>
          </li>
        ))}
      </ul>
      {entries.length === 0 && (
        <p className="font-body text-center py-8" style={{ fontSize: 13, color: '#565C66' }}>
          No PRs logged yet. Keep lifting! 💪
        </p>
      )}
    </section>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
export function WeeklyDashboardShell({ sessions, prFeed }: WeeklyDashboardShellProps) {
  const bars = getWeekBars(sessions);
  const totalVolume = bars.reduce((acc, b) => acc + b.volume, 0);
  const activeDays = bars.filter((b) => b.volume > 0).length;
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const prThisWeek = prFeed.filter((p) => p.date >= sevenDaysAgo).length;

  return (
    <main className="flex flex-col gap-4 px-4 pt-4" aria-label="Weekly dashboard">
      {/* ── Week summary header ───────────────────────────────────────────── */}
      <header>
        <h1
          className="font-body font-semibold text-chalk"
          style={{ fontSize: 20, letterSpacing: '-0.02em' }}
        >
          This Week
        </h1>

        <div className="flex gap-2 mt-2">
          {/* Total volume */}
          <div
            className="flex flex-col items-center px-4 py-2 rounded-xl flex-1"
            style={{ background: 'rgba(86,92,102,0.1)', border: '1px solid rgba(86,92,102,0.15)' }}
          >
            <span className="font-display" style={{ fontSize: 24, fontWeight: 700, color: '#C4622D', lineHeight: 1 }}>
              {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume || '—'}
            </span>
            <span className="font-body" style={{ fontSize: 10, color: '#565C66', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
              Total kg
            </span>
          </div>

          {/* Active days */}
          <div
            className="flex flex-col items-center px-4 py-2 rounded-xl flex-1"
            style={{ background: 'rgba(86,92,102,0.1)', border: '1px solid rgba(86,92,102,0.15)' }}
          >
            <span className="font-display" style={{ fontSize: 24, fontWeight: 700, color: '#EDEDEA', lineHeight: 1 }}>
              {activeDays}
            </span>
            <span className="font-body" style={{ fontSize: 10, color: '#565C66', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
              Days trained
            </span>
          </div>

          {/* PRs */}
          <div
            className="flex flex-col items-center px-4 py-2 rounded-xl flex-1"
            style={{ background: 'rgba(86,92,102,0.1)', border: '1px solid rgba(86,92,102,0.15)' }}
          >
            <span className="font-display" style={{ fontSize: 24, fontWeight: 700, color: '#EDEDEA', lineHeight: 1 }}>
              {prThisWeek}
            </span>
            <span className="font-body" style={{ fontSize: 10, color: '#565C66', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
              PRs this wk
            </span>
          </div>
        </div>
      </header>

      {/* ── Volume chart ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: '#1E2126', border: '1px solid rgba(86,92,102,0.2)', boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
      >
        <VolumeChart sessions={sessions} />
      </div>

      {/* ── Workout history ───────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: '#1E2126', border: '1px solid rgba(86,92,102,0.2)', boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
      >
        <WorkoutHistory sessions={sessions} />
      </div>

      {/* ── PR feed ───────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: '#1E2126', border: '1px solid rgba(86,92,102,0.2)', boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
      >
        <PRFeed entries={prFeed} />
      </div>
    </main>
  );
}
