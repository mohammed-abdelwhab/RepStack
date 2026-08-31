// @ts-nocheck
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { signUpUser } from "../lib/auth";

function SignUpForm() {
  type Mode = "signUp" | "signIn";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [mode, setMode] = useState<Mode>("signUp");
  const [showForm, setShowForm] = useState(true);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setIsLoading(true);
      // The response from the signUpUSer is an object of data and error
      const { data, error } = await signUpUser({ email, password });
      if (error) setError(error.message);
      if (data.user || data.session) {
        setIsAuth(true);
        setEmail("");
        setPassword("");
        setError("");
        setShowForm(false);
      }
    } catch (err) {
      setError(`Therer was an Error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  function handelBackNavigation() {
    setShowForm(true);
    setIsAuth(false);
  }

  // Here we should see the main app's view when logged in
  if (isAuth)
    return (
      <>
        <p className="font-body text-green-800">Welcome back 👋❤️</p>;
        <button onClick={handelBackNavigation}></button>
      </>
    );

  return (
    showForm && (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-surface rounded-2xl p-6">
          <h1 className="font-display text-2xl text-chalk mb-1">
            Create account
          </h1>
          <p className="font-body text-sm text-steel mb-6">
            Start tracking your workouts
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-body text-sm text-steel">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Add a valid account: you@example.com"
                className="bg-charcoal text-chalk font-body text-base rounded-lg px-4 py-3 border border-steel/30 focus:border-iron focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="font-body text-sm text-steel"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-charcoal text-chalk font-body text-base rounded-lg px-4 py-3 border border-steel/30 focus:border-iron focus:outline-none"
              />
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <p className="font-body text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className={`
        w-full bg-iron text-chalk font-body font-medium text-base rounded-lg py-3 mt-2
        relative flex items-center justify-center gap-2
        transition-all duration-75 border-b-4 border-black/30 transform
        ${
          isLoading
            ? "opacity-85 border-b-0 translate-y-1 scale-[0.98]"
            : "active:border-b-0 active:translate-y-1 active:scale-[0.98]"
        }
      `}
            >
              {isLoading ? "Signing up...." : "Sign up"}
            </button>
          </form>

          <p className="font-body text-sm text-steel text-center mt-6">
            Already have an account? <span className="text-iron">Log in</span>
          </p>
        </div>
      </div>
    )
  );
}

export default SignUpForm;
