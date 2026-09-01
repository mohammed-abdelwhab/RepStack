import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useGymTracker } from "./context/GymTrackerContext";
import { PageSkeletonLoader } from "./components/PageSkeletonLoader";

// Lazy-loaded route chunks
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WorkoutSession = lazy(() => import("./pages/WorkoutSession"));
const CreateWorkout = lazy(() => import("./pages/CreateWorkout"));
const EditWorkout = lazy(() => import("./pages/EditWorkout"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useGymTracker();

  if (authLoading) {
    return <PageSkeletonLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageSkeletonLoader />}>
        <Routes>
          <Route path="/login" element={<Auth />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/workout/:dayId" element={<WorkoutSession />} />
                  <Route path="/workout/new" element={<CreateWorkout />} />
                  <Route path="/workout/:dayId/edit" element={<EditWorkout />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
