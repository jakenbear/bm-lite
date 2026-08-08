import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  rounds: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    startDate: v.string(),
    timeZone: v.string(),
    status: v.union(v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    archivedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_status", ["ownerId", "status"]),
  dayEntries: defineTable({
    ownerId: v.id("users"),
    roundId: v.id("rounds"),
    dayIndex: v.number(),
    workout: v.boolean(),
    food: v.boolean(),
    steps: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_round", ["roundId"])
    .index("by_round_day", ["roundId", "dayIndex"])
    .index("by_owner", ["ownerId"]),
});
