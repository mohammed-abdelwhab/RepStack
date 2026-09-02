import { z } from "zod";

// The Zod schema (checks data at runtime)
export const SessionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  workout_day_id: z.number(),
  performed_on: z.string(),
  duration_seconds: z.number().optional().nullable(),
});

// Full TypeScript type generated from schema
export type Session = z.infer<typeof SessionSchema>;
