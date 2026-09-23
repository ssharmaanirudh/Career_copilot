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

  const usagePercent = Math.min(100, Math.round((used / FREE_MONTHLY_ANALYSES) * 100));

  return (
    <div className="gl-page-grid flex min-h-full flex-col font-sans">
      <SiteHeader />
      <main className="mx-auto w-full max-w-sm flex-1 px-6 py-16">
        <h1 className="font-serif text-3xl font-semibold text-gl-ink">Your account</h1>
        <p className="mt-1 text-sm text-gl-ink-muted">Manage your sign-in and see your usage this month.</p>

        <div className="mt-6 divide-y divide-gl-ink/10 rounded-2xl border border-gl-ink/10 bg-gl-paper-card shadow-sm shadow-black/5">
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">Email</p>
            <p className="mt-1 text-sm font-medium text-gl-ink">{session.user.email}</p>
          </div>

          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">
              Analyses this month
            </p>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gl-teal">{used}</span>
              <span className="text-sm text-gl-ink-muted">of {FREE_MONTHLY_ANALYSES} used</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gl-teal/15">
              <div
                className="h-full rounded-full bg-gl-teal transition-[width]"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gl-ink-faint">
              {remaining} remaining — resets on the 1st of each month.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
