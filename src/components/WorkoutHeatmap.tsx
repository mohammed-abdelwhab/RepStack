import { useState, useMemo } from "react";
import type { Session } from "../schemas/sessions";
import type { WorkoutDay } from "../schemas/workoutDays";
import type { SetEntry } from "../schemas/setEntries";

interface WorkoutHeatmapProps {
  sessions: Session[];
  workoutDays: WorkoutDay[];
  setEntries: SetEntry[];
}

interface DayActivity {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Sun, 1 = Mon ...
  count: number;
  routines: string[];
  totalVolume: number;
  totalSets: number;
}

export function WorkoutHeatmap({
  sessions,
  workoutDays,
  setEntries,
}: WorkoutHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  // Pre-calculate volume per session
  const sessionVolumeMap = useMemo(() => {
    const map = new Map<number, { volume: number; setsCount: number }>();
    setEntries.forEach((entry) => {
      const current = map.get(entry.session_id) || { volume: 0, setsCount: 0 };
      const weight = entry.weight ?? 0;
      const reps = entry.reps ?? 0;
      current.volume += weight * reps;
      if (weight > 0 || reps > 0) {
        current.setsCount += 1;
      }
      map.set(entry.session_id, current);
    });
    return map;
  }, [setEntries]);

  // Aggregate sessions by date
  const activityByDate = useMemo(() => {
    const map = new Map<string, { count: number; routines: string[]; volume: number; sets: number }>();

    sessions.forEach((s) => {
      const dateKey = s.performed_on;
      const dayName =
        workoutDays.find((d) => d.id === s.workout_day_id)?.name || "Workout";
      const volData = sessionVolumeMap.get(s.id) || { volume: 0, setsCount: 0 };

      const existing = map.get(dateKey) || {
        count: 0,
        routines: [],
        volume: 0,
        sets: 0,
      };

      existing.count += 1;
      existing.routines.push(dayName);
      existing.volume += volData.volume;
      existing.sets += volData.setsCount;

      map.set(dateKey, existing);
    });

    return map;
  }, [sessions, workoutDays, sessionVolumeMap]);

  // Generate 52 weeks (364 days) calendar matrix ending today
  const { weeks, stats } = useMemo(() => {
    const now = new Date();
    const daysArray: DayActivity[] = [];
    const totalDaysToGenerate = 52 * 7; // 52 weeks

    // Calculate start date
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - (totalDaysToGenerate - 1));

    let activeDaysCount = 0;

    for (let i = 0; i < totalDaysToGenerate; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const data = activityByDate.get(dateStr);
      const count = data?.count || 0;
      if (count > 0) activeDaysCount++;

      daysArray.push({
        dateStr,
        dayOfWeek: d.getDay(),
        count,
        routines: data?.routines || [],
        totalVolume: data?.volume || 0,
        totalSets: data?.sets || 0,
      });
    }

    // Group into 52 columns of 7 rows
    const weekColumns: DayActivity[][] = [];
    for (let w = 0; w < 52; w++) {
      weekColumns.push(daysArray.slice(w * 7, (w + 1) * 7));
    }

    // Calculate Current Streak & Longest Streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Iterate backwards from today to find current streak
    const reversed = [...daysArray].reverse();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    let streakActive =
      (activityByDate.get(todayStr)?.count || 0) > 0 ||
      (activityByDate.get(yesterdayStr)?.count || 0) > 0;

    if (streakActive) {
      for (const day of reversed) {
        if (day.count > 0) {
          currentStreak++;
        } else {
          // If today wasn't logged yet, don't break immediately if yesterday was logged
          if (day.dateStr === todayStr) continue;
          break;
        }
      }
    }

    // Longest streak
    for (const day of daysArray) {
      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    return {
      weeks: weekColumns,
      stats: {
        totalWorkouts: sessions.length,
        activeDays: activeDaysCount,
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
      },
    };
  }, [activityByDate, sessions.length]);

  // Color Intensity function
  const getCellStyles = (day: DayActivity) => {
    if (day.count === 0) {
      return {
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      };
    }
    if (day.totalVolume > 6000 || day.count >= 2) {
      return {
        background: "#dfff00",
        border: "1px solid #dfff00",
        boxShadow: "0 0 6px rgba(223, 255, 0, 0.5)",
      };
    }
    if (day.totalVolume > 2500 || day.count === 1) {
      return {
        background: "rgba(223, 255, 0, 0.7)",
        border: "1px solid rgba(223, 255, 0, 0.8)",
      };
    }
    return {
      background: "rgba(223, 255, 0, 0.3)",
      border: "1px solid rgba(223, 255, 0, 0.4)",
    };
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <section
      className="rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
      style={{
        background: "#121212",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* ── Top Header & Streak Stats ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🗓️</span>
            <h3 className="font-display font-black text-sm tracking-wide text-white uppercase">
              Training Activity
            </h3>
          </div>
          <p className="font-body text-xs text-steel mt-0.5">
            {stats.totalWorkouts} workouts logged in the past year
          </p>
        </div>

        {/* Streak Counters */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(223, 255, 0, 0.08)",
              border: "1px solid rgba(223, 255, 0, 0.25)",
            }}
          >
            <span className="text-xs">🔥</span>
            <span className="font-mono text-xs font-bold text-[#dfff00]">
              {stats.currentStreak} Day{stats.currentStreak === 1 ? "" : "s"} Streak
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <span className="text-xs">🏆</span>
            <span className="font-mono text-xs font-semibold text-white">
              Best: {stats.longestStreak}d
            </span>
          </div>
        </div>
      </div>

      {/* ── Heatmap Grid ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
        <div className="min-w-[620px]">
          {/* Month Labels Bar */}
          <div className="flex text-[10px] font-mono text-steel/70 mb-1.5 pl-6">
            {weeks.map((week, wIdx) => {
              const firstDay = week[0];
              const dayDate = new Date(firstDay.dateStr);
              // Show month name when it's the first week of that month
              if (dayDate.getDate() <= 7 && wIdx % 4 === 0) {
                return (
                  <span
                    key={wIdx}
                    className="truncate"
                    style={{ width: "calc(100% / 13)" }}
                  >
                    {monthNames[dayDate.getMonth()]}
                  </span>
                );
              }
              return null;
            })}
          </div>

          {/* Grid with Day Labels on Left */}
          <div className="flex gap-2 items-start">
            {/* Day of Week labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[9px] font-mono text-steel/60 pt-0.5 h-[90px] pr-1 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Matrix of 52 Columns */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const style = getCellStyles(day);
                    const isHovered = hoveredDay?.dateStr === day.dateStr;

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        aria-label={`${day.dateStr}: ${day.count} workouts`}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() =>
                          setHoveredDay(
                            hoveredDay?.dateStr === day.dateStr ? null : day,
                          )
                        }
                        className="w-3 h-3 rounded-[2.5px] transition-transform duration-100 cursor-pointer focus:outline-none"
                        style={{
                          ...style,
                          transform: isHovered ? "scale(1.35)" : "scale(1)",
                          zIndex: isHovered ? 20 : 1,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Popover / Tooltip Information ───────────────────────────── */}
      <div
        className="rounded-xl px-3.5 py-2.5 flex items-center justify-between min-h-[44px] transition-all"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        {hoveredDay ? (
          <div className="flex items-center justify-between w-full text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-steel">{hoveredDay.dateStr}</span>
              <span className="font-display font-bold text-white uppercase">
                {hoveredDay.count > 0
                  ? hoveredDay.routines.join(" & ")
                  : "Rest Day"}
              </span>
            </div>
            {hoveredDay.count > 0 && (
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-steel">
                  {hoveredDay.totalSets} Sets
                </span>
                <span className="font-bold text-[#dfff00]">
                  {hoveredDay.totalVolume.toLocaleString()} kg volume
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-xs text-steel">
            <span>Hover or tap a square to view workout details</span>
            {/* Legend */}
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-[2px] bg-white/5 border border-white/10" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#dfff00]/30 border border-[#dfff00]/40" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#dfff00]/70 border border-[#dfff00]/80" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#dfff00] shadow-[0_0_4px_rgba(223,255,0,0.6)]" />
              <span>More</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default WorkoutHeatmap;
