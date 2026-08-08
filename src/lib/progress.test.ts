import { describe, expect, it } from "vitest";
import {
  addDays,
  checksCompleted,
  completionPercent,
  dayStatus,
  daysBetween,
  isEditableDay,
  summarizeRound,
  type DayEntry,
} from "./progress";

const beast = { workout: true, food: true, steps: true };

describe("progress calculations", () => {
  it("scores each number of completed checks", () => {
    expect(checksCompleted(beast)).toBe(3);
    expect(completionPercent(beast)).toBe(100);
    expect(dayStatus(beast)).toBe("beast");
    expect(dayStatus({ ...beast, steps: false })).toBe("ok");
    expect(dayStatus({ workout: true, food: false, steps: false })).toBe("lame");
    expect(dayStatus({ workout: false, food: false, steps: false })).toBe("sucks");
  });

  it("handles calendar math without daylight-saving drift", () => {
    expect(addDays("2026-03-07", 2)).toBe("2026-03-09");
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("counts missing elapsed days as zero and ignores future days", () => {
    const entries: DayEntry[] = [
      { dayIndex: 1, ...beast },
      { dayIndex: 2, ...beast },
      { dayIndex: 4, workout: true, food: true, steps: false },
      { dayIndex: 20, ...beast },
    ];
    const summary = summarizeRound("2026-05-01", entries, "2026-05-04");
    expect(summary).toMatchObject({
      currentDay: 4,
      remaining: 86,
      beastDays: 2,
      currentStreak: 0,
      bestStreak: 2,
      averageCompletion: 67,
      elapsedDays: 4,
    });
  });

  it("caps round progress at day 90", () => {
    const summary = summarizeRound("2026-01-01", [], "2027-01-01");
    expect(summary.currentDay).toBe(90);
    expect(summary.remaining).toBe(0);
    expect(summary.elapsedDays).toBe(90);
  });

  it("locks future and out-of-range days", () => {
    expect(isEditableDay(3, "2026-05-01", "2026-05-03")).toBe(true);
    expect(isEditableDay(4, "2026-05-01", "2026-05-03")).toBe(false);
    expect(isEditableDay(91, "2026-05-01", "2027-01-01")).toBe(false);
  });
});
