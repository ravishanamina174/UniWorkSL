# UniWork REST API

Base path: `/api/v1`. Responses use JSON. Validation errors and expected failures use `{ "status", "code", "message", "timestamp" }`; field values and stack traces are not returned. Page responses include `content`, zero-based `page`, `size`, `totalElements`, and `totalPages`. Maximum page size is 50.

## Authentication

`GET /api/v1/health` and GET requests under `/api/v1/public/tasks` are public. All other endpoints require a valid Clerk bearer JWT. Spring validates signature, issuer, expiration, and not-before claims, and can enforce `CLERK_JWT_AUDIENCE`; it checks the token's `azp` against `CLERK_AUTHORIZED_PARTIES` when that optional claim exists. The JWKS URI defaults to the issuer's `/.well-known/jwks.json` and can be overridden by `CLERK_JWKS_URI`. Protected routes fail closed if issuer configuration is missing. The API uses the verified JWT `sub` to find the internal user. Poster endpoints additionally require the internal `TASK_POSTER` role. Ownership mismatches return 404 so another poster's resource is not disclosed. Unauthenticated requests return 401; authenticated users with insufficient role return 403.

Task Poster or Student role is assigned only by that role's profile onboarding path when the backend first links the verified Clerk subject. A linked account cannot switch roles. Profile and task request DTOs do not contain role fields.

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
| GET | `/api/v1/public/tasks?page=0&size=10&search=&minAmount=&maxAmount=` | Public paginated published task listing and amount filters for the future student app |
| GET | `/api/v1/public/tasks/{taskId}` | Read a published task |

Task amount uses decimal LKR values (`NUMERIC(12,2)` / Java `BigDecimal`). The web form sends local Sri Lanka date/time; the service converts `Asia/Colombo` to an `Instant` for UTC storage and returns Sri Lanka local time. Coordinates are numeric and validated to latitude `[-90,90]` and longitude `[-180,180]`. New tasks start as `DRAFT`; only drafts can be edited or published. Drafts and published tasks may be cancelled. Other transitions return 409.

## Student profile and task marketplace

| Method | Endpoint | Purpose |
| --- | --- | --- |
| PUT | `/api/v1/student/profile` | Create or update the authenticated Student profile |
| GET | `/api/v1/student/profile` | Read the authenticated Student's private profile |
| GET | `/api/v1/student/tasks?page=0&size=10&search=&minAmount=&maxAmount=` | Browse published tasks with paging, text and amount filters |
| GET | `/api/v1/student/tasks/{taskId}` | Read a published task or a task the Student has applied to |
| POST | `/api/v1/student/tasks/{taskId}/applications` | Apply to a published task |
| GET | `/api/v1/student/applications?page=0&size=10&status=` | List only the authenticated Student's applications |
| POST | `/api/v1/student/applications/{applicationId}/withdraw` | Withdraw a pending application |

Student address and NIC use AES-256-GCM at rest. Student profile reads are owner-only. Applicant DTOs expose name, university, and faculty to the owning poster; they never include address, phone, or NIC.

## Poster application management

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/poster/applications?page=0&size=10` | Paginated applications received across the authenticated poster's tasks |
| GET | `/api/v1/poster/tasks/{taskId}/applications?page=0&size=10` | Applications for one owned task |
| GET | `/api/v1/poster/applications/tasks/{taskId}?page=0&size=10` | Alternate task-scoped poster application listing |
| POST | `/api/v1/poster/applications/{applicationId}/accept` | Select exactly one applicant and reject other pending applicants |
| POST | `/api/v1/poster/applications/{applicationId}/reject` | Reject one pending applicant |
| GET | `/api/v1/poster/applications/tasks/{taskId}/selected` | Read the selected student's limited profile summary |

Application selection locks the task row in a transaction; the partial unique database index independently enforces one accepted application per task. New applications are serialized with selection, must target published tasks, and cannot be submitted by the poster. Withdrawn applications may be resubmitted; active duplicates are rejected.

## Task execution and feedback (Student APIs)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/student/tasks/accepted?page=0&size=10` | List the Student's accepted, started, and not-yet-completed executions |
| GET | `/api/v1/student/tasks/{taskId}/execution` | Read the authenticated Student's execution record |
| POST | `/api/v1/student/tasks/{taskId}/execution/start` | Request a four-digit start code |
| POST | `/api/v1/student/tasks/{taskId}/execution/verify-pin` | Verify `{ "pin": "1234" }`; successful PIN verification sets `STARTED` |
| POST | `/api/v1/student/tasks/{taskId}/execution/location` | Record GPS availability, permission, coordinates, and accuracy |
| POST | `/api/v1/student/tasks/{taskId}/execution/complete` | Complete task and report `{ "paymentReceived": true/false }` |
| GET | `/api/v1/student/history?page=0&size=10` | List completed execution history |
| POST | `/api/v1/student/tasks/{taskId}/review` | Submit one post-completion review and location feedback |
| POST | `/api/v1/student/tasks/{taskId}/reports` | Submit a private safety/non-payment report |
| GET | `/api/v1/student/reports?page=0&size=10` | List only the reporter's own reports |

PINs expire after five minutes and allow five attempts. The database stores only a server-keyed HMAC verification hash and random salt; a secure code is derived when needed for the owner's dashboard. The poster PIN endpoint is owner-scoped and never returns a code after success or expiry. Five failed attempts impose a cooldown until the five-minute window ends. A valid PIN changes the task to `STARTED` immediately; GPS is submitted afterward, and permission denial, unavailable GPS, or an outside-radius result is recorded without blocking the start. Distance uses the Haversine formula and a 100-meter radius. Payments remain direct; `paymentReceived: false` is recorded as unresolved, without blocking task completion.

`GET /api/v1/poster/tasks/{taskId}/execution` returns selected-student summary, temporary PIN when active, verification status, arrival result, and completion/payment status to the owning poster only. No safety reports or student private profile fields are exposed to posters.

Safety reports require an accepted task execution, are visible only to the reporter, and are not an emergency-response service. The API does not promise immediate human review.

## Migrations and OpenAPI

`classpath:db/migration` contains PostgreSQL-only core migrations through V7. V4 adds encrypted Student profiles, execution records, reviews, private safety reports, and verification-attempt audit fields. V5 constrains verification results; V6 removes the recoverable code column and retains only the HMAC and random salt; V7 adds lifecycle query indexes. The PostGIS V3 migration lives in `classpath:db/postgis` and is included by `SPRING_PROFILES_ACTIVE=postgis`; use this profile when provisioning a fresh Neon database so Flyway applies V1–V7 in order and enables the extension. MVP arrival still uses the isolated Haversine service. OpenAPI JSON is at `/v3/api-docs`, Swagger UI at `/swagger-ui/index.html` in development.
