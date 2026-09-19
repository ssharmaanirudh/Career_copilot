import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon's HTTP driver (one fetch per query, no persistent connection) —
 * the right fit for this app's architecture: every API route is a short,
 * independent request (runtime = "nodejs", no long-lived server process),
 * so there's no connection pool to manage or exhaust on our side. Neon's
 * own pooled endpoint (the "-pooler" host in DATABASE_URL) handles
 * fan-out on Neon's side.
 *
 * This is the FIRST persistent store this app has ever had. Hard
 * boundary, not just a convention: this database holds account and
 * usage-count rows only. Resume text, job description text, and analysis
 * results are never written here — that's the existing "processed once,
 * never stored" promise in CLAUDE.md, and it has to stay true now that a
 * database exists at all, not just by omission.
 */
function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and set it to your Neon connection string (the pooled one, with '-pooler' in the hostname).",
    );
  }
  return url;
}

const sql = neon(requireDatabaseUrl());

export const db = drizzle(sql, { schema });
