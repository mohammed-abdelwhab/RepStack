import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGymTracker } from "../context/GymTrackerContext";
import { SideDrawer } from "../components/SideDrawer";
import { ExerciseCard } from "../components/ExerciseCard";
import { ToastNotification } from "../components/ToastNotification";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { WorkoutCompletionModal } from "../components/WorkoutCompletionModal";
import { PageSkeletonLoader } from "../components/PageSkeletonLoader";
import { RestTimer } from "../components/RestTimer";
import { ReorderExercisesModal } from "../components/ReorderExercisesModal";
import type { AlertVariant } from "../components/StatusAlert";
import {
  getLastPerformanceForExercise,
  getGlobalPRForExercise,
} from "../utils/exerciseUtils";
import type {
  MockDay,
  MockExercise,
  WorkoutSession as UIWorkoutSession,
} from "../types/mock";
import type { SetEntry } from "../schemas/setEntries";

export default function WorkoutSession() {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { state, logSession, reorderExercises } = useGymTracker();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [notification, setNotification] = useState<{
    variant: AlertVariant;
    title?: string;
    message: string;
  } | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Completion modal state
  const [completionData, setCompletionData] = useState<{
    isOpen: boolean;
    dayName: string;
    totalVolume: number;
    totalSets: number;
    exercisesCompleted: number;
    durationSeconds: number;
    newPRs: { exerciseName: string; weight: number; reps: number }[];
  } | null>(null);

  // Session elapsed timer (wall-clock based)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const startStr = localStorage.getItem(`repstack_workout_start_${dayId}`);
    if (startStr) {
      return Math.max(0, Math.floor((Date.now() - Number(startStr)) / 1000));
    }
    return 0;
  });

  // Rest timer state
  const [isRestTimerOpen, setIsRestTimerOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("repstack_rest_timer");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.isRunning && parsed.targetEpoch > Date.now();
      }
    } catch {}
    return false;
  });
  const [restDefaultSeconds, setRestDefaultSeconds] = useState<number>(90);

  // Reorder exercises modal state
  const [isReorderModalOpen, setIsReorderModalOpen] = useState<boolean>(false);

  // ── Workout Active State ──────────────────────────────────────────────────
  const [isWorkoutStarted, setIsWorkoutStarted] = useState<boolean>(() => {
    return localStorage.getItem(`repstack_workout_active_${dayId}`) === "true";
  });

  // Find current day
  const dbDay = state.workoutDays.find((d) => String(d.id) === dayId);

  // Local draft of mock exercises for the active session log
  const [draftExercises, setDraftExercises] = useState<MockExercise[]>([]);

  // ── Initialize or Restore Draft from localStorage ─────────────────────────
  useEffect(() => {
    if (!dbDay) return;

    // Check if a saved session draft exists in localStorage
    const savedDraftStr = localStorage.getItem(`repstack_draft_${dayId}`);
    if (savedDraftStr) {
      try {
        const parsed: MockExercise[] = JSON.parse(savedDraftStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDraftExercises(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved session draft", e);
      }
    }

    // Otherwise construct fresh drafts from routine exercises & last performance lookup
    const dayExercises = state.exercises.filter(
      (e) => e.workout_day_id === dbDay.id,
    );

    const initialDrafts: MockExercise[] = dayExercises.map((ex) => {
      const config = state.exerciseConfigs.find((c) => c.exercise_id === ex.id);
      const workingSetsCount = config?.working_set_count ?? 3;

      const lastPerf = getLastPerformanceForExercise(
        ex.name,
        state.exercises,
        state.sessions,
        state.setEntries,
      );

      const lastWarmup =
        lastPerf?.sets.find((s) => s.set_type === "warmup") || null;
      const lastWorkingSets =
        lastPerf?.sets.filter((s) => s.set_type === "working") || [];

      return {
        id: String(ex.id),
        name: ex.name,
        notes: ex.notes || "",
        imageUrl: ex.image_url,
        isCompleted: false,
        warmup: {
          weight: lastWarmup?.weight ?? null,
          reps: lastWarmup?.reps ?? null,
          isCompleted: false,
        },
        workingSets: Array.from({ length: workingSetsCount }, (_, i) => {
          const match = lastWorkingSets.find((s) => s.set_index === i);
          return {
            weight: match?.weight ?? null,
            reps: match?.reps ?? null,
            isCompleted: false,
          };
        }),
      };
    });

    setDraftExercises(initialDrafts);
    setIsLogged(false);
  }, [
    dayId,
    dbDay,
    state.exercises,
    state.exerciseConfigs,
    state.sessions,
    state.setEntries,
  ]);

  // Helper to update draft state & instantly synchronize to localStorage
  const updateAndPersistDraft = useCallback(
    (updater: (prev: MockExercise[]) => MockExercise[]) => {
      setDraftExercises((prev) => {
        const next = updater(prev);
        localStorage.setItem(`repstack_draft_${dayId}`, JSON.stringify(next));
        return next;
      });
    },
    [dayId],
  );

  // ── Wall-Clock Session Elapsed Timer ─────────────────────────────────────
  useEffect(() => {
    if (!isWorkoutStarted) {
      setElapsedSeconds(0);
      return;
    }

    const startStr = localStorage.getItem(`repstack_workout_start_${dayId}`);
    const startTime = startStr ? Number(startStr) : Date.now();
    if (!startStr) {
      localStorage.setItem(
        `repstack_workout_start_${dayId}`,
        startTime.toString(),
      );
    }

    const updateTimer = () => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutStarted, dayId]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleStartWorkout = () => {
    const now = Date.now();
    setIsWorkoutStarted(true);
    localStorage.setItem(`repstack_workout_active_${dayId}`, "true");
    localStorage.setItem(`repstack_workout_start_${dayId}`, now.toString());
    localStorage.setItem(
      `repstack_draft_${dayId}`,
      JSON.stringify(draftExercises),
    );
  };

  const handleConfirmCancel = () => {
    setIsWorkoutStarted(false);
    localStorage.removeItem(`repstack_workout_active_${dayId}`);
    localStorage.removeItem(`repstack_workout_start_${dayId}`);
    localStorage.removeItem(`repstack_draft_${dayId}`);
    setIsConfirmCancelOpen(false);
    navigate("/");
  };

  // ── Exercise Reordering Handlers ──────────────────────────────────────────
  const handleMoveExercise = useCallback(
    (exerciseId: string, direction: "up" | "down") => {
      updateAndPersistDraft((prev) => {
        const idx = prev.findIndex((e) => e.id === exerciseId);
        if (idx === -1) return prev;
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= prev.length) return prev;
        const copy = [...prev];
        const temp = copy[idx];
        copy[idx] = copy[targetIdx];
        copy[targetIdx] = temp;
        return copy;
      });
    },
    [updateAndPersistDraft],
  );

  const handleSaveReorder = useCallback(
    async (orderedIds: (string | number)[]) => {
      updateAndPersistDraft((prev) => {
        const map = new Map(prev.map((e) => [String(e.id), e]));
        const reordered = orderedIds
          .map((id) => map.get(String(id)))
          .filter(Boolean) as MockExercise[];
        return reordered;
      });

      // Also persist to DB in background
      try {
        await reorderExercises(orderedIds.map((id) => Number(id)));
      } catch (e) {
        console.error("Failed to persist reorder to DB", e);
      }
    },
    [updateAndPersistDraft, reorderExercises],
  );

  // ── Callbacks for Exercise Inputs & Checkboxes ─────────────────────────────

  const handleSetChange = useCallback(
    (
      exerciseId: string,
      payload: {
        setIndex: number;
        field: "weight" | "reps";
        value: number | null;
        isWarmup?: boolean;
      },
    ) => {
      updateAndPersistDraft((prev) =>
        prev.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          if (payload.isWarmup) {
            return {
              ...ex,
              warmup: { ...ex.warmup, [payload.field]: payload.value },
            };
          }
          const newSets = ex.workingSets.map((set, i) =>
            i === payload.setIndex
              ? { ...set, [payload.field]: payload.value }
              : set,
          );
          return { ...ex, workingSets: newSets };
        }),
      );
    },
    [updateAndPersistDraft],
  );

  const handleToggleSetComplete = useCallback(
    (exerciseId: string, setIndex: number, isWarmup = false) => {
      updateAndPersistDraft((prev) =>
        prev.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          if (isWarmup) {
            return {
              ...ex,
              warmup: {
                ...ex.warmup,
                isCompleted: !ex.warmup.isCompleted,
              },
            };
          }
          const newSets = ex.workingSets.map((s, idx) =>
            idx === setIndex ? { ...s, isCompleted: !s.isCompleted } : s,
          );
          const allWorkingComplete = newSets.every((s) => s.isCompleted);
          return {
            ...ex,
            workingSets: newSets,
            isCompleted: allWorkingComplete,
          };
        }),
      );
    },
    [updateAndPersistDraft],
  );

  const handleToggleExerciseComplete = useCallback(
    (exerciseId: string) => {
      updateAndPersistDraft((prev) =>
        prev.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          const targetComplete = !ex.isCompleted;
          return {
            ...ex,
            isCompleted: targetComplete,
            workingSets: ex.workingSets.map((s) => ({
              ...s,
              isCompleted: targetComplete,
            })),
          };
        }),
      );
    },
    [updateAndPersistDraft],
  );

  const handleAddSet = useCallback(
    (exerciseId: string) => {
      updateAndPersistDraft((prev) =>
        prev.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          const lastSet = ex.workingSets[ex.workingSets.length - 1];
          return {
            ...ex,
            isCompleted: false,
            workingSets: [
              ...ex.workingSets,
              {
                weight: lastSet?.weight ?? null,
                reps: lastSet?.reps ?? null,
                isCompleted: false,
              },
            ],
          };
        }),
      );
    },
    [updateAndPersistDraft],
  );

  const handleRemoveSet = useCallback(
    (exerciseId: string, setIndex: number) => {
      updateAndPersistDraft((prev) =>
        prev.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          if (ex.workingSets.length <= 1) return ex;
          const newSets = ex.workingSets.filter((_, i) => i !== setIndex);
          return {
            ...ex,
            workingSets: newSets,
            isCompleted: newSets.every((s) => s.isCompleted),
          };
        }),
      );
    },
    [updateAndPersistDraft],
  );

  const handleNotesChange = useCallback(
    (exerciseId: string, notes: string) => {
      updateAndPersistDraft((prev) =>
        prev.map((ex) => (ex.id === exerciseId ? { ...ex, notes } : ex)),
      );
    },
    [updateAndPersistDraft],
  );

  // ── Log Workout Batch Submission ──────────────────────────────────────────
  const handleLogWorkout = async () => {
    if (!dbDay) return;

    const now = new Date();
    const performedOn = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Format all entered values to schema list
    const entriesToSave: Omit<SetEntry, "id" | "session_id">[] = [];
    let totalVol = 0;
    let totalSetsCount = 0;
    let exercisesCount = 0;
    const brokenPRs: { exerciseName: string; weight: number; reps: number }[] =
      [];

    draftExercises.forEach((ex) => {
      const exerciseId = Number(ex.id);
      let exHasValidSets = false;

      // Warmup set
      if (ex.warmup.weight !== null || ex.warmup.reps !== null) {
        entriesToSave.push({
          exercise_id: exerciseId,
          set_type: "warmup",
          set_index: 0,
          weight: ex.warmup.weight,
          reps: ex.warmup.reps,
        });
      }

      // Working sets
      ex.workingSets.forEach((set, idx) => {
        if (set.weight !== null || set.reps !== null) {
          entriesToSave.push({
            exercise_id: exerciseId,
            set_type: "working",
            set_index: idx,
            weight: set.weight,
            reps: set.reps,
          });
          totalVol += (set.weight ?? 0) * (set.reps ?? 0);
          totalSetsCount++;
          exHasValidSets = true;
        }
      });

      if (ex.isCompleted || exHasValidSets) {
        exercisesCount++;
      }

      // PR Calculation
      const globalPR = getGlobalPRForExercise(
        ex.name,
        state.exercises,
        state.personalRecords,
      );
      const workingSets = ex.workingSets.filter(
        (s) => s.weight !== null && s.reps !== null,
      );
      if (workingSets.length > 0) {
        let bestSet = workingSets[0];
        workingSets.forEach((s) => {
          if (
            (s.weight ?? 0) > (bestSet.weight ?? 0) ||
            ((s.weight ?? 0) === (bestSet.weight ?? 0) &&
              (s.reps ?? 0) > (bestSet.reps ?? 0))
          ) {
            bestSet = s;
          }
        });

        if (bestSet.weight !== null && bestSet.reps !== null) {
          const isBetter =
            !globalPR ||
            bestSet.weight > globalPR.max_weight ||
            (bestSet.weight === globalPR.max_weight &&
              bestSet.reps > globalPR.max_weight_reps);

          if (isBetter) {
            brokenPRs.push({
              exerciseName: ex.name,
              weight: bestSet.weight,
              reps: bestSet.reps,
            });
          }
        }
      }
    });

    try {
      const startStr = localStorage.getItem(`repstack_workout_start_${dayId}`);
      const durationSeconds = startStr
        ? Math.max(0, Math.floor((Date.now() - Number(startStr)) / 1000))
        : elapsedSeconds;

      await logSession(dbDay.id, performedOn, entriesToSave, durationSeconds);

      // Clean up local storage
      localStorage.removeItem(`repstack_workout_active_${dayId}`);
      localStorage.removeItem(`repstack_workout_start_${dayId}`);
      localStorage.removeItem(`repstack_draft_${dayId}`);
      setIsWorkoutStarted(false);
      setIsLogged(true);

      // Trigger "Nice Work 🎖️💪" celebration modal
      setCompletionData({
        isOpen: true,
        dayName: dbDay.name,
        totalVolume: totalVol,
        totalSets: totalSetsCount,
        exercisesCompleted: exercisesCount,
        durationSeconds,
        newPRs: brokenPRs,
      });
    } catch (err: any) {
      setNotification({
        variant: "error",
        title: "Failed to Save Workout",
        message: err?.message || "Could not log workout. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  // Render guards
  if (!state.dataLoaded) {
    return <PageSkeletonLoader />;
  }

  if (!dbDay) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#131313" }}
      >
        <div className="text-center">
          <p className="text-steel mb-4">Routine not found.</p>
          <button
            onClick={() => navigate("/")}
            className="underline text-iron font-body"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Mapped list for Drawer
  const mappedDays: MockDay[] = state.workoutDays.map((d) => ({
    id: String(d.id),
    name: d.name,
    exercises: [],
  }));

  const mappedSessions: UIWorkoutSession[] = state.sessions.map((s) => ({
    id: `sess-${s.id}`,
    dayId: String(s.workout_day_id),
    dayName:
      state.workoutDays.find((d) => d.id === s.workout_day_id)?.name || "",
    date: s.performed_on,
    totalVolume: 0,
  }));

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#131313", color: "#e5e2e1" }}
    >
      {/* Drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        days={mappedDays}
        activeDayId={dayId || ""}
        sessions={mappedSessions}
        onDayChange={(id) => {
          setDrawerOpen(false);
          navigate(`/workout/${id}`);
        }}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(19,19,19,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="flex flex-col gap-[4px] items-center justify-center w-9 h-9 rounded-xl cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              className="block rounded-full w-4 h-[1.5px]"
              style={{ background: "#e5e2e1" }}
            />
            <span
              className="block rounded-full w-3 h-[1.5px]"
              style={{ background: "#e5e2e1" }}
            />
            <span
              className="block rounded-full w-4 h-[1.5px]"
              style={{ background: "#e5e2e1" }}
            />
          </button>

          <div>
            <h1 className="font-display font-black text-sm tracking-wider leading-none flex items-center gap-1.5 text-white">
              {isWorkoutStarted ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#dfff00] animate-pulse" />
                  <span>ACTIVE TRAINING</span>
                </>
              ) : (
                <span className="text-steel">ROUTINE PREVIEW</span>
              )}
            </h1>
            <p className="font-body text-[10px] text-steel uppercase mt-1 tracking-widest">
              {dbDay.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/")}
            title="Go to Dashboard"
            className="flex items-center gap-1 font-body font-semibold text-xs px-2.5 py-1.5 rounded transition-all cursor-pointer"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#e5e2e1",
            }}
          >
            <span>📊</span>
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={() => navigate(`/workout/${dayId}/edit`)}
            className="font-body font-semibold text-xs px-2.5 py-1.5 rounded transition-all cursor-pointer"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#e5e2e1",
            }}
          >
            Edit
          </button>
        </div>
      </header>

      {/* Main workout content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: isWorkoutStarted ? "100px" : "32px",
        }}
      >
        {/* Top Header / Start Workout Banner */}
        {!isWorkoutStarted ? (
          <div className="px-4 pt-4 pb-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-2xl text-white">
                  {dbDay.name}
                </h2>
                <p className="font-body text-xs text-steel mt-0.5">
                  {draftExercises.length} exercise
                  {draftExercises.length === 1 ? "" : "s"} listed
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(true)}
                  className="font-mono text-xs px-2.5 py-1 rounded-md text-steel hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer flex items-center gap-1"
                  title="Reorder exercises"
                >
                  <span>⇅</span>
                  <span>Reorder</span>
                </button>
                <span
                  className="font-mono text-[10px] px-2.5 py-1 rounded-md text-steel"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  👁️ View Only
                </span>
              </div>
            </div>

            {/* Prominent TOP Start Workout Button */}
            <button
              type="button"
              onClick={handleStartWorkout}
              className="w-full rounded-2xl py-3.5 font-display font-black text-sm uppercase transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-xl"
              style={{
                background: "#dfff00",
                color: "#000000",
                boxShadow: "0px 6px 20px rgba(223, 255, 0, 0.25)",
                letterSpacing: "0.05em",
              }}
            >
              <span>▶</span> START {dbDay.name.toUpperCase()} WORKOUT
            </button>
          </div>
        ) : (
          <div className="px-4 pt-4 pb-2 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-2xl text-white">
                  {dbDay.name}
                </h2>
                <p className="font-body text-xs text-steel mt-0.5">
                  {draftExercises.length} exercise
                  {draftExercises.length === 1 ? "" : "s"} in session
                </p>
              </div>

              {/* Live Session Timer HUD */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold"
                style={{
                  background: "rgba(223, 255, 0, 0.1)",
                  border: "1px solid rgba(223, 255, 0, 0.35)",
                  boxShadow: "0 0 15px rgba(223, 255, 0, 0.15)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#dfff00] animate-pulse" />
                <span className="text-[#dfff00] font-black text-sm tracking-wider">
                  {formatDuration(elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* In-Session Quick Tools: Rest Timer & Reorder */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRestTimerOpen((v) => !v)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-mono text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
                style={{
                  background: isRestTimerOpen
                    ? "rgba(223, 255, 0, 0.15)"
                    : "rgba(255, 255, 255, 0.05)",
                  border: isRestTimerOpen
                    ? "1px solid #dfff00"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  color: isRestTimerOpen ? "#dfff00" : "#e5e2e1",
                }}
              >
                <span>⏱️</span>
                <span>Rest Timer</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReorderModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-mono text-xs font-semibold bg-white/5 hover:bg-white/10 text-steel hover:text-white border border-white/10 transition-all active:scale-[0.98] cursor-pointer"
                title="Reorder exercises"
              >
                <span>⇅</span>
                <span>Reorder</span>
              </button>
            </div>
          </div>
        )}

        {/* Exercises */}
        <div className="flex flex-col gap-4 px-4 pb-4 mt-2">
          {draftExercises.map((exercise, idx) => {
            const globalPR = getGlobalPRForExercise(
              exercise.name,
              state.exercises,
              state.personalRecords,
            );
            const lastPerf = getLastPerformanceForExercise(
              exercise.name,
              state.exercises,
              state.sessions,
              state.setEntries,
            );

            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                globalPR={globalPR}
                lastPerformance={lastPerf}
                isEditMode={isWorkoutStarted}
                onSetChange={handleSetChange}
                onAddSet={handleAddSet}
                onRemoveSet={handleRemoveSet}
                onNotesChange={handleNotesChange}
                onToggleSetComplete={handleToggleSetComplete}
                onToggleExerciseComplete={handleToggleExerciseComplete}
                onMoveUp={() => handleMoveExercise(exercise.id, "up")}
                onMoveDown={() => handleMoveExercise(exercise.id, "down")}
                canMoveUp={idx > 0}
                canMoveDown={idx < draftExercises.length - 1}
                onTriggerRestTimer={() => setIsRestTimerOpen(true)}
              />
            );
          })}
        </div>

        {/* Bottom Bar in Live Training Mode */}
        {isWorkoutStarted && (
          <div
            className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 flex items-center gap-2.5"
            style={{
              background: "rgba(18, 18, 18, 0.95)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <button
              type="button"
              onClick={() => setIsConfirmCancelOpen(true)}
              className="px-4 py-3.5 rounded-xl font-display font-bold text-xs uppercase transition-all duration-200 active:scale-[0.98] cursor-pointer flex-shrink-0"
              style={{
                background: "rgba(255, 49, 49, 0.08)",
                border: "1px solid rgba(255, 49, 49, 0.25)",
                color: "#ff3131",
              }}
            >
              ✕ CANCEL
            </button>

            <button
              disabled={isLogged || isSubmitting}
              onClick={handleLogWorkout}
              className="flex-1 rounded-xl py-3.5 font-display font-black text-sm uppercase transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-xl flex items-center justify-center gap-2"
              style={{
                background:
                  isLogged || isSubmitting
                    ? "rgba(255,255,255,0.04)"
                    : "#dfff00",
                color: isLogged || isSubmitting ? "#565C66" : "#000000",
                border:
                  isLogged || isSubmitting
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "none",
                boxShadow:
                  isLogged || isSubmitting
                    ? "none"
                    : "0px 6px 20px rgba(223, 255, 0, 0.25)",
                letterSpacing: "0.05em",
              }}
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {isSubmitting
                ? "SUBMITTING..."
                : isLogged
                  ? "✓ WORKOUT LOGGED"
                  : `LOG ${dbDay.name} WORKOUT`}
            </button>
          </div>
        )}
      </main>

      {/* Reusable Toast Notification */}
      {notification && (
        <ToastNotification
          variant={notification.variant}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Cancel Workout Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmCancelOpen}
        title="Discard Workout Session?"
        message="Are you sure you want to cancel this workout? Any unsaved weights and reps for this session will be discarded."
        confirmText="Discard & Exit"
        cancelText="Keep Training"
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsConfirmCancelOpen(false)}
      />

      {/* Nice Work 🎖️💪 Celebratory Modal */}
      {completionData && (
        <WorkoutCompletionModal
          isOpen={completionData.isOpen}
          dayName={completionData.dayName}
          totalVolume={completionData.totalVolume}
          totalSets={completionData.totalSets}
          exercisesCompleted={completionData.exercisesCompleted}
          durationSeconds={completionData.durationSeconds}
          newPRs={completionData.newPRs}
          onClose={() => {
            setCompletionData(null);
            navigate("/");
          }}
        />
      )}

      {/* Persistent Wall-Clock Rest Timer Overlay */}
      {isRestTimerOpen && (
        <RestTimer
          defaultSeconds={restDefaultSeconds}
          onClose={() => setIsRestTimerOpen(false)}
          onDefaultChange={(sec) => setRestDefaultSeconds(sec)}
        />
      )}

      {/* Reorder Exercises Modal */}
      <ReorderExercisesModal
        isOpen={isReorderModalOpen}
        exercises={draftExercises.map((e) => ({ id: e.id, name: e.name }))}
        onSave={handleSaveReorder}
        onClose={() => setIsReorderModalOpen(false)}
      />
    </div>
  );
}
