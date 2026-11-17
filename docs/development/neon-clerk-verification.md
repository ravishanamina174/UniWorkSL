# Neon and Clerk verification

Checked: 2026-11-17

## Environment status

- `apps/web/.env.local` is present and ignored by Git. Both Clerk web keys are populated. The Clerk development instance is reachable by the Next.js client: `/sign-in` and `/sign-up` rendered the real Clerk components in development mode. The current UI offers Google sign-in.
- No `backend/.env` is present, and no backend database, Clerk issuer, or PII key variables are set in the process environment. No Neon URL or DB credentials were found. Secret values were not printed.
- `NEXT_PUBLIC_API_BASE_URL` in the local web environment targets loopback. There is no running local API configured to Neon.

## Local database preservation check

The local `postgresql@16` service and `uniwork` database are still present. Read-only checks found Flyway versions 1, 2, and 4–6 applied; V3 (PostGIS) and V7 are absent. The application tables inspected (`uniwork_users`, profiles, tasks, applications, executions, reviews, and safety reports) all have zero rows. PostGIS is not installed in that database. No local database, migration history, or rows were changed. There are no business rows to migrate, though the existing local database should remain preserved.

## Changes prepared

- Spring Boot imports an ignored `backend/.env` in the backend working directory. Process environment variables take precedence.
- The datasource no longer defaults to `localhost`; `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` are required. PostgreSQL JDBC SSL mode is set to `require`.
- The backend environment example uses placeholders and a direct Neon endpoint format with `sslmode=require`; it contains no real credentials.
- Setup instructions require a schema/history inspection and Neon backup before touching a non-empty target. On a fresh target, start with the `postgis` profile so Flyway applies V1, V2, optional PostGIS V3, then V4–V7 in version order. Verify with `SELECT PostGIS_Version();`. Application location checks continue using Haversine.

## Verification outcomes

| Check | Result |
| --- | --- |
| Clerk sign-in/sign-up UI | PASS: real Clerk development components loaded in browser. |
| Clerk user sign-in, onboarding, session token, sign-out | BLOCKED: no test identity/session was available; no account was created. |
| Spring JWT validation against a real Clerk session | BLOCKED: backend issuer and Neon configuration are absent, and no signed-in session token is available. Automated validator and unauthenticated 401 tests remain in the backend suite. |
| Neon TLS connection and backend health | BLOCKED: Neon host/credentials are not configured. |
| Neon Flyway V1–V7, Hibernate validation, and PostGIS V3 | BLOCKED: no Neon connection is available. The local database was not used as a substitute. |
| Local database data migration | No business data to migrate based on aggregate row counts; keep the local database intact. |

## To complete live migration

1. Put Neon direct-host credentials in the ignored `backend/.env` and keep `sslmode=require` in `DB_URL`. Keep the existing encryption key stable; do not generate a replacement if encrypted data already exists.
2. Set `CLERK_ISSUER_URI` to the configured Clerk instance issuer and match `CLERK_AUTHORIZED_PARTIES` to the web origin. Set `CLERK_JWT_AUDIENCE` if the session token includes an API audience.
3. Inspect the Neon schema and `flyway_schema_history` read-only first. Take a restore point. Resolve any existing data/schema history before allowing migrations to run.
4. On a new empty target, run from `backend`: `SPRING_PROFILES_ACTIVE=postgis ./mvnw spring-boot:run`. Check Flyway completion, Hibernate validation, `/api/v1/health`, and `SELECT PostGIS_Version();`.
5. Sign in with an approved Clerk test account and exercise onboarding and authenticated API calls. Do not use a production account or create a new account without an approved test identity.
