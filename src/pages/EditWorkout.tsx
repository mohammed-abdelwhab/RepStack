import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGymTracker } from "../context/GymTrackerContext";

interface EditableExercise {
  id: number;
  name: string;
  notes: string;
  workingSetCount: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

export default function EditWorkout() {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const {
    state,
    updateWorkoutDay,
    deleteWorkoutDay,
    addExercise,
    updateExercise,
    removeExercise,
    updateExerciseConfig,
  } = useGymTracker();

  const dbDay = state.workoutDays.find((d) => String(d.id) === dayId);

  const [routineName, setRoutineName] = useState("");
  const [exercises, setExercises] = useState<EditableExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate local form state
  useEffect(() => {
    if (!dbDay) return;
    setRoutineName(dbDay.name);

    const dayExercises = state.exercises.filter(
      (e) => e.workout_day_id === dbDay.id,
    );
    const mapped: EditableExercise[] = dayExercises.map((e) => {
      const config = state.exerciseConfigs.find((c) => c.exercise_id === e.id);
      return {
        id: e.id,
        name: e.name,
        notes: e.notes || "",
        workingSetCount: config?.working_set_count ?? 3,
      };
    });
    setExercises(mapped);
  }, [dayId, dbDay, state.exercises, state.exerciseConfigs]);

  if (!dbDay) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#131313" }}
      >
        <div className="text-center">
          <p className="text-steel mb-4">Routine not found.</p>
          <button onClick={() => navigate("/")} className="underline text-iron">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleAddExerciseRow = () => {
    setExercises([
      ...exercises,
      {
        id: Date.now(), // temporary ID for react key and indexing
        name: "",
        notes: "",
        workingSetCount: 3,
        isNew: true,
      },
    ]);
  };

  const handleRemoveExerciseRow = (id: number, isNew?: boolean) => {
    if (isNew) {
      setExercises(exercises.filter((ex) => ex.id !== id));
    } else {
      setExercises(
        exercises.map((ex) => (ex.id === id ? { ...ex, isDeleted: true } : ex)),
      );
    }
  };

  const handleExerciseChange = (
    id: number,
    field: keyof EditableExercise,
    value: any,
  ) => {
    setExercises(
      exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineName.trim()) {
      setError("Routine name is required.");
      return;
    }

    const activeExercises = exercises.filter((ex) => !ex.isDeleted);
    const invalidEx = activeExercises.some((ex) => !ex.name.trim());
    if (invalidEx) {
      setError("All exercises must have a name.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // 1. Update Routine/Day Name if it changed
      if (routineName.trim() !== dbDay.name) {
        await updateWorkoutDay(dbDay.id, routineName.trim());
      }

      // 2. Loop through exercises and apply changes
      for (const ex of exercises) {
        if (ex.isDeleted) {
          if (!ex.isNew) {
            await removeExercise(ex.id);
          }
        } else if (ex.isNew) {
          await addExercise(
            dbDay.id,
            ex.name.trim(),
            ex.notes.trim(),
            ex.workingSetCount,
          );
        } else {
          // Existing exercises: check if name/notes changed
          const origEx = state.exercises.find((orig) => orig.id === ex.id);
          if (
            origEx &&
            (origEx.name !== ex.name.trim() ||
              (origEx.notes || "") !== ex.notes.trim())
          ) {
            await updateExercise(ex.id, ex.name.trim(), ex.notes.trim());
          }

          // Check if config sets count changed
          const origConfig = state.exerciseConfigs.find(
            (c) => c.exercise_id === ex.id,
          );
          if (
            origConfig &&
            origConfig.working_set_count !== ex.workingSetCount
          ) {
            await updateExerciseConfig(ex.id, ex.workingSetCount);
          }
        }
      }

      navigate(`/workout/${dbDay.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to update routine.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoutine = async () => {
    const confirm = window.confirm(
      `Are you sure you want to delete the "${dbDay.name}" routine? This will permanently delete all its exercises and configurations.`,
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      await deleteWorkoutDay(dbDay.id);
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Failed to delete routine.");
      setIsLoading(false);
    }
  };

  const visibleExercises = exercises.filter((ex) => !ex.isDeleted);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#131313", color: "#e5e2e1" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-4"
        style={{
          background: "rgba(19, 19, 19, 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/workout/${dayId}`)}
            aria-label="Back"
            className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#e5e2e1",
              fontSize: 18,
            }}
          >
            ←
          </button>
          <div>
            <h1 className="font-display font-black text-sm tracking-wide text-white leading-none">
              EDIT ROUTINE
            </h1>
            <p className="font-body text-[10px] text-steel uppercase mt-1 tracking-widest">
              {dbDay.name}
            </p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleDeleteRoutine}
            className="font-display font-bold text-xs uppercase px-3 py-1.5 rounded transition-all cursor-pointer"
            style={{
              background: "rgba(255, 49, 49, 0.1)",
              border: "1px solid rgba(255, 49, 49, 0.2)",
              color: "#ff3131",
            }}
          >
            DELETE
          </button>
        </div>
      </header>

      {/* Edit Form */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Day Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Routine Name
            </label>
            <input
              type="text"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="bg-surface text-chalk font-body text-base rounded px-4 py-3.5 border border-steel/20 focus:border-iron focus:outline-none transition-all"
              style={{ caretColor: "#dfff00" }}
            />
          </div>

          {/* Exercises list */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                Exercises
              </h2>
              <button
                type="button"
                onClick={handleAddExerciseRow}
                className="font-body font-semibold text-xs px-3 py-1.5 rounded transition-all cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#dfff00",
                }}
              >
                + ADD EXERCISE
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {visibleExercises.length === 0 ? (
                <div
                  className="rounded-xl p-6 text-center text-sm text-steel"
                  style={{
                    background: "#121212",
                    border: "1px dashed rgba(255,255,255,0.08)",
                  }}
                >
                  No exercises in this routine. Add some!
                </div>
              ) : (
                visibleExercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="rounded-xl p-4 flex flex-col gap-3 relative"
                    style={{
                      background: "#121212",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {/* Row Header */}
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-steel">
                        #{idx + 1} {ex.isNew ? "(New)" : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseRow(ex.id, ex.isNew)}
                        className="font-body text-xs cursor-pointer hover:underline"
                        style={{ color: "#ff3131" }}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Name Input */}
                    <div className="flex flex-col gap-1">
                      <label className="font-body text-xs text-steel">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Incline Bench Press"
                        value={ex.name}
                        onChange={(e) =>
                          handleExerciseChange(ex.id, "name", e.target.value)
                        }
                        className="bg-black text-chalk font-body text-base rounded px-3.5 py-2.5 border border-steel/20 focus:border-iron focus:outline-none"
                      />
                    </div>

                    {/* Working Sets Count */}
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-body text-xs text-steel">
                        Working Sets
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={ex.workingSetCount <= 1}
                          onClick={() =>
                            handleExerciseChange(
                              ex.id,
                              "workingSetCount",
                              ex.workingSetCount - 1,
                            )
                          }
                          className="w-7 h-7 rounded flex items-center justify-center font-bold bg-zinc-800 disabled:opacity-30 cursor-pointer text-white"
                        >
                          -
                        </button>
                        <span className="font-mono text-sm font-bold text-white">
                          {ex.workingSetCount}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleExerciseChange(
                              ex.id,
                              "workingSetCount",
                              ex.workingSetCount + 1,
                            )
                          }
                          className="w-7 h-7 rounded flex items-center justify-center font-bold bg-zinc-800 cursor-pointer text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Notes Input */}
                    <div className="flex flex-col gap-1 mt-1">
                      <label className="font-body text-xs text-steel">
                        Notes (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Focus on chest stretch"
                        value={ex.notes}
                        onChange={(e) =>
                          handleExerciseChange(ex.id, "notes", e.target.value)
                        }
                        className="bg-black text-chalk font-body text-base rounded px-3.5 py-2.5 border border-steel/15 focus:border-iron focus:outline-none"
                      />
                    </div>
                  </div>
                ))
              )}

              {/* Bottom Add Exercise Button */}
              <button
                type="button"
                onClick={handleAddExerciseRow}
                className="w-full py-3.5 rounded-xl border border-dashed text-xs font-display font-bold uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] hover:border-iron"
                style={{
                  background: "rgba(223, 255, 0, 0.04)",
                  borderColor: "rgba(223, 255, 0, 0.35)",
                  color: "#dfff00",
                }}
              >
                + ADD ANOTHER EXERCISE
              </button>
            </div>
          </div>

          {error && (
            <p
              className="font-body text-xs p-3 rounded"
              style={{
                background: "rgba(255, 49, 49, 0.1)",
                color: "#ff3131",
                border: "1px solid rgba(255, 49, 49, 0.2)",
              }}
            >
              {error}
            </p>
          )}

          {/* Submit Save */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full font-display font-black uppercase text-sm py-4 rounded transition-all active:scale-[0.98] cursor-pointer mt-4"
            style={{
              background: "#dfff00",
              color: "#000000",
              boxShadow: "0px 4px 15px rgba(223, 255, 0, 0.15)",
              letterSpacing: "0.05em",
            }}
          >
            {isLoading ? "SAVING CHANGES..." : "SAVE ROUTINE"}
          </button>
        </form>
      </main>
    </div>
  );
}
