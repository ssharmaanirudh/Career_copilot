"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthSidePanel } from "@/components/AuthSidePanel";
import { SparkleMark } from "@/components/DecorativeMarks";
import { authClient } from "@/lib/authClient";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/analyze";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email({
      email: email.trim(),
      password,
      rememberMe: staySignedIn,
    });

    if (signInError) {
      setError(signInError.message ?? "Couldn't sign you in. Check your email and password.");
      setBusy(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-14">
      <div className="mx-auto w-full max-w-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gl-teal-bg px-3 py-1 text-xs font-semibold text-gl-teal">
          <SparkleMark className="h-3 w-3" />
          AI-powered career copilot
        </span>

        <h1 className="font-serif mt-4 text-3xl font-semibold text-gl-ink">Sign in</h1>
        <p className="mt-1 text-sm text-gl-ink-muted">Sign in to run a gap analysis.</p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4 rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5"
        >
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gl-ink/15 p-3 text-sm shadow-inner shadow-black/5 transition-shadow focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gl-ink-muted">
            <input
              type="checkbox"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
              className="h-4 w-4 rounded border-gl-ink/30 text-gl-teal focus:ring-gl-teal/40"
            />
            Stay signed in on this device
          </label>

          {error && <p className="text-sm text-gl-crimson">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="brand-gradient-bg mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-md shadow-gl-teal/25 transition-all hover:shadow-lg hover:shadow-gl-teal/35 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gl-ink-muted">
          Don&apos;t have an account?{" "}
          <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-gl-teal hover:underline">
            Create one
          </Link>
        </p>
      </div>

      <AuthSidePanel />
    </main>
  );
}

export default function SignInPage() {
  return (
    <div className="gl-page-grid flex min-h-full flex-col font-sans">
      <SiteHeader />
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
