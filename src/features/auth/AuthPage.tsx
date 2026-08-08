import { useState, type FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Dumbbell, LockKeyhole } from "lucide-react";

export function AuthPage() {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const formData = new FormData(event.currentTarget);
      formData.set("flow", mode);
      await signIn("password", formData);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message.replace(/^Uncaught Error: /, "")
          : "Unable to sign in.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">
          <Dumbbell aria-hidden="true" />
        </div>
        <p className="eyebrow">90 days. Three daily choices.</p>
        <h1>Beast Mode Lite</h1>
        <p className="muted">Build consistency one checked box at a time.</p>

        <form onSubmit={submit} className="auth-form">
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              minLength={8}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={busy}>
            <LockKeyhole size={18} aria-hidden="true" />
            {busy ? "Working…" : mode === "signIn" ? "Enter the arena" : "Create owner account"}
          </button>
        </form>

        <button
          className="text-button"
          type="button"
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError("");
          }}
        >
          {mode === "signIn"
            ? "First visit? Create the owner account"
            : "Already registered? Sign in"}
        </button>
        <p className="auth-note">Only the configured owner email can register.</p>
      </section>
    </main>
  );
}
