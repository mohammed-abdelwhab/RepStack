import { supabase } from "./supabaseClient";
/** SIGN UP,IN,OUT LOGIC
 * Using the help of supabase.auth built in table and it's methods
 *
 */
type Credentials = {
  email: string;
  password: string;
};
// 1. Sign Up (first time)
async function signUpUser(credentials: Credentials) {
  const signUpResponse = await supabase.auth.signUp(credentials);
  return signUpResponse;
}

// 2. Sign In (There is an account)
async function signInUser(credentials: Credentials) {
  const signInResponse = await supabase.auth.signInWithPassword(credentials);
  return signInResponse;
}

// 3. Sign Out
async function signOutUser() {
  const signOutResponse = await supabase.auth.signOut();
  return signOutResponse;
}

// 4. get current session : checking the "writst band of your party check-in" -> valid = skip the login
/**
 * Your "session" is that wristband. Concretely, it's a pair of tokens:
    -- Access token (JWT) — the wristband itself. Sent with every request to prove who you are. Expires quickly (usually ~1 hour).
    -- Refresh token — a backstage pass that lets you get a new wristband without showing ID again, once the old one expires. Lasts much longer.
 * 
 */
async function getCurrentSession() {
  const currentSessionResponse = await supabase.auth.getSession();
  return currentSessionResponse;
}
export { signUpUser, signInUser, signOutUser, getCurrentSession };
