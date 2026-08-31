import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useGymTracker } from "./context/GymTrackerContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import WorkoutSession from "./pages/WorkoutSession";
import CreateWorkout from "./pages/CreateWorkout";
import EditWorkout from "./pages/EditWorkout";
import LoadingSpinner from "./components/LoadingSpinner";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useGymTracker();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#131313" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <HashRouter>
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
    </HashRouter>
  );
}
