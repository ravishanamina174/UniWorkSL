# UniWork Student for Android

This Expo Router application is the Student client for the shared UniWork Spring Boot API. Task Posters continue to use the web dashboard. The mobile client uses real Clerk sessions and API responses; it has no mock sign-in or local business data.

## Local setup

1. From the repository root, run `pnpm install`.
2. Copy `.env.example` to `.env.local` and set:
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`: the Clerk publishable key for the same instance configured in Spring Boot.
   - `EXPO_PUBLIC_API_BASE_URL`: API origin reachable from the Android device. The default `http://10.0.2.2:8080` reaches a backend on the host from the Android emulator. For a physical phone, use the computer's LAN IP and ensure both devices can reach it. Production requires HTTPS.
3. In Clerk, enable the Native API and register the Android app using application ID `lk.uniwork.student` and the `uniwork` URL scheme. Native API support and a registered application are required for mobile token issuance.
4. Start Spring Boot with its configured Neon datasource, then run `pnpm --filter @uniwork/mobile start` from the repo root. Press `a` to open Android when an emulator or device is available.

Never commit `.env.local` or real service keys. The Expo public Clerk key and API URL are client-visible configuration; Clerk secret keys and database credentials belong only in the backend's ignored environment file.

## Student flow

Students sign in or sign up through Clerk, complete the API-backed student profile, then browse published tasks, filter by text/payment, and apply. The Applied Tasks tab tracks application status, withdrawals, accepted tasks, completion, and history. Accepted work uses the existing four-digit poster-provided start code. After successful verification the app may request one foreground location fix; location is sent only if the Student grants permission and is available, and never blocks starting work. Students confirm completion and direct payment status, then may review the Task Poster or submit a private report.

Students must be at least 16. Roles are assigned once by the API; an existing Task Poster account cannot be converted into a Student account. UniWork does not process payments. NIC and address values go to the API, where the configured backend encrypts protected fields; this app does not keep a local profile database.

## Android release build

The `eas.json` preview and production profiles produce internal APKs. Run `npx eas-cli@latest build --platform android --profile preview` or `npx eas-cli@latest build --platform android --profile production`. See [Android EAS release setup](../../docs/deployment/android-eas.md) for EAS environments, Clerk native registration, signing, and post-build verification. The production API URL and Clerk publishable key are supplied by the EAS `production` environment; no release credentials are stored in the repository.

## Checks

From the repository root:

```sh
pnpm --filter @uniwork/api-contracts build
pnpm --filter @uniwork/mobile typecheck
pnpm --filter @uniwork/mobile lint
pnpm --filter @uniwork/mobile test
cd apps/mobile && pnpm dlx expo-doctor
```

Use `pnpm --filter @uniwork/mobile start` to launch Metro. A real device, Clerk Native API dashboard setup, and a reachable configured backend are needed for end-to-end verification. Those external checks are reported separately in `docs/development/mobile-verification.md`.
