import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RoundMapPage } from "./RoundMapPage";

const round = {
  _id: "round-1",
  name: "Test Round",
  startDate: "2026-05-01",
  timeZone: "America/New_York",
  status: "active" as const,
  createdAt: 1,
};

describe("RoundMapPage", () => {
  it("links elapsed days and locks future days", () => {
    render(
      <MemoryRouter>
        <RoundMapPage
          round={round}
          today="2026-05-02"
          entries={[{ dayIndex: 1, workout: true, food: true, steps: true }]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Edit day 1, 100 percent" })).toHaveAttribute("href", "/day/1");
    expect(screen.getByLabelText("Day 3, locked")).toBeInTheDocument();
    expect(screen.getByText("1 Beast day out of 2 elapsed")).toBeInTheDocument();
  });
});
