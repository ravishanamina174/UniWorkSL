import type {
  ApiError as ApiErrorBody,
  PageResponse,
  PinVerificationResult,
  SafetyReport,
  SafetyReportInput,
  StudentProfile,
  StudentProfileInput,
  IdentityVerification,
  StudentProfessionalProfile,
  StudentProfessionalProfileInput,
  StudentTaskApplication,
  StudentTaskExecution,
  Task,
  TaskReview,
  TaskReviewInput,
  PaymentDispute,
  PaymentDisputeReason,
} from '@uniwork/api-contracts';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

type TokenGetter = () => Promise<string | null>;
type Fetcher = typeof fetch;

export class UniWorkApi {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken: TokenGetter,
    private readonly onUnauthorized?: () => Promise<void> | void,
    private readonly fetcher: Fetcher = fetch,
  ) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    if (!token) {
      await this.onUnauthorized?.();
      throw new ApiRequestError('Your session has ended. Sign in again to continue.', 401, 'UNAUTHENTICATED');
    }

    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    headers.set('Authorization', `Bearer ${token}`);
    if (init.body !== undefined && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

    let response: Response;
    try {
      response = await this.fetcher(`${this.baseUrl}${path}`, { ...init, headers });
    } catch {
      throw new ApiRequestError('The UniWork server could not be reached. Check that the deployed API is running and try again.', 0, 'NETWORK_ERROR');
    }

    if (!response.ok) {
      let body: Partial<ApiErrorBody> = {};
      try {
        body = (await response.json()) as Partial<ApiErrorBody>;
      } catch {
        // The API may return an empty or non-JSON error response.
      }
      if (response.status === 401) await this.onUnauthorized?.();
      throw new ApiRequestError(
        body.code && body.message ? body.message : defaultMessage(response.status, path),
        response.status,
        body.code || `HTTP_${response.status}`,
      );
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  getProfile = () => this.request<StudentProfile>('/api/v1/student/profile');
  getIdentity = () => this.request<IdentityVerification>('/api/v1/student/identity');
  submitIdentity = (asset: { uri: string; fileName?: string | null; mimeType?: string | null }) => {
    const form = new FormData();
    form.append('image', { uri: asset.uri, name: asset.fileName || 'nic.jpg', type: asset.mimeType || 'image/jpeg' } as unknown as Blob);
    return this.request<IdentityVerification>('/api/v1/student/identity/reviews', { method: 'POST', body: form });
  };
  saveProfile = (input: StudentProfileInput) => this.request<StudentProfile>('/api/v1/student/profile', json('PUT', input));
  getProfessionalProfile = () => this.request<StudentProfessionalProfile>('/api/v1/student/professional-profile');
  saveProfessionalProfile = (input: StudentProfessionalProfileInput) => this.request<StudentProfessionalProfile>('/api/v1/student/professional-profile', json('PUT', input));

  listTasks = (page: number, search: string, minAmount?: number, maxAmount?: number, date?: string, latitude?: number, longitude?: number) => {
    const params = new URLSearchParams({ page: String(page), size: '10' });
    if (search.trim()) params.set('search', search.trim());
    if (minAmount !== undefined) params.set('minAmount', String(minAmount));
    if (maxAmount !== undefined) params.set('maxAmount', String(maxAmount));
    if (date) params.set('date', date);
    if (latitude !== undefined && longitude !== undefined) { params.set('latitude', String(latitude)); params.set('longitude', String(longitude)); }
    return this.request<PageResponse<Task>>(`/api/v1/student/tasks?${params.toString()}`);
  };
  getTask = (taskId: string) => this.request<Task>(`/api/v1/student/tasks/${taskId}`);
  applyForTask = (taskId: string, introduction = 'I can help with this task and will follow the agreed schedule.') => this.request<StudentTaskApplication>(`/api/v1/student/tasks/${taskId}/applications`, { method: 'POST', body: JSON.stringify({ introduction }) });
  listApplications = (page = 0) => this.request<PageResponse<StudentTaskApplication>>(`/api/v1/student/applications?page=${page}&size=50`);
  withdrawApplication = (applicationId: string) => this.request<StudentTaskApplication>(`/api/v1/student/applications/${applicationId}/withdraw`, { method: 'POST' });
  listAcceptedTasks = (page = 0) => this.request<PageResponse<StudentTaskExecution>>(`/api/v1/student/tasks/accepted?page=${page}&size=50`);
  listHistory = (page = 0) => this.request<PageResponse<StudentTaskExecution>>(`/api/v1/student/history?page=${page}&size=50`);
  getExecution = (taskId: string) => this.request<StudentTaskExecution>(`/api/v1/student/tasks/${taskId}/execution`);
  requestStart = (taskId: string) => this.request<StudentTaskExecution>(`/api/v1/student/tasks/${taskId}/execution/start`, { method: 'POST' });
  verifyPin = (taskId: string, pin: string) => this.request<PinVerificationResult>(`/api/v1/student/tasks/${taskId}/execution/verify-pin`, json('POST', { pin }));
  checkLocation = (taskId: string, request: { permissionGranted: boolean; locationAvailable: boolean; latitude?: number; longitude?: number; accuracyMeters?: number }) =>
    this.request<StudentTaskExecution>(`/api/v1/student/tasks/${taskId}/execution/location`, json('POST', request));
  completeTask = (taskId: string, paymentReceived: boolean) =>
    this.request<StudentTaskExecution>(`/api/v1/student/tasks/${taskId}/execution/complete`, json('POST', { paymentReceived }));
  createSafeTask = (taskId: string) => this.request<{ token: string }>(`/api/v1/student/tasks/${taskId}/safetask`, { method: 'POST' });
  getSafeTask = (taskId: string) => this.request<{ status: string; expiresAt: string | null; lastUpdatedAt: string | null }>(`/api/v1/student/tasks/${taskId}/safetask`);
  updateSafeTaskLocation = (taskId: string, latitude: number, longitude: number, accuracyMeters?: number) =>
    this.request<{ status: string }>(`/api/v1/student/tasks/${taskId}/safetask/location`, json('POST', { latitude, longitude, accuracyMeters }));
  stopSafeTask = (taskId: string) => this.request<{ status: string; expiresAt: string | null }>(`/api/v1/student/tasks/${taskId}/safetask`, { method: 'DELETE' });
  submitReview = (taskId: string, input: TaskReviewInput) => this.request<TaskReview>(`/api/v1/student/tasks/${taskId}/review`, json('POST', input));
  submitReport = (taskId: string, input: SafetyReportInput) => this.request<SafetyReport>(`/api/v1/student/tasks/${taskId}/reports`, json('POST', input));
  listDirectTasks = () => this.request<DirectTask[]>('/api/v1/student/direct-tasks');
  actOnDirectTask = (directTaskId: string, action: 'ACCEPT' | 'DECLINE' | 'COUNTER', proposedAmount?: number) =>
    this.request<DirectTask>(`/api/v1/student/direct-tasks/${directTaskId}/action`, json('POST', { action, proposedAmount }));
  listPaymentDisputes = (taskId: string) => this.request<PaymentDispute[]>(`/api/v1/student/tasks/${taskId}/payment-disputes`);
  filePaymentDispute = (taskId: string, input: { reason: PaymentDisputeReason; actualAmountLkr?: number; statement: string }) =>
    this.request<PaymentDispute>(`/api/v1/student/tasks/${taskId}/payment-disputes`, json('POST', input));
};

function json(method: string, value: unknown): RequestInit {
  return { method, body: JSON.stringify(value) };
}

export type DirectTask = { directTaskId: string; posterName: string; studentName: string; description: string; scheduledAt: string; amountLkr: number; locationAddress: string; status: string; counterAmountLkr?: number | null; taskId?: string | null };

function defaultMessage(status: number, path = ''): string {
  if (status === 403) return 'This account cannot use the Student app. UniWork roles cannot be switched.';
  if (status === 404 && path.includes('/safetask')) return 'SafeTask is not available on the configured server yet. Deploy the backend SafeTask changes, then try again.';
  if (status === 404) return 'We could not find that profile or task.';
  if (status === 409) return 'This action is no longer available for the current task status.';
  if (status === 429) return 'Too many attempts. Wait a little and try again.';
  if (status >= 500) return 'UniWork is temporarily unavailable. Please try again shortly.';
  return 'Please check your details and try again.';
}
