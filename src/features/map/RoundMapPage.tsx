import { Link } from "react-router-dom";
import { CalendarRange, Flame, Star, TimerReset } from "lucide-react";
import type { Round } from "../../lib/api";
import {
  completionPercent,
  dayStatus,
  emptyChecks,
  summarizeRound,
  type DayEntry,
  type DayStatus,
} from "../../lib/progress";

type Props = {
  round: Round;
  entries: DayEntry[];
  today: string;
};

const legend: Array<{ status: DayStatus | "future"; label: string }> = [
  { status: "sucks", label: "Sucks 0%" },
  { status: "lame", label: "Lame 33%" },
  { status: "ok", label: "OK 67%" },
  { status: "beast", label: "Beast 100%" },
  { status: "future", label: "Locked" },
];

export function RoundMapPage({ round, entries, today }: Props) {
  const summary = summarizeRound(round.startDate, entries, today);
  const byDay = new Map(entries.map((entry) => [entry.dayIndex, entry]));

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">{round.name}</p>
          <h1>90-Day Map</h1>
          <p className="muted">Every day is a choice. Build your streak.</p>
        </div>
      </header>

      <div className="summary-grid map-summary">
        <SummaryCard icon={CalendarRange} value={summary.currentDay || "—"} label="Current day" tone="blue" />
        <SummaryCard icon={Star} value={summary.beastDays} label="Beast days" tone="blue" />
        <SummaryCard icon={Flame} value={summary.currentStreak} label="Streak" tone="orange" />
        <SummaryCard icon={TimerReset} value={summary.remaining} label="Remaining" />
      </div>

      <div className="map-panel panel">
        <div className="map-legend">
          {legend.map((item) => (
            <span key={item.status}>
              <i className={`legend-swatch status-${item.status}`} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="day-grid">
          {Array.from({ length: 90 }, (_, offset) => {
            const dayIndex = offset + 1;
            const isFuture = dayIndex > summary.currentDay;
            const checks = byDay.get(dayIndex) ?? emptyChecks;
            const status = isFuture ? "future" : dayStatus(checks);
            const tile = (
              <>
                <strong>{dayIndex}</strong>
                <small>{isFuture ? "—" : `${completionPercent(checks)}%`}</small>
              </>
            );
            return isFuture ? (
              <span className={`day-tile status-${status}`} key={dayIndex} aria-label={`Day ${dayIndex}, locked`}>
                {tile}
              </span>
            ) : (
              <Link
                className={`day-tile status-${status}`}
                to={`/day/${dayIndex}`}
                key={dayIndex}
                aria-label={`Edit day ${dayIndex}, ${completionPercent(checks)} percent`}
              >
                {tile}
              </Link>
            );
          })}
        </div>
      </div>
      <p className="map-footer">
        {summary.beastDays} Beast {summary.beastDays === 1 ? "day" : "days"} out of {summary.elapsedDays} elapsed
      </p>
    </section>
  );
}

type SummaryCardProps = {
  icon: typeof CalendarRange;
  value: string | number;
  label: string;
  tone?: "blue" | "orange";
};

export function SummaryCard({ icon: Icon, value, label, tone }: SummaryCardProps) {
  return (
    <article className={`summary-card ${tone ? `tone-${tone}` : ""}`}>
      <Icon aria-hidden="true" />
      <div><strong>{value}</strong><span>{label}</span></div>
    </article>
  );
}
