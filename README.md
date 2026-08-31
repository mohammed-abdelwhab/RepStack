# RepStack — High-Performance Kinetic Gym Tracker

**RepStack** is a full-stack, single-page progressive web application built for dedicated athletes who require rapid, high-contrast, distraction-free performance tracking in high-intensity gym environments. 

Inspired by structural brutalism and glassmorphic designs, the application is designed to reduce eye strain, maximize hit targets during exercise, and maintain a seamless "flow state".

---

## 🚀 Key Features

- **Secure Authentication**: Sign up and Log in powered by Supabase Auth with automatic data seeding for first-time users.
- **Dynamic Workout Session Logger**: Log warmups, working sets, reps, and weights. Features inline set additions/removals and active PR calculations.
- **Centralized State Management**: Combines React's Context API and the `useReducer` hook to prevent prop-drilling and coordinate mutations in a clean, predictable loop.
- **Routines Customizer**: Build a routine from scratch or edit existing ones. Add, delete, or rename routines and modify target working sets.
- **Interactive Analytics**: Dashboard showcasing weekly training volumes and chronic personal records (PR) feed.
- **Glassmorphic Rest Timer**: Rest-timer overlay with customizable default targets to keep workouts moving.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build System & Tooling**: [Vite](https://vite.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router v6](https://reactrouter.com/) (Hash Router setup for static/CDN deployments)
- **Styling**: [Tailwind CSS v4.0](https://tailwindcss.com/)
- **Backend Database**: [Supabase](https://supabase.com/) (Postgres + Realtime Auth)
- **Validation**: [Zod](https://zod.dev/) (Runtime validation matching table definitions)

---

## 📂 Project Structure

```
├── public/                  # Static assets
├── src/
│   ├── assets/              # Icons and images
│   ├── components/          # Reusable UI parts (Drawer, Cards, TabBar, Timer)
│   ├── context/             # GymTrackerContext (database fetches & auth provider)
│   ├── data/                # Seeding/Mock data fallback
│   ├── hooks/               # useSupabaseQuery wrapper (SQL transaction commands)
│   ├── pages/               # Routing Views (Auth, Dashboard, Session, Builder, Editor)
│   ├── reducers/            # gymTrackerReducer (central pure state manager)
│   ├── schemas/             # Zod validation schemas matching database tables
│   ├── types/               # TypeScript declarations
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Router configuration & protected routes
│   └── index.css            # Base resets and Tailwind custom tokens
├── .env.local               # Local environment credentials (Supabase keys)
└── README.md
```

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Clone the Repository & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd Gym-Tracker

# Install dependencies
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and insert your Supabase project credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 4. Database Setup
Create the tables in your Supabase SQL editor using the schema definitions in `gym-tracker-schema-reference.md`. Ensure Row Level Security (RLS) is enabled and appropriate policies are configured (see `ARCHITECTURE.md`).

### 5. Run the Project
```bash
# Run in development mode
npm run dev

# Build for production
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
