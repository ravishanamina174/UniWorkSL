"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuthenticatedApi } from "./use-api";

type ProfileStatus = { completed: boolean };

export function DashboardProfileGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const api = useAuthenticatedApi();
  const [state, setState] = useState<"checking" | "ready" | "error">("checking");
  const [error, setError] = useState("The profile service could not be reached.");
  const [attempt, setAttempt] = useState(0);
  const isOnboarding = pathname === "/dashboard/onboarding";

  useEffect(() => {
    if (isOnboarding) return;
    let active = true;
    async function verifyProfile() {
      try {
        const profile = await api<ProfileStatus>("/api/v1/poster/profile/status");
        if (!active) return;
        if (!profile.completed) { router.replace("/dashboard/onboarding"); return; }
        setState("ready");
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "The profile service could not be reached.");
        setState("error");
      }
    }
    void verifyProfile();
    return () => { active = false; };
  }, [api, attempt, isOnboarding, pathname, router]);

  if (isOnboarding) return children;
  if (state === "checking") return <div className="dashboard-gate"><LoadingState label="Checking your Task Poster profile" /></div>;
  if (state === "error") return <div className="dashboard-gate"><div className="form-alert" role="alert">{error}</div><Button type="button" variant="secondary" onClick={() => { setState("checking"); setAttempt((value) => value + 1); }}>Try again</Button></div>;
  return children;
}
