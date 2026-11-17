import { auth, currentUser } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardConfigurationRequired, hasClerkConfiguration } from "@/components/dashboard/dashboard-access-state";
import { DashboardProfileGate } from "@/features/dashboard/dashboard-profile-gate";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!hasClerkConfiguration()) return <DashboardConfigurationRequired />;

  await auth.protect();

  const user = await currentUser();
  if (!user) return <DashboardConfigurationRequired />;

  return <DashboardShell displayName={user.firstName ?? "Task Poster"}><DashboardProfileGate>{children}</DashboardProfileGate></DashboardShell>;
}
