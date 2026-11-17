# Foundation milestone status

The Prompt 1 backend and repository foundation and the Prompt 2 public web and dashboard foundation are implemented. The Expo mobile application and business workflows remain future work.

## Verified

- Frontend ESLint and TypeScript checks pass.
- Frontend Vitest passes (9 tests across 5 files).
- Next.js production build succeeds.
- Spring Boot Maven `verify` succeeds (4 tests).
- Browser checks confirmed the landing page at mobile, tablet, and desktop viewport overrides. The rendered document width matched the available viewport width at each size; the mobile menu opened and the desktop navigation appeared at desktop width.
- The landing page showed the configured Coming Soon APK state. `/dashboard` showed the configuration-required screen with Clerk keys absent.
- Automated UI tests cover theme switching and persistence. A browser log exposed a server/client icon hydration mismatch; the toggle now renders a stable server snapshot. The browser stopped reconnecting to the local dev server during the post-fix check, so the final hydration fix was not independently rechecked in the browser.
- The visual dashboard preview is explicitly illustrative and contains no live task records. Dashboard task routes have empty placeholders only.

## Setup still required

### PostGIS

PostGIS is not installed and no spatial query has been run. Homebrew's PostGIS formula planned 96 dependencies and 16 package upgrades, so that installation was stopped. The default Flyway migration requires PostGIS and has not been applied. Do not disable Flyway in normal development or claim PostGIS support is verified.

Recommended next step: use an existing managed PostgreSQL service that offers PostGIS for a separate UniWork development database, or deliberately choose a PostgreSQL distribution that bundles PostGIS. See [web UI foundation and PostGIS options](web-ui.md#postgis-local-development-options) for the tradeoffs. Once selected, enable PostGIS and run the backend with default Flyway settings.

### Clerk and APK

The web dashboard stays unavailable until both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are configured. Authenticated dashboard access also requires administrator-managed Clerk `publicMetadata.role` set to `task_poster`; never authorize based on client-controlled `unsafeMetadata`. Backend JWT validation remains fail-closed until `CLERK_ISSUER_URI` is configured.

The Student app download displays Coming Soon until `NEXT_PUBLIC_ANDROID_APK_URL` is set to an HTTPS APK URL. No APK has been provided or generated.

## Readiness

**READY WITH BLOCKERS** for Prompt 3. The landing and dashboard foundation is complete and verified. PostGIS setup and Clerk configuration remain environment prerequisites; task workflows and the mobile app are intentionally not part of this milestone.
