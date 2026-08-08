import { Award, CalendarDays, Flame, Medal, Star, Target, Trophy, Zap } from "lucide-react";
import type { DashboardData, Round } from "../../lib/api";
import { summarizeRound, type DayEntry } from "../../lib/progress";
import { SummaryCard } from "../map/RoundMapPage";

type Props = {
  round: Round;
  entries: DayEntry[];
  profile: DashboardData["profile"];
  today: string;
};

export function StatsPage({ round, entries, profile, today }: Props) {
  const summary = summarizeRound(round.startDate, entries, today);
  const displayName = profile.name || profile.email?.split("@")[0] || "Beast";
  const achievements = [
    { title: "First Blood", detail: "Complete a Beast day", Icon: Target, unlocked: summary.beastDays >= 1 },
    { title: "Week Warrior", detail: "7-day Beast streak", Icon: Zap, unlocked: summary.bestStreak >= 7 },
    { title: "5 Beast Days", detail: "Five perfect days", Icon: Flame, unlocked: summary.beastDays >= 5 },
    { title: "Halfway There", detail: "Reach day 45", Icon: Medal, unlocked: summary.elapsedDays >= 45 },
    { title: "Beast Streak", detail: "30-day Beast streak", Icon: Star, unlocked: summary.bestStreak >= 30 },
    { title: "Beast Complete", detail: "Finish all 90 days", Icon: Trophy, unlocked: summary.elapsedDays >= 90 },
  ];

  return (
    <section className="page">
      <article className="profile-card panel">
        <div className="avatar">{displayName.slice(0, 2).toUpperCase()}</div>
        <div>
          <p className="eyebrow">Round profile</p>
          <h1>{displayName}</h1>
          <p className="muted">
            {round.name} · Started{" "}
            {new Date(`${round.startDate}T12:00:00`).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </article>

      <div className="summary-grid stats-summary">
        <SummaryCard icon={CalendarDays} value={`${summary.currentDay}/90`} label="Current day" tone="blue" />
        <SummaryCard icon={Flame} value={summary.currentStreak} label="Current streak" tone="orange" />
        <SummaryCard icon={Award} value={summary.bestStreak} label="Best streak" tone="blue" />
        <SummaryCard icon={Star} value={summary.beastDays} label="Beast days" tone="orange" />
        <SummaryCard icon={Target} value={`${summary.averageCompletion}%`} label="Avg completion" />
      </div>

      <section className="achievements panel">
        <div className="section-heading">
          <div><p className="eyebrow">Milestones</p><h2>Achievements</h2></div>
          <span>{achievements.filter((item) => item.unlocked).length}/{achievements.length}</span>
        </div>
        <div className="achievement-grid">
          {achievements.map(({ title, detail, Icon, unlocked }) => (
            <article className={`achievement ${unlocked ? "unlocked" : ""}`} key={title}>
              <Icon aria-hidden="true" />
              <div><strong>{title}</strong><span>{detail}</span></div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
