import { getAuthUserId } from "@convex-dev/auth/server";
import { mutationGeneric, queryGeneric } from "convex/server";
import { ConvexError, v } from "convex/values";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const getDashboard = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);
    if (!ownerId) throw new ConvexError("You must be signed in.");

    const activeRound = await ctx.db
      .query("rounds")
      .withIndex("by_owner_status", (query) =>
        query.eq("ownerId", ownerId).eq("status", "active"),
      )
      .first();

    const history = await ctx.db
      .query("rounds")
      .withIndex("by_owner_status", (query) =>
        query.eq("ownerId", ownerId).eq("status", "archived"),
      )
      .order("desc")
      .collect();

    const entries = activeRound
      ? await ctx.db
          .query("dayEntries")
          .withIndex("by_round", (query) => query.eq("roundId", activeRound._id))
          .collect()
      : [];
    entries.sort((left, right) => left.dayIndex - right.dayIndex);

    const user = await ctx.db.get(ownerId);
    return {
      activeRound,
      history,
      entries,
      profile: {
        email: user?.email,
        name: user?.name,
      },
      today: todayInTimeZone(activeRound?.timeZone ?? "UTC"),
    };
  },
});

export const create = mutationGeneric({
  args: {
    name: v.string(),
    startDate: v.string(),
    timeZone: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);
    if (!ownerId) throw new ConvexError("You must be signed in.");

    const name = args.name.trim();
    if (!name || name.length > 60) {
      throw new ConvexError("Round name must be between 1 and 60 characters.");
    }
    if (!datePattern.test(args.startDate) || Number.isNaN(Date.parse(`${args.startDate}T00:00:00Z`))) {
      throw new ConvexError("Choose a valid start date.");
    }

    let today: string;
    try {
      today = todayInTimeZone(args.timeZone);
    } catch {
      throw new ConvexError("The browser supplied an invalid time zone.");
    }
    if (args.startDate > today) {
      throw new ConvexError("A round cannot begin in the future.");
    }

    const activeRounds = await ctx.db
      .query("rounds")
      .withIndex("by_owner_status", (query) =>
        query.eq("ownerId", ownerId).eq("status", "active"),
      )
      .collect();
    const now = Date.now();
    await Promise.all(
      activeRounds.map((round) =>
        ctx.db.patch(round._id, { status: "archived", archivedAt: now }),
      ),
    );

    return await ctx.db.insert("rounds", {
      ownerId,
      name,
      startDate: args.startDate,
      timeZone: args.timeZone,
      status: "active",
      createdAt: now,
    });
  },
});

function todayInTimeZone(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
