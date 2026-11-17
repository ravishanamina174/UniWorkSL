# UniWorkSL UI redesign

Date: 2026-11-17

## Visual system

The refreshed identity uses an outlined 3D cube with a small U detail and the `UniWorkSL` wordmark. Web uses an inline SVG; Expo uses the already-installed `react-native-svg` package. Geist Sans and Geist Mono remain the Next.js fonts. Mobile keeps the platform system font for native rendering and startup performance.

| Role | Light | Dark |
| --- | --- | --- |
| Main background | `#FBFBF8` | `#171A16` |
| Raised surface | `#FFFFFF` | `#252A24` |
| Primary text | `#292B27` | `#F3F4EF` |
| Muted text | `#686D64` | `#B0B7AA` |
| Border | `#E2E4DD` | `#353C32` |
| Brand accent | Forest `#4F7D32` | Sage `#A5C58B` |

Success, warning, and error remain distinct semantic tokens. Slate blue, terracotta, warm tan, and sunflower are reserved for meaning or restrained highlights. Cards and controls use small rectangular corners, thin borders, and limited elevation. Light and dark themes share the same hierarchy.

## Public landing page

- Sticky navigation links to Why UniWork, How it Works, and Student Safety, plus student download and Task Poster actions.
- Hero uses the supplied `apps/web/public/Hero.png` as a priority-loaded, responsive background with a readable overlay and reduced-motion-aware entrance.
- A responsive, coded application-window preview sits below the hero copy. It is labeled illustrative and does not imply live marketplace data.
- Editorial about, separate Student/Task Poster journeys, category grid, Task Poster callout, student download/QR state, safety information, and footer retain the existing content and routes.
- Download remains Coming Soon until a valid HTTPS APK URL is configured. Safety copy describes the existing PIN, optional foreground location check, reviews, private reports, and direct-payment limits accurately.

## Task Poster dashboard and shared web components

Central CSS tokens carry the new forest/sage palette through the existing dashboard shell, navigation drawer, tables, task lists, forms, validation, statuses, profile, PIN, and dialog screens. Common buttons, fields, badges, containers, empty/loading states, and Clerk-hosted sign-in/up use the same small-radius, border-led style. Clerk appearance variables follow the active light/dark tokens. Existing route guards and task operations are unchanged.

## Student app

The shared native theme applies the same neutral, forest/sage, slate, and semantic status colors to authentication, onboarding, tabs, marketplace, task detail, application, execution, completion, review, report, and profile routes. System dark mode is supported. The shared task card now orders the date and status, title, LKR amount, location, short description, skill tags, and details action for quick scanning. The outlined cube wordmark is used on authentication screens. Native navigation and API/authentication handlers remain in place.

## Responsive behavior and interaction

The landing page and dashboard switch to stacked sections and a drawer-style dashboard menu at tablet/phone widths; category and workflow grids collapse without changing their underlying navigation. Native screens remain mobile-first, use the existing safe-area wrapper, and keep the task details action touch-sized. Focus rings remain visible, buttons retain hover/pressed states, and reduced-motion preferences disable entrance and other motion.

## Verification

- Web lint, typecheck, unit/component tests, and production build: passed (19 tests across 8 files).
- Mobile TypeScript, lint, and tests: passed (6 tests across 2 files).
- Expo dependency compatibility and Expo Doctor: passed (20/20).
- Metro export: iOS and Android bundles passed.
- Spring Boot Maven verify: passed (32 tests) with the local `WEB_ORIGIN=http://localhost:3000` expected by the CORS test; without that override, the environment's configured origin caused the preflight assertion to return 403.
- A local browser loaded the redesigned landing page and its route/section links. The supplied reference images in `apps/docs/design-references/` and the hero image were reviewed. Full desktop/mobile pixel review, authenticated dashboard visual review, and native-device review were not available in this run.
- Spring Boot and database code were not changed. No API, task lifecycle, Clerk authentication, or data operations were replaced with preview data.
