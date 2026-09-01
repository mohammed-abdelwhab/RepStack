import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGymTracker } from "../context/GymTrackerContext";
import { signUpUser, signInUser } from "../lib/auth";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Auth() {
  type Mode = "signIn" | "signUp";

  const { user } = useGymTracker();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // If user is already logged in, redirect them immediately to Dashboard
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signUp") {
        const { data, error: err } = await signUpUser({ email, password });
        if (err) {
          setError(err.message);
        } else if (data.user && !data.session) {
          // Signup confirmation required
          setError(
            "Account created! Please check your email for a verification link.",
          );
        } else if (data.session) {
          navigate("/", { replace: true });
        }
      } else {
        const { data, error: err } = await signInUser({ email, password });
        if (err) {
          setError(err.message);
        } else if (data.session) {
          navigate("/", { replace: true });
        }
      }
    } catch (err: any) {
      setError(err?.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#131313", color: "#e5e2e1" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "#121212",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="text-center mb-6">
          <h1
            className="font-display tracking-tight text-3xl font-black text-white"
            style={{ letterSpacing: "-0.04em" }}
          >
            GYM TRACKER
          </h1>
          <p
            className="font-body text-xs mt-1 uppercase tracking-widest"
            style={{ color: "#dfff00" }}
          >
            High-Performance Kinetic
          </p>
        </div>

        <h2 className="font-display text-xl font-bold text-white mb-2">
          {mode === "signIn" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="font-body text-sm text-steel mb-6">
          {mode === "signIn"
            ? "Sign in to log sets and track performance."
            : "Sign up to start tracking your reps and PRs."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="font-body text-xs font-semibold uppercase tracking-wider text-steel"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black text-chalk font-body text-base rounded px-4 py-3 border border-steel/20 focus:border-iron focus:outline-none transition-colors"
              style={{ caretColor: "#dfff00" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="font-body text-xs font-semibold uppercase tracking-wider text-steel"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black text-chalk font-body text-base rounded px-4 py-3 border border-steel/20 focus:border-iron focus:outline-none transition-colors"
              style={{ caretColor: "#dfff00" }}
            />
          </div>

          {error && (
            <p
              className="font-body text-xs p-3 rounded"
              style={{
                background: "rgba(255, 49, 49, 0.1)",
                color: "#ff3131",
                border: "1px solid rgba(255, 49, 49, 0.2)",
              }}
            >
              {error}
            </p>
          )}

          {isLoading ? (
            <div className="flex justify-center py-2">
              <LoadingSpinner />
            </div>
          ) : (
            <button
              type="submit"
              className="w-full font-display font-black uppercase text-sm py-3.5 rounded transition-all active:scale-[0.98] cursor-pointer mt-2"
              style={{
                background: "#dfff00",
                color: "#000000",
                boxShadow: "0px 4px 12px rgba(223, 255, 0, 0.15)",
                letterSpacing: "0.05em",
              }}
            >
              {mode === "signIn" ? "SIGN IN" : "REGISTER"}
            </button>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === "signIn" ? "signUp" : "signIn");
              setError("");
            }}
            className="font-body text-sm underline transition-colors cursor-pointer"
            style={{ color: "#dfff00" }}
          >
            {mode === "signIn"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
