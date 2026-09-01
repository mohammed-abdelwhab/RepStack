# RepStack — High-Performance Kinetic Gym Tracker

**RepStack** is a full-stack, single-page progressive web application built for dedicated athletes who require rapid, high-contrast, distraction-free performance tracking in high-intensity gym environments. 

Inspired by structural brutalism and glassmorphic design systems, the application is engineered to reduce eye strain, maximize hit targets during exercise, and maintain a seamless "flow state".

---

## 🚀 Key Features

- **Route Chunking & Lazy Loading**: All pages (`Auth`, `Dashboard`, `WorkoutSession`, `CreateWorkout`, `EditWorkout`) are code-split using `React.lazy()` and `<Suspense>`, delivering instantaneous initial loads under 150kB.
- **Athletic Skeleton Loader**: Built-in dark brutalist skeleton loader with animated shimmer placeholders during authentication resolution and route transitions.
- **Cross-Routine Exercise Tracking**: Shared history and personal records across routines (e.g. tracking "Incline Bench Press" across both *Push* and *Chest & Back* days).
- **Progress at a Glance Line Graphs**: High-contrast SVG line curves with glowing area fills, 1RM estimations (Epley formula), and session volume metrics.
- **Dynamic Session Logger**: Log warmups, working sets, reps, and weights with inline additions and rest timers.
- **Unified Alert System**: Custom reusable `<StatusAlert />`, floating `<ToastNotification />`, and glassmorphic `<ConfirmationModal />` dialogues.
- **Centralized State Management**: Context API + pure `useReducer` action cycle coordinating mutations to a Supabase Postgres backend.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build System & Tooling**: [Vite](https://vite.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router v6](https://reactrouter.com/) (Hash Router with code-split lazy routes)
- **Styling**: [Tailwind CSS v4.0](https://tailwindcss.com/)
- **Backend Database**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime Auth + Row Level Security)
- **Validation**: [Zod](https://zod.dev/) (Runtime validation matching table definitions)

---

## 📂 Project Structure

```
├── public/                  # Static icons and assets
├── src/
│   ├── assets/              # SVGs and images
│   ├── components/          # Reusable UI parts:
│   │   ├── StatusAlert.tsx          # Multi-variant alert banners
│   │   ├── ToastNotification.tsx    # Floating auto-dismiss toasts
│   │   ├── ConfirmationModal.tsx    # Custom modal for deletions
│   │   ├── PageSkeletonLoader.tsx   # Shimmer skeleton loader
│   │   ├── ExerciseProgressionChart.tsx # SVG progression analytics
│   │   ├── RestTimer.tsx            # Stopwatch & countdown timer
│   │   ├── ExerciseCard.tsx         # Active set logger cards
│   │   └── SideDrawer.tsx           # Navigation drawer
│   ├── context/             # GymTrackerContext (Supabase provider & actions)
│   ├── data/                # Initial seeding fallback
│   ├── hooks/               # useSupabaseQuery wrapper (SQL transaction commands)
│   ├── pages/               # Code-split views (Auth, Dashboard, Session, Builder, Editor)
│   ├── reducers/            # gymTrackerReducer (central pure state machine)
│   ├── schemas/             # Zod validation schemas matching database tables
│   ├── types/               # TypeScript declarations
│   ├── utils/               # exerciseUtils (cross-routine normalization & 1RM formulas)
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Code-split Router configuration & Suspense
│   └── index.css            # Base resets, mobile zoom prevention, Tailwind tokens
├── .env.example             # Environment variable template
├── vercel.json              # Vercel deployment rewrites
├── ARCHITECTURE.md          # Complete technical contributor guide
└── README.md
```

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Clone the Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/mohammed-abdelwhab/RepStack.git
cd RepStack

# Install dependencies
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and insert your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 4. Database Setup
Execute the SQL policies in `ARCHITECTURE.md` within your Supabase SQL Editor to configure Row Level Security (RLS) across all tables.

### 5. Run the Project
```bash
# Run in development mode
npm run dev

# Build for production with chunk splitting
npm run build
```

---

## 🎨 Theme & Style Guidelines

The design uses a high-contrast dark ecosystem:
- **Primary Color (Electric Lime)**: `#dfff00` — For primary buttons, progress actions, and highlights.
- **Secondary Color (Pulse Red)**: `#ff3131` — For high-intensity zones, timers, and deletes.
- **Tertiary Color (Cyan Tech)**: `#00f0ff` — For statistics and metadata.
- **Neutral Canvas**: `#131313` with Card Level 1 surfaces at `#121212`.
- **Typography**: Montserrat (Headings / displays), Inter (Body copy), and JetBrains Mono (Numeric labels / stopwatch metrics).
