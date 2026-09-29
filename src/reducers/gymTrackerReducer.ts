import type { WorkoutDay } from "../schemas/workoutDays";
import type { Exercise } from "../schemas/exercises";
import type { ExerciseSetConfig } from "../schemas/exerciseSetConfig";
import type { Session } from "../schemas/sessions";
import type { SetEntry } from "../schemas/setEntries";
import type { PersonalRecord } from "../schemas/personalRecords";

export interface GymTrackerState {
  workoutDays: WorkoutDay[];
  exercises: Exercise[];
  exerciseConfigs: ExerciseSetConfig[];
  sessions: Session[];
  setEntries: SetEntry[];
  personalRecords: PersonalRecord[];
  loading: boolean;
  dataLoaded: boolean;
  error: string | null;
}

export type GymTrackerAction =
  | { type: "START_LOADING" }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "SET_ALL_DATA";
      payload: {
        workoutDays: WorkoutDay[];
        exercises: Exercise[];
        exerciseConfigs: ExerciseSetConfig[];
        sessions: Session[];
        setEntries: SetEntry[];
        personalRecords: PersonalRecord[];
      };
    }
  | { type: "ADD_WORKOUT_DAY"; payload: WorkoutDay }
  | { type: "UPDATE_WORKOUT_DAY"; payload: WorkoutDay }
  | { type: "DELETE_WORKOUT_DAY"; payload: number }
  | {
      type: "ADD_EXERCISE";
      payload: { exercise: Exercise; config: ExerciseSetConfig };
    }
  | {
      type: "UPDATE_EXERCISE";
      payload: Exercise;
    }
  | { type: "REMOVE_EXERCISE"; payload: number }
  | { type: "UPDATE_EXERCISE_CONFIG"; payload: ExerciseSetConfig }
  | {
      type: "LOG_SESSION";
      payload: { session: Session; entries: SetEntry[]; prs: PersonalRecord[] };
    }
  | { type: "REORDER_EXERCISES"; payload: number[] }
  | { type: "RESET_DATA" };

export const initialState: GymTrackerState = {
  workoutDays: [],
  exercises: [],
  exerciseConfigs: [],
  sessions: [],
  setEntries: [],
  personalRecords: [],
  loading: false,
  dataLoaded: false,
  error: null,
};

export function gymTrackerReducer(
  state: GymTrackerState,
  action: GymTrackerAction,
): GymTrackerState {
  switch (action.type) {
    case "START_LOADING":
      return { ...state, loading: true, error: null };

    case "SET_ERROR":
      return {
        ...state,
        loading: false,
        dataLoaded: true,
        error: action.payload,
      };

    case "SET_ALL_DATA":
      return {
        ...state,
        loading: false,
        dataLoaded: true,
        error: null,
        workoutDays: action.payload.workoutDays.sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
        exercises: action.payload.exercises.sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
        exerciseConfigs: action.payload.exerciseConfigs,
        sessions: action.payload.sessions.sort(
          (a, b) =>
            new Date(b.performed_on).getTime() -
            new Date(a.performed_on).getTime(),
        ),
        setEntries: action.payload.setEntries,
        personalRecords: action.payload.personalRecords,
      };

    case "ADD_WORKOUT_DAY":
      return {
        ...state,
        loading: false,
        workoutDays: [...state.workoutDays, action.payload].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      };

    case "UPDATE_WORKOUT_DAY":
      return {
        ...state,
        loading: false,
        workoutDays: state.workoutDays
          .map((d) => (d.id === action.payload.id ? action.payload : d))
          .sort((a, b) => a.sort_order - b.sort_order),
      };

    case "DELETE_WORKOUT_DAY":
      return {
        ...state,
        loading: false,
        workoutDays: state.workoutDays.filter((d) => d.id !== action.payload),
        exercises: state.exercises.filter(
          (e) => e.workout_day_id !== action.payload,
        ),
      };

    case "ADD_EXERCISE":
      return {
        ...state,
        loading: false,
        exercises: [...state.exercises, action.payload.exercise].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
        exerciseConfigs: [...state.exerciseConfigs, action.payload.config],
      };

    case "UPDATE_EXERCISE":
      return {
        ...state,
        loading: false,
        exercises: state.exercises
          .map((e) => (e.id === action.payload.id ? action.payload : e))
          .sort((a, b) => a.sort_order - b.sort_order),
      };

    case "REMOVE_EXERCISE":
      return {
        ...state,
        loading: false,
        exercises: state.exercises.filter((e) => e.id !== action.payload),
        exerciseConfigs: state.exerciseConfigs.filter(
          (c) => c.exercise_id !== action.payload,
        ),
      };

    case "UPDATE_EXERCISE_CONFIG":
      return {
        ...state,
        loading: false,
        exerciseConfigs: state.exerciseConfigs.map((c) =>
          c.id === action.payload.id ||
          c.exercise_id === action.payload.exercise_id
            ? action.payload
            : c,
        ),
      };

    case "LOG_SESSION": {
      const updatedPRs = [...state.personalRecords];
      action.payload.prs.forEach((newPR) => {
        const idx = updatedPRs.findIndex(
          (pr) => pr.exercise_id === newPR.exercise_id,
        );
        if (idx !== -1) {
          updatedPRs[idx] = newPR;
        } else {
          updatedPRs.push(newPR);
        }
      });

      return {
        ...state,
        loading: false,
        sessions: [action.payload.session, ...state.sessions].sort(
          (a, b) =>
            new Date(b.performed_on).getTime() -
            new Date(a.performed_on).getTime(),
        ),
        setEntries: [...state.setEntries, ...action.payload.entries],
        personalRecords: updatedPRs,
      };
    }

    case "REORDER_EXERCISES": {
      const orderMap = new Map(action.payload.map((id, idx) => [id, idx]));
      return {
        ...state,
        exercises: state.exercises
          .map((e) =>
            orderMap.has(e.id) ? { ...e, sort_order: orderMap.get(e.id)! } : e,
          )
          .sort((a, b) => a.sort_order - b.sort_order),
      };
    }

    case "RESET_DATA":
      return initialState;

    default:
      return state;
  }
}
