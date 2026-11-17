# API foundation

Base path: `/api/v1`. The public `GET /api/v1/health` endpoint returns `{ "status": "UP" | "DOWN", "application": "UniWork API", "database": "UP" | "DOWN" }`. Database status comes from an actual JDBC connection check and does not include connection details. It returns HTTP 503 when the database cannot be reached.

All other API routes require a valid Clerk bearer JWT through Spring Security. Configure `CLERK_ISSUER_URI` for issuer/JWKS validation; when absent, tokens fail validation and protected routes remain closed. The web API client accepts an optional access-token callback for future Clerk integration. Swagger UI is available at `/swagger-ui/index.html` and OpenAPI JSON at `/v3/api-docs` in development.
