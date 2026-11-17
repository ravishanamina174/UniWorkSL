# Foundation and Prompt 3 status

The Prompt 1–2 repository, backend, public landing page, and dashboard shell remain in place. Prompt 3 adds Clerk-backed Task Poster onboarding, private profile management, task publishing/management, location selection, and an applications foundation. The Expo app and student application workflows remain deferred.

## Verified in this environment

- Web package: API contracts build, ESLint, TypeScript, Vitest, and Next.js production build pass.
- Backend: Maven `verify` passes (17 tests, including profile encryption/role checks, task state/ownership, and HTTP authorization/validation checks).
- PostgreSQL 16: default Flyway V1 and V2 migrations were applied successfully without PostGIS; Hibernate validated the mapped schema at API startup.
- Live unauthenticated API: public published-task listing returns a real empty page from the database; private profile and poster summary endpoints return 401 without a bearer token.
- No task, profile, or application demo records were added. The interactive map and real Clerk sign-in were not verified because their API key/project credentials are not configured.
- The Prompt 2 browser checks previously confirmed responsive layout, mobile navigation, APK Coming Soon state, and protected dashboard configuration screen. Prompt 3 authenticated dashboard screens cannot be exercised without Clerk configuration.

## Configuration needed for authenticated use

- Clerk web keys: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
- Backend Clerk issuer: `CLERK_ISSUER_URI`; JWT validation fails closed when absent.
- Stable server-side encryption key: `UNIWORK_PII_ENCRYPTION_KEY`, base64-encoded 32 bytes. Without it, profile persistence returns 503. Keep this stable and back it up securely.
- Optional Google Maps browser key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, restricted to Maps JavaScript API and the app's HTTP referrers. Manual coordinate entry remains available without it.
- Optional Android APK URL: `NEXT_PUBLIC_ANDROID_APK_URL` (HTTPS).

## Spatial support

Core schema and task APIs use PostgreSQL numeric latitude/longitude and work without PostGIS. PostGIS remains uninstalled; no distance query or spatial verification is claimed. `SPRING_PROFILES_ACTIVE=postgis` enables the isolated V3 extension migration only after the database administrator installs/enables PostGIS for this server. See [local setup](local-setup.md#postgresql-and-migrations).

## Readiness

**READY WITH BLOCKERS** for Prompt 4. Core migrations, task/profile APIs, authorization boundaries, and pages are implemented. Real Clerk login and authenticated web-to-API CRUD still require Clerk configuration and a secure PII key; the interactive map requires a restricted Google Maps key for map-based selection. Automated secure-auth tests and the live unauthenticated API checks do not count as real Clerk login verification.
