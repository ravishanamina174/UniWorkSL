"use client";

import { Activity } from "lucide-react";
import { HealthStatus } from "@/features/health/health-status";

export function DevelopmentHealthDiagnostic() {
  return <aside className="dev-diagnostic" aria-label="Development-only backend connectivity"><div className="dev-diagnostic-heading"><Activity size={15} aria-hidden="true" /><span>DEV DIAGNOSTIC</span></div><HealthStatus /></aside>;
}
