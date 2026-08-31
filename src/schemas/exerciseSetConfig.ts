import { z } from "zod";
// The Zod schema (checks data at runtime --> TS can't check)
export const ExerciseSetConfigSchema = z.object({
  id: z.number(),
  exercise_id: z.number(),
  working_set_count: z.number(),
});

// This single line generates a full TypeScript type from our schema automatically
export type ExerciseSetConfig = z.infer<typeof ExerciseSetConfigSchema>;
