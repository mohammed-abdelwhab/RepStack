export interface MockExercise {
  id: string;
  name: string;
  notes: string;
  imageUrl: string | null;
  warmup: { weight: number | null; reps: number | null; isCompleted?: boolean };
  workingSets: { weight: number | null; reps: number | null; isCompleted?: boolean }[];
  isCompleted?: boolean;
}

export interface MockDay {
  id: string;
  name: string;
  exercises: MockExercise[];
}

// ─── Supplementary types for Dashboard shell ──────────────────────────────────

export interface VolumeBar {
  dayLabel: string; // e.g. "Mon"
  volume: number; // total volume (sum of weight × reps across all working sets)
}

export interface PREntry {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string; // ISO date string
}

export interface WorkoutSession {
  id: string;
  dayId: string; // links to MockDay.id
  dayName: string; // denormalized label e.g. "Push"
  date: string; // ISO date string e.g. "2026-08-02"
  totalVolume: number; // sum(weight × reps) across all working sets
  durationSeconds?: number | null;
}
