/**
 * Best-effort rate limiting on the analyze/action-plan routes. Each call
 * now costs real money (billing is enabled), so this exists to stop a
 * single client — abusive or just a runaway script — from driving up
 * cost or crowding out other visitors, and to keep an overall daily
 * ceiling on total spend regardless of how many distinct visitors show
 * up. Two layers: a per-IP per-minute limit (the specific gap closed
 * here — previously this was a single global counter, not per-IP) and
 * the pre-existing global daily cap, kept as-is as an overall backstop.
 *
 * In-memory and scoped to a single warm instance, so under multi-instance
 * traffic it under-counts rather than perfectly enforcing the cap — a
 * fast, friendly first line of defense, not a substitute for a shared
 * store (e.g. Redis) if this deployment outgrows a single instance.
 */

const PER_MINUTE_LIMIT_PER_IP = 8;
const PER_DAY_LIMIT = 230;
const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * 60_000;

interface Window {
  windowStart: number;
  count: number;
}

const perIpWindows = new Map<string, Window>();

// Opportunistic cleanup so the map doesn't grow unbounded over a long-lived
// instance — sweep out stale entries every so often rather than on every call.
const CLEANUP_INTERVAL_CALLS = 200;
let callsSinceCleanup = 0;

function cleanupStaleWindows(now: number): void {
  for (const [ip, w] of perIpWindows) {
    if (now - w.windowStart >= MINUTE_MS) {
      perIpWindows.delete(ip);
    }
  }
}

let dayWindowStart = Date.now();
let dayCount = 0;

export class RateLimitedError extends Error {}

/** First entry in x-forwarded-for is the original client; falls back to x-real-ip, then a shared bucket if neither header is present (e.g. local dev). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export function checkRateLimit(ip: string): void {
  const now = Date.now();

  if (now - dayWindowStart >= DAY_MS) {
    dayWindowStart = now;
    dayCount = 0;
  }
  if (dayCount >= PER_DAY_LIMIT) {
    throw new RateLimitedError(
      "GapLens has hit its usage limit for today. Please check back tomorrow.",
    );
  }

  callsSinceCleanup += 1;
  if (callsSinceCleanup >= CLEANUP_INTERVAL_CALLS) {
    callsSinceCleanup = 0;
    cleanupStaleWindows(now);
  }

  const existing = perIpWindows.get(ip);
  if (!existing || now - existing.windowStart >= MINUTE_MS) {
    perIpWindows.set(ip, { windowStart: now, count: 1 });
  } else if (existing.count >= PER_MINUTE_LIMIT_PER_IP) {
    throw new RateLimitedError(
      "You're sending requests a bit too quickly. Please wait a minute and try again.",
    );
  } else {
    existing.count += 1;
  }

  dayCount += 1;
}
