"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, BriefcaseBusiness, CalendarDays, MapPin, Plus, Search } from "lucide-react";
import type { PageResponse, Task, TaskApplication, TaskStatus, TaskSummary } from "@uniwork/api-contracts";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { ApiRequestError } from "@/services/api-client";
import { useAuthenticatedApi } from "./use-api";
import { formatLkr, formatSriLankaDate, taskStatusLabel } from "./task-ui";
import { TaskForm } from "./task-form";

const statuses: Array<TaskStatus | ""> = ["", "DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED", "CLOSED"];

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={`status-${status.toLowerCase()}`}>{taskStatusLabel(status)}</Badge>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="dashboard-page-head"><div>{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h1>{title}</h1>{description ? <p>{description}</p> : null}</div>{action}</header>;
}

export function DashboardHomePage() {
  const api = useAuthenticatedApi();
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void api<TaskSummary>("/api/v1/poster/tasks/summary").then((data) => { if (active) setSummary(data); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Workspace summary could not be loaded."); });
    return () => { active = false; };
  }, [api, attempt]);
  if (error) return <div className="dashboard-content-stack"><PageHeader eyebrow="TASK POSTER WORKSPACE" title="Dashboard" description="A current view of your task activity." /><div className="form-alert" role="alert">{error}</div><Button variant="secondary" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>Try again</Button></div>;
  if (!summary) return <LoadingState label="Loading your dashboard" />;
  const metrics = [
    { label: "Total posted", value: summary.totalPosted }, { label: "Published", value: summary.published }, { label: "Ongoing", value: summary.ongoing }, { label: "Completed", value: summary.completed }, { label: "Pending applications", value: summary.pendingApplications },
  ];
  return <div className="dashboard-content-stack"><PageHeader eyebrow="TASK POSTER WORKSPACE" title="Dashboard" description="A current view of your task activity." action={<ButtonLink href="/dashboard/tasks/new"><Plus size={16} /> Create task</ButtonLink>} />
    <section className="metric-grid" aria-label="Task summary">{metrics.map((metric) => <article className="metric-panel" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</section>
    <section className="dashboard-section"><div className="dashboard-section-head"><div><h2>Get started</h2><p>Manage tasks and review student applications from your workspace.</p></div></div><div className="quick-actions"><Link href="/dashboard/tasks"><BriefcaseBusiness size={18} /><span><strong>View posted tasks</strong><small>Open your task list</small></span><ArrowRight size={16} /></Link><Link href="/dashboard/applications"><CalendarDays size={18} /><span><strong>Review applications</strong><small>{summary.pendingApplications} pending</small></span><ArrowRight size={16} /></Link></div></section>
  </div>;
}

export function PostedTasksPage() {
  const api = useAuthenticatedApi();
  const [result, setResult] = useState<PageResponse<Task> | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [page, setPage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(page), size: "10" });
    if (appliedSearch) params.set("search", appliedSearch);
    if (status) params.set("status", status);
    void api<PageResponse<Task>>(`/api/v1/poster/tasks?${params}`).then((data) => {
      if (active) { setResult(data); setError(""); }
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Tasks could not be loaded.");
    });
    return () => { active = false; };
  }, [api, appliedSearch, status, page, attempt]);
  return <div className="dashboard-content-stack"><PageHeader eyebrow="TASK MANAGEMENT" title="Posted Tasks" description="Search and manage the tasks you have created." action={<ButtonLink href="/dashboard/tasks/new"><Plus size={16} /> Create task</ButtonLink>} />
    <form className="task-filter-bar" onSubmit={(event) => { event.preventDefault(); setPage(0); setAppliedSearch(search.trim()); }}><label className="search-field"><span className="sr-only">Search tasks</span><Search size={16} aria-hidden="true" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your tasks" /></label><label className="filter-field"><span className="sr-only">Filter by status</span><select className="ui-input" value={status} onChange={(event) => { setStatus(event.target.value as TaskStatus | ""); setPage(0); }}><option value="">All statuses</option>{statuses.slice(1).map((value) => <option key={value} value={value}>{taskStatusLabel(value as TaskStatus)}</option>)}</select></label><Button type="submit" variant="secondary">Search</Button></form>
    {error ? <div className="form-alert" role="alert">{error} <button className="text-button" type="button" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>Try again</button></div> : null}
    {!result && !error ? <LoadingState label="Loading posted tasks" /> : null}
    {result && result.content.length === 0 ? <EmptyState icon={<BriefcaseBusiness size={20} />} title="No tasks found" description={appliedSearch || status ? "Try changing your search or filters." : "Tasks you create will appear here."} action={<ButtonLink href="/dashboard/tasks/new"><Plus size={16} /> Create task</ButtonLink>} /> : null}
    {result && result.content.length > 0 ? <><div className="task-list" aria-label="Posted tasks">{result.content.map((task) => <article className="task-row" key={task.taskId}><div className="task-row-main"><div className="task-row-heading"><Link href={`/dashboard/tasks/${task.taskId}`}><h2>{task.title}</h2></Link><TaskStatusBadge status={task.status} /></div><p className="task-row-meta"><span>{formatLkr(task.amountLkr)}</span><span><CalendarDays size={14} /> {formatSriLankaDate(task.taskDateTime)}</span><span><MapPin size={14} /> {task.locationAddress}</span></p><div className="skill-list">{task.requiredSkills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div></div><Link className="task-row-link" href={`/dashboard/tasks/${task.taskId}`} aria-label={`View ${task.title}`}><ArrowRight size={17} /></Link></article>)}</div><div className="pagination-bar"><span>{result.totalElements} task{result.totalElements === 1 ? "" : "s"}</span><div><Button variant="secondary" type="button" disabled={page <= 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</Button><span>Page {result.page + 1} of {Math.max(result.totalPages, 1)}</span><Button variant="secondary" type="button" disabled={page + 1 >= result.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div></> : null}
  </div>;
}

export function CreateTaskPage() {
  return <div className="dashboard-content-stack"><PageHeader eyebrow="TASK MANAGEMENT" title="Create a task" description="Save as a draft or publish when the details are ready." /><TaskForm /></div>;
}

export function TaskDetailsPage() {
  const params = useParams<{ taskId: string }>();
  const api = useAuthenticatedApi();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void api<Task>(`/api/v1/poster/tasks/${params.taskId}`).then((value) => { if (active) setTask(value); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Task could not be loaded."); });
    return () => { active = false; };
  }, [api, params.taskId]);
  async function performAction(action: "publish" | "cancel") {
    if (!task) return;
    setBusy(true); setError("");
    try { setTask(await api<Task>(`/api/v1/poster/tasks/${task.taskId}/${action}`, { method: "POST" })); setCancelOpen(false); router.refresh(); }
    catch (cause) { setError(cause instanceof ApiRequestError ? cause.message : cause instanceof Error ? cause.message : "The task could not be updated."); }
    finally { setBusy(false); }
  }
  if (error && !task) return <div className="form-alert" role="alert">{error}</div>;
  if (!task) return <LoadingState label="Loading task details" />;
  const canEdit = task.status === "DRAFT";
  const canCancel = task.status === "DRAFT" || task.status === "PUBLISHED";
  return <div className="dashboard-content-stack"><PageHeader eyebrow="TASK DETAILS" title={task.title} description="Review the current task information and status." action={<TaskStatusBadge status={task.status} />} />
    {error ? <div className="form-alert" role="alert">{error}</div> : null}
    <section className="form-section"><div className="form-section-heading"><h2>Task information</h2></div><dl className="profile-details"><div><dt>Amount</dt><dd>{formatLkr(task.amountLkr)}</dd></div><div><dt>Date and time · Sri Lanka</dt><dd>{formatSriLankaDate(task.taskDateTime)}</dd></div><div className="profile-detail-full"><dt>Description</dt><dd>{task.description}</dd></div><div className="profile-detail-full"><dt>Required skills</dt><dd><span className="skill-list">{task.requiredSkills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</span></dd></div><div className="profile-detail-full"><dt>Location</dt><dd>{task.locationAddress}<small className="coordinate-line">{task.latitude}, {task.longitude}</small></dd></div></dl></section>
    <div className="form-actions task-detail-actions"><ButtonLink href={`/dashboard/tasks/${task.taskId}/applications`} variant="secondary">View applications</ButtonLink>{canEdit ? <ButtonLink href={`/dashboard/tasks/${task.taskId}/edit`} variant="secondary">Edit draft</ButtonLink> : null}{canEdit ? <Button disabled={busy} onClick={() => void performAction("publish")}>Publish task</Button> : null}{canCancel ? <Button variant="secondary" disabled={busy} onClick={() => setCancelOpen(true)}>Cancel task</Button> : null}<ButtonLink href="/dashboard/tasks" variant="secondary">Back to tasks</ButtonLink></div>
    <Dialog open={cancelOpen} title="Cancel this task?" onClose={() => setCancelOpen(false)}><p>This task will no longer be available to students. You can’t undo this action.</p><div className="form-actions"><Button variant="secondary" onClick={() => setCancelOpen(false)}>Keep task</Button><Button className="button-danger" disabled={busy} onClick={() => void performAction("cancel")}>Cancel task</Button></div></Dialog>
  </div>;
}

export function EditTaskPage() {
  const params = useParams<{ taskId: string }>();
  const api = useAuthenticatedApi();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void api<Task>(`/api/v1/poster/tasks/${params.taskId}`).then((value) => { if (active) setTask(value); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Task could not be loaded."); });
    return () => { active = false; };
  }, [api, params.taskId]);
  if (error) return <div className="form-alert" role="alert">{error}</div>;
  if (!task) return <LoadingState label="Loading task" />;
  if (task.status !== "DRAFT") return <div className="form-alert" role="status">Only a draft can be edited. <Link href={`/dashboard/tasks/${task.taskId}`}>Return to task</Link></div>;
  return <div className="dashboard-content-stack"><PageHeader eyebrow="TASK MANAGEMENT" title="Edit draft" description="Update the details before publishing." /><TaskForm initial={task} taskId={task.taskId} /></div>;
}

function ApplicationsTable({ rows }: { rows: TaskApplication[] }) {
  return <div className="application-list">{rows.map((application) => <article className="application-row" key={application.applicationId}><div><Link href={`/dashboard/tasks/${application.taskId}`}><strong>{application.taskTitle}</strong></Link><span>Submitted {formatSriLankaDate(application.submittedAt)}</span></div><Badge className={`status-${application.status.toLowerCase()}`}>{application.status.charAt(0) + application.status.slice(1).toLowerCase()}</Badge></article>)}</div>;
}

export function ApplicationsPage({ taskId }: { taskId?: string }) {
  const api = useAuthenticatedApi();
  const [result, setResult] = useState<PageResponse<TaskApplication> | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  useEffect(() => {
    let active = true;
    const endpoint = taskId ? `/api/v1/poster/tasks/${taskId}/applications` : "/api/v1/poster/applications";
    void api<PageResponse<TaskApplication>>(`${endpoint}?page=${page}&size=10`).then((value) => { if (active) setResult(value); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Applications could not be loaded."); });
    return () => { active = false; };
  }, [api, page, taskId]);
  if (error) return <div className="form-alert" role="alert">{error}</div>;
  if (!result) return <LoadingState label="Loading applications" />;
  return <div className="dashboard-content-stack"><PageHeader eyebrow="TASK MANAGEMENT" title={taskId ? "Task applications" : "Applications"} description="Applications received for your posted tasks." />
    {result.content.length ? <><ApplicationsTable rows={result.content} /><div className="pagination-bar"><span>{result.totalElements} application{result.totalElements === 1 ? "" : "s"}</span><div><Button variant="secondary" disabled={page <= 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</Button><span>Page {result.page + 1} of {Math.max(1, result.totalPages)}</span><Button variant="secondary" disabled={page + 1 >= result.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div></> : <EmptyState icon={<ArrowDown size={20} />} title="No applications yet" description="When students apply to your published tasks, their applications will appear here." />}
  </div>;
}

export function TaskApplicationsPage() {
  const params = useParams<{ taskId: string }>();
  return <ApplicationsPage taskId={params.taskId} />;
}
