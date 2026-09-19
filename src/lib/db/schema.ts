import { pgTable, text, timestamp, integer, index, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

export * from "./auth-schema";

/**
 * Append-only usage log, not a simple counter — chosen deliberately
 * (LICENSING.md Part 1 / Phase 1 proposal): this is billing-adjacent, so
 * being able to show a specific user exactly what happened and when (a
 * dispute, a support question, "why was I blocked") matters more than
 * saving a handful of rows. "This month's usage" is a fast indexed range
 * query (userId, createdAt), not a stored running total.
 *
 * Hard boundary: this table records only that a qualifying event
 * happened, and which route it came from — never the resume text, JD
 * text, or analysis result itself. That content is never written to this
 * database, full stop, per CLAUDE.md's "processed once, never stored"
 * promise.
 */
export const usageEventTypeValues = ["analyze"] as const;
export type UsageEventType = (typeof usageEventTypeValues)[number];

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Which metered action this was — currently only "analyze" (the initial submit and every "refine" resubmission both count, per the Phase 1 decision). */
    eventType: text("event_type").notNull().$type<UsageEventType>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("usage_events_user_created_idx").on(table.userId, table.createdAt)],
);

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  user: one(user, {
    fields: [usageEvents.userId],
    references: [user.id],
  }),
}));

/**
 * Part 2 (institutional licensing) — schema only, nothing reads or
 * writes this table yet. Exists now so `user.institutionId` (already
 * generated onto the Better Auth user table in auth.ts) has something
 * real to eventually reference, without a later rebuild.
 */
export const institutions = pgTable("institutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  adminUserId: text("admin_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  planType: text("plan_type").notNull().default("flat"),
  usageCapPerMonth: integer("usage_cap_per_month").notNull().default(500),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
