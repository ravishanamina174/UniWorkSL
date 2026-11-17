import type { TaskStatus } from "@uniwork/api-contracts";

export function taskStatusLabel(status: TaskStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatLkr(amount: number): string {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 2 }).format(amount);
}

export function formatSriLankaDate(value: string): string {
  const date = new Date(/[zZ]|[+-][0-9]{2}:[0-9]{2}$/.test(value) ? value : `${value}+05:30`);
  return new Intl.DateTimeFormat("en-LK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" }).format(date);
}
