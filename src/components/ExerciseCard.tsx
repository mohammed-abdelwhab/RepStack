import { useState } from "react";
import type { MockExercise } from "../types/mock";

interface SetChangePayload {
  setIndex: number;
  field: "weight" | "reps";
  value: number | null;
  isWarmup?: boolean;
}

interface ExerciseCardProps {
  exercise: MockExercise;
  isEditMode: boolean;
  globalPR?: { max_weight: number; max_weight_reps: number } | null;
  lastPerformance?: {
    bestWeight: number | null;
    bestReps: number | null;
    sessionDate?: string;
  } | null;
  onSetChange: (exerciseId: string, payload: SetChangePayload) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
  onNotesChange?: (exerciseId: string, notes: string) => void;
  onToggleSetComplete?: (
    exerciseId: string,
    setIndex: number,
    isWarmup?: boolean,
  ) => void;
  onToggleExerciseComplete?: (exerciseId: string) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SetColumnHeader({ isEditMode }: { isEditMode: boolean }) {
  return (
    <div
      className="grid gap-2 mb-1 px-3 items-center"
      style={{
        gridTemplateColumns: isEditMode
          ? "24px 1fr 1fr 34px 22px"
          : "24px 1fr 1fr 34px",
      }}
    >
      <span className="font-body text-[10px] tracking-widest uppercase text-steel/60 text-center">
        #
      </span>
      <span className="font-body text-[10px] tracking-widest uppercase text-steel/60 text-center">
        kg
      </span>
      <span className="font-body text-[10px] tracking-widest uppercase text-steel/60 text-center">
        reps
      </span>
      <span className="font-body text-[10px] tracking-widest uppercase text-steel/60 text-center">
        ✓
      </span>
      {isEditMode && <span />}
    </div>
  );
}

interface SetRowProps {
  index: number;
  weight: number | null;
  reps: number | null;
  isCompleted?: boolean;
  isWarmup?: boolean;
  isEditMode: boolean;
  onWeightChange: (val: number | null) => void;
  onRepsChange: (val: number | null) => void;
  onToggleComplete?: () => void;
  onRemove?: () => void;
}

function SetRow({
  index,
  weight,
  reps,
  isCompleted = false,
  isWarmup = false,
  isEditMode,
  onWeightChange,
  onRepsChange,
  onToggleComplete,
  onRemove,
}: SetRowProps) {
  return (
    <div
      className="grid gap-2 items-center px-3 py-1.5 rounded-lg transition-all duration-150 group/row"
      style={{
        gridTemplateColumns: isEditMode
          ? "24px 1fr 1fr 34px 22px"
          : "24px 1fr 1fr 34px",
        background: isCompleted
          ? "rgba(223, 255, 0, 0.08)"
          : isWarmup
            ? "rgba(86,92,102,0.08)"
            : "rgba(86,92,102,0.04)",
        border: isCompleted
          ? "1px solid rgba(223, 255, 0, 0.3)"
          : "1px solid transparent",
      }}
    >
      {/* Set number / warmup badge */}
      <span
        className="font-display text-center leading-none"
        style={{
          fontSize: isWarmup ? 10 : 14,
          color: isCompleted ? "#dfff00" : isWarmup ? "#565C66" : "#EDEDEA",
          fontWeight: isCompleted || !isWarmup ? 600 : 400,
          letterSpacing: isWarmup ? "0.04em" : 0,
        }}
        aria-label={isWarmup ? "Warmup set" : `Set ${index + 1}`}
      >
        {isWarmup ? "W" : index + 1}
      </span>

      {/* Weight input */}
      <div className="relative">
        <input
          id={`weight-${isWarmup ? "warmup" : index}`}
          type="number"
          inputMode="decimal"
          step="0.5"
          min="0"
          value={weight ?? ""}
          onChange={(e) => {
            const v = e.target.value === "" ? null : parseFloat(e.target.value);
            onWeightChange(v);
          }}
          placeholder="—"
          aria-label={`${isWarmup ? "Warmup" : `Set ${index + 1}`} weight in kg`}
          readOnly={!isEditMode}
          className={`w-full text-center rounded-md border transition-all duration-150 font-display ${
            isCompleted ? "line-through opacity-90 text-[#dfff00]" : ""
          }`}
          style={{
            fontSize: isWarmup ? 16 : 20,
            fontWeight: isWarmup ? 400 : 600,
            color: isCompleted ? "#dfff00" : isWarmup ? "#565C66" : "#EDEDEA",
            background: "transparent",
            border: isEditMode
              ? isCompleted
                ? "1px solid rgba(223, 255, 0, 0.4)"
                : "1px solid rgba(223, 255, 0, 0.25)"
              : "1px solid transparent",
            outline: "none",
            padding: "2px 4px",
            lineHeight: 1.2,
            cursor: isEditMode ? "text" : "default",
          }}
          onFocus={(e) => {
            if (isEditMode) {
              e.target.style.border = "1px solid #dfff00";
              e.target.style.boxShadow = "0 0 0 3px rgba(223, 255, 0, 0.15)";
            }
          }}
          onBlur={(e) => {
            e.target.style.border = isEditMode
              ? isCompleted
                ? "1px solid rgba(223, 255, 0, 0.4)"
                : "1px solid rgba(223, 255, 0, 0.25)"
              : "1px solid transparent";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Reps input */}
      <div className="relative">
        <input
          id={`reps-${isWarmup ? "warmup" : index}`}
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          value={reps ?? ""}
          onChange={(e) => {
            const v =
              e.target.value === "" ? null : parseInt(e.target.value, 10);
            onRepsChange(v);
          }}
          placeholder="—"
          aria-label={`${isWarmup ? "Warmup" : `Set ${index + 1}`} reps`}
          readOnly={!isEditMode}
          className={`w-full text-center rounded-md transition-all duration-150 font-display ${
            isCompleted ? "line-through opacity-90 text-[#dfff00]" : ""
          }`}
          style={{
            fontSize: isWarmup ? 16 : 20,
            fontWeight: isWarmup ? 400 : 600,
            color: isCompleted ? "#dfff00" : isWarmup ? "#565C66" : "#EDEDEA",
            background: "transparent",
            border: isEditMode
              ? isCompleted
                ? "1px solid rgba(223, 255, 0, 0.4)"
                : "1px solid rgba(223, 255, 0, 0.25)"
              : "1px solid transparent",
            outline: "none",
            padding: "2px 4px",
            lineHeight: 1.2,
            cursor: isEditMode ? "text" : "default",
          }}
          onFocus={(e) => {
            if (isEditMode) {
              e.target.style.border = "1px solid #dfff00";
              e.target.style.boxShadow = "0 0 0 3px rgba(223, 255, 0, 0.15)";
            }
          }}
          onBlur={(e) => {
            e.target.style.border = isEditMode
              ? isCompleted
                ? "1px solid rgba(223, 255, 0, 0.4)"
                : "1px solid rgba(223, 255, 0, 0.25)"
              : "1px solid transparent";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Completion Checkbox Button */}
      <div className="flex items-center justify-center">
        {isEditMode ? (
          <button
            type="button"
            onClick={onToggleComplete}
            aria-label={
              isCompleted ? "Mark set incomplete" : "Mark set complete"
            }
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
            style={{
              background: isCompleted ? "#dfff00" : "rgba(255, 255, 255, 0.05)",
              border: isCompleted
                ? "1px solid #dfff00"
                : "1px solid rgba(255, 255, 255, 0.15)",
              color: isCompleted ? "#000000" : "#565C66",
              boxShadow: isCompleted
                ? "0 0 10px rgba(223, 255, 0, 0.4)"
                : "none",
            }}
          >
            {isCompleted ? (
              <span className="font-black text-xs text-black leading-none">
                ✓
              </span>
            ) : (
              <span className="text-[10px] text-steel">○</span>
            )}
          </button>
        ) : (
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
            style={{
              color: isCompleted ? "#dfff00" : "rgba(255, 255, 255, 0.2)",
            }}
          >
            {isCompleted ? "✓" : "—"}
          </span>
        )}
      </div>

      {/* Remove button (edit mode only) */}
      {isEditMode && (
        <div className="flex items-center justify-center">
          {!isWarmup && onRemove ? (
            <button
              id={`remove-set-${index}`}
              type="button"
              onClick={onRemove}
              aria-label={`Remove set ${index + 1}`}
              className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer text-steel hover:text-red-400"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                fontSize: 11,
              }}
            >
              ✕
            </button>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ExerciseCard ────────────────────────────────────────────────────────

export function ExerciseCard({
  exercise,
  isEditMode,
  globalPR,
  lastPerformance,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onNotesChange,
  onToggleSetComplete,
  onToggleExerciseComplete,
}: ExerciseCardProps) {
  const [warmupOpen, setWarmupOpen] = useState(false);
  const [isWarmupAdded, setIsWarmupAdded] = useState(false);

  const hasWarmup =
    exercise.warmup.weight !== null ||
    exercise.warmup.reps !== null ||
    Boolean(exercise.warmup.isCompleted) ||
    isWarmupAdded;

  // Exercise is considered complete if explicitly flagged or all working sets are marked complete
  const allWorkingSetsCompleted =
    exercise.workingSets.length > 0 &&
    exercise.workingSets.every((s) => s.isCompleted);
  const isExerciseDone = exercise.isCompleted || allWorkingSetsCompleted;

  return (
    <article
      className="rounded-2xl overflow-hidden transition-all duration-150"
      style={{
        background: "#121212",
        border: isExerciseDone
          ? "1.5px solid rgba(223, 255, 0, 0.35)"
          : "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: isExerciseDone
          ? "0 0 16px rgba(223, 255, 0, 0.08), 0 4px 16px rgba(0,0,0,0.4)"
          : "0 4px 16px rgba(0,0,0,0.4)",
      }}
      aria-label={`Exercise: ${exercise.name}`}
    >
      {/* ── Optional image banner ─────────────────────────────────────────── */}
      {exercise.imageUrl && (
        <div
          className="relative w-full overflow-hidden"
          style={{ height: 120 }}
        >
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.7)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 40%, #121212 100%)",
            }}
          />
        </div>
      )}

      {/* ── Card header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2
              className={`font-display font-bold text-chalk leading-tight truncate text-base ${
                isExerciseDone ? "line-through text-[#dfff00]" : ""
              }`}
              style={{ letterSpacing: "-0.01em" }}
            >
              {exercise.name}
            </h2>
            {isExerciseDone && (
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#dfff00]/15 text-[#dfff00] font-black border border-[#dfff00]/30 flex-shrink-0">
                DONE ✓
              </span>
            )}
          </div>

          {/* Indicators Row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {/* Set count badge */}
            <span
              className="font-mono text-[10px] px-2 py-0.5 rounded"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                color: "#e5e2e1",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <strong style={{ color: "#dfff00" }}>
                {exercise.workingSets.length}
              </strong>{" "}
              sets {hasWarmup ? "+ 1 warmup" : ""}
            </span>

            {/* Global All-Time PR Badge */}
            {globalPR && (
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-bold"
                style={{
                  background: "rgba(223, 255, 0, 0.12)",
                  color: "#dfff00",
                  border: "1px solid rgba(223, 255, 0, 0.3)",
                }}
              >
                <span>🏆 PR:</span>
                <span>
                  {globalPR.max_weight}kg × {globalPR.max_weight_reps}
                </span>
              </span>
            )}

            {/* Last Performance Badge */}
            {lastPerformance && lastPerformance.bestWeight !== null && (
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded text-steel"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                Last: {lastPerformance.bestWeight}kg ×{" "}
                {lastPerformance.bestReps}
              </span>
            )}
          </div>
        </div>

        {/* Header Action: Mark Exercise Done Toggle in Live Mode */}
        {isEditMode && onToggleExerciseComplete && (
          <button
            type="button"
            onClick={() => onToggleExerciseComplete(exercise.id)}
            className="flex items-center gap-1 font-mono text-[11px] px-2.5 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer flex-shrink-0"
            style={{
              background: isExerciseDone
                ? "#dfff00"
                : "rgba(255, 255, 255, 0.05)",
              border: isExerciseDone
                ? "1px solid #dfff00"
                : "1px solid rgba(255, 255, 255, 0.12)",
              color: isExerciseDone ? "#000000" : "#e5e2e1",
              fontWeight: isExerciseDone ? 800 : 500,
            }}
          >
            <span>{isExerciseDone ? "✓ Completed" : "Mark Done"}</span>
          </button>
        )}
      </div>

      {/* ── Notes field ───────────────────────────────────────────────────── */}
      {(exercise.notes || isEditMode) && (
        <div className="px-4 pb-3">
          <textarea
            id={`notes-${exercise.id}`}
            value={exercise.notes}
            onChange={(e) => onNotesChange?.(exercise.id, e.target.value)}
            readOnly={!isEditMode}
            placeholder={isEditMode ? "Add a cue or note…" : ""}
            rows={exercise.notes.length > 40 ? 2 : 1}
            aria-label={`Notes for ${exercise.name}`}
            className="w-full resize-none font-body transition-all duration-150"
            style={{
              fontSize: 16,
              color: "#e5e2e1",
              background: isEditMode ? "rgba(0, 0, 0, 0.4)" : "transparent",
              border: isEditMode
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "none",
              borderRadius: isEditMode ? 6 : 0,
              padding: isEditMode ? "8px 10px" : 0,
              outline: "none",
              lineHeight: 1.5,
              letterSpacing: "0.01em",
              cursor: isEditMode ? "text" : "default",
            }}
            onFocus={(e) => {
              if (isEditMode) {
                e.target.style.border = "1px solid #dfff00";
                e.target.style.boxShadow = "0 0 0 3px rgba(223, 255, 0, 0.12)";
              }
            }}
            onBlur={(e) => {
              e.target.style.border = isEditMode
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "none";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      )}

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div
        className="mx-4 mb-3"
        style={{ height: 1, background: "rgba(86,92,102,0.18)" }}
        aria-hidden
      />

      {/* ── Optional Warmup row (collapsible or toggleable) ──────────────── */}
      {hasWarmup ? (
        <div className="px-3 mb-2">
          <button
            id={`warmup-toggle-${exercise.id}`}
            type="button"
            onClick={() => setWarmupOpen((v) => !v)}
            aria-expanded={warmupOpen}
            aria-controls={`warmup-${exercise.id}`}
            className="flex items-center gap-2 w-full text-left py-1 group/warmup transition-opacity duration-150 hover:opacity-80 cursor-pointer"
          >
            <span
              className="transition-transform duration-200"
              aria-hidden
              style={{
                display: "inline-block",
                transform: warmupOpen ? "rotate(90deg)" : "rotate(0deg)",
                color: "#565C66",
                fontSize: 12,
              }}
            >
              ▶
            </span>
            <span
              className="font-body text-steel"
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Warmup Set
            </span>
          </button>

          {warmupOpen && (
            <div id={`warmup-${exercise.id}`} className="mt-1">
              <SetColumnHeader isEditMode={isEditMode} />
              <SetRow
                index={0}
                weight={exercise.warmup.weight}
                reps={exercise.warmup.reps}
                isCompleted={exercise.warmup.isCompleted}
                isWarmup
                isEditMode={isEditMode}
                onWeightChange={(v) =>
                  onSetChange(exercise.id, {
                    setIndex: 0,
                    field: "weight",
                    value: v,
                    isWarmup: true,
                  })
                }
                onRepsChange={(v) =>
                  onSetChange(exercise.id, {
                    setIndex: 0,
                    field: "reps",
                    value: v,
                    isWarmup: true,
                  })
                }
                onToggleComplete={() =>
                  onToggleSetComplete?.(exercise.id, 0, true)
                }
                onRemove={() => {
                  setIsWarmupAdded(false);
                  setWarmupOpen(false);
                  onSetChange(exercise.id, {
                    setIndex: 0,
                    field: "weight",
                    value: null,
                    isWarmup: true,
                  });
                  onSetChange(exercise.id, {
                    setIndex: 0,
                    field: "reps",
                    value: null,
                    isWarmup: true,
                  });
                }}
              />
            </div>
          )}
        </div>
      ) : (
        isEditMode && (
          <div className="px-3 pb-2">
            <button
              type="button"
              onClick={() => {
                setIsWarmupAdded(true);
                setWarmupOpen(true);
              }}
              className="flex items-center gap-1.5 font-body text-xs text-steel hover:text-[#dfff00] transition-colors cursor-pointer py-1"
            >
              <span className="font-mono text-xs">+</span>
              <span>Add Warmup Set</span>
            </button>
          </div>
        )
      )}

      {/* ── Working sets ──────────────────────────────────────────────────── */}
      <div className="px-3 pb-2 flex flex-col gap-1">
        <SetColumnHeader isEditMode={isEditMode} />
        {exercise.workingSets.map((set, i) => (
          <SetRow
            key={i}
            index={i}
            weight={set.weight}
            reps={set.reps}
            isCompleted={set.isCompleted}
            isEditMode={isEditMode}
            onWeightChange={(v) =>
              onSetChange(exercise.id, {
                setIndex: i,
                field: "weight",
                value: v,
              })
            }
            onRepsChange={(v) =>
              onSetChange(exercise.id, { setIndex: i, field: "reps", value: v })
            }
            onToggleComplete={() =>
              onToggleSetComplete?.(exercise.id, i, false)
            }
            onRemove={() => onRemoveSet(exercise.id, i)}
          />
        ))}
      </div>

      {/* ── Add / Remove set controls (Visible in Edit Mode Only) ───────── */}
      {isEditMode && (
        <div className="flex items-center gap-4 px-4 py-3 border-t border-white/5">
          <button
            id={`add-set-${exercise.id}`}
            type="button"
            onClick={() => onAddSet(exercise.id)}
            aria-label={`Add set to ${exercise.name}`}
            className="flex items-center gap-1.5 font-body text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer text-[#dfff00]"
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs"
              style={{
                background: "rgba(223, 255, 0, 0.15)",
                border: "1px solid rgba(223, 255, 0, 0.3)",
                color: "#dfff00",
              }}
            >
              +
            </span>
            Add set
          </button>

          {exercise.workingSets.length > 1 && (
            <button
              id={`remove-last-set-${exercise.id}`}
              type="button"
              onClick={() =>
                onRemoveSet(exercise.id, exercise.workingSets.length - 1)
              }
              aria-label={`Remove last set from ${exercise.name}`}
              className="flex items-center gap-1.5 font-body text-xs font-medium text-steel hover:text-white transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                −
              </span>
              Remove set
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default ExerciseCard;
