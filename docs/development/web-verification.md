# Prompt 5 web platform verification

Date: 2026-11-17

## Results

| Area | Result | Evidence / scope |
| --- | --- | --- |
| Web tests | PASS | `pnpm test`: 19 tests across 8 files. Added production API URL validation and bearer/401 handling tests. |
| Web static checks | PASS | `pnpm typecheck` and `pnpm lint` completed successfully. |
| Web production build | PASS | `pnpm build` completed with the dashboard routes compiled as dynamic routes. |
| API contracts | PASS | Contract package build ran from the web prebuild/dev script. |
| Backend | PASS | `./mvnw clean verify`: 29 tests, 0 failures/errors. Includes issuer/audience/authorized-party claim checks and location-accuracy handling. |
| Browser smoke check | PARTIAL | Local landing page rendered at desktop browser size. `/dashboard` rendered the intentional Clerk configuration gate, with no keys configured. No authenticated browser actions were possible. |
| Responsive browser check | NOT VERIFIED | The available browser workflow did not provide a viewport resize control; tablet/mobile layouts were not verified in-browser. |
| Clerk sign-up/sign-in and full poster workflow | BLOCKED | Clerk publishable/secret keys, issuer, and test identities are not configured. No successful auth or business records were fabricated. |
| PostgreSQL/Flyway/Hibernate | BLOCKED | PostgreSQL was not listening on `localhost:5432`; V7 migration, Hibernate validation, repository projection startup, and live database persistence could not be checked in this run. |
| Playwright | NOT RUN | Playwright is not installed in the existing workspace; no additional test dependency was added. |

## Security and integration changes

- Spring JWT decoding now fails closed without the Clerk issuer and validates signature/JWKS, issuer, expiration, and not-before claims. Optional audience and authorized-party lists can be configured; `azp` is checked when present.
- CORS accepts the configured web origin and no longer enables credential cookies. The browser API client uses bearer tokens.
- Production web configuration requires an HTTPS API base URL (loopback HTTP is allowed for local development).
- Application list queries use DTO projections to avoid loading private profile data and reduce list-endpoint N+1 access. Task collections use Hibernate batch fetching; V7 adds lifecycle query indexes.
- Location verification now requires reported accuracy <=100m and only reports “within radius” when the uncertainty interval is fully inside the 100m radius. Uncertain or inaccurate GPS is recorded without preventing a successful PIN-based start.
- The keyed PIN HMAC uses a domain-separated key derivation, and PIN hash comparison uses constant-time digest comparison.

## Clerk setup required for manual verification

1. Configure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `apps/web/.env.local`.
2. Set backend `CLERK_ISSUER_URI` to the Clerk instance issuer and ensure its JWKS endpoint is reachable. Configure `CLERK_JWKS_URI` only when using a non-default endpoint.
3. Configure `CLERK_JWT_AUDIENCE` if the session JWT contains an audience intended for this API. Set `CLERK_AUTHORIZED_PARTIES` to the exact allowed web origins.
4. Configure PostgreSQL credentials and a stable `UNIWORK_PII_ENCRYPTION_KEY`, then run the backend so Flyway V7 and Hibernate validation execute.
5. Use controlled Clerk poster/student test identities to run the end-to-end workflow and student API lifecycle. Do not use fabricated student records.

Until those services and test identities are supplied, this repository is prepared for Prompt 6 API consumption, but real web-to-database poster workflow, Clerk authentication, and responsive breakpoints remain unverified.
