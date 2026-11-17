# UniWork REST API

Base path: `/api/v1`. Responses use JSON. Validation errors and expected failures use `{ "status", "code", "message", "timestamp" }`; field values and stack traces are not returned. Page responses include `content`, zero-based `page`, `size`, `totalElements`, and `totalPages`. Maximum page size is 50.

## Authentication

`GET /api/v1/health` and GET requests under `/api/v1/public/tasks` are public. All other endpoints require a valid Clerk bearer JWT. Spring validates the issuer and signature from `CLERK_ISSUER_URI`; protected routes fail closed if it is unset. The API uses the verified JWT `sub` to find the internal user. Poster endpoints additionally require the internal `TASK_POSTER` role. Ownership mismatches return 404 so another poster's resource is not disclosed. Unauthenticated requests return 401; authenticated users with insufficient role return 403.

Task Poster role is assigned only by the profile onboarding path when the backend first links the verified Clerk subject. Profile and task request DTOs do not contain role fields.

## Task Poster profile

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/poster/profile/status` | Check onboarding completion without returning profile data |
| GET | `/api/v1/poster/profile` | Read the authenticated owner's private profile |
| PUT | `/api/v1/poster/profile` | Create or update the authenticated owner's profile and internal role link |

Profile `PUT` requires full name, street/address, Sri Lankan mobile number, valid old/new NIC format, and gender. NIC is encrypted at rest with AES-256-GCM. The API returns private profile details only to the authenticated owner. If `UNIWORK_PII_ENCRYPTION_KEY` is missing, profile persistence fails with `503 PII_ENCRYPTION_NOT_CONFIGURED`.

## Task Poster task management

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/poster/tasks/summary` | Database-backed task and pending-application counts |
| GET | `/api/v1/poster/tasks?page=0&size=10&search=&status=` | Paginated owned tasks; search and status filters are optional |
| POST | `/api/v1/poster/tasks` | Create a draft task |
| GET | `/api/v1/poster/tasks/{taskId}` | Read an owned task |
| PUT | `/api/v1/poster/tasks/{taskId}` | Edit an owned draft |
| POST | `/api/v1/poster/tasks/{taskId}/publish` | Publish an owned future-dated draft |
| POST | `/api/v1/poster/tasks/{taskId}/cancel` | Cancel an owned draft or published task |
| GET | `/api/v1/public/tasks?page=0&size=10&search=` | Public paginated published task listing for the future student app |
| GET | `/api/v1/public/tasks/{taskId}` | Read a published task |

Task amount uses decimal LKR values (`NUMERIC(12,2)` / Java `BigDecimal`). The web form sends local Sri Lanka date/time; the service converts `Asia/Colombo` to an `Instant` for UTC storage and returns Sri Lanka local time. Coordinates are numeric and validated to latitude `[-90,90]` and longitude `[-180,180]`. New tasks start as `DRAFT`; only drafts can be edited or published. Drafts and published tasks may be cancelled. Other transitions return 409.

## Applications foundation

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/poster/applications?page=0&size=10` | Paginated applications received across the authenticated poster's tasks |
| GET | `/api/v1/poster/tasks/{taskId}/applications?page=0&size=10` | Applications for one owned task |
| GET | `/api/v1/poster/applications/tasks/{taskId}?page=0&size=10` | Alternate task-scoped poster application listing |

Application list DTOs contain application/task identifiers, task title, status, and submission time only. There are no demo application records. Student submission and accept/reject operations are deferred to Prompt 4. The schema includes Pending, Accepted, Rejected, and Withdrawn states, a task/student uniqueness constraint, and a partial unique index that allows at most one accepted application per task.

## Migrations and OpenAPI

`classpath:db/migration` contains PostgreSQL-only core migrations. The optional PostGIS migration lives in `classpath:db/postgis` and is included by `SPRING_PROFILES_ACTIVE=postgis`; core APIs do not perform spatial distance queries. OpenAPI JSON is at `/v3/api-docs`, Swagger UI at `/swagger-ui/index.html` in development.
