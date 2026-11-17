# Local development

## Requirements

Java 21, Node.js 20.9+ (22 LTS recommended), pnpm 9+, and access to the UniWork Neon PostgreSQL project. Docker, Docker Compose, and Testcontainers are not used. The backend no longer defaults to a local PostgreSQL server.

## PostgreSQL and migrations

Copy `backend/.env.example` to `backend/.env` and replace the placeholders with the Neon project's **direct** connection host, database, username, and password. Keep this ignored file private. The JDBC URL must include `?sslmode=require`; use the direct `ep-...neon.tech` endpoint, not the `-pooler` endpoint. Do not put credentials in the URL. Spring Boot imports `backend/.env` as properties when launched from the `backend` directory; shell environment variables override file values. It fails at startup when required database variables are missing. The same variables can instead be supplied by the process environment or deployment secret manager.

Activate the `postgis` profile on the first backend startup against a new Neon database (`SPRING_PROFILES_ACTIVE=postgis ./mvnw spring-boot:run`). Flyway then applies the core V1–V2 migrations, the existing PostGIS V3 migration (`CREATE EXTENSION IF NOT EXISTS postgis`), and V4–V7 in version order. This profile must remain active on future starts so Flyway can resolve its history. The V3 migration can only run if the Neon role has permission to create the extension. `ddl-auto=validate` checks the mapped schema at startup; Flyway and Hibernate must both complete successfully before using the database. Never disable Flyway for normal operation.

Before applying migrations to any non-empty database, inspect its Flyway history and schema with read-only queries and take a Neon backup/restore point. If it already contains UniWork tables, do not baseline, repair, drop, or overwrite it without reviewing its migration history and data. If the existing data is from the stopped local PostgreSQL database, preserve it and plan a separate export/import; switching the URL does not migrate local rows. A blank or unverified target is not permission to discard data.

Verify the extension after startup using `SELECT PostGIS_Version();`. The application deliberately continues to use the tested Haversine implementation; enabling the extension does not change task-location behavior or add spatial queries.

## Clerk and PII encryption

Configure `CLERK_ISSUER_URI` to the exact Clerk issuer for the instance that issued the web session tokens. Spring Security validates signature, issuer, and time claims using the configured JWKS endpoint (`CLERK_JWKS_URI`, defaulting to the issuer's `/.well-known/jwks.json`). Set `CLERK_JWT_AUDIENCE` when the Clerk session JWT template includes an API audience; set `CLERK_AUTHORIZED_PARTIES` to the allowed web origins to validate `azp` when present. If the issuer is empty, protected API routes fail closed. In `apps/web/.env.local`, set both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. The dashboard remains unavailable until both are set. Sign-up is configured for Task Posters; backend onboarding creates an internal `TASK_POSTER` user bound to the verified Clerk `sub`. Later requests must resolve to that internal role. No frontend or API request can set or change the role. Never copy Clerk keys or the PII key into `.env.example` or Git.

Student and Task Poster NIC values and Student home addresses are encrypted at rest with AES-256-GCM. Temporary task-start PINs are stored only as a keyed HMAC and salt; the secure value is derived for the authorized poster dashboard. Generate a stable key and keep it in the backend's secret environment:

```sh
openssl rand -base64 32
```

Set the output as `UNIWORK_PII_ENCRYPTION_KEY`. Back it up through the team's secure secret-management process; losing or rotating the key without an existing-data re-encryption plan makes saved encrypted data unreadable and prevents PIN validation. Profile storage and PIN issuance return `503 PII_ENCRYPTION_NOT_CONFIGURED` when the key is absent. NIC and home address are excluded from public task and applicant DTOs; private profiles are scoped to their owner.

## Task execution and safety

Student and poster endpoints require Clerk JWTs and backend role checks. A selected student requests a four-digit code; it expires in five minutes, is limited to five guesses, and its dashboard disclosure is restricted to the owning poster. Successful PIN verification starts the task. A later Haversine location check records a 100-meter result but never blocks a verified start, including when location permission is denied or GPS is unavailable. Payment is physical and is only recorded from the student's completion report. Reviews and safety reports require the student's own execution record; reports are private to the reporter.

## Google Maps

Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the web environment for the interactive map. Restrict the browser key to the Maps JavaScript API and HTTP referrers for the development and deployed web origins. Do not use a server key in the browser. The map supports click-to-place, draggable markers, and browser geolocation. With no key, the form clearly reports the missing map configuration and lets the poster enter validated coordinates manually. Coordinates always require server-side range validation.

## Run the applications

Install JavaScript dependencies at the repository root with `pnpm install`. Configure `apps/web/.env.local` from `.env.example` and `backend/.env` from `backend/.env.example`. Start the backend with `cd backend && SPRING_PROFILES_ACTIVE=postgis ./mvnw spring-boot:run`; Spring reads the ignored `.env` file from that working directory. Start the website with `pnpm dev` from the root. The web API client sends a Clerk session token as a bearer token to `NEXT_PUBLIC_API_BASE_URL`.

## Verification

Run `pnpm --filter @uniwork/api-contracts build`, `pnpm --filter @uniwork/web lint`, `pnpm --filter @uniwork/web typecheck`, `pnpm --filter @uniwork/web test`, and `pnpm --filter @uniwork/web build`. Run backend checks with `cd backend && ./mvnw verify`. `GET /api/v1/health` checks a real JDBC connection. Swagger UI and OpenAPI JSON are available at `/swagger-ui/index.html` and `/v3/api-docs` in development. Production builds require `NEXT_PUBLIC_API_BASE_URL` to be set to an HTTPS API URL (loopback HTTP remains available for local development).


## Android Student app

Configure `apps/mobile/.env.local` from `apps/mobile/.env.example` with the Clerk publishable key and API origin. Register the Android application `lk.uniwork.student` and enable Clerk Native API. The Android emulator reaches the host API at `http://10.0.2.2:8080`; physical devices need a LAN-reachable API host. Use HTTPS for production. See the [mobile setup and verification guide](mobile-verification.md) for Student flows, location behavior, and current external-service checks. Deployment instructions for [Render](../deployment/render.md), [Vercel](../deployment/vercel.md), and [Android EAS APKs](../deployment/android-eas.md) are also available.
