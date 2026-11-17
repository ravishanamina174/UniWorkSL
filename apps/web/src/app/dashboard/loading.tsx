import { LoadingState } from "@/components/ui/loading-state";

export default function DashboardLoading() {
  return <div className="dashboard-loading"><LoadingState label="Loading your protected workspace…" /></div>;
}
