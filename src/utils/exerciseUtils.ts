import type { Exercise } from "../schemas/exercises";
import type { Session } from "../schemas/sessions";
import type { SetEntry } from "../schemas/setEntries";
import type { PersonalRecord } from "../schemas/personalRecords";

// Normalize exercise names to allow cross-routine matching (e.g. "Incline Bench Press" in Push and Chest & Back)
export function normalizeExerciseName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

// Calculate Estimated 1RM using the standard Epley formula: 1RM = Weight * (1 + Reps / 30)
export function calculate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weight);
  return Math.round(weight * (1 + reps / 30));
}

// Find all exercise IDs that share the same normalized name
export function findMatchingExerciseIds(
  exercises: Exercise[],
  targetName: string,
): number[] {
  const norm = normalizeExerciseName(targetName);
  return exercises
    .filter((e) => normalizeExerciseName(e.name) === norm)
    .map((e) => e.id);
}

// Get the all-time highest Personal Record across all workout days for this exercise name
export function getGlobalPRForExercise(
  exerciseName: string,
  exercises: Exercise[],
  personalRecords: PersonalRecord[],
): PersonalRecord | null {
  const matchingIds = findMatchingExerciseIds(exercises, exerciseName);
  if (matchingIds.length === 0) return null;

  const relevantPRs = personalRecords.filter((pr) =>
    matchingIds.includes(pr.exercise_id),
  );
  if (relevantPRs.length === 0) return null;

  // Find the PR with the highest max_weight (or higher reps on tie)
  return relevantPRs.reduce((best, current) => {
    if (current.max_weight > best.max_weight) return current;
    if (
      current.max_weight === best.max_weight &&
      current.max_weight_reps > best.max_weight_reps
    ) {
      return current;
    }
    return best;
  }, relevantPRs[0]);
}

export interface LastPerformance {
  sessionDate: string;
  sessionId: number;
  sets: {
    weight: number | null;
    reps: number | null;
    set_type: string;
    set_index: number;
  }[];
  bestWeight: number | null;
  bestReps: number | null;
}

// Find the most recent performance for an exercise across ALL workout routines
export function getLastPerformanceForExercise(
  exerciseName: string,
  exercises: Exercise[],
  sessions: Session[],
  setEntries: SetEntry[],
): LastPerformance | null {
  const matchingIds = findMatchingExerciseIds(exercises, exerciseName);
  if (matchingIds.length === 0) return null;

  // Find all set entries for any of these exercise IDs
  const matchingEntries = setEntries.filter((s) =>
    matchingIds.includes(s.exercise_id),
  );
  if (matchingEntries.length === 0) return null;

  // Get session IDs that have entries for this exercise
  const sessionIdsWithExercise = new Set(
    matchingEntries.map((e) => e.session_id),
  );

  // Sort sessions by date descending
  const sortedSessions = sessions
    .filter((s) => sessionIdsWithExercise.has(s.id))
    .sort(
      (a, b) =>
        new Date(b.performed_on).getTime() - new Date(a.performed_on).getTime(),
    );

  if (sortedSessions.length === 0) return null;

  const latestSession = sortedSessions[0];
  const latestSets = matchingEntries
    .filter((e) => e.session_id === latestSession.id)
    .sort((a, b) => a.set_index - b.set_index);

  const workingSets = latestSets.filter(
    (s) => s.set_type === "working" && s.weight !== null && s.reps !== null,
  );

  let bestWeight: number | null = null;
  let bestReps: number | null = null;

  if (workingSets.length > 0) {
    const best = workingSets.reduce((prev, curr) => {
      if ((curr.weight ?? 0) > (prev.weight ?? 0)) return curr;
      if (
        (curr.weight ?? 0) === (prev.weight ?? 0) &&
        (curr.reps ?? 0) > (prev.reps ?? 0)
      ) {
        return curr;
      }
      return prev;
    }, workingSets[0]);

    bestWeight = best.weight;
    bestReps = best.reps;
  }

  return {
    sessionDate: latestSession.performed_on,
    sessionId: latestSession.id,
    sets: latestSets,
    bestWeight,
    bestReps,
  };
}

export interface ExerciseDataPoint {
  sessionDate: string;
  label: string; // e.g. "S1", "S2"
  maxWeight: number;
  maxReps: number;
  est1RM: number;
  totalVolume: number;
}

// Get progression timeline data points for an exercise across all sessions
export function getExerciseProgressionTimeline(
  exerciseName: string,
  exercises: Exercise[],
  sessions: Session[],
  setEntries: SetEntry[],
): ExerciseDataPoint[] {
  const matchingIds = findMatchingExerciseIds(exercises, exerciseName);
  if (matchingIds.length === 0) return [];

  const matchingEntries = setEntries.filter((s) =>
    matchingIds.includes(s.exercise_id),
  );
  if (matchingEntries.length === 0) return [];

  // Group entries by session ID
  const sessionIdsWithExercise = new Set(
    matchingEntries.map((e) => e.session_id),
  );

  // Sort sessions chronologically (oldest to newest)
  const chronologicalSessions = sessions
    .filter((s) => sessionIdsWithExercise.has(s.id))
    .sort(
      (a, b) =>
        new Date(a.performed_on).getTime() - new Date(b.performed_on).getTime(),
    );

  return chronologicalSessions.map((session, idx) => {
    const sessionSets = matchingEntries.filter(
      (e) => e.session_id === session.id,
    );
    const workingSets = sessionSets.filter(
      (s) => s.set_type === "working" && s.weight !== null && s.reps !== null,
    );

    let maxWeight = 0;
    let maxReps = 0;

    if (workingSets.length > 0) {
      const best = workingSets.reduce((prev, curr) => {
        if ((curr.weight ?? 0) > (prev.weight ?? 0)) return curr;
        if (
          (curr.weight ?? 0) === (prev.weight ?? 0) &&
          (curr.reps ?? 0) > (prev.reps ?? 0)
        ) {
          return curr;
        }
        return prev;
      }, workingSets[0]);

      maxWeight = best.weight ?? 0;
      maxReps = best.reps ?? 0;
    }

    const est1RM = calculate1RM(maxWeight, maxReps);
    const totalVolume = workingSets.reduce(
      (acc, s) => acc + (s.weight ?? 0) * (s.reps ?? 0),
      0,
    );

    return {
      sessionDate: session.performed_on,
      label: `S${idx + 1}`,
      maxWeight,
      maxReps,
      est1RM,
      totalVolume,
    };
  });
}

// Get all distinct exercise names configured by the user
export function getUniqueExerciseNames(exercises: Exercise[]): string[] {
  const map = new Map<string, string>(); // normalized -> display original
  exercises.forEach((ex) => {
    const norm = normalizeExerciseName(ex.name);
    if (!map.has(norm)) {
      map.set(norm, ex.name);
    }
  });
  return Array.from(map.values());
}
