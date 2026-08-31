import type { MockDay, VolumeBar, PREntry, WorkoutSession } from '../types/mock';

// ─── Mock workout days — exact exercise data from spec ────────────────────────

export const mockDays: MockDay[] = [
  {
    id: 'day-1',
    name: 'Push',
    exercises: [
      {
        id: 'ex-push-1',
        name: 'Incline Chest Press',
        notes: '',
        imageUrl: null,
        warmup: { weight: 40, reps: 15 },
        workingSets: [
          { weight: 70, reps: 10 },
          { weight: 75, reps: 8 },
          { weight: 80, reps: 6 },
          { weight: 80, reps: 6 },
        ],
      },
      {
        id: 'ex-push-2',
        name: 'Flat Chest Press',
        notes: 'Crossed out flys',
        imageUrl: null,
        warmup: { weight: 40, reps: 15 },
        workingSets: [
          { weight: 80, reps: 10 },
          { weight: 85, reps: 8 },
          { weight: 90, reps: 6 },
        ],
      },
      {
        id: 'ex-push-3',
        name: 'Lateral Raises',
        notes: '',
        imageUrl: null,
        warmup: { weight: 8, reps: 15 },
        workingSets: [
          { weight: 12, reps: 15 },
          { weight: 14, reps: 12 },
          { weight: 14, reps: 12 },
        ],
      },
      {
        id: 'ex-push-4',
        name: 'Shoulder Press Machine',
        notes: '',
        imageUrl: null,
        warmup: { weight: 30, reps: 15 },
        workingSets: [
          { weight: 50, reps: 12 },
          { weight: 55, reps: 10 },
          { weight: 60, reps: 8 },
        ],
      },
      {
        id: 'ex-push-5',
        name: 'Tricep Extension',
        notes: 'V-shape / Normal',
        imageUrl: null,
        warmup: { weight: 20, reps: 15 },
        workingSets: [
          { weight: 35, reps: 12 },
          { weight: 37.5, reps: 10 },
          { weight: 40, reps: 8 },
        ],
      },
      {
        id: 'ex-push-6',
        name: 'Tricep Overhead Extension',
        notes: '',
        imageUrl: null,
        warmup: { weight: 15, reps: 15 },
        workingSets: [
          { weight: 25, reps: 12 },
          { weight: 27.5, reps: 10 },
          { weight: 30, reps: 8 },
        ],
      },
      {
        id: 'ex-push-7',
        name: 'Abs Machine',
        notes: '',
        imageUrl: null,
        warmup: { weight: null, reps: null },
        workingSets: [
          { weight: 40, reps: 20 },
          { weight: 45, reps: 15 },
          { weight: 50, reps: 12 },
        ],
      },
    ],
  },
  {
    id: 'day-2',
    name: 'Pull',
    exercises: [
      {
        id: 'ex-pull-1',
        name: 'Wide Grip Lat Pulldown',
        notes: 'Keep back stationary',
        imageUrl: null,
        warmup: { weight: 40, reps: 15 },
        workingSets: [
          { weight: 65, reps: 10 },
          { weight: 70, reps: 8 },
          { weight: 75, reps: 6 },
          { weight: 75, reps: 6 },
        ],
      },
      {
        id: 'ex-pull-2',
        name: 'Wide Grip Seated Row',
        notes: 'T-bar',
        imageUrl: null,
        warmup: { weight: 40, reps: 15 },
        workingSets: [
          { weight: 60, reps: 12 },
          { weight: 65, reps: 10 },
          { weight: 70, reps: 8 },
        ],
      },
      {
        id: 'ex-pull-3',
        name: 'Seated Preacher Curl',
        notes: 'Biceps',
        imageUrl: null,
        warmup: { weight: 15, reps: 15 },
        workingSets: [
          { weight: 25, reps: 12 },
          { weight: 27.5, reps: 10 },
          { weight: 30, reps: 8 },
        ],
      },
      {
        id: 'ex-pull-4',
        name: 'Machine Bicep Curl',
        notes: '',
        imageUrl: null,
        warmup: { weight: 20, reps: 15 },
        workingSets: [
          { weight: 35, reps: 12 },
          { weight: 40, reps: 10 },
          { weight: 40, reps: 10 },
        ],
      },
      {
        id: 'ex-pull-5',
        name: 'Rear Delt',
        notes: '',
        imageUrl: null,
        warmup: { weight: 8, reps: 15 },
        workingSets: [
          { weight: 12, reps: 15 },
          { weight: 14, reps: 12 },
          { weight: 14, reps: 10 },
        ],
      },
      {
        id: 'ex-pull-6',
        name: 'Dumbbell Shrugs',
        notes: 'Traps',
        imageUrl: null,
        warmup: { weight: 20, reps: 15 },
        workingSets: [
          { weight: 32.5, reps: 15 },
          { weight: 35, reps: 12 },
          { weight: 37.5, reps: 10 },
        ],
      },
      {
        id: 'ex-pull-7',
        name: 'Forearm Curl',
        notes: 'Reverse grip, on concentric',
        imageUrl: null,
        warmup: { weight: null, reps: null },
        workingSets: [
          { weight: 20, reps: 15 },
          { weight: 20, reps: 15 },
          { weight: 20, reps: 15 },
        ],
      },
    ],
  },
  {
    id: 'day-3',
    name: 'Leg',
    exercises: [
      {
        id: 'ex-leg-1',
        name: 'Smith Machine Squat',
        notes: '',
        imageUrl: null,
        warmup: { weight: 40, reps: 15 },
        workingSets: [
          { weight: 80, reps: 10 },
          { weight: 90, reps: 8 },
          { weight: 100, reps: 6 },
          { weight: 100, reps: 6 },
        ],
      },
      {
        id: 'ex-leg-2',
        name: 'Hip Thrust',
        notes: '',
        imageUrl: null,
        warmup: { weight: 40, reps: 15 },
        workingSets: [
          { weight: 80, reps: 12 },
          { weight: 90, reps: 10 },
          { weight: 100, reps: 8 },
        ],
      },
      {
        id: 'ex-leg-3',
        name: 'Calf Raises',
        notes: 'On Hack Squat machine',
        imageUrl: null,
        warmup: { weight: null, reps: null },
        workingSets: [
          { weight: 60, reps: 20 },
          { weight: 70, reps: 15 },
          { weight: 80, reps: 12 },
          { weight: 80, reps: 12 },
        ],
      },
      {
        id: 'ex-leg-4',
        name: 'Leg Curl',
        notes: '',
        imageUrl: null,
        warmup: { weight: 20, reps: 15 },
        workingSets: [
          { weight: 45, reps: 12 },
          { weight: 50, reps: 10 },
          { weight: 55, reps: 8 },
        ],
      },
      {
        id: 'ex-leg-5',
        name: 'Leg Extension',
        notes: '',
        imageUrl: null,
        warmup: { weight: 25, reps: 15 },
        workingSets: [
          { weight: 55, reps: 12 },
          { weight: 60, reps: 10 },
          { weight: 65, reps: 8 },
        ],
      },
    ],
  },
  {
    id: 'day-4',
    name: 'Chest + Back',
    exercises: [
      {
        id: 'ex-cb-1',
        name: 'Incline Chest Press',
        notes: '',
        imageUrl: null,
        warmup: { weight: 40, reps: 15 },
        workingSets: [
          { weight: 72.5, reps: 10 },
          { weight: 77.5, reps: 8 },
          { weight: 82.5, reps: 6 },
        ],
      },
      {
        id: 'ex-cb-2',
        name: 'T-Bar Row',
        notes: '',
        imageUrl: null,
        warmup: { weight: 40, reps: 15 },
        workingSets: [
          { weight: 60, reps: 10 },
          { weight: 65, reps: 8 },
          { weight: 70, reps: 8 },
        ],
      },
      {
        id: 'ex-cb-3',
        name: 'Flat Bench Press',
        notes: '',
        imageUrl: null,
        warmup: { weight: 40, reps: 15 },
        workingSets: [
          { weight: 82.5, reps: 10 },
          { weight: 87.5, reps: 8 },
          { weight: 90, reps: 6 },
        ],
      },
      {
        id: 'ex-cb-4',
        name: 'Machine Wide Lat Pulldown',
        notes: '',
        imageUrl: null,
        warmup: { weight: 40, reps: 15 },
        workingSets: [
          { weight: 65, reps: 12 },
          { weight: 70, reps: 10 },
          { weight: 75, reps: 8 },
        ],
      },
      {
        id: 'ex-cb-5',
        name: 'Fly Bench Press',
        notes: '',
        imageUrl: null,
        warmup: { weight: 12, reps: 15 },
        workingSets: [
          { weight: 18, reps: 12 },
          { weight: 20, reps: 10 },
          { weight: 22, reps: 8 },
        ],
      },
      {
        id: 'ex-cb-6',
        name: 'Abs',
        notes: '',
        imageUrl: null,
        warmup: { weight: null, reps: null },
        workingSets: [
          { weight: 40, reps: 20 },
          { weight: 45, reps: 15 },
          { weight: 50, reps: 12 },
        ],
      },
      {
        id: 'ex-cb-7',
        name: 'Dumbbell Shrugs',
        notes: 'Traps',
        imageUrl: null,
        warmup: { weight: 20, reps: 15 },
        workingSets: [
          { weight: 35, reps: 15 },
          { weight: 37.5, reps: 12 },
          { weight: 40, reps: 10 },
        ],
      },
    ],
  },
  {
    id: 'day-5',
    name: 'Shoulder + Arm',
    exercises: [
      {
        id: 'ex-sa-1',
        name: 'Shoulder Press',
        notes: 'Side focus',
        imageUrl: null,
        warmup: { weight: 30, reps: 15 },
        workingSets: [
          { weight: 52.5, reps: 12 },
          { weight: 57.5, reps: 10 },
          { weight: 62.5, reps: 8 },
        ],
      },
      {
        id: 'ex-sa-2',
        name: 'Lateral Raises',
        notes: '',
        imageUrl: null,
        warmup: { weight: 8, reps: 15 },
        workingSets: [
          { weight: 12, reps: 15 },
          { weight: 14, reps: 12 },
          { weight: 16, reps: 10 },
        ],
      },
      {
        id: 'ex-sa-3',
        name: 'Seated Preacher Curl',
        notes: 'Biceps',
        imageUrl: null,
        warmup: { weight: 15, reps: 15 },
        workingSets: [
          { weight: 27.5, reps: 12 },
          { weight: 30, reps: 10 },
          { weight: 30, reps: 10 },
        ],
      },
      {
        id: 'ex-sa-4',
        name: 'Tricep Overhead Extension',
        notes: '',
        imageUrl: null,
        warmup: { weight: 15, reps: 15 },
        workingSets: [
          { weight: 27.5, reps: 12 },
          { weight: 30, reps: 10 },
          { weight: 32.5, reps: 8 },
        ],
      },
      {
        id: 'ex-sa-5',
        name: 'Rear Delt',
        notes: 'Squeeze at peak',
        imageUrl: null,
        warmup: { weight: 8, reps: 15 },
        workingSets: [
          { weight: 14, reps: 15 },
          { weight: 16, reps: 12 },
          { weight: 16, reps: 12 },
        ],
      },
      {
        id: 'ex-sa-6',
        name: 'Forearm Curl',
        notes: 'Squeeze at peak',
        imageUrl: null,
        warmup: { weight: null, reps: null },
        workingSets: [
          { weight: 22, reps: 15 },
          { weight: 22, reps: 15 },
          { weight: 22, reps: 15 },
        ],
      },
      {
        id: 'ex-sa-7',
        name: 'Forearm Curl',
        notes: 'On concentric / lifting',
        imageUrl: null,
        warmup: { weight: null, reps: null },
        workingSets: [
          { weight: 18, reps: 15 },
          { weight: 18, reps: 15 },
          { weight: 18, reps: 15 },
        ],
      },
    ],
  },
];

// ─── Weekly volume data (mock) ────────────────────────────────────────────────
export const mockVolumeData: VolumeBar[] = [
  { dayLabel: 'Mon', volume: 8420 },
  { dayLabel: 'Tue', volume: 7180 },
  { dayLabel: 'Wed', volume: 10650 },
  { dayLabel: 'Thu', volume: 6900 },
  { dayLabel: 'Fri', volume: 9210 },
  { dayLabel: 'Sat', volume: 4300 },
  { dayLabel: 'Sun', volume: 0 },
];

// ─── Recent PR feed (mock) ────────────────────────────────────────────────────
export const mockPRFeed: PREntry[] = [
  {
    id: 'pr-1',
    exerciseName: 'Flat Bench Press',
    weight: 90,
    reps: 6,
    date: '2026-08-03',
  },
  {
    id: 'pr-2',
    exerciseName: 'Smith Machine Squat',
    weight: 100,
    reps: 6,
    date: '2026-08-01',
  },
  {
    id: 'pr-3',
    exerciseName: 'Wide Grip Lat Pulldown',
    weight: 75,
    reps: 6,
    date: '2026-07-30',
  },
  {
    id: 'pr-4',
    exerciseName: 'Hip Thrust',
    weight: 100,
    reps: 8,
    date: '2026-07-28',
  },
  {
    id: 'pr-5',
    exerciseName: 'Dumbbell Shrugs',
    weight: 40,
    reps: 10,
    date: '2026-07-26',
  },
];

// ─── Seeded workout sessions (this week) ─────────────────────────────────────
// These seed values give the stats view something to display before the user
// starts logging real sessions.
export const mockSessions: WorkoutSession[] = [
  {
    id: 'sess-1',
    dayId: 'day-1',
    dayName: 'Push',
    date: '2026-07-28',   // Tuesday
    totalVolume: 8420,
  },
  {
    id: 'sess-2',
    dayId: 'day-2',
    dayName: 'Pull',
    date: '2026-07-29',   // Wednesday
    totalVolume: 7180,
  },
  {
    id: 'sess-3',
    dayId: 'day-3',
    dayName: 'Leg',
    date: '2026-07-31',   // Friday
    totalVolume: 10650,
  },
  {
    id: 'sess-4',
    dayId: 'day-4',
    dayName: 'Chest + Back',
    date: '2026-08-01',   // Saturday
    totalVolume: 9210,
  },
  {
    id: 'sess-5',
    dayId: 'day-1',
    dayName: 'Push',
    date: '2026-08-03',   // Monday (today)
    totalVolume: 8750,
  },
];
