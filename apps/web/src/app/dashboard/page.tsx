import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardPage() {
  return (
    <div className="dashboard-empty-wrap">
      <header className="dashboard-page-head"><div><p className="eyebrow">TASK POSTER WORKSPACE</p><h1>Dashboard</h1><p>A clear starting point for coordinating local work.</p></div></header>
      <div className="dashboard-empty-intro"><BriefcaseBusiness size={19} aria-hidden="true" /><div><h2>Your workspace is ready to grow.</h2><p>Task publishing and application management will appear here in a later development milestone. No sample task data is shown.</p></div></div>
      <EmptyState icon={<BriefcaseBusiness size={20} aria-hidden="true" />} title="No task activity yet" description="Once task tools are available, this space will show activity from your own posted tasks and applications." action={<Link className="button button-secondary" href="/dashboard/tasks">View Posted Tasks</Link>} />
    </div>
  );
}
