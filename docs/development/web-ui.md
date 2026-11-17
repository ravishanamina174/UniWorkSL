# Web UI foundation

## Design system

The public site and dashboard use Geist Sans and Geist Mono, Tailwind CSS 4, restrained violet accents, 1px neutral borders, and 4px component corners. Semantic light/dark tokens are centralized in `apps/web/src/app/globals.css`; the theme choice persists through `next-themes` and can follow the system preference. Lucide icons are used consistently. Navigation, forms, cards, badges, empty states, loading indicators, and dialogs are reusable components.

The landing-page interface preview is illustrative and contains no live task data. The task category grid presents examples only. The backend health diagnostic appears in development and is omitted from production pages.

## APK link and QR code

Set `NEXT_PUBLIC_ANDROID_APK_URL` to an HTTPS URL to render the download link and a QR code encoding the same URL. Missing, invalid, or non-HTTPS values show Coming Soon and never render a QR code or broken download link. Do not commit a real APK or signed release artifact in this foundation milestone.

## Dashboard protection

Set both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in the web environment. With either value missing, `/dashboard` displays a configuration-required screen and does not render the dashboard shell. With both present, `src/proxy.ts` provides Clerk request context, the server layout requires a Clerk session, and the current Clerk user must have server-controlled `publicMetadata.role` equal to `task_poster`. Do not set this authorization value from client-controlled `unsafeMetadata`.

The Clerk account’s public metadata can be provisioned through an administrator-controlled Clerk action. The web shell calls Clerk’s server API to verify that role. Backend authorization for task-management routes remains part of the later backend feature work; no business API or task data is exposed by this shell.

## PostGIS local-development options

The current Homebrew PostGIS formula planned 96 dependencies and upgrades to 16 installed packages on the development Mac. That broad installation was not applied. No PostGIS extension or spatial query is claimed to work.

Options for the team:

1. Use an existing managed PostgreSQL service that offers PostGIS and a separate UniWork development database. For example, Supabase documents enabling PostGIS from its database extension settings. Keep credentials local and use the existing `DB_URL` configuration.
2. Install a PostgreSQL distribution that bundles PostGIS, such as Postgres.app. It manages its own PostgreSQL cluster, so use it as a deliberate replacement or separate server rather than copying its extension files into the Homebrew PostgreSQL 16 installation.
3. Approve the Homebrew PostGIS dependency changes after reviewing the formula plan, or build PostGIS and its GIS dependencies manually. This is the heaviest local option.

The current UniWork PostgreSQL service and database remain available. Do not disable Flyway in normal development; its initial migration needs PostGIS. Once a provider is selected, enable PostGIS in the `uniwork` database and run the default Flyway migration.
