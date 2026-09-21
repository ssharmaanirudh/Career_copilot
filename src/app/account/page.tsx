import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SignOutButton } from "@/components/SignOutButton";
import { getServerSession } from "@/lib/session";
import { FREE_MONTHLY_ANALYSES, getMonthlyUsageCount } from "@/lib/quota";

export default async function AccountPage() {
  const session = await getServerSession(await headers());
  if (!session) {
    redirect("/signin?redirect=/account");
  }

  const used = await getMonthlyUsageCount(session.user.id);
  const remaining = Math.max(0, FREE_MONTHLY_ANALYSES - used);

  return (
    <div className="gl-page-grid flex min-h-full flex-col font-sans">
      <SiteHeader />
      <main className="mx-auto w-full max-w-sm flex-1 px-6 py-16">
        <h1 className="font-serif text-2xl font-semibold text-gl-ink">Account</h1>

        <div className="mt-6 rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-5 shadow-sm shadow-black/5">
          <p className="text-xs font-medium uppercase tracking-wide text-gl-ink-faint">Email</p>
          <p className="mt-1 text-sm text-gl-ink">{session.user.email}</p>
        </div>

        <div className="mt-4 rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-5 shadow-sm shadow-black/5">
          <p className="text-xs font-medium uppercase tracking-wide text-gl-ink-faint">
            Analyses this month
          </p>
          <p className="mt-1 text-sm text-gl-ink">
            {used} of {FREE_MONTHLY_ANALYSES} used — {remaining} remaining
          </p>
          <p className="mt-1 text-xs text-gl-ink-faint">Resets on the 1st of each month.</p>
        </div>

        <div className="mt-6">
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
