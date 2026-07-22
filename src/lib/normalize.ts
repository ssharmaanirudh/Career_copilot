/** Small sanitizers shared by every feature that parses a Gemini JSON response. */

export function clampScore(n: unknown): number {
  const num = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

export function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function bool(v: unknown): boolean {
  return v === true;
}
