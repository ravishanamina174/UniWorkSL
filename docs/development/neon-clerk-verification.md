# Neon and Clerk verification

Checked: 2026-11-17. This record supersedes the earlier pre-configuration check below; the configured local environment now connects to Neon.

## Environment and database

- The ignored `backend/.env`, `apps/web/.env.local`, and `apps/mobile/.env.local` exist. Secret values were not printed or committed.
- Spring Boot connected to Neon PostgreSQL 18.7 using the configured direct JDBC connection and SSL-required settings. Hibernate ORM initialized with `ddl-auto=validate`.
- Flyway validated the existing migration set and reported schema version V7 current. No migration was applied during the latest read-only verification run.
- `SELECT PostGIS_Version()` returned PostGIS 3.6.
- `GET /api/v1/health` returned HTTP 200 with application and database status `UP`.
- An unauthenticated request to `GET /api/v1/student/profile` returned HTTP 401 (`UNAUTHENTICATED`). No user/task/application/report test records were inserted.
- Earlier read-only inspection of local PostgreSQL found no UniWork business rows. The local service and database were left intact.

## Clerk status

- The web and mobile publishable keys are development (`pk_test_`) keys. The backend has a configured Clerk development issuer and authorized-party setting. The audience setting is blank; audience validation is therefore not active for this instance.
- Backend JWT verification validates signature through the configured/default JWKS URI, issuer, expiration/not-before, and checks `azp` against configured authorized parties when the claim exists. Automated validator tests cover accepted and rejected audience/party values.
- No real Clerk session token was used against the backend. No authenticated profile onboarding, mobile sign-in, Poster sign-in, or full cross-platform API workflow is verified.
- Clerk production configuration must use production instance keys/issuer. Register Android package `lk.uniwork.student`, enable Native API after reviewing Clerk's stated challenge implications, and verify the real mobile session's issuer, audience if configured, and exact `azp` before changing the production allowlist. Do not assume that the custom app scheme is the session's authorized party.

## Data preservation

The latest verification used health and version queries only. It did not reset schemas, run destructive SQL, or create business data. Preserve the existing local and Neon datasets. Keep the same `UNIWORK_PII_ENCRYPTION_KEY` for any database that contains records encrypted with that key.

See [V1 release verification](v1-release-verification.md) for test results and remaining deployment/device blockers.
