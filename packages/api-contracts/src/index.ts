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
  verificationStatus: IdentityStatus;
};

export type IdentityStatus = "UNVERIFIED" | "MANUAL_REVIEW_PENDING" | "VERIFIED" | "REJECTED";
export type IdentityVerification = { status: IdentityStatus; method: "MANUAL_REVIEW" | null; verifiedAt: string | null; lastReviewStatus: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | null; lastReviewReason: string | null };

export type TaskInput = {
  title: string;
  description: string;
  amountLkr: number;
  taskDateTime: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  requiredSkills: string[];
  category?: StudentCategory;
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
  introduction: string | null;
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

export type StudentProfileInput = {
  fullName: string;
  age: number;
  gender: Gender;
  address: string;
  phoneNumber: string;
  nic: string;
  university: string;
  faculty: string;
  primaryCategory: StudentCategory;
};

export type StudentProfile = StudentProfileInput & {
  userId: string;
  createdAt: string;
  updatedAt: string;
  verificationStatus: IdentityStatus;
};
export type StudentCategory = "MOVING_PACKING" | "EVENTS_PROMOTIONS" | "TUTORING_EDUCATION" | "IT_TECH_SUPPORT" | "DESIGN_CREATIVE" | "PHOTOGRAPHY_VIDEO" | "SHOPPING_ERRANDS" | "DELIVERY_PICKUP" | "GARDENING_OUTDOOR" | "CLEANING_HOME" | "OFFICE_DATA_ENTRY" | "PET_CARE_ASSISTANCE";
export const STUDENT_CATEGORIES: ReadonlyArray<{ value: StudentCategory; label: string; slug: string }> = [
  { value: "MOVING_PACKING", label: "Moving & Packing", slug: "moving-packing" }, { value: "EVENTS_PROMOTIONS", label: "Events & Promotions", slug: "events-promotions" },
  { value: "TUTORING_EDUCATION", label: "Tutoring & Education", slug: "tutoring-education" }, { value: "IT_TECH_SUPPORT", label: "IT & Tech Support", slug: "it-tech-support" },
  { value: "DESIGN_CREATIVE", label: "Design & Creative", slug: "design-creative" }, { value: "PHOTOGRAPHY_VIDEO", label: "Photography & Video", slug: "photography-video" },
  { value: "SHOPPING_ERRANDS", label: "Shopping & Errands", slug: "shopping-errands" }, { value: "DELIVERY_PICKUP", label: "Delivery & Pickup", slug: "delivery-pickup" },
  { value: "GARDENING_OUTDOOR", label: "Gardening & Outdoor Help", slug: "gardening-outdoor" }, { value: "CLEANING_HOME", label: "Cleaning & Home Help", slug: "cleaning-home" },
  { value: "OFFICE_DATA_ENTRY", label: "Office & Data Entry", slug: "office-data-entry" }, { value: "PET_CARE_ASSISTANCE", label: "Pet Care & Assistance", slug: "pet-care-assistance" },
];

export type Availability = "WEEKENDS" | "WEEKDAYS" | "EVERY_DAY" | "AFTER_5_PM" | "HOLIDAY_FULL_TIME";
export type ProfessionalLanguage = "SINHALA" | "ENGLISH" | "TAMIL";
export type StudentProfessionalProfile = {
  profileId: string;
  professionalSummary: string | null;
  primaryLocation: string | null;
  primaryLatitude: number | null;
  primaryLongitude: number | null;
  secondaryLocation: string | null;
  secondaryLatitude: number | null;
  secondaryLongitude: number | null;
  skills: string[];
  availability: Availability[];
  languages: ProfessionalLanguage[];
  discoverable: boolean;
  updatedAt: string | null;
};
export type StudentProfessionalProfileInput = Omit<StudentProfessionalProfile, "profileId" | "updatedAt">;
export type StudentLookupCriteria = { skills: string[]; location: string | null; availability: Availability[]; languages: ProfessionalLanguage[] };
export type StudentLookupCandidate = StudentProfessionalProfile & { name: string; matchScore: number; matchReasons: string[] };
export type StudentLookupResponse = { criteria: StudentLookupCriteria; candidates: StudentLookupCandidate[] };

export type StudentTaskApplication = {
  applicationId: string;
  taskId: string;
  taskTitle: string;
  status: ApplicationStatus;
  submittedAt: string;
  studentName: string;
  university: string;
  faculty: string;
  introduction: string | null;
};

export type PinVerificationResult = {
  taskId: string;
  verified: boolean;
  locked: boolean;
  attemptsRemaining: number;
  taskStatus: TaskStatus;
  verifiedAt: string | null;
};

export type TaskReviewInput = {
  posterRating: number;
  positiveFeedback: boolean;
  reviewText?: string;
  locationFeedback?: string;
};

export type TaskReview = {
  reviewId: string;
  taskId: string;
  posterRating: number;
  positiveFeedback: boolean;
  reviewText: string | null;
  locationFeedback: string | null;
  createdAt: string;
};

export type SafetyReportCategory =
  | "UNSAFE_LOCATION"
  | "HARASSMENT"
  | "MISLEADING_TASK"
  | "NON_PAYMENT"
  | "OTHER";

export type SafetyReportInput = {
  category: SafetyReportCategory;
  description: string;
};

export type SafetyReport = SafetyReportInput & {
  reportId: string;
  taskId: string;
  status: string;
  createdAt: string;
};

export type PaymentDisputeReason = "PAYMENT_NOT_RECEIVED" | "INCORRECT_PAYMENT_AMOUNT";
export type PaymentDispute = {
  disputeId: string;
  taskId: string;
  taskTitle: string;
  studentName: string;
  posterName: string;
  agreedAmountLkr: number;
  actualAmountLkr: number | null;
  reason: PaymentDisputeReason;
  studentStatement: string;
  posterResponse: string | null;
  posterSaysPaid: boolean | null;
  status: string;
  outcome: string | null;
  createdAt: string;
  respondedAt: string | null;
  updatedAt: string;
};
