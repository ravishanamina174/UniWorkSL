# Architecture overview

UniWork is a client-server system with a single Spring Boot modular monolith. The public site and Task Poster dashboard are web clients; the future Student client is a mobile-only Expo app. All clients call versioned REST endpoints. Clients never connect to PostgreSQL directly.

## Backend modules

Organize future business work by feature (`user`, `student`, `poster`, `task`, `application`, `execution`, `location`, `review`, `safety`). Each feature owns its HTTP controller, DTOs, service, repository, and persistence entities as needed. `common` holds shared API response/error types; `config` and `security` hold cross-cutting infrastructure. Keep business rules in services and use transactions for multi-record state changes.

## Authentication

Clerk is the identity provider. Spring Security is configured as an OAuth2 resource server and validates bearer JWTs using the configured Clerk issuer/JWKS discovery. Public routes are explicitly allowlisted; other routes require a valid JWT. Role and ownership checks belong on server-side authorization rules and services. The browser API client can accept a token provider for future Clerk integration; it does not invent or persist tokens.

## Database

PostgreSQL is the relational source of truth, with PostGIS for geographic data and distance operations. Flyway owns schema changes. Hibernate validates rather than creates the schema. Local development uses native PostgreSQL, without containers. Sensitive identity fields must be access-controlled and omitted from public DTOs.

## Mobile integration

The future Expo student app will use the same REST API and Clerk identity system as web. Shared TypeScript API types live in `packages/api-contracts`; as API surface grows, generate client types from Springdoc OpenAPI to avoid schema drift. Java DTOs remain authoritative.
