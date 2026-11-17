# UniWork Sri Lanka

UniWork connects Sri Lankan university students with people who need help with small, physical tasks. Version 1 uses a public Next.js site and Task Poster dashboard, a future student-only Expo app, and one shared Spring Boot REST API. Payments remain direct between the poster and student.

## Stack and layout

- `apps/web`: Next.js App Router, TypeScript, Tailwind CSS.
- `apps/web`: public landing page plus a Clerk-protected Task Poster dashboard for onboarding, profiles, tasks, and applications. The Student app download remains marked Coming Soon until an HTTPS APK URL is configured.
- `apps/mobile`: reserved for the later Expo student application; not initialized yet.
- `backend`: Java 21 Spring Boot modular monolith, REST, PostgreSQL, and Flyway. Core task location is stored as validated latitude/longitude decimals; optional PostGIS activation is documented separately.
- `packages/api-contracts`: shared TypeScript response types.
- `docs`: architecture, API, and local development notes.

## Prerequisites

Java 21, Node.js 20.9+ (22 LTS recommended), pnpm 9+, and native PostgreSQL 16+. Docker is not used. Core schema migrations do not require PostGIS. See [development setup](docs/development/local-setup.md) for database, PII encryption, Clerk, and Google Maps configuration.

## Configure

Copy `apps/web/.env.example` to `apps/web/.env.local`, and configure backend variables from `backend/.env.example`. Set `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`), `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `CLERK_ISSUER_URI`, and a stable, randomly generated base64 32-byte `UNIWORK_PII_ENCRYPTION_KEY`. The web dashboard also requires `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Task Poster role is assigned once by the backend during web onboarding and is stored in its internal user record; clients cannot submit or change it. For interactive task maps, restrict `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to the Maps JavaScript API and the app's HTTP referrers. Leave it blank to use manual coordinates. `NEXT_PUBLIC_ANDROID_APK_URL` can be set to an HTTPS APK URL when available. Never commit real credentials.

## Run

From the repository root, install dependencies with `pnpm install`. In one terminal start the backend with `cd backend && ./mvnw spring-boot:run`; in another run `pnpm dev`. Open `http://localhost:3000`; it checks `GET /api/v1/health` against the live backend.

## Verify

- Web: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Backend: `cd backend && ./mvnw test` and `./mvnw verify`.
- API: `curl http://localhost:8080/api/v1/health`; Swagger UI is at `http://localhost:8080/swagger-ui/index.html` in development.

See [architecture](docs/architecture/overview.md), [API](docs/api/README.md), and [local setup](docs/development/local-setup.md). The current implementation milestone and any external service limitations are recorded in [status](docs/development/status.md).

The landing page and dashboard use the centralized UI tokens and shared components documented in [web UI foundation](docs/development/web-ui.md). Dashboard task, profile, and application screens read from Spring APIs and show real empty states when the database has no records.
