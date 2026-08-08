import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { CalendarDays, Rocket } from "lucide-react";
import { trackerApi } from "../../lib/api";
import { dateKey } from "../../lib/progress";

export function RoundSetup() {
  const createRound = useMutation(trackerApi.createRound);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await createRound({
        name: String(form.get("name") || "My 90-Day Round"),
        startDate: String(form.get("startDate")),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start the round.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="setup-page">
      <section className="setup-card panel">
        <div className="setup-icon">
          <CalendarDays aria-hidden="true" />
        </div>
        <p className="eyebrow">Your next 90 days</p>
        <h1>Start a Beast Mode round</h1>
        <p className="muted">
          Pick your day one. You can fill in that day and any elapsed days, while
          future days stay locked.
        </p>
        <form onSubmit={submit} className="setup-form">
          <label>
            Round name
            <input name="name" defaultValue="My 90-Day Round" maxLength={60} required />
          </label>
          <label>
            Day one
            <input
              name="startDate"
              type="date"
              defaultValue={dateKey(new Date())}
              max={dateKey(new Date())}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="primary-button" disabled={busy}>
            <Rocket size={18} aria-hidden="true" />
            {busy ? "Starting…" : "Start the round"}
          </button>
        </form>
      </section>
    </main>
  );
}
