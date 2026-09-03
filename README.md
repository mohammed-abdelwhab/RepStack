# RepStack — High-Performance Kinetic Gym Tracker

**RepStack** is a full-stack, single-page progressive web application built for dedicated athletes who require rapid, high-contrast, distraction-free performance tracking in high-intensity gym environments. 

Inspired by structural brutalism and glassmorphic design systems, the application is engineered to reduce eye strain, maximize hit targets during exercise, and maintain a seamless "flow state".

---

## 🚀 Key Features

- **View-Only Preview vs. Live Active Training**:
  - **View-Only Mode**: Default state when viewing any workout day. Inputs and cards are cleanly read-only, allowing you to review previous weights, target sets, and PR records without accidental edits.
  - **Live Training Mode**: Activated by tapping **`▶ START WORKOUT`**. Starts the live workout stopwatch, unlocks inputs and set controls, enables top-anchored rest timers, and provides a **`✕ CANCEL`** option with confirmation dialogues.
- **Active Workout Session Stopwatch**:
  - Real-time training duration tracker (`● 00:48:15`) with pause/resume controls and `localStorage` resilience.
  - Automatically saves total elapsed time (`duration_seconds`) to the database on completion.
- **GitHub-Style 52-Week Activity Heatmap**:
  - 365-day training grid with intensity color-grading (Electric Lime `#dfff00`), live streak counters (🔥 Current Streak & 🏆 Best Streak), and interactive popovers showing dates, routines, sets, and volume lifted.
- **Synthesized Web Audio API Rest Timer**:
  - Zero-dependency sound synthesizer playing clean 3-tone notification chimes on countdown expiration and session completion.
  - Top-anchored floating overlay (`top-16`) with 30s/1m/90s/2m/3m/5m presets and inline `⏱️ Rest` trigger buttons on every exercise card.
- **Route Chunking & Lazy Loading**:
  - All pages (`Auth`, `Dashboard`, `WorkoutSession`, `CreateWorkout`, `EditWorkout`) are code-split using `React.lazy()` and `<Suspense>`, delivering instantaneous sub-35kB route chunks.
- **Cross-Routine Exercise Tracking**:
  - Shared history and personal records across routines (e.g. tracking *"Incline Bench Press"* across both *Push* and *Chest & Back* days).
- **Progress at a Glance Line Graphs**:
  - High-contrast SVG line curves with glowing area fills, 1RM estimations (Epley formula), and session volume metrics.
- **Unified Alert & Confirmation System**:
  - Custom reusable `<StatusAlert />`, floating `<ToastNotification />`, and glassmorphic `<ConfirmationModal />` dialogues replacing native browser alerts.
- **Centralized State Management**:
  - Context API + pure `useReducer` action cycle coordinating mutations to a Supabase Postgres backend.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build System & Tooling**: [Vite](https://vite.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Audio Engine**: Native Browser [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (Zero external audio files / CORS issues)
- **Routing**: [React Router v6](https://reactrouter.com/) (Hash Router with code-split lazy routes)
- **Styling**: [Tailwind CSS v4.0](https://tailwindcss.com/)
- **Backend Database**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime Auth + Row Level Security)
- **Validation**: [Zod](https://zod.dev/) (Runtime validation matching table definitions)

---

## 📂 Project Structure

```
├── public/                  # Static icons and manifest assets
├── src/
│   ├── assets/              # SVGs and images
│   ├── components/          # Reusable UI parts:
│   │   ├── WorkoutHeatmap.tsx       # GitHub-style 52-week activity matrix & streak counters
│   │   ├── RestTimer.tsx            # Top-anchored rest timer with audio notifications
│   │   ├── ExerciseCard.tsx         # Active set logger & view-only exercise cards
│   │   ├── ExerciseProgressionChart.tsx # SVG progression analytics & 1RM curves
│   │   ├── ConfirmationModal.tsx    # Custom modal for deletions and cancel actions
│   │   ├── StatusAlert.tsx          # Multi-variant alert banners
│   │   ├── ToastNotification.tsx    # Floating auto-dismiss toasts
│   │   ├── PRCelebration.tsx        # Animated PR broken celebration modal
│   │   ├── PageSkeletonLoader.tsx   # Shimmer skeleton loader
│   │   ├── SideDrawer.tsx           # Slide-out navigation drawer & profile renaming
│   │   └── BottomTabBar.tsx         # Sticky bottom navigation bar
│   ├── context/             # GymTrackerContext (Supabase provider & dispatchers)
│   ├── hooks/               # useSupabaseQuery wrapper (SQL transactions & duration queries)
│   ├── pages/               # Code-split views (Auth, Dashboard, Session, Builder, Editor)
│   ├── reducers/            # gymTrackerReducer (central pure state machine)
│   ├── schemas/             # Zod validation schemas matching database tables
│   ├── types/               # TypeScript declarations
│   ├── utils/               # exerciseUtils (cross-routine normalization & 1RM formulas) & audioUtils
│   ├── main.tsx             # Application entry point
│   ├── App.tsx              # Code-split Router configuration & Suspense
│   └── index.css            # Base resets, mobile zoom prevention, Tailwind tokens
├── .env.example             # Environment variable template
├── vercel.json              # Vercel deployment rewrites
├── ARCHITECTURE.md          # Complete technical contributor guide & learning roadmap
└── README.md
```

---

## ⚙️ Installation & Local Setup

### 1. Clone the Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/mohammed-abdelwhab/RepStack.git
cd RepStack

# Install dependencies
npm install
```

### 2. Setup Environment Variables
Create a `.env.local` file in the root directory and insert your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 3. Database Setup
Execute the SQL policies in `ARCHITECTURE.md` within your Supabase SQL Editor to configure Row Level Security (RLS) across all tables.

### 4. Run the Project
```bash
# Run in development mode
npm run dev

# Build for production with chunk splitting
npm run build
```

---

## 📖 Architecture & Contributor Guide
For an in-depth explanation of state management flows, database schemas, and a 5-step learning roadmap, read [ARCHITECTURE.md](./ARCHITECTURE.md).
