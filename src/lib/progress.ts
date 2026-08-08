export const ROUND_LENGTH = 90;

export type DayChecks = {
  workout: boolean;
  food: boolean;
  steps: boolean;
};

export type DayEntry = DayChecks & {
  dayIndex: number;
  updatedAt?: number;
};

export type DayStatus = "beast" | "ok" | "lame" | "sucks";

export type RoundSummary = {
  currentDay: number;
  remaining: number;
  beastDays: number;
  currentStreak: number;
  bestStreak: number;
  averageCompletion: number;
  elapsedDays: number;
};

export const emptyChecks: DayChecks = {
  workout: false,
  food: false,
  steps: false,
};

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(key: string, amount: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return date.toISOString().slice(0, 10);
}

export function daysBetween(startKey: string, endKey: string): number {
  const start = Date.parse(`${startKey}T00:00:00Z`);
  const end = Date.parse(`${endKey}T00:00:00Z`);
  return Math.floor((end - start) / 86_400_000);
}

export function checksCompleted(checks: DayChecks): number {
  return Number(checks.workout) + Number(checks.food) + Number(checks.steps);
}

export function completionPercent(checks: DayChecks): number {
  return Math.round((checksCompleted(checks) / 3) * 100);
}

export function dayStatus(checks: DayChecks): DayStatus {
  const completed = checksCompleted(checks);
  if (completed === 3) return "beast";
  if (completed === 2) return "ok";
  if (completed === 1) return "lame";
  return "sucks";
}

export function statusLabel(status: DayStatus): string {
  return { beast: "Beast", ok: "OK", lame: "Lame", sucks: "Sucks" }[status];
}

export function summarizeRound(
  startDate: string,
  entries: DayEntry[],
  today = dateKey(new Date()),
): RoundSummary {
  const dayOffset = daysBetween(startDate, today);
  const elapsedDays = Math.max(0, Math.min(ROUND_LENGTH, dayOffset + 1));
  const currentDay = Math.max(0, Math.min(ROUND_LENGTH, dayOffset + 1));
  const byDay = new Map(entries.map((entry) => [entry.dayIndex, entry]));

  let beastDays = 0;
  let totalPercent = 0;
  let bestStreak = 0;
  let runningStreak = 0;

  for (let index = 1; index <= elapsedDays; index += 1) {
    const checks = byDay.get(index) ?? emptyChecks;
    totalPercent += completionPercent(checks);
    if (dayStatus(checks) === "beast") {
      beastDays += 1;
      runningStreak += 1;
      bestStreak = Math.max(bestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  return {
    currentDay,
    remaining: Math.max(0, ROUND_LENGTH - elapsedDays),
    beastDays,
    currentStreak: runningStreak,
    bestStreak,
    averageCompletion: elapsedDays ? Math.round(totalPercent / elapsedDays) : 0,
    elapsedDays,
  };
}

export function isEditableDay(
  dayIndex: number,
  startDate: string,
  today = dateKey(new Date()),
): boolean {
  const latest = daysBetween(startDate, today) + 1;
  return dayIndex >= 1 && dayIndex <= ROUND_LENGTH && dayIndex <= latest;
}
