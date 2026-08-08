import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const update = mutation({
  args: {
    roundId: v.id("rounds"),
    dayIndex: v.number(),
    checks: v.object({
      workout: v.boolean(),
      food: v.boolean(),
      steps: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);
    if (!ownerId) throw new ConvexError("You must be signed in.");

    const round = await ctx.db.get(args.roundId);
    if (!round || round.ownerId !== ownerId) {
      throw new ConvexError("Round not found.");
    }
    if (round.status !== "active") {
      throw new ConvexError("Archived rounds are read-only.");
    }
    if (!Number.isInteger(args.dayIndex) || args.dayIndex < 1 || args.dayIndex > 90) {
      throw new ConvexError("Day must be between 1 and 90.");
    }

    const today = todayInTimeZone(round.timeZone);
    const latestEditable = daysBetween(round.startDate, today) + 1;
    if (args.dayIndex > latestEditable) {
      throw new ConvexError("Future days are locked.");
    }

    const existing = await ctx.db
      .query("dayEntries")
      .withIndex("by_round_day", (query) =>
        query.eq("roundId", round._id).eq("dayIndex", args.dayIndex),
      )
      .unique();
    const values = {
      ...args.checks,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, values);
    } else {
      await ctx.db.insert("dayEntries", {
        ownerId,
        roundId: round._id,
        dayIndex: args.dayIndex,
        ...values,
      });
    }
    return null;
  },
});

function daysBetween(startKey: string, endKey: string): number {
  return Math.floor(
    (Date.parse(`${endKey}T00:00:00Z`) - Date.parse(`${startKey}T00:00:00Z`)) /
      86_400_000,
  );
}

function todayInTimeZone(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
