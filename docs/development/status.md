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

- Clerk web keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) and backend `CLERK_ISSUER_URI`.
- A stable, secret base64 32-byte `UNIWORK_PII_ENCRYPTION_KEY` for encrypted profiles and PIN protection.
- Optional restricted `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for interactive map selection; manual coordinates remain available.
- A hosted Android APK URL is optional until the student mobile app is built.

## Readiness

**READY WITH BLOCKERS**. The student API and poster workflow are implemented, but real Clerk-authenticated workflows cannot be exercised until project credentials and a stable encryption key are configured. See [local setup](local-setup.md) and [API documentation](../api/README.md).
