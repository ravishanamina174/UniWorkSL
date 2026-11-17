# UniWork V1 release verification

Date: 2026-11-17

## Final status

**UNIWORK V1.0 — RELEASE CANDIDATE WITH BLOCKERS**

The repository is prepared for deployment and contains the public site, Task Poster dashboard, Android Student app, shared Spring API, and Neon/PostGIS configuration. A public V1 release is not verified: production deployments, live Clerk sign-in, the full Poster-to-Student lifecycle, an installable APK, and APK download/QR access have not been tested.

## Service and workflow verification

| Area | Result | Evidence / limitation |
| --- | --- | --- |
| Public Next.js landing page | PASS (build) | Production build completed. No deployed URL is available. |
| Task Poster dashboard | PASS (build); BLOCKED (live auth/workflow) | Dynamic routes compile; no production Clerk identity was used to run onboarding, task creation, Google Maps publish, acceptance, or execution. |
| Android Student Expo app | PASS (static checks/export); NOT RUN (device) | SDK config and Android JS bundle validate; no emulator/device was attached. Bundle export is not a native installable APK. |
| Shared REST API | PASS (unit/security and health) | Maven suite passed; live `/api/v1/health` returned application/database `UP`; unauthenticated Student profile request returned HTTP 401. |
| Neon and PostGIS | PASS (current configured database) | Neon PostgreSQL 18.7, Flyway V7 current, Hibernate schema validation initialized, PostGIS 3.6. Verification was read-only; no business rows were created. |
| Clerk web and mobile | BLOCKED (real sessions) | Local web/mobile keys are `pk_test_` development keys. Backend issuer and authorized-party setting exist; audience is blank. No real JWT was used to test an authenticated request. |
| Complete Poster-to-Student task lifecycle | NOT RUN | Requires controlled Clerk test identities and a device/emulator. No test tasks or business records were created in Neon. |
| Render backend | NOT DEPLOYED | `backend/Dockerfile` and root Blueprint prepared. No Render API access/service URL is available. No container runtime test was performed. |
| Vercel web | NOT DEPLOYED | Monorepo build settings and app build command prepared. No Vercel access/project URL is available. |
| Production APK | NOT BUILT | EAS APK profiles prepared; no EAS account/project access or device verification. |
| APK link and QR | BLOCKED | `NEXT_PUBLIC_ANDROID_APK_URL` remains unset; landing page correctly shows Coming Soon. |

## Automated checks

| Check | Result |
| --- | --- |
| Web ESLint, TypeScript, unit tests, production build | PASS — 19 tests across 8 files |
| Backend `./mvnw clean verify` | PASS — 32 tests, 0 failures/errors |
| Mobile TypeScript and ESLint | PASS |
| Mobile Jest suite | PASS — 6 tests across 2 files |
| Expo Doctor | PASS — 20/20 checks after adding the SDK-compatible `expo-constants` peer |
| Expo Android JavaScript bundle export | PASS — Android bundle exported (7.4 MB); this is not an APK |
| Expo app config, EAS, Vercel JSON, Render YAML parsing | PASS |
| Git whitespace/diff check | PASS |
| Docker image build/container runtime | NOT RUN — Docker was not installed or run locally |
| Responsive browser/device verification | NOT RUN |
| EAS APK build/install/physical-device flow | NOT RUN |

## Security and reliability review

- Backend production profile disables Swagger/OpenAPI routes, validates required TLS/origin/PII settings at startup, keeps Hibernate schema mode at `validate`, runs Flyway with the PostGIS profile, and bounds the Hikari pool to five connections per instance.
- API security retains Clerk JWT signature/JWKS, issuer, expiration, not-before, optional audience, and configured `azp` validation. Student and Poster role/ownership rules are enforced server-side. No authentication checks were bypassed.
- PII encryption key values, Clerk secrets, database credentials, and local environment contents are not included here or in the deployment files. Keep the same PII key for any database containing values encrypted with it.
- Mobile requests only a foreground location fix after valid PIN verification; no background permission is declared. Location is not represented as a safety guarantee. Direct payments remain outside UniWork.
- Neon database verification did not create sample records or modify the schema. Render cold starts, production connection stability, and API latency have not been measured.

## Manual actions required before V1 release

1. **Clerk:** Create/select production Clerk instance keys; register `lk.uniwork.student`, enable Native API after reviewing Clerk's native challenge behavior, and use real controlled Poster/Student test identities. Verify each token's issuer, audience if present, and actual `azp`; configure only those exact authorized parties.
2. **Render:** Create the Web Service from the repository root using `render.yaml`; supply Neon direct SSL connection settings, production Clerk issuer/claims, canonical `WEB_ORIGIN`, and the stable 32-byte `UNIWORK_PII_ENCRYPTION_KEY`. Deploy and record the actual HTTPS URL. Confirm health, Flyway, Hibernate, PostGIS, and protected route behavior.
3. **Vercel:** Set project root to `apps/web`, configure production Clerk and restricted Maps keys, deploy, then set the exact Vercel origin in Render's CORS/authorized-party settings. Record and test the real public URL and responsive dashboard.
4. **EAS:** Configure EAS `preview` and `production` environments with the matching HTTPS API URL and Clerk publishable keys; link the Expo project and build the APK profiles. Install on a physical Android device or emulator and test restart/session, auth, marketplace, application, PIN, foreground location, completion, review, and report flows.
5. **Hosting:** Host the successfully tested production APK at a public HTTPS URL, set `NEXT_PUBLIC_ANDROID_APK_URL`, redeploy Vercel, and verify both download and generated QR on a phone.
6. **Cross-platform test:** Use controlled test accounts and clearly identified non-production tasks to run the complete web-to-mobile lifecycle. Verify persistence, roles, ownership, one-student selection, PIN expiry/attempts, 100-meter GPS behavior, location-failure initiation, paid/unpaid completion, and private reports. Do not seed test records into production.
7. **Release:** Run the final URL/device checks and only then decide whether V1 release criteria are met. Do not create a release tag before that point.

No deployed URL or release APK is claimed by this verification record.
