import { makeFunctionReference } from "convex/server";
import type { DayChecks, DayEntry } from "./progress";

export type Round = {
  _id: string;
  name: string;
  startDate: string;
  timeZone: string;
  status: "active" | "archived";
  createdAt: number;
  archivedAt?: number;
};

export type DashboardData = {
  activeRound: Round | null;
  entries: DayEntry[];
  history: Round[];
  profile: {
    email?: string;
    name?: string;
  };
  today: string;
};

export const trackerApi = {
  dashboard: makeFunctionReference<"query", Record<string, never>, DashboardData>(
    "rounds:getDashboard",
  ),
  createRound: makeFunctionReference<
    "mutation",
    { name: string; startDate: string; timeZone: string },
    string
  >("rounds:create"),
  updateDay: makeFunctionReference<
    "mutation",
    { roundId: string; dayIndex: number; checks: DayChecks },
    null
  >("dayEntries:update"),
};
