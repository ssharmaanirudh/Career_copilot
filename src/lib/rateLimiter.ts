/**
 * Best-effort guard against exhausting Gemini's shared free-tier quota
 * (10 req/min, 250/day, pooled across every visitor to this deployment).
 *
 * This is in-memory and scoped to a single warm serverless instance, so
 * under multi-instance traffic it under-counts rather than perfectly
 * enforcing the cap — it's a fast, friendly first line of defense, not a
 * substitute for upgrading to a paid Gemini tier or a shared store (e.g.
 * Vercel KV) if this deployment outgrows it.
 */

const PER_MINUTE_LIMIT = 8;
const PER_DAY_LIMIT = 230;
const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * 60_000;

let minuteWindowStart = Date.now();
let minuteCount = 0;
let dayWindowStart = Date.now();
let dayCount = 0;

export class RateLimitedError extends Error {}

export function checkRateLimit(): void {
  const now = Date.now();

  if (now - minuteWindowStart >= MINUTE_MS) {
    minuteWindowStart = now;
    minuteCount = 0;
  }
  if (now - dayWindowStart >= DAY_MS) {
    dayWindowStart = now;
    dayCount = 0;
  }

  if (dayCount >= PER_DAY_LIMIT) {
    throw new RateLimitedError(
      "GapLens has hit its usage limit for today. Please check back tomorrow.",
    );
  }
  if (minuteCount >= PER_MINUTE_LIMIT) {
    throw new RateLimitedError(
      "GapLens is getting a lot of use right now. Please wait a minute and try again.",
    );
  }

  minuteCount += 1;
  dayCount += 1;
}
