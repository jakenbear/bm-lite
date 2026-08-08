import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { Archive, CalendarPlus, X } from "lucide-react";
import type { Round } from "../../lib/api";
import { trackerApi } from "../../lib/api";
import { dateKey } from "../../lib/progress";

type Props = {
  activeRound: Round;
  history: Round[];
};

export function RoundHistoryPage({ activeRound, history }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const createRound = useMutation(trackerApi.createRound);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await createRound({
        name: String(form.get("name")),
        startDate: String(form.get("startDate")),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
      setShowForm(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the round.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div><p className="eyebrow">Keep the history</p><h1>Your rounds</h1><p className="muted">Past rounds are archived and remain read-only.</p></div>
        <button className="primary-button compact" type="button" onClick={() => setShowForm(true)}>
          <CalendarPlus size={18} /> New round
        </button>
      </header>

      <article className="round-card active panel">
        <span className="round-badge">Active</span>
        <h2>{activeRound.name}</h2>
        <p>Started {formatDate(activeRound.startDate)}</p>
      </article>

      <h2 className="subheading">Round history</h2>
      <div className="round-list">
        {history.length === 0 ? (
          <div className="empty-state panel"><Archive /><p>No archived rounds yet.</p></div>
        ) : history.map((round) => (
          <article className="round-card panel" key={round._id}>
            <Archive aria-hidden="true" />
            <div><h3>{round.name}</h3><p>Started {formatDate(round.startDate)}</p></div>
            <span>Archived</span>
          </article>
        ))}
      </div>

      {showForm && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal panel" role="dialog" aria-modal="true" aria-labelledby="new-round-title">
            <button className="icon-button modal-close" onClick={() => setShowForm(false)} aria-label="Close"><X /></button>
            <p className="eyebrow">Fresh start</p>
            <h2 id="new-round-title">Start a new round</h2>
            <p className="muted">Your current round will move to read-only history.</p>
            <form className="setup-form" onSubmit={submit}>
              <label>Round name<input name="name" defaultValue="My Next 90 Days" maxLength={60} required /></label>
              <label>Day one<input name="startDate" type="date" max={dateKey(new Date())} defaultValue={dateKey(new Date())} required /></label>
              {error && <p className="form-error">{error}</p>}
              <button className="primary-button" disabled={busy}>{busy ? "Starting…" : "Archive current & start"}</button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

function formatDate(key: string) {
  return new Date(`${key}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
