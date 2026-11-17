# Local development (Apple Silicon)

## Requirements

Install Java 21, Node.js, pnpm, and Homebrew if desired. Install PostgreSQL and PostGIS natively through Homebrew; do not install Docker or use containers. Existing installations should be reused. The project does not change global PostgreSQL configuration.

## Database

Start the local PostgreSQL service using the installed service name (`brew services start postgresql@16`, or the version present). Create a separate database and enable PostGIS as a database administrator:

```sql
CREATE DATABASE uniwork;
\connect uniwork
CREATE EXTENSION IF NOT EXISTS postgis;
```

Use a dedicated local role if desired, and set `DB_URL=jdbc:postgresql://localhost:5432/uniwork`, `DB_USERNAME`, and `DB_PASSWORD`. Flyway creates/updates the UniWork-owned schema. Do not point development at a database containing unrelated data.

The initial Flyway migration requires the PostGIS extension to be installed and enabled. Do not disable Flyway in normal development; the `FLYWAY_ENABLED=false` override was used only to verify the API against PostgreSQL before PostGIS was available.

## Apps

Run `pnpm install` from the root. Set `apps/web/.env.local` from `.env.example`. Export backend DB settings and `CLERK_ISSUER_URI` as needed. Start backend with `cd backend && ./mvnw spring-boot:run`; start web with root `pnpm dev`. Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `cd backend && ./mvnw test` for checks.

## Troubleshooting

The public health response reports database state from a real JDBC connection, so it is DOWN until PostgreSQL is running and credentials are valid. The public web page reports API connectivity separately. Check ports 3000/8080/5432 before changing defaults; do not stop unrelated services.
