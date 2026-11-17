export type ApiError = {
  status: number;
  code: string;
  message: string;
  timestamp: string;
};

export type HealthStatus = "UP" | "DOWN";

export type HealthResponse = {
  status: HealthStatus;
  application: "UniWork API";
  database: HealthStatus;
};

export type Gender = "FEMALE" | "MALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type UserRole = "TASK_POSTER" | "STUDENT";
export type TaskStatus = "DRAFT" | "PUBLISHED" | "ACCEPTED" | "STARTED" | "CANCELLED" | "ONGOING" | "COMPLETED" | "CLOSED";
export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type TaskPosterProfile = {
  userId: string;
  role: UserRole;
  fullName: string;
  address: string;
  phoneNumber: string;
  nic: string;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  description: string;
  amountLkr: number;
  taskDateTime: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  requiredSkills: string[];
};

export type Task = TaskInput & {
  taskId: string;
  posterId: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskSummary = {
  totalPosted: number;
  published: number;
  accepted: number;
  ongoing: number;
  completed: number;
  pendingApplications: number;
};

export type TaskApplication = {
  applicationId: string;
  taskId: string;
  taskTitle: string;
  status: ApplicationStatus;
  submittedAt: string;
  studentName: string;
  university: string;
  faculty: string;
};

export type PosterExecution = {
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  studentName: string;
  university: string;
  faculty: string;
  verificationStatus: "NOT_REQUESTED" | "PIN_PENDING" | "EXPIRED" | "VERIFIED";
  verificationPin: string | null;
  pinExpiresAt: string | null;
  startedAt: string | null;
  locationVerified: boolean | null;
  locationResult: string | null;
  locationCheckedAt: string | null;
  completedAt: string | null;
  paymentReceived: boolean | null;
};

export type StudentTaskExecution = {
  taskId: string;
  title: string;
  description: string;
  amountLkr: number;
  taskDateTime: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  requiredSkills: string[];
  status: TaskStatus;
  startRequestedAt: string | null;
  pinExpiresAt: string | null;
  pinVerifiedAt: string | null;
  startedAt: string | null;
  attemptsRemaining: number;
  locationVerified: boolean | null;
  locationResult: string | null;
  locationCheckedAt: string | null;
  completedAt: string | null;
  paymentReceived: boolean | null;
};
