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

  // ── Calculate SVG Path Coordinates ──────────────────────────────────────────
  const chartHeight = 160;
  const paddingX = 24;
  const paddingY = 24;

  const weights = timeline.map((p) => p.maxWeight);
  const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 100;
  // Add margin to scale so line doesn't hit boundaries
  const yMin = Math.max(0, minWeight - 5);
  const yMax = maxWeight === yMin ? yMin + 10 : maxWeight + 5;
  const yRange = yMax - yMin;

  const getCoordinates = (index: number, weight: number, total: number) => {
    const x =
      total <= 1 ? 50 : paddingX + (index / (total - 1)) * (100 - paddingX * 2);
    const normalizedY = (weight - yMin) / (yRange || 1);
    const y =
      chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);
    return { x, y };
  };

  const points = timeline.map((pt, i) => ({
    ...pt,
    ...getCoordinates(i, pt.maxWeight, timeline.length),
  }));

  // Construct SVG Path
  let linePath = "";
  let areaPath = "";

  if (points.length > 1) {
    linePath =
      `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ");
    areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;
  }

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

      {/* ── Progression Line Graph SVG ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex justify-between text-xs text-steel font-mono">
          <span>Progression Curve</span>
          <span>{yMax} kg</span>
        </div>

        <div
          className="w-full relative rounded-xl overflow-hidden flex items-center justify-center"
          style={{
            height: chartHeight,
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-10">
            <div className="w-full border-b border-white" />
            <div className="w-full border-b border-white" />
            <div className="w-full border-b border-white" />
          </div>

          {timeline.length === 0 ? (
            <div className="text-center p-4">
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
          ) : timeline.length === 1 ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                style={{
                  background: "#dfff00",
                  boxShadow: "0 0 15px rgba(223, 255, 0, 0.6)",
                }}
              />
              <p className="font-mono text-xs text-white">
                Initial Baseline:{" "}
                <span style={{ color: "#dfff00" }}>
                  {timeline[0].maxWeight} kg
                </span>{" "}
                ({timeline[0].maxReps} reps)
              </p>
              <span className="font-mono text-[10px] text-steel">
                {timeline[0].sessionDate}
              </span>
            </div>
          ) : (
            <>
              <svg
                viewBox={`0 0 100 ${chartHeight}`}
                preserveAspectRatio="none"
                className="w-full h-full absolute inset-0 overflow-visible"
              >
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#dfff00" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#121212" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Area Gradient Fill */}
                <path d={areaPath} fill="url(#chartGradient)" />

                {/* Main Curve Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#dfff00"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Data Points */}
                {points.map((p, idx) => {
                  const isLatest = idx === points.length - 1;
                  const isHovered = hoveredIdx === idx;
                  return (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isLatest || isHovered ? 5 : 3.5}
                        fill={isLatest ? "#dfff00" : "#131313"}
                        stroke="#dfff00"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredIdx !== null && points[hoveredIdx] && (
                <div
                  className="absolute pointer-events-none rounded px-2 py-1 font-mono text-[11px] shadow-lg z-20"
                  style={{
                    left: `${points[hoveredIdx].x}%`,
                    top: `${points[hoveredIdx].y - 38}px`,
                    transform: "translateX(-50%)",
                    background: "#000000",
                    border: "1px solid #dfff00",
                    color: "#ffffff",
                  }}
                >
                  <div
                    className="font-bold text-center"
                    style={{ color: "#dfff00" }}
                  >
                    {points[hoveredIdx].maxWeight} kg ×{" "}
                    {points[hoveredIdx].maxReps}
                  </div>
                  <div className="text-[9px] text-steel text-center">
                    {points[hoveredIdx].sessionDate}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* X-Axis Timeline Labels */}
        {timeline.length > 1 && (
          <div className="flex justify-between px-6 pt-1 text-[10px] font-mono text-steel">
            {timeline.map((pt, idx) => (
              <span
                key={idx}
                className={idx === timeline.length - 1 ? "font-bold" : ""}
                style={{
                  color: idx === timeline.length - 1 ? "#dfff00" : "#565C66",
                }}
              >
                {idx === timeline.length - 1 ? "NOW" : pt.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
