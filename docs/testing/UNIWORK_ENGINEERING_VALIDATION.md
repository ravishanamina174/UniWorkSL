# UniWork Engineering Validation

**Run date:** 2026-11-21  
**Scope:** local development checkout only; no deployed service, production database, deployment, push, or commit was used.

## Executive result

The locally testable platform checks passed after one validation bug was corrected. The backend test suite has **52 tests**: **51 passed, 1 skipped, 0 failed**. The skipped test is the native PostGIS marketplace discovery integration test; the local PostgreSQL installation did not provide PostGIS. Web checks passed (29 tests), and mobile checks passed (9 tests).

The local public-task browse/detail benchmark completed at 50 and 100 virtual users with zero failed HTTP requests and all functional checks passing. These are developer-machine baseline results, not production capacity claims.

## Environment and isolation

| Item | Value |
| --- | --- |
| Host | macOS 15.7.3, arm64, 16 GiB memory |
| Java | OpenJDK 21.0.12.1 |
| Database | disposable local PostgreSQL 16.16 on `127.0.0.1:5545` |
| API process | disposable Spring Boot process on `127.0.0.1:8091` |
| Test data | one synthetic task-poster and 100 synthetic published tasks |
| Load tool | k6 2.4.0 |

The database cluster and its seed data were created under `/private/tmp` solely for this run. No configured Neon database, Render deployment, Vercel deployment, or live Clerk account was targeted.

The available PostgreSQL server reported no `postgis` extension. To permit non-spatial integration and startup validation, a temporary migration copy omitted `V11__marketplace_geo_index.sql`; the optional PostGIS migration profile was also not enabled. Thus, the following are explicitly **not** verified in this run:

- PostGIS extension installation and `PostGIS_Version()`;
- `V11__marketplace_geo_index.sql` application;
- native `ST_DWithin` / `ST_Distance` marketplace discovery query execution.

The geospatial Haversine implementation was tested independently, including International Date Line and symmetry boundaries. Full spatial validation requires an isolated PostgreSQL instance with PostGIS (or a dedicated Neon development branch), never production.

## Database, Flyway, and startup

Spring Boot started successfully against the isolated database. Hibernate ran with `ddl-auto=validate`; no schema mismatch was reported. Flyway successfully validated and applied the non-spatial migrations in the temporary copy:

`V1, V2, V4, V5, V6, V7, V8, V9, V10, V12`

`/actuator/health` returned `UP` after startup.

## Test coverage and results

### Backend

Command (with only disposable database settings):

```sh
cd backend
DB_URL='jdbc:postgresql://127.0.0.1:5545/uniwork_validation?sslmode=disable' \
DB_USERNAME=uniwork_test DB_PASSWORD='' \
SPRING_FLYWAY_LOCATIONS='filesystem:/private/tmp/uniwork-validation-migrations' \
UNIWORK_ADMIN_INTEGRATION_TEST=1 ./mvnw test
```

Result: **52 run, 51 passed, 1 skipped, 0 failures, 0 errors**.

Coverage includes authentication/JWT claim validation, admin access control, task creation and lifecycle transitions, applications and selection, task start/complete flows, SafeTask token hashing and guardian visibility windows, PII encryption, task-poster profiles, public task access, input validation, and safety-admin persistence/constraint behavior.

Two Haversine boundary tests were added:

- short distance across the International Date Line;
- distance symmetry between Colombo and Kandy coordinates.

The existing `MarketplaceRepositoryIntegrationTest` remained skipped because it deliberately requires explicit PostGIS-capable integration configuration. It was not bypassed or converted into a mock test.

### Security checks

- Unauthenticated request to the local Admin endpoint returned **401**.
- The automated security tests cover Clerk issuer/JWK/audience/authorized-party validators, API protection, and fail-closed Admin authorization.
- The Admin authorization implementation reads the Clerk user’s trusted `public_metadata.role` server-side; the frontend does not grant itself Admin access.
- Security review covered endpoint authorization patterns, DTO validation, parameterized Spring Data access, secret handling in ignored environment files, and generic production-safe error responses.

No active attack tooling or production target was used.

### Web and mobile regression checks

| Command | Result |
| --- | --- |
| `pnpm test` | 29 web tests passed |
| `pnpm typecheck` | passed |
| `pnpm lint` | passed |
| `pnpm --filter @uniwork/mobile typecheck` | passed |
| `pnpm --filter @uniwork/mobile lint` | passed |
| `pnpm --filter @uniwork/mobile test` | 9 tests passed |

The web test run emitted a React test-renderer warning about a script tag in the navigation test. It did not fail tests or indicate a runtime production error, but it should be cleaned up in a future test-only maintenance pass.

## Defect found and fixed

### Invalid public pagination returned 500

**Reproduction:** `GET /api/v1/public/tasks?size=999` returned HTTP 500 even though `size` is constrained to 1–50.

**Cause:** method-parameter `ConstraintViolationException` was not mapped by the global REST exception handler. Only body-validation exceptions were mapped to a client error.

**Fix:** `GlobalExceptionHandler` now maps `ConstraintViolationException` to a safe HTTP 400 `VALIDATION_FAILED` response. A MockMvc regression test verifies the behavior.

**Post-fix verification:** the same local request returns:

```json
{"status":400,"code":"VALIDATION_FAILED","message":"One or more request values are invalid."}
```

No sensitive validation details are returned.

## Performance baseline

The script at [`public-task-browse.js`](k6/public-task-browse.js) performs two representative public, read-only requests per iteration:

1. `GET /api/v1/public/tasks?size=20&search=benchmark`
2. `GET /api/v1/public/tasks/{id}`

It requires explicit `BASE_URL` and `PUBLIC_TASK_ID` variables and refuses to run without them. The final runs used `http://127.0.0.1:8091`, the isolated API only, for 30 seconds each.

| Scenario | HTTP requests | Requests/sec | Avg latency | p95 latency | Max latency | Failed HTTP requests | Functional checks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 50 VUs, 30s | 14,200 | 471.05 | 5.85 ms | 13.48 ms | 121.85 ms | 0.00% | 28,400 / 28,400 passed |
| 100 VUs, 30s | 28,600 | 946.91 | 5.35 ms | 13.95 ms | 45.57 ms | 0.00% | 57,200 / 57,200 passed |

These figures cover only local loopback traffic, a synthetic 100-row data set, and unauthenticated public reads. They exclude TLS, Clerk token verification, PostGIS discovery, external map services, AI features, deployed infrastructure, and production-like network latency. They must not be presented as production throughput commitments.

## Reproduction and remaining validation

For a complete spatial integration run, create a dedicated isolated Neon branch or local PostgreSQL/PostGIS database, configure only that test target through local environment variables, apply all migrations including `V11`, and execute:

```sh
cd backend
./mvnw -Duniwork.neon.integration=true test
```

Then confirm `PostGIS_Version()`, Flyway `V11`, and the marketplace near-search query with seeded data. Use a real Clerk test account only in an isolated development instance to exercise end-to-end authenticated role behavior; no token or secret should be recorded in test output.

## Follow-up priorities

1. Add a PostGIS-capable ephemeral test target in CI so native marketplace discovery is no longer manually gated.
2. Add end-to-end API tests with a Clerk development-instance token fixture or controlled test issuer.
3. Run a longer, staged benchmark against a production-like non-production deployment after observability and resource limits are configured.
4. Resolve the React test renderer script-tag warning in the navigation test.

## CV-ready contribution summary

> Built a repeatable local engineering validation workflow for a Spring Boot/Next.js/Expo marketplace: expanded backend coverage to 52 tests, hardened REST validation responses, verified Flyway/Hibernate startup on isolated PostgreSQL, and established reproducible k6 baselines at 50 and 100 virtual users.
