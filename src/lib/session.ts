import { auth } from "./auth";

export type ServerSession = Awaited<ReturnType<typeof auth.api.getSession>>;

/** Server-side session lookup for API routes and server components — validates against the DB, unlike the cookie-presence check in middleware.ts. */
export async function getServerSession(headers: Headers): Promise<ServerSession> {
  return auth.api.getSession({ headers });
}
