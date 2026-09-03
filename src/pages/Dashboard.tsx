import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGymTracker } from "../context/GymTrackerContext";
import { SideDrawer } from "../components/SideDrawer";
import { WeeklyDashboardShell } from "../components/WeeklyDashboardShell";
import { ExerciseProgressionChart } from "../components/ExerciseProgressionChart";
import { WorkoutHeatmap } from "../components/WorkoutHeatmap";
import type { WorkoutSession, PREntry, MockDay } from "../types/mock";

export default function Dashboard() {
  const { state, user, logout } = useGymTracker();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>(() => {
    if (!user) return "";
    return localStorage.getItem(`gym_tracker_name_${user.id}`) || "";
  });
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`gym_tracker_name_${user.id}`);
      if (saved) setDisplayName(saved);
    }
  }, [user]);

  // ── Mappers: DB State to UI Mock types ─────────────────────────────────────

  // Map Workout Days to MockDay UI format
  const mappedDays: MockDay[] = state.workoutDays.map((d) => {
    const dayExercises = state.exercises.filter(
      (e) => e.workout_day_id === d.id,
    );
    return {
      id: String(d.id),
      name: d.name,
      exercises: dayExercises.map((e) => {
        const config = state.exerciseConfigs.find(
          (c) => c.exercise_id === e.id,
        );
        const setEntries = state.setEntries.filter(
          (s) => s.exercise_id === e.id,
        );

        // Find recent sets to initialize drafts
        const workingSetsCount = config?.working_set_count ?? 3;
        const recentSession = state.sessions.find(
          (s) => s.workout_day_id === d.id,
        );
        const recentSets = recentSession
          ? setEntries.filter(
              (s) =>
                s.session_id === recentSession.id && s.set_type === "working",
            )
          : [];
        const recentWarmup = recentSession
          ? setEntries.find(
              (s) =>
                s.session_id === recentSession.id && s.set_type === "warmup",
            )
          : null;

        return {
          id: String(e.id),
          name: e.name,
          notes: e.notes || "",
          imageUrl: e.image_url,
          warmup: {
            weight: recentWarmup?.weight ?? null,
            reps: recentWarmup?.reps ?? null,
          },
          workingSets: Array.from({ length: workingSetsCount }, (_, i) => {
            const match = recentSets.find((s) => s.set_index === i);
            return {
              weight: match?.weight ?? null,
              reps: match?.reps ?? null,
            };
          }),
        };
      }),
    };
  });

  // Map DB sessions to UI WorkoutSession
  const mappedSessions: WorkoutSession[] = state.sessions.map((s) => {
    const day = state.workoutDays.find((d) => d.id === s.workout_day_id);
    const sessionEntries = state.setEntries.filter(
      (entry) => entry.session_id === s.id && entry.set_type === "working",
    );
    const totalVolume = sessionEntries.reduce(
      (acc, entry) => acc + (entry.weight ?? 0) * (entry.reps ?? 0),
      0,
    );

    return {
      id: `sess-${s.id}`,
      dayId: String(s.workout_day_id),
      dayName: day?.name || "Workout",
      date: s.performed_on,
      totalVolume,
      durationSeconds: s.duration_seconds,
    };
  });

  // Map DB personal records to UI PREntry
  const mappedPRFeed: PREntry[] = state.personalRecords.map((pr) => {
    const ex = state.exercises.find((e) => e.id === pr.exercise_id);
    return {
      id: `pr-${pr.id}`,
      exerciseName: ex?.name || "Exercise",
      weight: pr.max_weight,
      reps: pr.max_weight_reps,
      date: pr.achieved_on,
    };
  });

  return (
    <div
      className="min-h-screen flex flex-col pb-24"
      style={{ background: "#131313", color: "#e5e2e1" }}
    >
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-3.5 py-3 gap-2"
        style={{
          background: "rgba(19, 19, 19, 0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Left: Hamburger & User / Dashboard Identity */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="flex flex-col gap-[3.5px] items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 active:scale-90 cursor-pointer flex-shrink-0"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <span
              className="block rounded-full"
              style={{ width: 14, height: 1.5, background: "#e5e2e1" }}
            />
            <span
              className="block rounded-full"
              style={{ width: 10, height: 1.5, background: "#e5e2e1" }}
            />
            <span
              className="block rounded-full"
              style={{ width: 14, height: 1.5, background: "#e5e2e1" }}
            />
          </button>

          <div className="min-w-0 flex-1">
            <h1
              className="font-display leading-none truncate text-white"
              style={{
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: "0.04em",
              }}
            >
              DASHBOARD
            </h1>
            <button
              onClick={() => {
                setTempName(displayName || "");
                setIsNameModalOpen(true);
              }}
              title="Click to rename display name"
              className="flex items-center gap-1 mt-1 text-left group cursor-pointer max-w-full"
            >
              <p
                className="font-mono leading-none text-steel uppercase text-[10px] truncate max-w-[130px] sm:max-w-[240px] group-hover:text-primary transition-colors"
                style={{
                  letterSpacing: "0.04em",
                }}
              >
                {displayName ? displayName : user?.email}
              </p>
              <span
                className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0"
                style={{ color: "#dfff00" }}
              >
                ✏️
              </span>
            </button>
          </div>
        </div>

        {/* Right: Sleek Log Out Button */}
        <div className="flex-shrink-0">
          <button
            onClick={logout}
            title="Log out of account"
            className="font-mono font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            style={{
              background: "rgba(255, 49, 49, 0.08)",
              border: "1px solid rgba(255, 49, 49, 0.25)",
              color: "#ff3131",
            }}
          >
            <span>LOG OUT</span>
          </button>
        </div>
      </header>

      {/* ── Display Name Edit Modal ────────────────────────────────────────── */}
      {isNameModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setIsNameModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 relative"
            style={{
              background: "#121212",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-black text-lg text-white uppercase">
                  Profile Display Name
                </h3>
                <p className="font-body text-xs text-steel mt-0.5">
                  Choose how your name appears on the dashboard.
                </p>
              </div>
              <button
                onClick={() => setIsNameModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-steel hover:text-white bg-zinc-800/60 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-steel uppercase">
                Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Mohamed, Alex, Titan"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
                className="bg-black text-chalk font-body text-sm rounded px-3.5 py-2.5 border border-steel/25 focus:border-iron focus:outline-none"
                style={{ caretColor: "#dfff00" }}
              />
              <span className="font-body text-[11px] text-steel">
                Current account email:{" "}
                <strong className="text-chalk">{user?.email}</strong>
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDisplayName("");
                  if (user) {
                    localStorage.removeItem(`gym_tracker_name_${user.id}`);
                  }
                  setIsNameModalOpen(false);
                }}
                className="flex-1 font-mono text-xs py-2.5 rounded bg-zinc-900 border border-white/10 text-steel hover:text-white transition-colors cursor-pointer"
              >
                Reset to Email
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = tempName.trim();
                  setDisplayName(trimmed);
                  if (user) {
                    if (trimmed) {
                      localStorage.setItem(
                        `gym_tracker_name_${user.id}`,
                        trimmed,
                      );
                    } else {
                      localStorage.removeItem(`gym_tracker_name_${user.id}`);
                    }
                  }
                  setIsNameModalOpen(false);
                }}
                className="flex-1 font-display font-black text-xs uppercase py-2.5 rounded transition-all active:scale-95 cursor-pointer"
                style={{
                  background: "#dfff00",
                  color: "#000000",
                }}
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Side drawer menu ────────────────────────────────────────────────── */}
      <SideDrawer
        isOpen={drawerOpen}
        days={mappedDays}
        activeDayId=""
        sessions={mappedSessions}
        onDayChange={(id) => {
          setDrawerOpen(false);
          navigate(`/workout/${id}`);
        }}
        onClose={() => setDrawerOpen(false)}
      />

      {/* ── Main Dashboard Content ─────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-4 flex flex-col gap-6 max-w-lg mx-auto w-full">
        {/* Workout Days Listing */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-lg font-black tracking-tight text-white">
              MY ROUTINES
            </h2>
            <Link
              to="/workout/new"
              className="font-display font-black text-xs uppercase px-3 py-2 rounded transition-all hover:opacity-90"
              style={{
                background: "#dfff00",
                color: "#000000",
              }}
            >
              + NEW DAY
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {state.workoutDays.length === 0 ? (
              <div
                className="rounded-2xl p-8 text-center flex flex-col items-center gap-3"
                style={{
                  background: "#121212",
                  border: "1px dashed rgba(255, 255, 255, 0.12)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{
                    background: "rgba(223, 255, 0, 0.08)",
                    border: "1px solid rgba(223, 255, 0, 0.2)",
                    color: "#dfff00",
                  }}
                >
                  🏋️
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white uppercase">
                    No Routines Yet
                  </h3>
                  <p className="font-body text-xs text-steel mt-1">
                    Create your custom workout days to begin tracking your sets
                    and personal records.
                  </p>
                </div>
                <Link
                  to="/workout/new"
                  className="font-display font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-all active:scale-95 mt-1 cursor-pointer"
                  style={{
                    background: "#dfff00",
                    color: "#000000",
                    boxShadow: "0 4px 15px rgba(223, 255, 0, 0.15)",
                  }}
                >
                  + CREATE YOUR FIRST ROUTINE
                </Link>
              </div>
            ) : (
              state.workoutDays.map((day) => {
                const exercisesCount = state.exercises.filter(
                  (e) => e.workout_day_id === day.id,
                ).length;

                return (
                  <div
                    key={day.id}
                    className="flex justify-between items-center rounded-xl p-4 transition-all"
                    style={{
                      background: "#121212",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div>
                      <h3 className="font-display text-base font-bold text-white leading-tight">
                        {day.name}
                      </h3>
                      <p className="font-body text-xs text-steel mt-0.5">
                        {exercisesCount} Exercise
                        {exercisesCount === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/workout/${day.id}/edit`}
                        className="font-body font-semibold text-xs px-3 py-2 rounded transition-all"
                        style={{
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          color: "#e5e2e1",
                        }}
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/workout/${day.id}`}
                        className="font-display font-black text-xs uppercase px-3.5 py-2 rounded transition-all"
                        style={{
                          background: "#dfff00",
                          color: "#000000",
                        }}
                      >
                        START
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── GitHub-Style Training Consistency Heatmap ─────────────────── */}
        <WorkoutHeatmap
          sessions={state.sessions}
          workoutDays={state.workoutDays}
          setEntries={state.setEntries}
        />

        {/* ── Exercise Performance & PR Progression Chart (Stitch Design) ───── */}
        <ExerciseProgressionChart />

        {/* Volume Charts and History Feed */}
        <WeeklyDashboardShell sessions={mappedSessions} prFeed={mappedPRFeed} />
      </main>
    </div>
  );
}
