import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { hasClerkConfiguration } from "@/lib/clerk-config";

export function DashboardConfigurationRequired() {
  return (
    <main className="dashboard-config">
      <section className="dashboard-config-panel" aria-labelledby="dashboard-setup-title">
        <span className="empty-state-icon"><LockKeyhole size={21} aria-hidden="true" /></span>
        <p className="eyebrow">TASK POSTER DASHBOARD</p>
        <h1 id="dashboard-setup-title">Dashboard access is not configured yet.</h1>
        <p>Protected access stays unavailable until both Clerk keys are set. Configure <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code>CLERK_SECRET_KEY</code> in <code>apps/web/.env.local</code>, then restart the web app.</p>
        <Link className="button button-secondary" href="/#top"><ArrowLeft size={16} aria-hidden="true" /> Back to UniWork</Link>
      </section>
    </main>
  );
}

export { hasClerkConfiguration };
