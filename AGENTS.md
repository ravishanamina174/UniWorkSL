# UniWork contributor instructions

- Read `PROJECT_SPEC.md` and `UI_DESIGN_SYSTEM.md` before changing application code; keep them unchanged.
- Use the confirmed stack: Next.js/TypeScript/Tailwind, Spring Boot/Java 21, PostgreSQL/PostGIS, Flyway, and REST.
- Keep the backend a package-by-feature modular monolith. Use DTOs at API boundaries and constructor injection.
- Students use the future mobile app only; Task Posters use the web dashboard only. Both use the shared Spring Boot API.
- Do not add payment processing to Version 1. Payments are direct between users.
- Never introduce Docker for local development.
- Do not use mock business logic in completed features or report unverified integrations as working.
- Protect secrets and personal information; use environment variables and keep local `.env` files untracked.
- Keep documentation accurate, run relevant tests/builds when asked or required, and avoid unrelated changes.
