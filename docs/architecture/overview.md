# Architecture overview

UniWork is a client-server system with a single Spring Boot modular monolith. The public site and Task Poster dashboard are web clients; the future Student client is a mobile-only Expo app. All clients call versioned REST endpoints. Clients never connect to PostgreSQL directly.

## Backend modules

Organize future business work by feature (`user`, `student`, `poster`, `task`, `application`, `execution`, `location`, `review`, `safety`). Each feature owns its HTTP controller, DTOs, service, repository, and persistence entities as needed. `common` holds shared API response/error types; `config` and `security` hold cross-cutting infrastructure. Keep business rules in services and use transactions for multi-record state changes.

## Authentication

Clerk is the identity provider. Spring Security is configured as an OAuth2 resource server and validates bearer JWTs using the configured Clerk issuer/JWKS discovery. Health and published-task GET routes are public; poster routes require a valid JWT. During web onboarding, the backend binds the verified Clerk `sub` to an internal user and assigns `TASK_POSTER` once. Subsequent poster APIs require that server-side role and check ownership in repository queries. No request DTO accepts role changes, and Clerk client metadata is not an authorization source. If Clerk issuer configuration is missing, protected API routes fail closed.

## Database

Neon PostgreSQL is the relational source of truth for the configured platform. Flyway owns schema changes; Hibernate validates rather than creates the schema. The `postgis` profile applies V3 (`CREATE EXTENSION IF NOT EXISTS postgis`) before V4–V7 on a fresh target. Task arrival continues to use the existing Haversine implementation. JDBC SSL is required. NIC values are stored using AES-256-GCM ciphertext with a stable server-held encryption key. Private profile data is owner-scoped and omitted from public task/application DTOs. No local PostgreSQL server is required to run the backend.

## Mobile integration

The future Expo student app will use the same REST API and Clerk identity system as web. Shared TypeScript API types live in `packages/api-contracts`; as API surface grows, generate client types from Springdoc OpenAPI to avoid schema drift. Java DTOs remain authoritative.
