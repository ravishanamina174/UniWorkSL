# UniWork implementation status

Prompts 1–4 retain the public site and Task Poster dashboard foundation and add poster/student profile APIs, task management, applications, task execution, reviews, and private safety reports. The Expo project remains uninitialized as required.

## Prompt 4 verification

- Maven `verify` passes 25 tests. API contracts build, ESLint, TypeScript, Vitest (13 tests), and the Next.js production build pass.
- PostgreSQL 16 applied the available default migrations through V6; Hibernate validated the complete mapped schema. The filtered published-task browse query returned HTTP 200 against the live database.
- Protected student and poster API endpoints return 401 without a Clerk bearer token. Clerk is not configured in this environment, so real sign-in and authenticated database-backed business workflows have not been verified.
- No sample users, tasks, applications, reports, or payments were inserted.
- PostGIS remains uninstalled. Arrival checks use an isolated Haversine calculation with a 100-meter threshold; denied or unavailable location is recorded as not verified and does not block an already PIN-verified start.

## Lifecycle and data protection

- Application acceptance serializes on the task row, closes other pending applications, and has a partial unique database index as a second one-selected-student safeguard.
- Student and Task Poster roles are bound to the first role-specific profile created for the verified Clerk subject; roles cannot be switched.
- Student addresses and NIC values are AES-GCM encrypted. Start PIN validation uses a keyed HMAC plus random salt; no plaintext or reversible PIN is stored, and only the authorized poster receives a derived code while active.
- Payments remain direct between users. The API stores the student's completion and payment report; unpaid completion remains marked unresolved and can be reported.
- Safety reports are private to the submitting student. The API does not promise immediate human response.

## External configuration still needed

- Clerk web keys are present in ignored `apps/web/.env.local` and the real Clerk development sign-in/sign-up components render. A test account/session and backend `CLERK_ISSUER_URI` are still needed to verify JWT acceptance and the signed-in workflow.
- A stable, secret base64 32-byte `UNIWORK_PII_ENCRYPTION_KEY` is still needed by the backend. Preserve the existing key if encrypted profiles or PINs have ever been stored.
- Neon direct connection host, database, username, and password are not configured. Spring Boot now expects them and enforces JDBC SSL rather than falling back to localhost.
- Optional restricted `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for interactive map selection; manual coordinates remain available.
- A hosted Android APK URL is optional until the student mobile app is built.

## Readiness

**READY WITH BLOCKERS**. The student API and poster workflow are implemented. The local PostgreSQL `uniwork` database remains intact; read-only inspection found no business rows, Flyway through V6, and no PostGIS extension. Real Neon persistence, PostGIS, and Clerk-authenticated API workflows remain unverified until the missing backend credentials and test identity are configured. See [local setup](local-setup.md), [Neon and Clerk verification](neon-clerk-verification.md), and [API documentation](../api/README.md).
