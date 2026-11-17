import { ArrowUpRight, FolderOpen } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

const sectionTitles: Record<string, string> = {
  tasks: "Posted Tasks",
  applications: "Applications",
  profile: "Profile",
  new: "Create Task",
  start: "Task Start",
};

export default async function DashboardSectionPage({ params }: { params: Promise<{ section: string[] }> }) {
  const { section } = await params;
  const lastSegment = section.at(-1) ?? "";
  const title = sectionTitles[lastSegment] ?? (section.includes("applications") ? "Applications" : "Task Details");
  return (
    <div className="dashboard-empty-wrap">
      <header className="dashboard-page-head"><div><p className="eyebrow">TASK POSTER WORKSPACE</p><h1>{title}</h1><p>This dashboard area is part of the shared workspace foundation.</p></div></header>
      <EmptyState icon={<FolderOpen size={20} aria-hidden="true" />} title={`${title} tools are coming in a later milestone`} description="This route is prepared for future task management. It does not contain mock records or actions yet." action={<Link className="button button-secondary" href="/dashboard">Return to Dashboard <ArrowUpRight size={15} aria-hidden="true" /></Link>} />
    </div>
  );
}
