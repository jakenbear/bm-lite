import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { Check, ChevronLeft, Footprints, Salad, Sparkles, Dumbbell } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { Round } from "../../lib/api";
import { trackerApi } from "../../lib/api";
import {
  addDays,
  completionPercent,
  dayStatus,
  emptyChecks,
  isEditableDay,
  statusLabel,
  type DayChecks,
  type DayEntry,
} from "../../lib/progress";

type Props = {
  round: Round;
  entries: DayEntry[];
  today: string;
};

const checkItems: Array<{
  key: keyof DayChecks;
  title: string;
  detail: string;
  Icon: typeof Dumbbell;
}> = [
  { key: "workout", title: "DDPY workout", detail: "Complete 1 or 2 workouts", Icon: Dumbbell },
  { key: "food", title: "Log food", detail: "Track everything you eat", Icon: Salad },
  { key: "steps", title: "Meet step goal", detail: "Hit your personal step target", Icon: Footprints },
];

export function TodayPage({ round, entries, today }: Props) {
  const params = useParams();
  const requested = Number(params.dayIndex);
  const currentIndex = Math.max(
    1,
    Math.min(90, Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${round.startDate}T00:00:00Z`)) / 86_400_000) + 1),
  );
  const dayIndex = Number.isInteger(requested) && requested >= 1 ? requested : currentIndex;
  const stored = entries.find((entry) => entry.dayIndex === dayIndex);
  const initialChecks = stored
    ? { workout: stored.workout, food: stored.food, steps: stored.steps }
    : emptyChecks;
  const [checks, setChecks] = useState<DayChecks>(initialChecks);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const updateDay = useMutation(trackerApi.updateDay);
  const editable = isEditableDay(dayIndex, round.startDate, today);

  useEffect(() => {
    // Reset optimistic state when navigation or a server update changes the entry.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecks(
      stored
        ? { workout: stored.workout, food: stored.food, steps: stored.steps }
        : emptyChecks,
    );
  }, [stored, dayIndex]);

  async function toggle(key: keyof DayChecks) {
    if (!editable || saving) return;
    const previous = checks;
    const next = { ...checks, [key]: !checks[key] };
    setChecks(next);
    setSaving(true);
    setError("");
    try {
      await updateDay({ roundId: round._id, dayIndex, checks: next });
    } catch (caught) {
      setChecks(previous);
      setError(caught instanceof Error ? caught.message : "Could not save this day.");
    } finally {
      setSaving(false);
    }
  }

  const status = dayStatus(checks);
  const displayDate = new Date(`${addDays(round.startDate, dayIndex - 1)}T12:00:00`);

  return (
    <section className="page">
      {params.dayIndex && (
        <Link className="back-link" to="/map">
          <ChevronLeft size={18} /> Back to map
        </Link>
      )}
      <header className="page-header">
        <div>
          <p className="eyebrow">Day {dayIndex} of 90</p>
          <h1>{dayIndex === currentIndex ? "Today’s choices" : `Day ${dayIndex}`}</h1>
          <p className="muted">
            {displayDate.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className={`day-score status-${status}`}>
          <strong>{completionPercent(checks)}%</strong>
          <span>{statusLabel(status)}</span>
        </div>
      </header>

      <div className="daily-checks" aria-label="Daily goals">
        {checkItems.map(({ key, title, detail, Icon }) => (
          <button
            type="button"
            key={key}
            className={`check-card ${checks[key] ? "is-checked" : ""}`}
            onClick={() => void toggle(key)}
            disabled={!editable}
            aria-pressed={checks[key]}
          >
            <span className="check-icon"><Icon aria-hidden="true" /></span>
            <span className="check-copy"><strong>{title}</strong><small>{detail}</small></span>
            <span className="checkbox">{checks[key] && <Check aria-hidden="true" />}</span>
          </button>
        ))}
      </div>

      {!editable && <p className="notice">This day is in the future and is locked.</p>}
      {saving && <p className="save-status">Saving…</p>}
      {error && <p className="form-error">{error}</p>}
      <div className={`result-banner status-${status}`}>
        <Sparkles aria-hidden="true" />
        <div>
          <strong>{statusLabel(status)} day</strong>
          <span>
            {status === "beast"
              ? "All three goals complete. You showed up."
              : `${3 - Object.values(checks).filter(Boolean).length} goal${Object.values(checks).filter(Boolean).length === 2 ? "" : "s"} to Beast.`}
          </span>
        </div>
      </div>
    </section>
  );
}
