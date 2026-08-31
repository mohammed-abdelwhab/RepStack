# My Gym Tracker Coach — Database Schema Reference

Built by hand in Supabase's Table Editor. This reflects what was actually
built, including a deliberate deviation from the original plan: primary
keys ended up as `int8` (auto-incrementing numbers) instead of `uuid`,
since that's what Supabase's default "New Table" wizard provides — kept
as-is rather than fighting the default, and every foreign key matches it
consistently throughout.

All six tables have Row Level Security (RLS) **enabled**. Policies
(who can read/write which rows) are the next step, not yet written.

---

## workout_days
*Your day tabs — Push, Pull, Leg, etc.*

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | int8 | No (PK) | auto | Primary key |
| `created_at` | timestamptz | Yes | `now()` | Auto-filled, effectively never empty |
| `user_id` | uuid | **No** | — | FK → `auth.users.id`, cascade delete |
| `name` | text | **No** | — | e.g. "Push" |
| `sort_order` | int4 | **No** | `0` | Display order; no FK, just a number |

---

## exercises
*The moves inside each day.*

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | int8 | No (PK) | auto | Primary key |
| `created_at` | timestamptz | Yes | `now()` | |
| `workout_day_id` | int8 | **No** | — | FK → `public.workout_days.id`, cascade delete |
| `name` | text | **No** | — | e.g. "Incline Chest Press" |
| `notes` | text | Yes | `''` | Intentionally nullable-friendly; empty string default avoids null/empty double-handling later |
| `image_url` | text | Yes | — | Populated later via Supabase Storage upload |
| `sort_order` | int4 | **No** | `0` | Display order within the day; no FK |

---

## exercise_set_config
*How many working sets you do for each exercise — one row per exercise.*

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | int8 | No (PK) | auto | Primary key |
| `created_at` | timestamptz | Yes | `now()` | |
| `exercise_id` | int8 | **No** | — | FK → `public.exercises.id`, cascade delete, **UNIQUE** (enforces one row per exercise) |
| `working_set_count` | int4 | No | `3` | |

---

## sessions
*One row per real workout you actually did.*

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | int8 | No (PK) | auto | Primary key |
| `created_at` | timestamptz | Yes | `now()` | |
| `user_id` | uuid | **No** | — | FK → `auth.users.id`, cascade delete |
| `workout_day_id` | int8 | **No** | — | FK → `public.workout_days.id`, cascade delete |
| `performed_on` | date | **No** | `CURRENT_DATE` (optional) | Calendar date only, no clock time |

---

## personal_records
*Your best-ever lift per exercise — one row per exercise.*

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | int8 | No (PK) | auto | Primary key |
| `created_at` | timestamptz | Yes | `now()` | |
| `exercise_id` | int8 | **No** | — | FK → `public.exercises.id`, cascade delete, **UNIQUE** |
| `max_weight` | numeric | No | — | |
| `max_weight_reps` | int4 | No | — | |
| `achieved_on` | date | No | — | |
| `previous_weight` | numeric | **Yes (intentional)** | — | NULL means "this was the first-ever record," not missing data |

---

## set_entries
*Every weight and rep you actually type — the biggest table.*

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | int8 | No (PK) | auto | Primary key |
| `created_at` | timestamptz | Yes | `now()` | |
| `session_id` | int8 | **No** | — | FK → `public.sessions.id`, cascade delete |
| `exercise_id` | int8 | **No** | — | FK → `public.exercises.id`, cascade delete |
| `set_type` | text | **No** | — | `'warmup'` or `'working'` — no DB-level check constraint yet, could add later via SQL |
| `set_index` | int4 | No | — | Which set number (1 for warmup; 1, 2, 3... for working sets) |
| `weight` | numeric | **Yes (intentional)** | — | NULL means "not entered yet," not an error |
| `reps` | int4 | **Yes (intentional)** | — | Same as weight |

---

## Relationships (plain English)

- An `exercise` **belongs to** a `workout_day`.
- A `session` **belongs to** a `workout_day` ("I did Push today").
- `exercise_set_config` **belongs to** exactly one `exercise` (1-to-1, via the unique constraint).
- `personal_records` **belongs to** exactly one `exercise` (1-to-1, via the unique constraint).
- A `set_entry` **belongs to** both a `session` and an `exercise` — it needs to know which real workout it was logged in, and which move the number was for.
- `workout_days` and `sessions` both **belong to** a `user` (`auth.users`), so every table ultimately traces back to whoever's logged in.

## What's next

Every table has RLS **on** but **no policies written**, so right now
everything is fully locked, even to the owning user. Next step: write one
reusable policy pattern ("a user can read/write only rows where `user_id`
matches their own id") and apply it — directly or via the exercise/session
it belongs to — across all six tables.
