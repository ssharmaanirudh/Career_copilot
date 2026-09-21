import { createAuthClient } from "better-auth/react";

/**
 * Browser-side auth client. No baseURL override needed — Better Auth
 * defaults to same-origin (`/api/auth/*`), which matches where
 * `src/app/api/auth/[...all]/route.ts` mounts the handler.
 */
export const authClient = createAuthClient();

export const { useSession, signIn, signUp, signOut } = authClient;
