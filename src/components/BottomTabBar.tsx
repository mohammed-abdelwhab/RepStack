import type { MockDay } from "../types/mock";

interface BottomTabBarProps {
  days: MockDay[];
  activeDay: string;
  onDayChange: (id: string) => void;
  /** Optional extra tab for the Stats/Dashboard view */
  statsTab?: { id: string; name: string };
  activeIsStats?: boolean;
  onStatsOpen?: () => void;
}

// Day-number abbreviations: Push=1, Pull=2, Leg=3, etc.
const DAY_ICONS: Record<string, string> = {
  Push: "💪",
  Pull: "🔗",
  Leg: "🦵",
  "Chest + Back": "⚔️",
  "Shoulder + Arm": "💡",
};

export function BottomTabBar({
  days,
  activeDay,
  onDayChange,
  statsTab,
  activeIsStats = false,
  onStatsOpen,
}: BottomTabBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background:
          "linear-gradient(180deg, rgba(30,33,38,0.85) 0%, #1E2126 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(86,92,102,0.3)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      aria-label="Day navigation"
    >
      {days.map((day, index) => {
        const isActive = !activeIsStats && activeDay === day.id;
        const icon = DAY_ICONS[day.name] ?? "🏋️";
        return (
          <button
            key={day.id}
            id={`tab-${day.id}`}
            aria-label={`Day ${index + 1}: ${day.name}`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onDayChange(day.id)}
            className="group flex flex-col items-center justify-end flex-1 pt-2 pb-1.5 gap-0.5 cursor-pointer select-none"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {/* Active indicator bar at bottom */}
            <span
              className="absolute bottom-0 h-[2px] w-8 rounded-full transition-all duration-200"
              style={{
                background: isActive ? "#dfff00" : "transparent",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />

            {/* Icon */}
            <span
              className="text-xl leading-none transition-transform duration-150 group-active:scale-90"
              aria-hidden
            >
              {icon}
            </span>

            {/* Day number + abbreviated name */}
            <span
              className="leading-none transition-colors duration-200 font-display"
              style={{
                fontSize: "11px",
                letterSpacing: "0.03em",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#dfff00" : "#565C66",
              }}
            >
              D{index + 1}
            </span>

            {/* Day name */}
            <span
              className="leading-none font-body truncate max-w-[56px] text-center"
              style={{
                fontSize: "9px",
                letterSpacing: "0.02em",
                color: isActive ? "#e5e2e1" : "#565C66",
                transition: "color 200ms",
              }}
            >
              {day.name}
            </span>
          </button>
        );
      })}

      {/* Stats tab */}
      {statsTab && onStatsOpen && (
        <button
          id={`tab-${statsTab.id}`}
          aria-label="Weekly stats"
          aria-current={activeIsStats ? "page" : undefined}
          onClick={onStatsOpen}
          className="group flex flex-col items-center justify-end flex-1 pt-2 pb-1.5 gap-0.5 relative cursor-pointer select-none"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <span
            className="absolute bottom-0 h-[2px] w-8 rounded-full transition-all duration-200"
            style={{
              background: activeIsStats ? "#dfff00" : "transparent",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
          <span
            className="text-xl leading-none transition-transform duration-150 group-active:scale-90"
            aria-hidden
          >
            📊
          </span>
          <span
            className="leading-none font-display"
            style={{
              fontSize: "11px",
              letterSpacing: "0.03em",
              fontWeight: activeIsStats ? 600 : 400,
              color: activeIsStats ? "#dfff00" : "#565C66",
            }}
          >
            WK
          </span>
          <span
            className="leading-none font-body"
            style={{
              fontSize: "9px",
              color: activeIsStats ? "#e5e2e1" : "#565C66",
              transition: "color 200ms",
            }}
          >
            Stats
          </span>
        </button>
      )}
    </nav>
  );
}
