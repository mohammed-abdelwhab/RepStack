import type { MockDay, WorkoutSession } from "../types/mock";

interface SideDrawerProps {
  isOpen: boolean;
  days: MockDay[];
  activeDayId: string;
  sessions: WorkoutSession[];
  onDayChange: (id: string) => void;
  onClose: () => void;
}

const DAY_ICONS: Record<string, string> = {
  Push: "💪",
  Pull: "🔗",
  Leg: "🦵",
  "Chest + Back": "⚔️",
  "Shoulder + Arm": "💡",
};

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function SideDrawer({
  isOpen,
  days,
  activeDayId,
  sessions,
  onDayChange,
  onClose,
}: SideDrawerProps) {
  // Last session for each day
  const lastSessionByDay = (dayId: string): WorkoutSession | undefined => {
    return sessions
      .filter((s) => s.dayId === dayId)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
  };

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        id="drawer-backdrop"
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-50 transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: isOpen ? "blur(3px)" : "none",
          WebkitBackdropFilter: isOpen ? "blur(3px)" : "none",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* ── Drawer panel ──────────────────────────────────────────────────── */}
      <nav
        id="side-drawer"
        aria-label="Workout navigation"
        aria-hidden={!isOpen}
        className="fixed top-0 left-0 bottom-0 z-[60] flex flex-col"
        style={{
          width: "min(80vw, 300px)",
          background: "#121212",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: isOpen ? "8px 0 40px rgba(0,0,0,0.6)" : "none",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          paddingTop: "env(safe-area-inset-top, 0px)",
          willChange: "transform",
        }}
      >
        {/* ── Drawer header ─────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 20 }} aria-hidden>
              🏋️
            </span>
            <span
              className="font-display"
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: "#white",
                letterSpacing: "0.06em",
              }}
            >
              MY WORKOUTS
            </span>
          </div>
          <button
            id="close-drawer-btn"
            onClick={onClose}
            aria-label="Close navigation"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#565C66",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Section label ─────────────────────────────────────────────── */}
        <p
          className="font-body px-4 pt-4 pb-2"
          style={{
            fontSize: 10,
            color: "#565C66",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          Training Days
        </p>

        {/* ── Day list ──────────────────────────────────────────────────── */}
        <ul
          className="flex flex-col px-2 gap-0.5 flex-1 overflow-y-auto"
          role="list"
        >
          {days.map((day, index) => {
            const isActive = activeDayId === day.id;
            const lastSession = lastSessionByDay(day.id);
            const icon = DAY_ICONS[day.name] ?? "🏋️";

            return (
              <li key={day.id}>
                <button
                  id={`drawer-day-${day.id}`}
                  onClick={() => {
                    onDayChange(day.id);
                    onClose();
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98] cursor-pointer group/day"
                  style={{
                    background: isActive
                      ? "rgba(223, 255, 0, 0.08)"
                      : "transparent",
                    border: `1px solid ${isActive ? "rgba(223, 255, 0, 0.2)" : "transparent"}`,
                    WebkitTapHighlightColor: "transparent",
                    textAlign: "left",
                  }}
                >
                  {/* Day icon */}
                  <span
                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{
                      width: 40,
                      height: 40,
                      background: isActive
                        ? "rgba(223, 255, 0, 0.12)"
                        : "rgba(255, 255, 255, 0.04)",
                      fontSize: 18,
                      transition: "background 200ms",
                    }}
                    aria-hidden
                  >
                    {icon}
                  </span>

                  {/* Day info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="font-body"
                        style={{
                          fontSize: 10,
                          color: isActive ? "#dfff00" : "#565C66",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          transition: "color 200ms",
                        }}
                      >
                        D{index + 1}
                      </span>
                      <span
                        className="font-body font-medium truncate"
                        style={{
                          fontSize: 14,
                          color: "#e5e2e1",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {day.name}
                      </span>
                    </div>
                    <p
                      className="font-body truncate mt-0.5"
                      style={{ fontSize: 11, color: "#565C66" }}
                    >
                      {lastSession
                        ? `Last: ${formatShortDate(lastSession.date)}`
                        : `${day.exercises.length} exercises`}
                    </p>
                  </div>

                  {/* Active arrow */}
                  {isActive && (
                    <span
                      className="flex-shrink-0"
                      style={{ color: "#dfff00", fontSize: 12 }}
                      aria-hidden
                    >
                      ▶
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
