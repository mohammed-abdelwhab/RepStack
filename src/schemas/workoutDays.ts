import { z } from "zod";
// The Zod schema (checks data at runtime --> TS can't check)
export const WorkoutDaySchema = z.object({
  id: z.number(),
  user_id: z.uuid(), //* the type in the database is in uuid which is a string formatted id
  name: z.string(),
  sort_order: z.number(),
});

// This single line generates a full TypeScript type from our schema automatically
export type WorkoutDay = z.infer<typeof WorkoutDaySchema>;
