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
export type TaskStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "ONGOING" | "COMPLETED" | "CLOSED";
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
};
