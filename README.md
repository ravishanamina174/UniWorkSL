# UniWork Sri Lanka

UniWork connects Sri Lankan university students with people who need help with small, physical tasks. Version 1 uses a public Next.js site and Task Poster dashboard, a future student-only Expo app, and one shared Spring Boot REST API. Payments remain direct between the poster and student.

## Stack and layout

- `apps/web`: Next.js App Router, TypeScript, Tailwind CSS.
- `apps/mobile`: reserved for the later Expo student application; not initialized yet.
- `backend`: Java 21 Spring Boot modular monolith, REST, PostgreSQL/PostGIS, Flyway.
- `packages/api-contracts`: shared TypeScript response types.
- `docs`: architecture, API, and local development notes.

## Prerequisites

Java 21, Node.js 20.9+ (22 LTS recommended), pnpm 9+, and native PostgreSQL with PostGIS. Docker is not used. For actual database-backed startup, create a local database named `uniwork` and enable PostGIS as described in [development setup](docs/development/local-setup.md).

## Configure

Copy `apps/web/.env.example` to `apps/web/.env.local`, and `backend/.env.example` to your shell environment or a local environment file loader. Set `NEXT_PUBLIC_API_BASE_URL` to the backend base URL (default `http://localhost:8080`) and database variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`. Set `CLERK_ISSUER_URI` to the Clerk issuer before making authenticated API calls. Never commit real credentials.

## Run

From the repository root, install dependencies with `pnpm install`. In one terminal start the backend with `cd backend && ./mvnw spring-boot:run`; in another run `pnpm dev`. Open `http://localhost:3000`; it checks `GET /api/v1/health` against the live backend.

## Verify

- Web: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Backend: `cd backend && ./mvnw test` and `./mvnw verify`.
- API: `curl http://localhost:8080/api/v1/health`; Swagger UI is at `http://localhost:8080/swagger-ui/index.html` in development.

See [architecture](docs/architecture/overview.md), [API](docs/api/README.md), and [local setup](docs/development/local-setup.md). The current implementation milestone and any external service limitations are recorded in [status](docs/development/status.md).
