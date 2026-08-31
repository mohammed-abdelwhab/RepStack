import { z } from "zod";
// The Zod schema (checks data at runtime --> TS can't check)
export const SetEntrySchema = z.object({
  id: z.number(),
  session_id: z.number(),
  exercise_id: z.number(),
  set_type: z.string(),
  set_index: z.number(),
  weight: z.coerce.number().nullable(),
  reps: z.number().nullable(),
});

// This single line generates a full TypeScript type from our schema automatically
export type SetEntry = z.infer<typeof SetEntrySchema>;
