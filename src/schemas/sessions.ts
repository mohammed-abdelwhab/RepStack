import { z } from "zod";
// The Zod schema (checks data at runtime --> TS can't check)
export const SessionSchema = z.object({
  id: z.number(),
  user_id: z.uuid(),
  workout_day_id: z.number(),
  performed_on: z.string(),
});

// This single line generates a full TypeScript type from our schema automatically
export type Session = z.infer<typeof SessionSchema>;
