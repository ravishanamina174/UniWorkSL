# UniWork implementation status

UniWork now contains the public Next.js site and Task Poster dashboard, Expo Android Student app, Java 21 Spring Boot REST API, and Neon PostgreSQL/PostGIS configuration. The web and mobile clients call the same API. Payments remain direct between users.

## Current verification

- Spring Boot connected to the configured Neon database, Hibernate validated mapped tables, Flyway found schema version V7 current, and PostGIS returned version 3.6. The API health endpoint reported both application and database `UP`; a protected profile request without a token returned 401.
- Backend Maven tests, web checks/build, mobile checks/build, and the task lifecycle/security unit suite are recorded in [V1 release verification](v1-release-verification.md).
- A real Clerk Student/Poster account flow and full cross-platform task lifecycle were not run. Local Clerk keys are development keys, no controlled test identities or Android device are available, and the mobile Clerk Native API registration must be checked in the Clerk Dashboard.
- No Render or Vercel deployment has been created. No EAS APK has been built or hosted. The landing page must keep its Coming Soon state until a public APK has passed device checks.
- The prior local PostgreSQL database remains untouched; the previous read-only inspection found no UniWork business rows. No data migration or reset was performed.

## Release preparation

- Render uses the backend-only multi-stage `backend/Dockerfile`, a non-root Java 21 runtime, `PORT` binding, production profile, health check, HTTPS Neon connection, and bounded Hikari pool. Docker/container runtime checks have not been run locally.
- The Vercel build compiles shared API contracts before Next.js and expects the project root `apps/web`.
- EAS preview/production profiles are configured for Android APK output with remote version-code incrementing.
- Production startup validation checks HTTPS origins, explicit allowed parties, Neon `sslmode=require`, and a valid 32-byte PII encryption key.

See [Render deployment](../deployment/render.md), [Vercel deployment](../deployment/vercel.md), [Android EAS builds](../deployment/android-eas.md), [environment variable reference](../deployment/environment-variables.md), [local setup](local-setup.md), and [Neon/Clerk verification](neon-clerk-verification.md).

**Status: RELEASE CANDIDATE WITH BLOCKERS.** See the V1 release verification record for exact manual actions and limitations.
