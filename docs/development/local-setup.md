# Local development

## Requirements

Java 21, Node.js 20.9+ (22 LTS recommended), pnpm 9+, and native PostgreSQL 16+. Docker, Docker Compose, and Testcontainers are not used. Core features require PostgreSQL only; PostGIS is optional for a later spatial migration.

## PostgreSQL and migrations

Start the local service using its installed version (`brew services start postgresql@16`, or the version present). Create a dedicated `uniwork` database and local database role if needed. Set `DB_URL=jdbc:postgresql://localhost:5432/uniwork`, `DB_USERNAME`, and `DB_PASSWORD` in the backend environment. Do not point development at a database containing unrelated data.

The default Flyway location `classpath:db/migration` applies core schema V1–V7 for users, encrypted Student and Task Poster profiles, tasks, applications, execution records, reviews, private safety reports, and lifecycle query indexes. V4 extends task lifecycle states and adds verification-attempt audit fields while retaining numeric latitude/longitude columns; V5 constrains verification results; V6 stores only the start-code HMAC and random salt; V7 adds indexes for published task filtering and task application pages. It works without PostGIS. `ddl-auto=validate` checks the mapped schema at startup. Never disable Flyway for normal development.

PostGIS is isolated in `db/postgis/V3__enable_postgis.sql`. To add it later, first install PostGIS for the exact PostgreSQL server and enable the extension with a database administrator. Then start with `SPRING_PROFILES_ACTIVE=postgis` so Flyway also scans `classpath:db/postgis`. Keep that profile enabled for databases that have applied V3 so Flyway can resolve its history. No PostGIS distance query is implemented or verified.

## Clerk and PII encryption

Configure `CLERK_ISSUER_URI` with the Clerk instance's exact issuer. Spring Security validates signature, issuer, and time claims using the configured JWKS endpoint (`CLERK_JWKS_URI`, defaulting to the issuer's `/.well-known/jwks.json`). Set `CLERK_JWT_AUDIENCE` when the Clerk token template includes a backend audience; set `CLERK_AUTHORIZED_PARTIES` to allowed web origins to validate `azp` when present. If the issuer is empty, protected API routes fail closed. In `apps/web/.env.local`, set both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. The dashboard remains unavailable until both are set. Sign-up is configured for Task Posters; backend onboarding creates an internal `TASK_POSTER` user bound to the verified Clerk `sub`. Later requests must resolve to that internal role. No frontend or API request can set or change the role.

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

Install JavaScript dependencies at the repository root with `pnpm install`. Configure `apps/web/.env.local` from `.env.example` and export the backend database and security settings. Start the backend with `cd backend && ./mvnw spring-boot:run`; start the website with `pnpm dev` from the root. The web API client sends a Clerk session token as a bearer token to `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`).

## Verification

Run `pnpm --filter @uniwork/api-contracts build`, `pnpm --filter @uniwork/web lint`, `pnpm --filter @uniwork/web typecheck`, `pnpm --filter @uniwork/web test`, and `pnpm --filter @uniwork/web build`. Run backend checks with `cd backend && ./mvnw verify`. `GET /api/v1/health` checks a real JDBC connection. Swagger UI and OpenAPI JSON are available at `/swagger-ui/index.html` and `/v3/api-docs` in development. Production builds require `NEXT_PUBLIC_API_BASE_URL` to be set to an HTTPS API URL (loopback HTTP remains available for local development).
