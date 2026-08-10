/**
 * Shared between the client form (src/app/page.tsx) and the /api/analyze
 * route, so the two stay in sync — the server check exists as a backstop
 * for direct API calls, not as the primary UX (that's the client-side
 * inline message).
 *
 * The shortest real, already-tested job description in this project's own
 * eval fixtures is 234 characters (a lean "Essential requirements" list
 * with 3 bullets). This sits comfortably below that — even an unusually
 * verbose job title rarely exceeds ~100 characters — while safely
 * rejecting a bare title like "IT Expert-Cloud".
 */
export const MIN_JOB_DESCRIPTION_LENGTH = 150;
