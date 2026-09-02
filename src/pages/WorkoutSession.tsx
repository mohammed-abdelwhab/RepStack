import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGymTracker } from "../context/GymTrackerContext";
import { SideDrawer } from "../components/SideDrawer";
import { BottomTabBar } from "../components/BottomTabBar";
import { ExerciseCard } from "../components/ExerciseCard";
import { PRCelebration } from "../components/PRCelebration";
import { RestTimer } from "../components/RestTimer";
import { ToastNotification } from "../components/ToastNotification";
import { soundEffects } from "../utils/audioUtils";
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

interface PRToast {
  exerciseName: string;
  weight: number;
  reps: number;
}

export default function WorkoutSession() {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { state, logSession } = useGymTracker();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerDefault, setTimerDefault] = useState(90); // seconds
  const [prToast, setPrToast] = useState<PRToast | null>(null);
  const [notification, setNotification] = useState<{
    variant: AlertVariant;
    title?: string;
    message: string;
  } | null>(null);
  const [isLogged, setIsLogged] = useState(false);

  // ── Workout Live Training Stopwatch State ────────────────────────────────
  const [isWorkoutStarted, setIsWorkoutStarted] = useState<boolean>(() => {
    return localStorage.getItem(`repstack_workout_active_${dayId}`) === "true";
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const savedStart = localStorage.getItem(`repstack_start_${dayId}`);
    if (savedStart) {
      const diff = Math.floor((Date.now() - parseInt(savedStart, 10)) / 1000);
      return diff > 0 ? diff : 0;
    }
    return 0;
  });
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Active workout timer tick
  useEffect(() => {
    if (!isWorkoutStarted || isTimerPaused) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorkoutStarted, isTimerPaused]);

  const handleStartWorkout = () => {
    setIsWorkoutStarted(true);
    setIsTimerPaused(false);
    localStorage.setItem(`repstack_workout_active_${dayId}`, "true");
    localStorage.setItem(
      `repstack_start_${dayId}`,
      String(Date.now() - elapsedSeconds * 1000),
    );
  };

  const handleTogglePause = () => {
    setIsTimerPaused((prev) => !prev);
  };

  const formatElapsedTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Find current day
  const dbDay = state.workoutDays.find((d) => String(d.id) === dayId);

  // Local draft of mock exercises for the active session log
  const [draftExercises, setDraftExercises] = useState<MockExercise[]>([]);

  // Initialize draft inputs
  useEffect(() => {
    if (!dbDay) return;

    const dayExercises = state.exercises.filter(
      (e) => e.workout_day_id === dbDay.id,
    );

    const initialDrafts: MockExercise[] = dayExercises.map((ex) => {
      const config = state.exerciseConfigs.find((c) => c.exercise_id === ex.id);
      const workingSetsCount = config?.working_set_count ?? 3;

      // Cross-routine lookup: retrieve last logged weights & reps across ALL routines for this exercise name
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
        warmup: {
          weight: lastWarmup?.weight ?? null,
          reps: lastWarmup?.reps ?? null,
        },
        workingSets: Array.from({ length: workingSetsCount }, (_, i) => {
          const match = lastWorkingSets.find((s) => s.set_index === i);
          return {
            weight: match?.weight ?? null,
            reps: match?.reps ?? null,
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

  // Render guards
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

  // ── Callbacks for Exercise Inputs ──────────────────────────────────────────

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
      setDraftExercises((prev) =>
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
    [],
  );

  const handleAddSet = useCallback((exerciseId: string) => {
    setDraftExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const last = ex.workingSets[ex.workingSets.length - 1];
        return {
          ...ex,
          workingSets: [
            ...ex.workingSets,
            { weight: last?.weight ?? null, reps: last?.reps ?? null },
          ],
        };
      }),
    );
  }, []);

  const handleRemoveSet = useCallback(
    (exerciseId: string, setIndex: number) => {
      setDraftExercises((prev) =>
        prev.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          if (ex.workingSets.length <= 1) return ex;
          return {
            ...ex,
            workingSets: ex.workingSets.filter((_, i) => i !== setIndex),
          };
        }),
      );
    },
    [],
  );

  const handleNotesChange = useCallback((exerciseId: string, notes: string) => {
    setDraftExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, notes } : ex)),
    );
  }, []);

  const handleStartTimer = useCallback(() => {
    setTimerVisible(true);
  }, []);

  // Log active workout to Supabase
  const handleLogWorkout = async () => {
    const performedOn = new Date().toISOString().split("T")[0];

    // Format all draft values to schema list
    const entriesToSave: Omit<SetEntry, "id" | "session_id">[] = [];

    draftExercises.forEach((ex) => {
      const exerciseId = Number(ex.id);

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
        }
      });
    });

    try {
      const finalDuration = elapsedSeconds;
      await logSession(dbDay.id, performedOn, entriesToSave, finalDuration);
      setIsLogged(true);
      setIsWorkoutStarted(false);
      localStorage.removeItem(`repstack_workout_active_${dayId}`);
      localStorage.removeItem(`repstack_start_${dayId}`);

      // Play completion chime
      soundEffects.playWorkoutCompleteChime();

      const durationMinutes = Math.floor(finalDuration / 60);
      const durationSecondsRemainder = finalDuration % 60;
      const durationFormatted =
        durationMinutes > 0
          ? `${durationMinutes}m ${durationSecondsRemainder}s`
          : `${durationSecondsRemainder}s`;

      // Let's check for any new PRs broken across all routines
      let foundPR: PRToast | null = null;
      draftExercises.forEach((ex) => {
        const globalPR = getGlobalPRForExercise(
          ex.name,
          state.exercises,
          state.personalRecords,
        );

        // Find best working set entered
        const workingSets = ex.workingSets.filter(
          (s) => s.weight !== null && s.reps !== null,
        );
        if (workingSets.length === 0) return;

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
            foundPR = {
              exerciseName: ex.name,
              weight: bestSet.weight,
              reps: bestSet.reps,
            };
          }
        }
      });

      if (foundPR) {
        setPrToast(foundPR);
      } else {
        setNotification({
          variant: "success",
          title: "Workout Logged",
          message: `${dbDay.name} completed in ${durationFormatted}! Session saved.`,
        });
      }

      // Automatically redirect to Dashboard after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2500);
    } catch (err: any) {
      setNotification({
        variant: "error",
        title: "Failed to Log Session",
        message: err?.message || "Could not save workout. Please try again.",
      });
    }
  };

  // Mapped list for Drawer/BottomTabs
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

      {/* PR Celebrate */}
      {prToast && (
        <PRCelebration
          exerciseName={prToast.exerciseName}
          weight={prToast.weight}
          reps={prToast.reps}
          onDismiss={() => setPrToast(null)}
        />
      )}

      {/* Rest Timer */}
      {timerVisible && (
        <RestTimer
          defaultSeconds={timerDefault}
          onClose={() => setTimerVisible(false)}
          onDefaultChange={setTimerDefault}
        />
      )}

      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(19,19,19,0.9)",
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
            <h1 className="font-display font-black text-sm text-white tracking-wider leading-none">
              ACTIVE TRAINING
            </h1>
            <p className="font-body text-[10px] text-steel uppercase mt-1 tracking-widest">
              {dbDay.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/workout/${dayId}/edit`)}
            className="font-body font-semibold text-xs px-2.5 py-1.5 rounded transition-all cursor-pointer"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#e5e2e1",
            }}
          >
            Edit Routine
          </button>
        </div>
      </header>

      {/* ── Active Workout Stopwatch & Rest Quick Launch Bar ────────────── */}
      <div
        className="px-4 py-2.5 sticky top-[57px] z-30 flex items-center justify-between"
        style={{
          background: "rgba(18, 18, 18, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          {!isWorkoutStarted ? (
            <button
              type="button"
              onClick={handleStartWorkout}
              className="font-display font-black text-xs uppercase px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              style={{
                background: "#dfff00",
                color: "#000000",
                boxShadow: "0 0 12px rgba(223, 255, 0, 0.35)",
              }}
            >
              <span>▶</span> START WORKOUT
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isTimerPaused
                      ? "bg-amber-400"
                      : "bg-[#dfff00] animate-pulse"
                  }`}
                />
                <span className="font-mono text-sm font-black text-white tracking-wider">
                  {formatElapsedTime(elapsedSeconds)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleTogglePause}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-steel hover:text-white transition-colors cursor-pointer border border-white/10"
                title={
                  isTimerPaused ? "Resume workout timer" : "Pause workout timer"
                }
              >
                {isTimerPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
            </div>
          )}
        </div>

        {/* Quick Rest Timer Trigger */}
        <button
          type="button"
          onClick={() => setTimerVisible((v) => !v)}
          className="font-mono text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          style={{
            background: timerVisible
              ? "rgba(223, 255, 0, 0.15)"
              : "rgba(255, 255, 255, 0.05)",
            border: timerVisible
              ? "1px solid #dfff00"
              : "1px solid rgba(255, 255, 255, 0.1)",
            color: timerVisible ? "#dfff00" : "#e5e2e1",
          }}
        >
          <span>⏱️</span>
          <span>Rest Timer</span>
        </button>
      </div>

      {/* Main workout logging */}
      <main
        className="flex-1 overflow-y-auto pb-24"
        style={{
          paddingBottom: timerVisible ? "160px" : "90px",
        }}
      >
        {/* Title details */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="font-display font-black text-2xl text-white">
            {dbDay.name}
          </h2>
          <p className="font-body text-xs text-steel mt-0.5">
            {draftExercises.length} exercise
            {draftExercises.length === 1 ? "" : "s"} listed
          </p>
        </div>

        {/* Exercises */}
        <div className="flex flex-col gap-4 px-4 pb-4">
          {draftExercises.map((exercise) => {
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
                isEditMode={true} // Allow inline logging edits
                onSetChange={handleSetChange}
                onAddSet={handleAddSet}
                onRemoveSet={handleRemoveSet}
                onNotesChange={handleNotesChange}
                onStartTimer={handleStartTimer}
              />
            );
          })}
        </div>

        {/* Log Workout trigger */}
        <div className="px-4 pb-6 pt-2">
          <button
            disabled={isLogged}
            onClick={handleLogWorkout}
            className="w-full rounded-2xl py-4 font-display font-black text-sm uppercase transition-all duration-200 active:scale-[0.98] cursor-pointer"
            style={{
              background: isLogged ? "rgba(255,255,255,0.04)" : "#dfff00",
              color: isLogged ? "#565C66" : "#000000",
              border: isLogged ? "1px solid rgba(255,255,255,0.08)" : "none",
              boxShadow: isLogged
                ? "none"
                : "0px 6px 20px rgba(223, 255, 0, 0.15)",
              letterSpacing: "0.05em",
            }}
          >
            {isLogged ? "✓ WORKOUT LOGGED" : `LOG ${dbDay.name} WORKOUT`}
          </button>
        </div>
      </main>

      {/* Tabs */}
      <BottomTabBar
        days={mappedDays}
        activeDay={dayId || ""}
        activeIsStats={false}
        onDayChange={(id) => navigate(`/workout/${id}`)}
        onStatsOpen={() => navigate("/")}
        statsTab={{ id: "stats", name: "Stats" }}
      />

      {/* Reusable Toast Notification */}
      {notification && (
        <ToastNotification
          variant={notification.variant}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
