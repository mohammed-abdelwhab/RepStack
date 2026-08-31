import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { gymTrackerReducer, initialState } from "../reducers/gymTrackerReducer";
import type { GymTrackerState } from "../reducers/gymTrackerReducer";
import * as db from "../hooks/useSupabaseQuery";
import type { WorkoutDay } from "../schemas/workoutDays";
import type { Exercise } from "../schemas/exercises";
import type { ExerciseSetConfig } from "../schemas/exerciseSetConfig";
import type { SetEntry } from "../schemas/setEntries";

interface GymTrackerContextType {
  state: GymTrackerState;
  user: User | null;
  authLoading: boolean;
  addWorkoutDay: (name: string) => Promise<WorkoutDay | undefined>;
  updateWorkoutDay: (dayId: number, name: string) => Promise<void>;
  deleteWorkoutDay: (dayId: number) => Promise<void>;
  addExercise: (
    dayId: number,
    name: string,
    notes: string,
    workingSetCount: number,
  ) => Promise<{ exercise: Exercise; config: ExerciseSetConfig } | undefined>;
  updateExercise: (
    exerciseId: number,
    name: string,
    notes: string,
  ) => Promise<void>;
  removeExercise: (exerciseId: number) => Promise<void>;
  updateExerciseConfig: (
    exerciseId: number,
    workingSetCount: number,
  ) => Promise<void>;
  logSession: (
    dayId: number,
    performedOn: string,
    sets: Omit<SetEntry, "id" | "session_id">[],
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadData: () => Promise<void>;
}

const GymTrackerContext = createContext<GymTrackerContextType | undefined>(
  undefined,
);

export function GymTrackerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(gymTrackerReducer, initialState);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Load all user tracking data from Supabase
  const loadData = async () => {
    const session = await supabase.auth.getSession();
    const currentUser = session.data.session?.user || null;
    if (!currentUser) return;

    dispatch({ type: "START_LOADING" });
    try {
      let data = await db.fetchUserData(currentUser.id);

      // If user has 0 workout days, seed with defaults to get them started
      if (data.workoutDays.length === 0) {
        await db.seedNewUserWorkouts(currentUser.id);
        data = await db.fetchUserData(currentUser.id);
      }

      dispatch({
        type: "SET_ALL_DATA",
        payload: data,
      });
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        payload: err.message || "Failed to fetch user data",
      });
    }
  };

  useEffect(() => {
    // 1. Initial auth state check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) {
        loadData();
      }
    });

    // 2. Listen to authentication updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false);

      if (event === "SIGNED_IN" && currentUser) {
        await loadData();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        dispatch({
          type: "SET_ALL_DATA",
          payload: {
            workoutDays: [],
            exercises: [],
            exerciseConfigs: [],
            sessions: [],
            setEntries: [],
            personalRecords: [],
          },
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Context Action Wrappers
  const addWorkoutDay = async (
    name: string,
  ): Promise<WorkoutDay | undefined> => {
    if (!user) return;
    dispatch({ type: "START_LOADING" });
    try {
      const sortOrder = state.workoutDays.length;
      const day = await db.createWorkoutDay(user.id, name, sortOrder);
      dispatch({ type: "ADD_WORKOUT_DAY", payload: day });
      return day;
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      throw err;
    }
  };

  const updateWorkoutDay = async (dayId: number, name: string) => {
    dispatch({ type: "START_LOADING" });
    try {
      const day = await db.updateWorkoutDay(dayId, name);
      dispatch({ type: "UPDATE_WORKOUT_DAY", payload: day });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const deleteWorkoutDay = async (dayId: number) => {
    dispatch({ type: "START_LOADING" });
    try {
      await db.deleteWorkoutDay(dayId);
      dispatch({ type: "DELETE_WORKOUT_DAY", payload: dayId });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const addExercise = async (
    dayId: number,
    name: string,
    notes: string,
    workingSetCount: number,
  ): Promise<{ exercise: Exercise; config: ExerciseSetConfig } | undefined> => {
    dispatch({ type: "START_LOADING" });
    try {
      const dayExercises = state.exercises.filter(
        (e) => e.workout_day_id === dayId,
      );
      const sortOrder = dayExercises.length;
      const result = await db.addExercise(
        dayId,
        name,
        notes,
        null,
        sortOrder,
        workingSetCount,
      );
      dispatch({ type: "ADD_EXERCISE", payload: result });
      return result;
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      throw err;
    }
  };

  const updateExercise = async (
    exerciseId: number,
    name: string,
    notes: string,
  ) => {
    dispatch({ type: "START_LOADING" });
    try {
      const exercise = await db.updateExercise(exerciseId, name, notes);
      dispatch({ type: "UPDATE_EXERCISE", payload: exercise });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const removeExercise = async (exerciseId: number) => {
    dispatch({ type: "START_LOADING" });
    try {
      await db.removeExercise(exerciseId);
      dispatch({ type: "REMOVE_EXERCISE", payload: exerciseId });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const updateExerciseConfig = async (
    exerciseId: number,
    workingSetCount: number,
  ) => {
    dispatch({ type: "START_LOADING" });
    try {
      const config = await db.updateExerciseConfig(exerciseId, workingSetCount);
      dispatch({ type: "UPDATE_EXERCISE_CONFIG", payload: config });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const logSession = async (
    dayId: number,
    performedOn: string,
    sets: Omit<SetEntry, "id" | "session_id">[],
  ) => {
    if (!user) return;
    dispatch({ type: "START_LOADING" });
    try {
      const result = await db.logWorkoutSession(
        user.id,
        dayId,
        performedOn,
        sets,
        state.personalRecords,
        state.exercises,
      );
      dispatch({ type: "LOG_SESSION", payload: result });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <GymTrackerContext.Provider
      value={{
        state,
        user,
        authLoading,
        addWorkoutDay,
        updateWorkoutDay,
        deleteWorkoutDay,
        addExercise,
        updateExercise,
        removeExercise,
        updateExerciseConfig,
        logSession,
        logout,
        loadData,
      }}
    >
      {children}
    </GymTrackerContext.Provider>
  );
}

export function useGymTracker() {
  const context = useContext(GymTrackerContext);
  if (context === undefined) {
    throw new Error("useGymTracker must be used within a GymTrackerProvider");
  }
  return context;
}
