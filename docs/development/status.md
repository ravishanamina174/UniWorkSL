# Foundation milestone status

This repository contains the Prompt 1 foundation only. No mobile app or business feature workflows have been initialized.

## Verified on this development machine

- Java 21.0.12.1, Node.js 24.4.0, pnpm 11.25.0, Next.js 16.4.6, React 19.3.1, PostgreSQL 16.16 (Homebrew), Spring Boot 4.1.2, and Springdoc 3.2.0.
- Frontend dependencies installed; lint, typecheck, Vitest, and Next.js production build pass.
- Backend Maven `verify` passes (4 tests, including public health, protected-route rejection, CORS, and database health service behavior).
- PostgreSQL service is running, with a dedicated `uniwork` role/database. A live `SELECT 1` and `GET /api/v1/health` both report the database UP.
- The packaged backend starts against PostgreSQL with JPA/Hibernate Spatial active. `GET /v3/api-docs` returned 200, and a protected route returned the expected JSON 401 response.
- The local Next.js page was opened in a browser and reached the real API. Its status changed from loading to API connected.
- During this integration check only, Flyway was disabled because PostGIS is not installed yet.

## Outstanding database setup

PostGIS is not installed and no spatial query has been run. Homebrew showed that its PostGIS formula would bring in 96 dependencies and upgrade 16 existing packages on this machine, so that installation was stopped. The default Flyway migration (`V1__foundation.sql`) requires PostGIS and has not been applied. Install PostGIS using an approved method, enable the extension in the `uniwork` database, and start the backend with its default Flyway setting to complete migration verification. Do not leave `FLYWAY_ENABLED=false` in normal development.

The Clerk issuer is also not configured. JWT validation is fail-closed until `CLERK_ISSUER_URI` is set; no Clerk project credentials were supplied.
