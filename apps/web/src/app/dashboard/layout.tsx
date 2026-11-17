import { auth, currentUser } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardConfigurationRequired, TaskPosterRoleRequired, hasClerkConfiguration, hasTaskPosterRole } from "@/components/dashboard/dashboard-access-state";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!hasClerkConfiguration()) return <DashboardConfigurationRequired />;

  await auth.protect();

  const user = await currentUser();
  if (!user || !hasTaskPosterRole(user.publicMetadata)) return <TaskPosterRoleRequired />;

  return <DashboardShell displayName={user.firstName ?? "Task Poster"}>{children}</DashboardShell>;
}
