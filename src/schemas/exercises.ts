import { z } from "zod";
// The Zod schema (checks data at runtime --> TS can't check)
export const ExerciseSchema = z.object({
  id: z.number(),
  workout_day_id: z.number(),
  name: z.string(),
  notes: z.string().nullable(),
  image_url: z.string().nullable(),
  sort_order: z.number(),
});

// This single line generates a full TypeScript type from our schema automatically
export type Exercise = z.infer<typeof ExerciseSchema>;
