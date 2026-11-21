# Safety administration workspace

The restricted workspace lives at `/admin/dashboard`. It has no public or Task Poster navigation entry. Admin pages require Clerk sign-in and the exact Clerk **Public Metadata** value:

```json
{"role":"Admin"}
```

Assign this value manually to each trusted administrator in the Clerk Dashboard. There is no Admin sign-up or role-changing UI. No custom session claim is required: Next.js reads the current Clerk user on the server before rendering, and Spring Boot checks the current Clerk Backend API user record on **every** `/api/v1/admin/**` request after validating the JWT. This makes removal effective on the next backend request, even if a browser still has a valid session token. Configure `CLERK_SECRET_KEY` on the backend with the secret for the same Clerk instance as `CLERK_ISSUER_URI`; it is already needed by the web server. If Clerk is unavailable or the key is missing, Admin requests fail closed. This design favors immediate revocation over the Backend API rate limit; keep Admin access to the intended small internal team.

## Data and operations

Flyway `V12__safety_admin_cases.sql` adds payment disputes, watchlist case state, case notes, temporary publishing restrictions, and append-only audit events. Existing tasks, reviews, reports, profiles and SafeTask sessions remain authoritative. By default, 1- or 2-star reviews and at least two `HARASSMENT`/`UNSAFE_LOCATION` reports trigger watchlist review. Adjust `WATCHLIST_LOW_RATING_THRESHOLD` and `WATCHLIST_SERIOUS_REPORT_THRESHOLD` on the backend if policy changes. A newer signal reopens a previously resolved or dismissed watchlist case. This policy flags concerns for human review; it never automatically suspends an account or declares misconduct.

Only the assigned student can file a payment complaint for a completed task. The backend reads the agreed amount from the task; the student cannot change it. A unique `(task_id, reason)` constraint prevents duplicate complaints for the same issue. The relevant poster can submit one response. Administrators can add notes and reasoned decisions. Payment evidence upload is deferred because there is no secure file storage provider; the platform cannot independently prove direct payments or issue refunds.

Admin task monitoring shows the **agreed task address and coordinates** only. It never returns SafeTask guardian tokens or student live coordinates. The map uses Leaflet and OpenStreetMap standard raster tiles by default, with visible attribution. This is a small interactive internal map, with no background prefetch or offline downloads. Configure `NEXT_PUBLIC_ADMIN_TILE_URL` and `NEXT_PUBLIC_ADMIN_TILE_ATTRIBUTION` together if a licensed provider is needed. Follow the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/) for the default endpoint. The list remains usable if map tiles fail.

## Local verification

Use a disposable PostgreSQL/PostGIS database or a safe Neon branch. Never point unreviewed migrations or test fixtures at the shared production database. Start Spring Boot with the normal `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, Clerk issuer, PII key, and backend `CLERK_SECRET_KEY`. Keep Hibernate `ddl-auto: validate`. The optional transactional integration test is enabled with `UNIWORK_ADMIN_INTEGRATION_TEST=1` and uses the configured database; run it **only** against an isolated database.

The required Admin APIs are under `/api/v1/admin/`. Student complaints use `/api/v1/student/tasks/{taskId}/payment-disputes`; poster case reads use `/api/v1/poster/tasks/{taskId}/payment-disputes`, and poster responses use `/api/v1/poster/payment-disputes/{id}/response`.

## Deployment and manual checks

1. Review and back up the target database. Deploy the backend first so Flyway V12 and all new APIs are available. Set backend `CLERK_SECRET_KEY` before enabling Admin use. Confirm backend startup and schema validation.
2. Deploy the web app with the existing Clerk settings and API base URL. Optionally configure the Admin tile URL and attribution. Browse directly to `/admin/dashboard`.
3. Build and distribute the updated Android app after the backend deployment so students can submit payment complaints.
4. In Clerk, assign `{"role":"Admin"}` to 2–3 trusted accounts. Sign in afresh. Check Admin access, then remove the role and confirm the next Admin API call returns 403. Confirm non-admin and unauthenticated rejection.
5. With safe test accounts, start a task, verify its agreed location appears in Admin monitoring, add a low rating, inspect the watchlist signals, file a payment complaint, submit the poster response, record a decision, apply and remove a publishing restriction, and inspect audit history. Confirm existing tasks remain available and no live student position appears in Admin data.

No deployment, real Clerk account test, or shared Neon migration is performed by the local implementation workflow.
