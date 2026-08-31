import { z } from "zod";
// The Zod schema (checks data at runtime --> TS can't check)
export const PersonalRecordSchema = z.object({
  id: z.number(),
  exercise_id: z.number(),
  max_weight: z.coerce.number(), //* accepts 37.5 OR "37.5", always gives you back 37.5 as a real number --> this is the numeric type in the database
  max_weight_reps: z.number(),
  achieved_on: z.string(), // dates come back as strings from Postgres
  previous_weight: z.coerce.number().nullable(),
});

// This single line generates a full TypeScript type from our schema automatically
export type PersonalRecord = z.infer<typeof PersonalRecordSchema>;
