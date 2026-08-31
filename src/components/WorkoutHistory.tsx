import type { WorkoutSession } from '../types/mock';

interface WorkoutHistoryProps {
  sessions: WorkoutSession[];
}

const DAY_COLORS: Record<string, string> = {
  'Push':           '#C4622D',
  'Pull':           '#5B7FA6',
  'Leg':            '#6B8F5E',
  'Chest + Back':   '#8B6BAE',
  'Shoulder + Arm': '#A68B5B',
};

const DAY_ICONS: Record<string, string> = {
  'Push':           '💪',
  'Pull':           '🔗',
  'Leg':            '🦵',
  'Chest + Back':   '⚔️',
  'Shoulder + Arm': '💡',
};

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function WorkoutHistory({ sessions }: WorkoutHistoryProps) {
  // Sort newest first
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section aria-label="Workout history">
      <h3
        className="font-body font-semibold text-chalk mb-3"
        style={{ fontSize: 13, letterSpacing: '-0.01em' }}
      >
        Workout History
      </h3>

      {sorted.length === 0 ? (
        <div
          className="rounded-xl px-4 py-8 text-center"
          style={{ background: 'rgba(86,92,102,0.06)', border: '1px dashed rgba(86,92,102,0.2)' }}
        >
          <p className="font-body" style={{ fontSize: 13, color: '#565C66' }}>
            No workouts logged yet.
          </p>
          <p className="font-body mt-1" style={{ fontSize: 11, color: '#565C66', opacity: 0.7 }}>
            Tap "Log Workout" after finishing a session.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" role="list">
          {sorted.map((session) => {
            const accent = DAY_COLORS[session.dayName] ?? '#565C66';
            const icon = DAY_ICONS[session.dayName] ?? '🏋️';

            return (
              <li
                key={session.id}
                className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  background: 'rgba(86,92,102,0.07)',
                  border: '1px solid rgba(86,92,102,0.12)',
                }}
              >
                {/* Day icon blob */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-xl"
                  style={{
                    width: 40,
                    height: 40,
                    background: `${accent}18`,
                    border: `1px solid ${accent}30`,
                    fontSize: 18,
                  }}
                  aria-hidden
                >
                  {icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-body font-medium truncate"
                    style={{ fontSize: 13, color: '#EDEDEA', letterSpacing: '-0.01em' }}
                  >
                    {session.dayName}
                  </p>
                  <p
                    className="font-body truncate mt-0.5"
                    style={{ fontSize: 11, color: '#565C66' }}
                  >
                    {formatFullDate(session.date)}
                  </p>
                </div>

                {/* Volume — Oswald large */}
                <div className="flex-shrink-0 flex flex-col items-end">
                  <div className="flex items-baseline gap-0.5">
                    <span
                      className="font-display"
                      style={{ fontSize: 20, fontWeight: 700, color: accent, lineHeight: 1 }}
                    >
                      {session.totalVolume >= 1000
                        ? `${(session.totalVolume / 1000).toFixed(1)}k`
                        : session.totalVolume}
                    </span>
                    <span
                      className="font-body"
                      style={{ fontSize: 10, color: '#565C66', marginBottom: 1 }}
                    >
                      kg
                    </span>
                  </div>
                  <span
                    className="font-body"
                    style={{ fontSize: 9, color: '#565C66', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 1 }}
                  >
                    volume
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
