"use client";

import { useEffect, useState } from "react";
import type { HealthResponse } from "@uniwork/api-contracts";
import { ApiRequestError, apiRequest } from "@/services/api-client";

type State = { kind: "loading" } | { kind: "unavailable"; message: string } | { kind: "ready"; data: HealthResponse };

export function HealthStatus() {
  const [state, setState] = useState<State>({ kind: "loading" });
  useEffect(() => {
    let active = true;
    apiRequest<HealthResponse>("/api/v1/health")
      .then((data) => { if (active) setState(data.status === "UP" && data.database === "UP" ? { kind: "ready", data } : { kind: "unavailable", message: "The API is responding, but its database is unavailable." }); })
      .catch((error: unknown) => { if (active) setState({ kind: "unavailable", message: error instanceof ApiRequestError ? error.message : "The UniWork API is unavailable." }); });
    return () => { active = false; };
  }, []);

  if (state.kind === "loading") return <p role="status" className="text-sm text-[var(--muted)]">Checking live API status…</p>;
  if (state.kind === "unavailable") return <div role="status" className="border-l-2 border-[var(--error)] pl-3 text-sm"><p className="font-medium">API unavailable</p><p className="mt-1 text-[var(--muted)]">{state.message}</p></div>;
  return <div role="status" className="border-l-2 border-[var(--success)] pl-3 text-sm"><p className="font-medium">API connected</p><p className="mt-1 text-[var(--muted)]">{state.data.application} and database are up.</p></div>;
}
