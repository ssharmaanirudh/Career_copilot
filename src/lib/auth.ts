import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import * as schema from "./db/schema";

/**
 * Google sign-in is optional at the config level so the app still boots
 * (and `npx @better-auth/cli generate` still runs) before OAuth
 * credentials exist — Phase 1 is schema/migrations only, no real sign-in
 * flow wired up yet.
 */
const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    // Neon's HTTP driver doesn't support multi-statement transactions the
    // way a persistent-connection pool does — Better Auth's adapter is
    // explicitly designed to fall back to sequential (non-transactional)
    // execution when this is false.
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : undefined,
  session: {
    // "Keep me logged in" (Phase 2) is a longer-lived session, not a
    // separate mechanism — Better Auth already refreshes the expiry on
    // activity, so the two states differ only in how long they persist
    // once idle. Defaults are fine for Phase 1; revisited when the
    // sign-in UI actually exposes the choice.
  },
  user: {
    additionalFields: {
      /** Self-declared at signup ("student" | "professional" | ""), per LICENSING.md — not verified, used only to pick a pricing tier later. */
      declaredStatus: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      /**
       * Null until Part 2 (institutional licensing) exists. Deliberately
       * a plain string, not yet a real foreign key — the `institution`
       * table doesn't exist in this database yet, so there is nothing to
       * reference. Add the real `references` once Part 2's schema lands.
       */
      institutionId: {
        type: "string",
        required: false,
      },
    },
  },
});
