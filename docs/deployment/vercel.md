# Vercel web deployment

Deploy the existing Next.js public landing page and Task Poster dashboard as a Vercel monorepo project. Vercel supports a project root inside a pnpm workspace; set **Root Directory** to `apps/web`. See [Vercel monorepo support](https://vercel.com/docs/monorepos).

## Build settings

- Framework preset: Next.js (auto-detected).
- Root Directory: `apps/web`.
- Install command: keep Vercel's pnpm workspace detection/default install command.
- Build command: `pnpm build` (also set in `apps/web/vercel.json`). The app build first builds `@uniwork/api-contracts`, then runs the optimized Next.js build.
- Output directory: Next.js default `.next`.
- Node.js: use a supported LTS version compatible with the repository's Next.js 16 release.

## Environment variables

Set separate values for Preview and Production in Vercel. Production must use a dedicated Clerk production instance and the deployed Render API URL.

| Variable | Configuration |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Render API HTTPS origin, for example `https://<service>.onrender.com`; no `/api/v1` suffix |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Production Clerk `pk_live_...` value |
| `CLERK_SECRET_KEY` | Production Clerk `sk_live_...` secret |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional browser key, restricted to the Maps JavaScript API and exact production Vercel referrer origins |
| `NEXT_PUBLIC_ANDROID_APK_URL` | Leave empty/unset until a public HTTPS APK artifact has been uploaded and verified |

Add the canonical production Vercel origin to the production Clerk instance's allowed origins/redirect settings and set that same origin as Render's `WEB_ORIGIN` and an exact member of `CLERK_AUTHORIZED_PARTIES`. The backend CORS configuration accepts the single configured web origin; do not use `*`. Use test Clerk keys only in Preview and ensure the preview API is a non-production environment before enabling preview sign-in.

The landing page intentionally keeps its Student app download in the Coming Soon state while `NEXT_PUBLIC_ANDROID_APK_URL` is absent. Its QR code is generated from the same HTTPS URL only after one is configured. Never set this variable to a private or nonexistent artifact.

## Manual deployment and checks

1. Connect the repository to Vercel and set the project root to `apps/web`.
2. Configure the Production and Preview environment variables with the correct corresponding Clerk instances.
3. Deploy to Preview and verify the public page, Clerk sign-in/up pages, protected dashboard gate, and responsive browser layouts.
4. Create the Render backend, configure production values, and deploy it before promoting the web project.
5. Set `NEXT_PUBLIC_API_BASE_URL` to the tested Render HTTPS URL, then redeploy.
6. Use controlled Poster and Student test accounts to verify APIs. No deployment URL or production Clerk credentials are available in the current workspace.
