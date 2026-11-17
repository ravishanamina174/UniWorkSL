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
