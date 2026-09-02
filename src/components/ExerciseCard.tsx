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
  onStartTimer?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SetColumnHeader() {
  return (
    <div
      className="grid gap-2 mb-1 px-3"
      style={{ gridTemplateColumns: "28px 1fr 1fr 28px" }}
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
      <span />
    </div>
  );
}

interface SetRowProps {
  index: number;
  weight: number | null;
  reps: number | null;
  isWarmup?: boolean;
  isEditMode: boolean;
  onWeightChange: (val: number | null) => void;
  onRepsChange: (val: number | null) => void;
  onRemove?: () => void;
}

function SetRow({
  index,
  weight,
  reps,
  isWarmup = false,
  isEditMode,
  onWeightChange,
  onRepsChange,
  onRemove,
}: SetRowProps) {
  return (
    <div
      className="grid gap-2 items-center px-3 py-1.5 rounded-lg transition-colors duration-150 group/row"
      style={{
        gridTemplateColumns: "28px 1fr 1fr 28px",
        background: isWarmup ? "rgba(86,92,102,0.08)" : "rgba(86,92,102,0.04)",
      }}
    >
      {/* Set number / warmup badge */}
      <span
        className="font-display text-center leading-none"
        style={{
          fontSize: isWarmup ? 10 : 14,
          color: isWarmup ? "#565C66" : "#EDEDEA",
          fontWeight: isWarmup ? 400 : 500,
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
          className="w-full text-center rounded-md border transition-all duration-150 font-display"
          style={{
            fontSize: isWarmup ? 16 : 22,
            fontWeight: isWarmup ? 400 : 600,
            color: isWarmup ? "#565C66" : "#EDEDEA",
            background: "transparent",
            border: isEditMode
              ? "1px solid rgba(223, 255, 0, 0.35)"
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
              ? "1px solid rgba(223, 255, 0, 0.35)"
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
          className="w-full text-center rounded-md transition-all duration-150 font-display"
          style={{
            fontSize: isWarmup ? 16 : 22,
            fontWeight: isWarmup ? 400 : 600,
            color: isWarmup ? "#565C66" : "#EDEDEA",
            background: "transparent",
            border: isEditMode
              ? "1px solid rgba(223, 255, 0, 0.35)"
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
              ? "1px solid rgba(223, 255, 0, 0.35)"
              : "1px solid transparent";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Remove button (edit mode only) */}
      <div className="flex items-center justify-center">
        {isEditMode && !isWarmup && onRemove && (
          <button
            id={`remove-set-${index}`}
            onClick={onRemove}
            aria-label={`Remove set ${index + 1}`}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
            style={{
              background: "rgba(196,98,45,0.12)",
              border: "1px solid rgba(196,98,45,0.25)",
              color: "#C4622D",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            −
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main ExerciseCard ────────────────────────────────────────────────────────

export function ExerciseCard({
  exercise,
  isEditMode,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onNotesChange,
  onStartTimer,
  globalPR,
  lastPerformance,
}: ExerciseCardProps) {
  const [warmupOpen, setWarmupOpen] = useState(false);
  const hasWarmup =
    exercise.warmup.weight !== null || exercise.warmup.reps !== null;

  return (
    <article
      className="rounded-2xl overflow-hidden transition-transform duration-150"
      style={{
        background: "#121212",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
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
          <h2
            className="font-display font-bold text-chalk leading-tight truncate text-base"
            style={{ letterSpacing: "-0.01em" }}
          >
            {exercise.name}
          </h2>

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

        {/* Actions: Edit Drag Handle or Quick Rest Trigger */}
        {isEditMode ? (
          <div
            className="flex flex-col gap-[3px] mt-1 flex-shrink-0 opacity-50"
            aria-hidden
            title="Drag to reorder"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block rounded-full"
                style={{ width: 18, height: 2, background: "#565C66" }}
              />
            ))}
          </div>
        ) : (
          onStartTimer && (
            <button
              type="button"
              onClick={onStartTimer}
              className="flex items-center gap-1 font-mono text-[11px] px-2.5 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-steel hover:text-[#dfff00] transition-all duration-150 active:scale-95 cursor-pointer border border-white/10 flex-shrink-0"
              title={`Start rest timer for ${exercise.name}`}
            >
              <span>⏱️</span>
              <span className="font-semibold">Rest</span>
            </button>
          )
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

      {/* ── Warmup row (collapsible) ──────────────────────────────────────── */}
      {hasWarmup && (
        <div className="px-3 mb-2">
          <button
            id={`warmup-toggle-${exercise.id}`}
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
              Warmup
            </span>
          </button>

          {warmupOpen && (
            <div id={`warmup-${exercise.id}`} className="mt-1">
              <SetColumnHeader />
              <SetRow
                index={0}
                weight={exercise.warmup.weight}
                reps={exercise.warmup.reps}
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
              />
            </div>
          )}
        </div>
      )}

      {/* ── Working sets ──────────────────────────────────────────────────── */}
      <div className="px-3 pb-2 flex flex-col gap-1">
        <SetColumnHeader />
        {exercise.workingSets.map((set, i) => (
          <SetRow
            key={i}
            index={i}
            weight={set.weight}
            reps={set.reps}
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
            onRemove={() => onRemoveSet(exercise.id, i)}
          />
        ))}
      </div>

      {/* ── Add / Remove set controls ────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-3">
        <button
          id={`add-set-${exercise.id}`}
          onClick={() => onAddSet(exercise.id)}
          aria-label={`Add set to ${exercise.name}`}
          className="flex items-center gap-1.5 font-body text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer group/add"
          style={{
            color: "#C4622D",
            letterSpacing: "0.04em",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 group-hover/add:scale-110"
            style={{
              background: "rgba(196,98,45,0.15)",
              border: "1px solid rgba(196,98,45,0.3)",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            +
          </span>
          Add set
        </button>

        {exercise.workingSets.length > 1 && (
          <button
            id={`remove-last-set-${exercise.id}`}
            onClick={() =>
              onRemoveSet(exercise.id, exercise.workingSets.length - 1)
            }
            aria-label={`Remove last set from ${exercise.name}`}
            className="flex items-center gap-1.5 font-body text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer group/rem"
            style={{
              color: "#565C66",
              letterSpacing: "0.04em",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 group-hover/rem:scale-110"
              style={{
                background: "rgba(86,92,102,0.12)",
                border: "1px solid rgba(86,92,102,0.2)",
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              −
            </span>
            Remove set
          </button>
        )}

        {/* Rest timer trigger */}
        {!isEditMode && (
          <button
            id={`start-rest-${exercise.id}`}
            onClick={onStartTimer}
            aria-label="Start rest timer"
            className="flex items-center gap-1.5 font-body text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer group/rest"
            style={{
              color: "#565C66",
              letterSpacing: "0.04em",
              background: "none",
              border: "none",
              padding: 0,
              marginLeft: "auto",
            }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 group-hover/rest:scale-110 group-hover/rest:border-iron/50"
              style={{
                background: "rgba(86,92,102,0.1)",
                border: "1px solid rgba(86,92,102,0.18)",
                fontSize: 13,
                lineHeight: 1,
              }}
            >
              ⏱
            </span>
            Rest
          </button>
        )}

        {/* Edit mode: reorder placeholder controls */}
        {isEditMode && (
          <div className="ml-auto flex items-center gap-2">
            <button
              id={`reorder-up-${exercise.id}`}
              aria-label={`Move ${exercise.name} up`}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
              style={{
                background: "rgba(86,92,102,0.12)",
                border: "1px solid rgba(86,92,102,0.2)",
                color: "#565C66",
                fontSize: 12,
              }}
            >
              ↑
            </button>
            <button
              id={`reorder-down-${exercise.id}`}
              aria-label={`Move ${exercise.name} down`}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
              style={{
                background: "rgba(86,92,102,0.12)",
                border: "1px solid rgba(86,92,102,0.2)",
                color: "#565C66",
                fontSize: 12,
              }}
            >
              ↓
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
