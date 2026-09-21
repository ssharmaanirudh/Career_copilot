"use client";

import Link from "next/link";
import { useSession } from "@/lib/authClient";

/** Reactive sign-in/account link shared by both site headers — flips immediately on sign-in/out via Better Auth's session hook, no page reload needed. */
export function UserMenu() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <span className="h-9 w-20 shrink-0" aria-hidden="true" />;
  }

  if (!session) {
    return (
      <Link
        href="/signin"
        className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-gl-ink-muted transition-colors hover:text-gl-ink"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-gl-ink-muted transition-colors hover:text-gl-ink"
    >
      Account
    </Link>
  );
}
