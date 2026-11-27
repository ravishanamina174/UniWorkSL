# Environment variable reference

Use ignored local environment files for development and each hosting provider's secret store for production. Example files contain placeholders only. Never commit `.env`, `.env.local`, private Clerk keys, database credentials, or the PII encryption key.

| Variable | Client/service | Required / purpose |
| --- | --- | --- |
| `DB_URL` | Render / backend | Direct Neon JDBC URL with `sslmode=require` |
| `DB_USERNAME`, `DB_PASSWORD` | Render / backend | Neon credentials |
| `CLERK_ISSUER_URI` | Render / backend | Clerk production issuer; HTTPS |
| `GEMINI_API_KEY` | Render / backend | Server-side Google Gemini key; never expose to clients |
| `GEMINI_MODEL` | Render / backend | Gemini model name; defaults to `gemini-3.6-flash` |
| `CLERK_JWKS_URI` | Render / backend | Optional custom JWKS endpoint; otherwise issuer default |
| `CLERK_JWT_AUDIENCE` | Render / backend | Optional exact API audience when present in tokens |
| `CLERK_AUTHORIZED_PARTIES` | Render / backend | Exact comma-separated allowed token parties; include canonical web origin and verify mobile `azp` before adding it |
| `WEB_ORIGIN` | Render / backend | One canonical HTTPS Vercel origin, used for CORS |
| `UNIWORK_PII_ENCRYPTION_KEY` | Render / backend | Stable Base64 32-byte AES key; preserve for records encrypted with it |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Render / backend | Private Cloudflare R2 credentials for NIC manual reviews |
| `R2_BUCKET_NAME` | Render / backend | Private bucket, normally `uniwork-identity` |
| `R2_ENDPOINT` | Render / backend | Optional S3 endpoint override; otherwise derived from account ID |
| `IDENTITY_REVIEW_RETENTION_DAYS` | Render / backend | Pending review expiry, default 30 days |
| `IDENTITY_ORPHAN_GRACE_DAYS` | Render / backend | Age after which unreferenced NIC objects are deleted, default 45 days |
| `IDENTITY_CLEANUP_INTERVAL_MS` | Render / backend | Retry and expiry sweep interval, default one hour |
| `IDENTITY_TESSERACT_COMMAND` | Backend | Optional OCR binary path; default `tesseract` |
| `NEXT_PUBLIC_API_BASE_URL` | Vercel / web; EAS / mobile | Backend origin; HTTPS in production |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Vercel / web | Browser-visible Clerk publishable key; environment-specific |
| `CLERK_SECRET_KEY` | Vercel / web | Clerk server secret; environment-specific |
| `CLERK_SECRET_KEY` | Render / backend | Same Clerk instance secret; required for live Admin role checks against Clerk Backend API |
| `CLERK_API_URL` | Render / backend | Optional Clerk Backend API override; default `https://api.clerk.com/v1` |
| `NEXT_PUBLIC_ADMIN_TILE_URL` | Vercel / web | Optional Admin map raster tiles; default OpenStreetMap standard tiles |
| `NEXT_PUBLIC_ADMIN_TILE_ATTRIBUTION` | Vercel / web | Attribution for the configured Admin tile provider |
| `WATCHLIST_LOW_RATING_THRESHOLD` | Render / backend | Highest star rating flagged for review; default `2` |
| `WATCHLIST_SERIOUS_REPORT_THRESHOLD` | Render / backend | Count of harassment or unsafe-location reports that triggers review; default `2` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Vercel / web | Optional Maps JS key, restrict by API and referrer |
| `NEXT_PUBLIC_ANDROID_APK_URL` | Vercel / web | Public HTTPS APK URL only after successful build/hosting |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | EAS / mobile | Browser-visible Clerk publishable key for the matching instance |
| `SPRING_PROFILES_ACTIVE` | Render / backend | `postgis,prod` |
| `PORT` | Render / backend | Automatically supplied by Render; do not hard-code |
| `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE` | Render / backend | Default/Blueprint cap: 5 per instance |
| `SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE` | Render / backend | Default/Blueprint idle floor: 1 |

For local emulator development, mobile's example API origin uses `http://10.0.2.2:8080`. For physical-device development, replace it with a reachable computer LAN address. Production must use HTTPS.
