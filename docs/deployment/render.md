# Render backend deployment

The backend-only image is built by `backend/Dockerfile`. The root `render.yaml` Blueprint points Render at that Dockerfile and uses `backend/` as the Docker build context; keep the repository root as the Blueprint repository directory. Render supports Dockerfile and context paths relative to the repository root. See [Render's Blueprint reference](https://render.com/docs/blueprint-spec) and [Docker deployment guide](https://render.com/docs/docker).

## Blueprint settings

- Service type: Web Service; runtime: Docker.
- Dockerfile: `./backend/Dockerfile`.
- Docker build context: `./backend`.
- Health check path: `/api/v1/health`.
- `SPRING_PROFILES_ACTIVE=postgis,prod` enables the PostGIS Flyway location and production settings.
- Render supplies `PORT`; Spring Boot binds to `${PORT:8080}`. Do not set a fixed port in the dashboard.
- Hikari defaults cap each instance at five pooled connections, one idle connection, and a 29-minute maximum connection lifetime. The Blueprint lets operators override pool bounds.

The image uses Maven with Java 21 for its build stage and a non-root Java 21 JRE Alpine runtime. `backend/.dockerignore` excludes local `.env` files and build output. No credentials are baked into the image. Container runtime testing has not been performed locally.

## Required Render environment values

Provide these in the Render Dashboard or Blueprint prompt; never commit their values:

| Variable | Value to provide |
| --- | --- |
| `DB_URL` | Neon direct JDBC URL: `jdbc:postgresql://<direct-host>/<database>?sslmode=require` |
| `DB_USERNAME` | Neon database username |
| `DB_PASSWORD` | Neon database password |
| `CLERK_ISSUER_URI` | HTTPS issuer for the production Clerk instance |
| `CLERK_JWT_AUDIENCE` | The exact API audience if production Clerk session tokens include one; leave blank only when no audience is configured |
| `CLERK_AUTHORIZED_PARTIES` | Comma-separated exact origins permitted by policy; must include `WEB_ORIGIN` |
| `WEB_ORIGIN` | The canonical HTTPS Vercel Task Poster origin, with no path or trailing slash |
| `UNIWORK_PII_ENCRYPTION_KEY` | Base64 encoded 32-byte AES key, stored as a secret and preserved for the lifetime of data encrypted with it |

`CLERK_JWKS_URI` is optional; by default the backend uses `<issuer>/.well-known/jwks.json`. Determine the mobile token's actual `azp` from a real Clerk Student session before adding a mobile party to `CLERK_AUTHORIZED_PARTIES`. Do not allow broad wildcards or weaken JWT validation to get a mobile request accepted. Clerk's guidance recommends explicitly allowlisting authorized parties when the claim is present: [Clerk session token claims](https://clerk.com/docs/guides/sessions/session-tokens).

The production profile refuses to start unless the Neon URL uses `sslmode=require`, the web origin and Clerk issuer use HTTPS, the allowed-party list includes that exact web origin, and the PII key decodes to 32 bytes. The Hibernate schema mode remains `validate`; Flyway stays enabled. V7 and PostGIS 3.6 were verified on the currently configured Neon database. Do not use the local development `.env` values for production; configure production Clerk keys and origins separately.

## Release verification after deployment

1. Confirm Render reports a healthy deployment and copy the assigned HTTPS service URL.
2. Request `GET https://<render-service>/api/v1/health`; expect HTTP 200 with application and database `UP`.
3. Review deployment logs for Flyway validation/current version, Hibernate initialization, and successful server startup. Never paste secret-bearing environment output into tickets or commits.
4. Confirm `/swagger-ui` and `/v3/api-docs` are disabled under the production profile.
5. Send an unauthenticated request to a protected Student and Poster endpoint; expect HTTP 401. Then use controlled production Clerk test identities to verify valid role and owner checks.
6. Use an approved read-only database query to verify `PostGIS_Version()` and Flyway V7. Do not create test business records in production.

No Render service has been created and no public backend URL is available yet.
