# Student mobile app setup and verification

## Runtime configuration

The Android Student client lives in `apps/mobile`, uses Expo SDK 58 and Expo Router, and sends Clerk bearer tokens to the existing Spring Boot student APIs. It uses `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and `EXPO_PUBLIC_API_BASE_URL` from the ignored `apps/mobile/.env.local`. For the Android emulator, the default API URL is `http://10.0.2.2:8080`; for a physical device, set the computer's LAN address. Production API origins must use HTTPS. See [mobile setup](../../apps/mobile/README.md).

Clerk requires the Native API to be enabled and Android app `lk.uniwork.student` registered for the matching instance. The app uses Clerk's SecureStore token cache. Backend JWT issuer, audience, and authorized-party validation remain configured in Spring Boot; client setup does not bypass backend validation.

The app calls the existing student profile, task marketplace, applications, task execution, history, review, and report endpoints. Location is requested only in the foreground after the Student verifies the poster's start code. A denied or unavailable location is recorded without preventing task start. Completion and direct-payment confirmation are separate actions; UniWork does not process payments.

## Verification status

Mobile unit tests, lint, TypeScript, Expo config/bundling, API health, and real Clerk/device checks must be reported based on the latest run. The project must not describe a live account flow as verified without a Clerk test account and a reachable configured backend. The current run report lists any checks blocked by missing tools, credentials, or devices.

### Local verification run (2026-11-17)

- Passed: shared API contracts build; mobile TypeScript check; mobile ESLint; mobile Jest suite (6 tests); Android Expo export/bundle; Expo public config evaluation; app icon/adaptive icon and splash assets.
- Passed: Expo Doctor reported all 20 checks passing after adding the SDK-compatible `expo-constants` peer dependency.
- Passed: web lint, typecheck, tests (19 tests across 8 files), and production build; Spring Boot `./mvnw clean verify` (32 tests, 0 failures/errors).
- Live backend: Spring Boot loaded the ignored local backend environment, connected to Neon PostgreSQL 18.7, validated Hibernate mappings, and reported Flyway schema V7 current. A read-only Neon query returned PostGIS 3.6. `GET /api/v1/health` returned `UP` for application and database, and unauthenticated `GET /api/v1/student/profile` returned HTTP 401 (`UNAUTHENTICATED`).
- Clerk: the mobile publishable key is configured locally and matching backend issuer and authorized-party settings are present. Audience is blank, so audience validation is not configured for this instance. A real native Clerk session was not tested: no Android device/emulator was attached, and Native API enablement/app registration plus a Student test account require Clerk dashboard/manual setup.
- Not run: device UI, onboarding against a real Clerk Student identity, authenticated mobile-to-Neon requests, foreground location permission flow, and end-to-end execution/review/report. No live Clerk JWT was available to validate issuer/authorized-party claims in a real request.
