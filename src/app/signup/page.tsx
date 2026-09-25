"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthSidePanel } from "@/components/AuthSidePanel";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { SparkleMark } from "@/components/DecorativeMarks";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/FormIcons";
import { authClient } from "@/lib/authClient";

const MIN_PASSWORD_LENGTH = 8;

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/analyze";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-14">
      <div className="mx-auto w-full max-w-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gl-teal-bg px-3 py-1 text-xs font-semibold text-gl-teal">
          <SparkleMark className="h-3 w-3" />
          AI-powered career copilot
        </span>

        <h1 className="font-serif mt-4 text-3xl font-semibold text-gl-ink sm:text-4xl">
          Your next opportunity{" "}
          <span className="relative inline-block text-gl-teal">
            starts here.
            <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gl-teal" aria-hidden="true" />
          </span>
        </h1>
        <p className="mt-2 text-sm text-gl-ink-muted">
          Free — 3 gap analyses a month, resets each month.
        </p>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5">
          <GoogleSignInButton callbackURL={redirectTo} />

          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-gl-ink-faint">
            <span className="h-px flex-1 bg-gl-ink/10" />
            or
            <span className="h-px flex-1 bg-gl-ink/10" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gl-ink">
                Email address
              </label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gl-ink-faint" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gl-ink/15 p-3 pl-10 text-sm shadow-inner shadow-black/5 transition-shadow focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gl-ink">
                Password
              </label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gl-ink-faint" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gl-ink/15 p-3 pl-10 pr-10 text-sm shadow-inner shadow-black/5 transition-shadow focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gl-ink-faint transition-colors hover:text-gl-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
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
              className="brand-gradient-bg group mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-md shadow-gl-teal/25 transition-all hover:shadow-lg hover:shadow-gl-teal/35 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gl-ink-muted">
          Already have an account?{" "}
          <Link href={`/signin?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-gl-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <AuthSidePanel />
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
