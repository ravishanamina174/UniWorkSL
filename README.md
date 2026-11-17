# UniWork Sri Lanka

UniWork connects Sri Lankan university students with people who need help with small, physical tasks. Version 1 uses a public Next.js site and Task Poster dashboard, a future student-only Expo app, and one shared Spring Boot REST API. Payments remain direct between the poster and student.

## Stack and layout

- `apps/web`: Next.js App Router, TypeScript, Tailwind CSS.
- `apps/web`: public landing page plus a Clerk-protected Task Poster dashboard for onboarding, profiles, tasks, student application selection, and task-start/completion status. The Student app download remains marked Coming Soon until an HTTPS APK URL is configured.
- `apps/mobile`: Android-first Expo Router Student app with Clerk auth, student onboarding, task discovery/applications, task execution, and API-backed reviews/reports.
- `backend`: Java 21 Spring Boot modular monolith, REST, PostgreSQL, and Flyway. Student profiles, applications, task execution, reviews, and private safety reports serve the Android Student app. Task arrival uses an isolated Haversine implementation and works without PostGIS.
- `packages/api-contracts`: shared TypeScript response types.
- `docs`: architecture, API, and local development notes.

## Prerequisites

Java 21, Node.js 20.9+ (22 LTS recommended), pnpm 9+, and access to the UniWork Neon PostgreSQL project. Docker is not used. Flyway V3 enables PostGIS for configured Neon environments while task arrival continues to use Haversine. See [development setup](docs/development/local-setup.md) for Neon SSL, database migration, PII encryption, Clerk, and Google Maps configuration.

## Configure

Copy `apps/web/.env.example` to `apps/web/.env.local` and `backend/.env.example` to the ignored `backend/.env`. Set `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`; production requires HTTPS), the direct Neon `DB_URL` with `sslmode=require`, `DB_USERNAME`, `DB_PASSWORD`, `CLERK_ISSUER_URI`, and a stable base64 32-byte `UNIWORK_PII_ENCRYPTION_KEY`. Spring Boot imports `backend/.env` when launched from the `backend` directory. Configure optional Clerk JWT audience/JWKS/authorized-party settings to match the Clerk instance and web origin. The web dashboard also requires `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Task Poster role is assigned once by the backend during web onboarding and is stored in its internal user record; clients cannot submit or change it. For interactive task maps, restrict `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to the Maps JavaScript API and the app's HTTP referrers. Leave it blank to use manual coordinates. `NEXT_PUBLIC_ANDROID_APK_URL` can be set to an HTTPS APK URL when available. Never commit real credentials.

## Run

From the repository root, install dependencies with `pnpm install`. In one terminal start the backend with `cd backend && ./mvnw spring-boot:run`; in another run `pnpm dev`. Open `http://localhost:3000`; it checks `GET /api/v1/health` against the live backend.

## Verify

- Web: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Backend: `cd backend && ./mvnw test` and `./mvnw verify`.
- API: `curl http://localhost:8080/api/v1/health`; Swagger UI is at `http://localhost:8080/swagger-ui/index.html` in development.

See [architecture](docs/architecture/overview.md), [API](docs/api/README.md), and [local setup](docs/development/local-setup.md). The current implementation milestone and any external service limitations are recorded in [status](docs/development/status.md).

Prompt 5 web results and Neon/Clerk verification status are recorded in [web platform verification](docs/development/web-verification.md) and [Neon and Clerk verification](docs/development/neon-clerk-verification.md). Student app setup and verification are in [mobile verification](docs/development/mobile-verification.md).

The landing page and dashboard use the centralized UI tokens and shared components documented in [web UI foundation](docs/development/web-ui.md). Dashboard task, profile, and application screens read from Spring APIs and show real empty states when the database has no records.
