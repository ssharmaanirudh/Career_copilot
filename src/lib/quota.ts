import { and, count, eq, gte } from "drizzle-orm";
import { db } from "./db/client";
import { usageEvents, type UsageEventType } from "./db/schema";

/** Free tier: 3 analyses per calendar month, resetting monthly — not a lifetime cap (confirmed decision, LICENSING.md). */
export const FREE_MONTHLY_ANALYSES = 3;

/** Calendar-month boundary in UTC — deterministic and simple; not adjusted per user timezone. */
export function currentMonthStart(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getMonthlyUsageCount(userId: string, eventType: UsageEventType = "analyze"): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, userId),
        eq(usageEvents.eventType, eventType),
        gte(usageEvents.createdAt, currentMonthStart()),
      ),
    );
  return rows[0]?.value ?? 0;
}

export async function recordUsageEvent(userId: string, eventType: UsageEventType = "analyze"): Promise<void> {
  await db.insert(usageEvents).values({ userId, eventType });
}

export const MONTHLY_LIMIT_MESSAGE =
  "You've used your 3 free analyses this month. Upgrade to continue, or check back next month.";
