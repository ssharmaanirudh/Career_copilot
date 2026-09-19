import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "../src/lib/db/client";

/**
 * Runs automatically before the app starts on every deploy (see the
 * "start" script in package.json) — the app must never come up against
 * an unmigrated or partially-migrated database. Two deliberate choices:
 *
 * 1. Uses drizzle-orm's own migrate() function directly, not the
 *    `drizzle-kit migrate` CLI. A CLI subprocess's exit code turned out
 *    to be an unreliable signal in practice (confirmed during Phase 1
 *    verification: an earlier run exited 0 in a broken network
 *    environment, and a later run under the same conditions hung
 *    indefinitely with no exit at all). Calling migrate() as a real
 *    JS function means a failure is a real thrown exception, not a
 *    subprocess exit code to interpret.
 * 2. Even so, does NOT trust a clean migrate() return on its own — the
 *    Neon HTTP driver also doesn't support transactions (documented by
 *    drizzle-orm itself), so a failure partway through a migration
 *    can leave the schema partially applied with no rollback. The
 *    independent verification query below is what actually decides
 *    success: it re-reads the live schema from a separate connection
 *    and checks every table this app depends on is really there,
 *    regardless of what migrate() claimed.
 *
 * Exits non-zero on any failure so Render's deploy fails loudly and
 * visibly in its logs, rather than starting the app against a broken
 * database.
 */
const REQUIRED_TABLES = ["user", "session", "account", "verification", "usage_events", "institutions"] as const;

async function verifyTablesExist(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  `) as unknown as { table_name: string }[];
  const found = new Set(rows.map((r) => r.table_name));
  const missing = REQUIRED_TABLES.filter((t) => !found.has(t));
  if (missing.length > 0) {
    throw new Error(`missing table(s) after migration: ${missing.join(", ")}`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("[migrate] FATAL: DATABASE_URL is not set. Refusing to start without a database.");
    process.exit(1);
  }

  console.log("[migrate] Applying any pending migrations from ./drizzle ...");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
  } catch (err) {
    console.error(
      "[migrate] MIGRATION FAILED while applying — refusing to start the app:",
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  }

  console.log("[migrate] migrate() returned cleanly. Verifying the live schema independently before trusting that ...");
  try {
    await verifyTablesExist();
  } catch (err) {
    console.error(
      "[migrate] MIGRATION VERIFICATION FAILED — refusing to start the app:",
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  }

  console.log(
    `[migrate] MIGRATION VERIFIED: OK — all ${REQUIRED_TABLES.length} expected tables exist (${REQUIRED_TABLES.join(", ")}). Starting the app.`,
  );
}

main();
