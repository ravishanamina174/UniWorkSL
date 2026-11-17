# Web UI and Task Poster dashboard

## Design system

The public site and dashboard use Geist Sans and Geist Mono, Tailwind CSS 4, restrained violet accents, thin neutral borders, and small rectangular corners. Semantic light/dark tokens are centralized in `apps/web/src/app/globals.css`. Theme choice persists through `next-themes`. Lucide icons and reusable navigation, form, card, badge, loading, empty-state, and dialog components are used consistently.

The public landing-page interface preview is illustrative and contains no live records. The category grid shows examples, not listings. The backend health diagnostic is development-only.

## Clerk onboarding and API session

Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `apps/web/.env.local` to render Clerk sign-up and sign-in. New web accounts are routed to `/dashboard/onboarding`. The protected dashboard requires a Clerk session. It checks `GET /api/v1/poster/profile/status` and routes incomplete accounts to onboarding. Sign-up, onboarding, profile, and task requests use the Clerk session token supplied by `useAuth().getToken()` to the Spring API.

The backend assigns internal `TASK_POSTER` role only when a verified Clerk subject first completes the Task Poster profile. The role is stored in `uniwork_users`, is not accepted in profile or task request bodies, and is checked for every poster API. Users with an existing internal `STUDENT` role cannot change it through onboarding. There is no authorization decision based on client-editable Clerk metadata.

With either Clerk key missing, the dashboard shows a configuration-required screen. No real Clerk login has been verified until a project issuer and browser keys are supplied. Backend `CLERK_ISSUER_URI` is also required; the JWT validator fails closed if it is missing.

## Profile data

Profile reads and updates are owner-scoped. The private profile view masks NIC; the edit screen shows the owner's value so it can be updated. NIC is AES-256-GCM encrypted in PostgreSQL under `UNIWORK_PII_ENCRYPTION_KEY`; keep the stable key outside source control and back it up securely. Home address and NIC are not part of the public task or poster application DTOs.

## Dashboard pages and APIs

- `/dashboard` reads real task and pending-application counts.
- `/dashboard/tasks` lists owned records with server-side search, status filter, and pagination.
- `/dashboard/tasks/new` saves drafts or publishes tasks; location is selected from the map or validated manual coordinates.
- `/dashboard/tasks/[taskId]` reads an owned task and exposes only server-eligible actions.
- `/dashboard/tasks/[taskId]/edit` edits drafts only.
- `/dashboard/profile`, `/dashboard/profile/edit`, and `/dashboard/onboarding` use the profile APIs.
- `/dashboard/applications` and `/dashboard/tasks/[taskId]/applications` show server records or true empty states.

No sample task statistics, tasks, or applications are inserted. Application creation and selection stay in Prompt 4.

## Google Maps configuration

Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to load the Maps JavaScript API with its dynamic library loader. Restrict this browser key to the Maps JavaScript API and the exact HTTP referrers for development and deployment. Google documents dynamic `importLibrary()` loading and map click events in [Maps JavaScript API libraries](https://developers.google.com/maps/documentation/javascript/libraries) and [Events](https://developers.google.com/maps/documentation/javascript/events).

With no key, the form states that the map is unavailable and still allows manual latitude and longitude entry. With a key, a user can click the real map to set a draggable marker. Browser geolocation is requested only after the user chooses “Use my current location”; denied permission leaves manual entry available. Map/API errors are displayed as errors and are never represented as a working map.

## Persistence and PostGIS

Default Flyway migration V1 and core migration V2 create and constrain the user, encrypted profile, task, task skill, and application schema on PostgreSQL without PostGIS. Task coordinates use numeric columns with database and request-level range checks. Task schedule inputs are interpreted in `Asia/Colombo`, converted to UTC `Instant` storage, and returned in Sri Lanka local time.

The `db/postgis/V3__enable_postgis.sql` migration runs under the `postgis` Spring profile and enables PostGIS in the target PostgreSQL database. The application still uses its Haversine distance service; PostGIS spatial queries are not part of the current task flow. See [local setup](local-setup.md#postgresql-and-migrations) for target database checks and migration order.

## APK link and QR code

Set `NEXT_PUBLIC_ANDROID_APK_URL` to an HTTPS URL to render the download link and a QR code encoding the same URL. Missing, invalid, or non-HTTPS values show Coming Soon and never render a broken link or QR code. No APK or signed release artifact is included.
