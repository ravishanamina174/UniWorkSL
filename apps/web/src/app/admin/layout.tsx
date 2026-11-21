import { auth, currentUser } from "@clerk/nextjs/server";
import { DashboardConfigurationRequired, hasClerkConfiguration } from "@/components/dashboard/dashboard-access-state";
import { AdminShell } from "@/features/admin/admin-shell";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!hasClerkConfiguration()) return <DashboardConfigurationRequired />;
  await auth.protect();
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "Admin") return <main className="admin-denied"><h1>Access denied</h1><p>This workspace is available only to assigned UniWorkSL safety administrators.</p></main>;
  return <AdminShell name={user.firstName || "Administrator"}>{children}</AdminShell>;
}
