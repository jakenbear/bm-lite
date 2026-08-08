import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TodayPage } from "./TodayPage";

const updateDay = vi.fn().mockResolvedValue(null);
vi.mock("convex/react", () => ({
  useMutation: () => updateDay,
}));

describe("TodayPage", () => {
  it("updates a goal and shows a Beast day when all three are checked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TodayPage
          round={{
            _id: "round-1",
            name: "Test",
            startDate: "2026-05-01",
            timeZone: "UTC",
            status: "active",
            createdAt: 1,
          }}
          today="2026-05-01"
          entries={[{ dayIndex: 1, workout: true, food: false, steps: true }]}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /Log food/i }));

    expect(screen.getByText("Beast day")).toBeInTheDocument();
    expect(updateDay).toHaveBeenCalledWith({
      roundId: "round-1",
      dayIndex: 1,
      checks: { workout: true, food: true, steps: true },
    });
  });
});
