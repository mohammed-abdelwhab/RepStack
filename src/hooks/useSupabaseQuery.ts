import { supabase } from "../lib/supabaseClient";
import type { WorkoutDay } from "../schemas/workoutDays";
import type { Exercise } from "../schemas/exercises";
import type { ExerciseSetConfig } from "../schemas/exerciseSetConfig";
import type { Session } from "../schemas/sessions";
import type { SetEntry } from "../schemas/setEntries";
import type { PersonalRecord } from "../schemas/personalRecords";

// Fetch all database records for the logged-in user
export async function fetchUserData(userId: string) {
  // 1. Fetch workout days
  const { data: workoutDays, error: daysErr } = await supabase
    .from("workout_days")
    .select("*")
    .eq("user_id", userId);
  if (daysErr) throw daysErr;

  const dayIds = (workoutDays || []).map((d) => d.id);

  // 2. Fetch exercises for these days
  let exercises: Exercise[] = [];
  if (dayIds.length > 0) {
    const { data: exData, error: exErr } = await supabase
      .from("exercises")
      .select("*")
      .in("workout_day_id", dayIds);
    if (exErr) throw exErr;
    exercises = exData || [];
  }

  const exerciseIds = exercises.map((e) => e.id);

  // 3. Fetch configurations for exercises
  let exerciseConfigs: ExerciseSetConfig[] = [];
  if (exerciseIds.length > 0) {
    const { data: configData, error: configErr } = await supabase
      .from("exercise_set_config")
      .select("*")
      .in("exercise_id", exerciseIds);
    if (configErr) throw configErr;
    exerciseConfigs = configData || [];
  }

  // 4. Fetch personal records for exercises
  let personalRecords: PersonalRecord[] = [];
  if (exerciseIds.length > 0) {
    const { data: prData, error: prErr } = await supabase
      .from("personal_records")
      .select("*")
      .in("exercise_id", exerciseIds);
    if (prErr) throw prErr;
    personalRecords = prData || [];
  }

  // 5. Fetch sessions logged by this user
  const { data: sessions, error: sessErr } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId);
  if (sessErr) throw sessErr;

  const sessionIds = (sessions || []).map((s) => s.id);

  // 6. Fetch set entries for these sessions
  let setEntries: SetEntry[] = [];
  if (sessionIds.length > 0) {
    const { data: setEntriesData, error: setEntriesErr } = await supabase
      .from("set_entries")
      .select("*")
      .in("session_id", sessionIds);
    if (setEntriesErr) throw setEntriesErr;
    setEntries = setEntriesData || [];
  }

  return {
    workoutDays: (workoutDays || []) as WorkoutDay[],
    exercises: exercises as Exercise[],
    exerciseConfigs: exerciseConfigs as ExerciseSetConfig[],
    sessions: (sessions || []) as Session[],
    setEntries: setEntries as SetEntry[],
    personalRecords: personalRecords as PersonalRecord[],
  };
}

// Create a new workout day
export async function createWorkoutDay(
  userId: string,
  name: string,
  sortOrder: number,
): Promise<WorkoutDay> {
  const { data, error } = await supabase
    .from("workout_days")
    .insert([{ user_id: userId, name, sort_order: sortOrder }])
    .select()
    .single();

  if (error) throw error;
  return data as WorkoutDay;
}

// Update a workout day name
export async function updateWorkoutDay(
  dayId: number,
  name: string,
): Promise<WorkoutDay> {
  const { data, error } = await supabase
    .from("workout_days")
    .update({ name })
    .eq("id", dayId)
    .select()
    .single();

  if (error) throw error;
  return data as WorkoutDay;
}

// Delete a workout day (cascading deletes exercises, configs in DB)
export async function deleteWorkoutDay(dayId: number): Promise<void> {
  const { error } = await supabase
    .from("workout_days")
    .delete()
    .eq("id", dayId);
  if (error) throw error;
}

// Add an exercise with its configuration to a day
export async function addExercise(
  dayId: number,
  name: string,
  notes: string,
  imageUrl: string | null,
  sortOrder: number,
  workingSetCount: number,
): Promise<{ exercise: Exercise; config: ExerciseSetConfig }> {
  // 1. Insert exercise
  const { data: exercise, error: exErr } = await supabase
    .from("exercises")
    .insert([
      {
        workout_day_id: dayId,
        name,
        notes,
        image_url: imageUrl,
        sort_order: sortOrder,
      },
    ])
    .select()
    .single();

  if (exErr) throw exErr;

  // 2. Insert configuration
  const { data: config, error: configErr } = await supabase
    .from("exercise_set_config")
    .insert([{ exercise_id: exercise.id, working_set_count: workingSetCount }])
    .select()
    .single();

  if (configErr) {
    // Clean up inserted exercise if config insert fails
    await supabase.from("exercises").delete().eq("id", exercise.id);
    throw configErr;
  }

  return {
    exercise: exercise as Exercise,
    config: config as ExerciseSetConfig,
  };
}

// Update an exercise details
export async function updateExercise(
  exerciseId: number,
  name: string,
  notes: string,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from("exercises")
    .update({ name, notes })
    .eq("id", exerciseId)
    .select()
    .single();

  if (error) throw error;
  return data as Exercise;
}

// Remove an exercise (cascading deletes config in DB)
export async function removeExercise(exerciseId: number): Promise<void> {
  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", exerciseId);
  if (error) throw error;
}

// Update working set count config
export async function updateExerciseConfig(
  exerciseId: number,
  workingSetCount: number,
): Promise<ExerciseSetConfig> {
  const { data, error } = await supabase
    .from("exercise_set_config")
    .upsert(
      { exercise_id: exerciseId, working_set_count: workingSetCount },
      { onConflict: "exercise_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data as ExerciseSetConfig;
}

// Log a finished session
export async function logWorkoutSession(
  userId: string,
  dayId: number,
  performedOn: string,
  sets: Omit<SetEntry, "id" | "session_id">[],
  existingPRs: PersonalRecord[],
  allExercises: Exercise[] = [],
): Promise<{ session: Session; entries: SetEntry[]; prs: PersonalRecord[] }> {
  // 1. Insert session
  const { data: session, error: sessErr } = await supabase
    .from("sessions")
    .insert([
      { user_id: userId, workout_day_id: dayId, performed_on: performedOn },
    ])
    .select()
    .single();

  if (sessErr) throw sessErr;

  // 2. Insert set entries mapped to the session ID
  const entriesToInsert = sets.map((s) => ({
    session_id: session.id,
    exercise_id: s.exercise_id,
    set_type: s.set_type,
    set_index: s.set_index,
    weight: s.weight,
    reps: s.reps,
  }));

  const { data: entries, error: entriesErr } = await supabase
    .from("set_entries")
    .insert(entriesToInsert)
    .select();

  if (entriesErr) {
    // Rollback session
    await supabase.from("sessions").delete().eq("id", session.id);
    throw entriesErr;
  }

  // 3. Compute and update Personal Records (evaluated globally per exercise name)
  const prsToUpsert: Omit<PersonalRecord, "id">[] = [];
  const updatedPRs: PersonalRecord[] = [];

  // Group set entries by exercise
  const exerciseSetsMap = new Map<
    number,
    Omit<SetEntry, "id" | "session_id">[]
  >();
  sets.forEach((s) => {
    if (!exerciseSetsMap.has(s.exercise_id)) {
      exerciseSetsMap.set(s.exercise_id, []);
    }
    exerciseSetsMap.get(s.exercise_id)!.push(s);
  });

  for (const [exerciseId, exerciseSets] of exerciseSetsMap.entries()) {
    // Find working sets only for personal records (warmup sets do not count for PRs)
    const workingSets = exerciseSets.filter(
      (s) => s.set_type === "working" && s.weight !== null && s.reps !== null,
    );
    if (workingSets.length === 0) continue;

    // Find the best lift in this session (max weight, then max reps)
    let bestSet = workingSets[0];
    for (const set of workingSets) {
      if (
        (set.weight ?? 0) > (bestSet.weight ?? 0) ||
        ((set.weight ?? 0) === (bestSet.weight ?? 0) &&
          (set.reps ?? 0) > (bestSet.reps ?? 0))
      ) {
        bestSet = set;
      }
    }

    if (bestSet.weight === null || bestSet.reps === null) continue;

    // Find matching exercise name across all workouts
    const currentEx = allExercises.find((e) => e.id === exerciseId);
    const normalizedName = currentEx ? currentEx.name.trim().toLowerCase() : "";

    const siblingIds = allExercises
      .filter((e) => e.name.trim().toLowerCase() === normalizedName)
      .map((e) => e.id);

    const relevantPRs = existingPRs.filter((pr) =>
      siblingIds.length > 0
        ? siblingIds.includes(pr.exercise_id)
        : pr.exercise_id === exerciseId,
    );

    let globalPR: PersonalRecord | null = null;
    if (relevantPRs.length > 0) {
      globalPR = relevantPRs.reduce((best, curr) => {
        if (curr.max_weight > best.max_weight) return curr;
        if (
          curr.max_weight === best.max_weight &&
          curr.max_weight_reps > best.max_weight_reps
        )
          return curr;
        return best;
      }, relevantPRs[0]);
    }

    const isNewPR =
      !globalPR ||
      bestSet.weight > globalPR.max_weight ||
      (bestSet.weight === globalPR.max_weight &&
        bestSet.reps > globalPR.max_weight_reps);

    if (isNewPR) {
      // Sync PR to this exercise ID (and all sibling IDs if any)
      const targetIds = siblingIds.length > 0 ? siblingIds : [exerciseId];
      targetIds.forEach((targetId) => {
        prsToUpsert.push({
          exercise_id: targetId,
          max_weight: bestSet.weight!,
          max_weight_reps: bestSet.reps!,
          achieved_on: performedOn,
          previous_weight: globalPR ? globalPR.max_weight : null,
        });
      });
    }
  }

  if (prsToUpsert.length > 0) {
    const { data: upsertedPRs, error: prErr } = await supabase
      .from("personal_records")
      .upsert(prsToUpsert, { onConflict: "exercise_id" })
      .select();

    if (prErr) {
      console.error("Failed to update personal records:", prErr);
    } else if (upsertedPRs) {
      updatedPRs.push(...(upsertedPRs as PersonalRecord[]));
    }
  }

  return {
    session: session as Session,
    entries: entries as SetEntry[],
    prs: updatedPRs,
  };
}
