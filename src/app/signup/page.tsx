"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { authClient } from "@/lib/authClient";

const MIN_PASSWORD_LENGTH = 8;

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/analyze";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setBusy(true);
    setError(null);

    const { error: signUpError } = await authClient.signUp.email({
      email: email.trim(),
      password,
      name: email.trim(),
    });

    if (signUpError) {
      setError(signUpError.message ?? "Couldn't create your account. Try a different email.");
      setBusy(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-gl-ink">Create an account</h1>
      <p className="mt-1 text-sm text-gl-ink-muted">
        Free — 3 gap analyses a month, resets each month.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gl-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gl-ink/15 p-3 text-sm shadow-inner shadow-black/5 transition-shadow focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gl-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gl-ink/15 p-3 text-sm shadow-inner shadow-black/5 transition-shadow focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15"
          />
          {passwordTooShort && (
            <p className="mt-1.5 text-xs text-gl-crimson">
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-gl-crimson">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="brand-gradient-bg mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-md shadow-gl-teal/25 transition-all hover:shadow-lg hover:shadow-gl-teal/35 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gl-ink-muted">
        Already have an account?{" "}
        <Link href={`/signin?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-gl-teal hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <div className="gl-page-grid flex min-h-full flex-col font-sans">
      <SiteHeader />
      <Suspense fallback={null}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
