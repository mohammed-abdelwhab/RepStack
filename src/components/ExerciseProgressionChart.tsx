import { useState, useMemo } from "react";
import { useGymTracker } from "../context/GymTrackerContext";
import {
  getUniqueExerciseNames,
  getExerciseProgressionTimeline,
  getGlobalPRForExercise,
  getLastPerformanceForExercise,
  calculate1RM,
} from "../utils/exerciseUtils";

export function ExerciseProgressionChart() {
  const { state } = useGymTracker();

  // Get list of all distinct exercise names
  const uniqueExerciseNames = useMemo(() => {
    return getUniqueExerciseNames(state.exercises);
  }, [state.exercises]);

  // Selected exercise name (defaults to first available or empty)
  const [selectedExercise, setSelectedExercise] = useState<string>(() => {
    return uniqueExerciseNames[0] || "";
  });

  // Keep selection valid when list updates
  const activeExerciseName = uniqueExerciseNames.includes(selectedExercise)
    ? selectedExercise
    : uniqueExerciseNames[0] || "";

  // Progression points for selected exercise
  const timeline = useMemo(() => {
    if (!activeExerciseName) return [];
    return getExerciseProgressionTimeline(
      activeExerciseName,
      state.exercises,
      state.sessions,
      state.setEntries,
    );
  }, [activeExerciseName, state.exercises, state.sessions, state.setEntries]);

  // Global PR for selected exercise
  const globalPR = useMemo(() => {
    if (!activeExerciseName) return null;
    return getGlobalPRForExercise(
      activeExerciseName,
      state.exercises,
      state.personalRecords,
    );
  }, [activeExerciseName, state.exercises, state.personalRecords]);

  // Last performance for selected exercise
  const lastPerf = useMemo(() => {
    if (!activeExerciseName) return null;
    return getLastPerformanceForExercise(
      activeExerciseName,
      state.exercises,
      state.sessions,
      state.setEntries,
    );
  }, [activeExerciseName, state.exercises, state.sessions, state.setEntries]);

  // Estimated 1RM from current best
  const currentEst1RM = useMemo(() => {
    if (!globalPR) return 0;
    return calculate1RM(globalPR.max_weight, globalPR.max_weight_reps);
  }, [globalPR]);

  // Hovered point for interactive tooltip
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (uniqueExerciseNames.length === 0) {
    return null;
  }

  // ── Calculate Progression Bars with +1 Rep Progress Logic ──────────────────
  const maxWeightAll = Math.max(...timeline.map((p) => p.maxWeight), 1);

  const sessionBars = timeline.map((curr, idx) => {
    if (idx === 0) {
      return {
        ...curr,
        isProgress: true,
        diffBadge: "Baseline",
        badgeColor: "#565C66",
        heightPct: Math.max(
          35,
          Math.round((curr.maxWeight / maxWeightAll) * 100),
        ),
      };
    }

    const prev = timeline[idx - 1];
    const weightDiff = curr.maxWeight - prev.maxWeight;
    const repsDiff = curr.maxReps - prev.maxReps;

    const isWeightUp = weightDiff > 0;
    const isRepsUpAtSameWeight = weightDiff === 0 && repsDiff > 0;
    const isHigherEffectiveVolume = curr.est1RM > prev.est1RM;
    const isProgress =
      isWeightUp || isRepsUpAtSameWeight || isHigherEffectiveVolume;

    let diffBadge = "";
    let badgeColor = "#565C66";

    if (isWeightUp) {
      diffBadge = `▲ +${weightDiff}kg${repsDiff > 0 ? ` (+${repsDiff}r)` : ""}`;
      badgeColor = "#dfff00";
    } else if (isRepsUpAtSameWeight) {
      diffBadge = `▲ +${repsDiff} rep${repsDiff > 1 ? "s" : ""}`;
      badgeColor = "#dfff00";
    } else if (isHigherEffectiveVolume) {
      diffBadge = `▲ Overload`;
      badgeColor = "#dfff00";
    } else if (weightDiff === 0 && repsDiff === 0) {
      diffBadge = `= Equal`;
      badgeColor = "#9ca3af";
    } else {
      diffBadge = `▼ Deload`;
      badgeColor = "#565C66";
    }

    const heightPct = Math.max(
      35,
      Math.round((curr.maxWeight / maxWeightAll) * 100),
    );

    return {
      ...curr,
      isProgress,
      diffBadge,
      badgeColor,
      heightPct,
    };
  });

  const latestBar = sessionBars[sessionBars.length - 1];
  const prevBar =
    sessionBars.length > 1 ? sessionBars[sessionBars.length - 2] : null;
  const progressSessionsCount = sessionBars.filter((b) => b.isProgress).length;

  return (
    <section
      className="rounded-2xl p-5 flex flex-col gap-5 relative overflow-hidden"
      style={{
        background: "#121212",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
      }}
      aria-label="Exercise Progression Analytics"
    >
      {/* ── Section Title & Exercise Pills ──────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-baseline">
          <div>
            <span
              className="font-mono font-bold text-[10px] uppercase tracking-widest"
              style={{ color: "#dfff00" }}
            >
              Performance Analytics
            </span>
            <h2 className="font-display font-black text-lg text-white tracking-tight">
              PROGRESS AT A GLANCE
            </h2>
          </div>
          {timeline.length > 0 && (
            <span className="font-mono text-xs text-steel">
              {timeline.length} session{timeline.length === 1 ? "" : "s"} logged
            </span>
          )}
        </div>

        {/* Exercise Switcher Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
          {uniqueExerciseNames.map((name) => {
            const isSelected = name === activeExerciseName;
            return (
              <button
                key={name}
                onClick={() => {
                  setSelectedExercise(name);
                  setHoveredIdx(null);
                }}
                className="font-mono text-xs px-3.5 py-1.5 rounded-full transition-all duration-150 whitespace-nowrap cursor-pointer"
                style={{
                  background: isSelected
                    ? "#dfff00"
                    : "rgba(255, 255, 255, 0.04)",
                  color: isSelected ? "#000000" : "#e5e2e1",
                  border: isSelected
                    ? "1px solid #dfff00"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  fontWeight: isSelected ? 700 : 500,
                  boxShadow: isSelected
                    ? "0 0 12px rgba(223, 255, 0, 0.25)"
                    : "none",
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bento Metrics Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Metric 1: All-Time PR */}
        <div
          className="rounded-xl p-3 flex flex-col gap-0.5 relative overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(223, 255, 0, 0.2)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-steel">
              All-Time PR
            </span>
            <span className="text-xs" aria-hidden>
              🏆
            </span>
          </div>
          <p className="font-display font-black text-xl text-white mt-1">
            {globalPR ? `${globalPR.max_weight} kg` : "—"}
          </p>
          <span className="font-mono text-[10px]" style={{ color: "#dfff00" }}>
            {globalPR ? `${globalPR.max_weight_reps} reps` : "No record yet"}
          </span>
        </div>

        {/* Metric 2: Estimated 1RM */}
        <div
          className="rounded-xl p-3 flex flex-col gap-0.5"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-steel">
              Estimated 1RM
            </span>
            <span className="text-xs" aria-hidden>
              ⚡
            </span>
          </div>
          <p className="font-display font-black text-xl text-white mt-1">
            {currentEst1RM > 0 ? `${currentEst1RM} kg` : "—"}
          </p>
          <span className="font-body text-[10px] text-steel">
            Epley calculation
          </span>
        </div>

        {/* Metric 3: Last Session */}
        <div
          className="rounded-xl p-3 flex flex-col gap-0.5"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-steel">
              Last Lift
            </span>
            <span className="text-xs" aria-hidden>
              ⏱️
            </span>
          </div>
          <p className="font-display font-black text-xl text-white mt-1">
            {lastPerf?.bestWeight ? `${lastPerf.bestWeight} kg` : "—"}
          </p>
          <span className="font-mono text-[10px] text-steel">
            {lastPerf?.bestReps
              ? `${lastPerf.bestReps} reps`
              : "Not logged yet"}
          </span>
        </div>

        {/* Metric 4: Total Volume */}
        <div
          className="rounded-xl p-3 flex flex-col gap-0.5"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-steel">
              Recent Volume
            </span>
            <span className="text-xs" aria-hidden>
              📈
            </span>
          </div>
          <p className="font-display font-black text-xl text-white mt-1">
            {timeline.length > 0
              ? `${(timeline[timeline.length - 1].totalVolume / 1000).toFixed(1)}k`
              : "0k"}
          </p>
          <span className="font-mono text-[10px] text-steel">
            kg × reps sum
          </span>
        </div>
      </div>

      {/* ── Progression Status Banner ─────────────────────────────────────── */}
      {prevBar && (
        <div
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-mono text-xs"
          style={{
            background: latestBar.isProgress
              ? "rgba(223, 255, 0, 0.08)"
              : "rgba(255, 255, 255, 0.03)",
            border: latestBar.isProgress
              ? "1px solid rgba(223, 255, 0, 0.25)"
              : "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center gap-2">
            <span>{latestBar.isProgress ? "🔥" : "⚖️"}</span>
            <span
              className="font-bold"
              style={{ color: latestBar.isProgress ? "#dfff00" : "#ffffff" }}
            >
              {latestBar.isProgress
                ? `Progression Detected: ${latestBar.diffBadge} vs last session!`
                : "No overload this session — target +1 rep next time!"}
            </span>
          </div>
          <span className="text-[10px] text-steel">
            {progressSessionsCount}/{sessionBars.length} improved
          </span>
        </div>
      )}

      {/* ── Progression Bar Chart ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex justify-between text-xs text-steel font-mono">
          <span>Session Performance (Weights & Reps)</span>
          <span>Max: {maxWeightAll} kg</span>
        </div>

        <div
          className="w-full relative rounded-xl overflow-x-auto p-4 flex items-end custom-scrollbar"
          style={{
            minHeight: "220px",
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {sessionBars.length === 0 ? (
            <div className="text-center p-4 w-full">
              <p className="font-body text-xs text-steel">
                No session entries recorded for{" "}
                <span className="text-white font-medium">
                  {activeExerciseName}
                </span>{" "}
                yet.
              </p>
              <p className="font-mono text-[10px] text-steel mt-1 opacity-70">
                Log a workout to view weights & reps progression!
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-3 min-w-full justify-around pt-8 pb-2">
              {sessionBars.map((bar, idx) => {
                const isHovered = hoveredIdx === idx;
                const isLatest = idx === sessionBars.length - 1;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1.5 flex-1 max-w-[85px] min-w-[55px] cursor-pointer group relative"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() =>
                      setHoveredIdx(hoveredIdx === idx ? null : idx)
                    }
                  >
                    {/* Floating Progress Badge Above Bar */}
                    <span
                      className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded transition-transform group-hover:scale-105 whitespace-nowrap"
                      style={{
                        background: bar.isProgress
                          ? "rgba(223, 255, 0, 0.15)"
                          : "rgba(255, 255, 255, 0.05)",
                        color: bar.badgeColor,
                        border: bar.isProgress
                          ? "1px solid rgba(223, 255, 0, 0.3)"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {bar.diffBadge}
                    </span>

                    {/* Vertical Session Bar */}
                    <div
                      className="w-full rounded-xl flex flex-col justify-between items-center py-2 transition-all duration-200"
                      style={{
                        height: `${Math.max(bar.heightPct * 1.3, 70)}px`,
                        background: bar.isProgress
                          ? "linear-gradient(180deg, #dfff00 0%, rgba(223, 255, 0, 0.35) 100%)"
                          : "linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%)",
                        border: bar.isProgress
                          ? "1.5px solid #dfff00"
                          : "1px solid rgba(255, 255, 255, 0.12)",
                        boxShadow: bar.isProgress
                          ? isHovered || isLatest
                            ? "0 0 20px rgba(223, 255, 0, 0.45)"
                            : "0 0 10px rgba(223, 255, 0, 0.2)"
                          : "none",
                        transform: isHovered ? "scaleY(1.03)" : "none",
                      }}
                    >
                      {/* Weight inside bar */}
                      <span
                        className="font-mono text-[11px] font-black leading-none"
                        style={{
                          color: bar.isProgress ? "#000000" : "#ffffff",
                        }}
                      >
                        {bar.maxWeight}kg
                      </span>

                      {/* Reps inside bar */}
                      <span
                        className="font-mono text-[10px] font-bold leading-none px-1 py-0.5 rounded"
                        style={{
                          background: bar.isProgress
                            ? "rgba(0, 0, 0, 0.25)"
                            : "rgba(0, 0, 0, 0.5)",
                          color: bar.isProgress ? "#000000" : "#e5e2e1",
                        }}
                      >
                        {bar.maxReps}r
                      </span>
                    </div>

                    {/* Bottom Label & Date */}
                    <div className="flex flex-col items-center mt-0.5">
                      <span
                        className="font-mono text-[10px] font-bold"
                        style={{
                          color: isLatest ? "#dfff00" : "#9ca3af",
                        }}
                      >
                        {isLatest ? "NOW" : bar.label}
                      </span>
                      <span className="font-mono text-[8px] text-steel/70 truncate max-w-[55px]">
                        {bar.sessionDate.slice(5)}
                      </span>
                    </div>

                    {/* Hover/Tap Detailed Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none rounded-xl p-2 font-mono text-[10px] shadow-2xl z-30 min-w-[110px] text-center"
                        style={{
                          background: "#000000",
                          border: "1px solid #dfff00",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
                        }}
                      >
                        <div className="text-white font-bold">
                          {bar.maxWeight} kg × {bar.maxReps} reps
                        </div>
                        <div className="text-[#dfff00] font-medium text-[9px] mt-0.5">
                          1RM: ~{bar.est1RM} kg
                        </div>
                        <div className="text-steel text-[8px] mt-0.5">
                          {bar.sessionDate}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
