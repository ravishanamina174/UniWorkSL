# Local development

## Requirements

Java 21, Node.js 20.9+ (22 LTS recommended), pnpm 9+, and native PostgreSQL 16+. Docker, Docker Compose, and Testcontainers are not used. Core features require PostgreSQL only; PostGIS is optional for a later spatial migration.

## PostgreSQL and migrations

Start the local service using its installed version (`brew services start postgresql@16`, or the version present). Create a dedicated `uniwork` database and local database role if needed. Set `DB_URL=jdbc:postgresql://localhost:5432/uniwork`, `DB_USERNAME`, and `DB_PASSWORD` in the backend environment. Do not point development at a database containing unrelated data.

The default Flyway location `classpath:db/migration` applies the core schema (`V1__foundation.sql` and `V2__application_selection_constraint.sql`) for users, encrypted Task Poster profiles, tasks, task skills, and applications. It uses numeric latitude/longitude columns and works without PostGIS. `ddl-auto=validate` checks the mapped schema at startup. Never disable Flyway for normal development.

PostGIS is isolated in `db/postgis/V3__enable_postgis.sql`. To add it later, first install PostGIS for the exact PostgreSQL server and enable the extension with a database administrator. Then start with `SPRING_PROFILES_ACTIVE=postgis` so Flyway also scans `classpath:db/postgis`. Keep that profile enabled for databases that have applied V3 so Flyway can resolve its history. No PostGIS distance query is implemented or verified.

## Clerk and PII encryption

Configure `CLERK_ISSUER_URI` with the Clerk instance's issuer. Spring Security validates the bearer JWT issuer/signature; if the issuer is empty, protected API routes fail closed. In `apps/web/.env.local`, set both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. The dashboard remains unavailable until both are set. Sign-up is configured for Task Posters; backend onboarding creates an internal `TASK_POSTER` user bound to the verified Clerk `sub`. Later requests must resolve to that internal role. No frontend or API request can set or change the role.

NIC values are encrypted at rest with AES-256-GCM. Generate a stable key and keep it in the backend's secret environment:

```sh
openssl rand -base64 32
```

Set the output as `UNIWORK_PII_ENCRYPTION_KEY`. Back it up through the team's secure secret-management process; losing or rotating the key without an existing-data re-encryption plan makes saved NIC values unreadable. Profile storage returns `503 PII_ENCRYPTION_NOT_CONFIGURED` when the key is absent. NIC and home address are excluded from the public task DTO and application DTO; the private profile endpoint is authenticated and scoped to the owner.

## Google Maps

Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the web environment for the interactive map. Restrict the browser key to the Maps JavaScript API and HTTP referrers for the development and deployed web origins. Do not use a server key in the browser. The map supports click-to-place, draggable markers, and browser geolocation. With no key, the form clearly reports the missing map configuration and lets the poster enter validated coordinates manually. Coordinates always require server-side range validation.

## Run the applications

Install JavaScript dependencies at the repository root with `pnpm install`. Configure `apps/web/.env.local` from `.env.example` and export the backend database and security settings. Start the backend with `cd backend && ./mvnw spring-boot:run`; start the website with `pnpm dev` from the root. The web API client sends a Clerk session token as a bearer token to `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`).

## Verification

Run `pnpm --filter @uniwork/api-contracts build`, `pnpm --filter @uniwork/web lint`, `pnpm --filter @uniwork/web typecheck`, `pnpm --filter @uniwork/web test`, and `pnpm --filter @uniwork/web build`. Run backend checks with `cd backend && ./mvnw verify`. `GET /api/v1/health` checks a real JDBC connection. Swagger UI and OpenAPI JSON are available at `/swagger-ui/index.html` and `/v3/api-docs` in development.
