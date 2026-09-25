"use client";

import { useState } from "react";
import { authClient } from "@/lib/authClient";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4.5 w-4.5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18A13.9 13.9 0 0 1 10.94 24c0-1.45.25-2.86.7-4.18v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

/** Real Google OAuth sign-in — calls Better Auth's social sign-in, which redirects the browser to Google when GOOGLE_CLIENT_ID/SECRET are configured server-side. */
export function GoogleSignInButton({ callbackURL }: { callbackURL: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.social({ provider: "google", callbackURL });
    if (signInError) {
      setError(signInError.message ?? "Couldn't start Google sign-in. Try email and password instead.");
      setBusy(false);
    }
    // On success the browser is redirected to Google by Better Auth's client — nothing else to do here.
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gl-ink/15 bg-gl-paper-card p-3 text-sm font-medium text-gl-ink shadow-sm shadow-black/5 transition-colors hover:bg-gl-paper disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon />
        {busy ? "Redirecting…" : "Continue with Google"}
      </button>
      {error && <p className="mt-2 text-sm text-gl-crimson">{error}</p>}
    </div>
  );
}
