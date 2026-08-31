import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGymTracker } from "../context/GymTrackerContext";

interface TempExercise {
  name: string;
  notes: string;
  workingSetCount: number;
}

export default function CreateWorkout() {
  const navigate = useNavigate();
  const { addWorkoutDay, addExercise } = useGymTracker();

  const [dayName, setDayName] = useState("");
  const [exercises, setExercises] = useState<TempExercise[]>([
    { name: "", notes: "", workingSetCount: 3 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddExerciseRow = () => {
    setExercises([...exercises, { name: "", notes: "", workingSetCount: 3 }]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    if (exercises.length === 1) return;
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (
    index: number,
    field: keyof TempExercise,
    value: any,
  ) => {
    setExercises(
      exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayName.trim()) {
      setError("Please enter a routine name.");
      return;
    }
    const invalidEx = exercises.some((ex) => !ex.name.trim());
    if (invalidEx) {
      setError("All added exercises must have a name.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // 1. Create the day tab
      const day = await addWorkoutDay(dayName.trim());
      if (!day) {
        throw new Error("Failed to create workout day.");
      }

      // 2. Sequentially add exercises under the new day ID
      for (const ex of exercises) {
        await addExercise(
          day.id,
          ex.name.trim(),
          ex.notes.trim(),
          ex.workingSetCount,
        );
      }

      // 3. Redirect back to Dashboard
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Failed to create workout routine.");
    } finally {
      setIsLoading(false);
    }
  };

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
            onClick={() => navigate("/")}
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
              NEW ROUTINE
            </h1>
            <p className="font-body text-[10px] text-steel uppercase mt-1 tracking-widest">
              Workout Builder
            </p>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Day Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Routine Name
            </label>
            <input
              type="text"
              placeholder="e.g. Legs Heavy, Shoulder Blast"
              value={dayName}
              onChange={(e) => setDayName(e.target.value)}
              className="bg-surface text-chalk font-body text-base rounded px-4 py-3.5 border border-steel/20 focus:border-iron focus:outline-none transition-all"
              style={{ caretColor: "#dfff00" }}
            />
          </div>

          {/* Exercises Section */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                Exercises Config
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
              {exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-4 flex flex-col gap-3 relative"
                  style={{
                    background: "#121212",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {/* Row header: Exercise count & remove button */}
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-steel">
                      #{idx + 1}
                    </span>
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseRow(idx)}
                        className="font-body text-xs cursor-pointer hover:underline"
                        style={{ color: "#ff3131" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Exercise Name Input */}
                  <div className="flex flex-col gap-1">
                    <label className="font-body text-xs text-steel">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat Bench Press"
                      value={ex.name}
                      onChange={(e) =>
                        handleExerciseChange(idx, "name", e.target.value)
                      }
                      className="bg-black text-chalk font-body text-sm rounded px-3 py-2 border border-steel/20 focus:border-iron focus:outline-none"
                    />
                  </div>

                  {/* Working set count selector */}
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-body text-xs text-steel">
                      Working Sets Count
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={ex.workingSetCount <= 1}
                        onClick={() =>
                          handleExerciseChange(
                            idx,
                            "workingSetCount",
                            ex.workingSetCount - 1,
                          )
                        }
                        className="w-7 h-7 rounded flex items-center justify-center font-bold bg-zinc-800 disabled:opacity-30 cursor-pointer"
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
                            idx,
                            "workingSetCount",
                            ex.workingSetCount + 1,
                          )
                        }
                        className="w-7 h-7 rounded flex items-center justify-center font-bold bg-zinc-800 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Notes input */}
                  <div className="flex flex-col gap-1 mt-1">
                    <label className="font-body text-xs text-steel">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Keep chest up, warm up shoulder cuffs first"
                      value={ex.notes}
                      onChange={(e) =>
                        handleExerciseChange(idx, "notes", e.target.value)
                      }
                      className="bg-black text-chalk font-body text-xs rounded px-3 py-2 border border-steel/15 focus:border-iron focus:outline-none"
                    />
                  </div>
                </div>
              ))}
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

          {/* Submit */}
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
            {isLoading ? "BUILDING ROUTINE..." : "SAVE ROUTINE"}
          </button>
        </form>
      </main>
    </div>
  );
}
