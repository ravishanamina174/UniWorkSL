# 19. UI Design Principles — UniWork Sri Lanka

**Design System:** UniWork Minimal Box UI  
**Design Inspiration:** Render Website & Dashboard  
**Platforms:** Landing Page, Task Poster Web Dashboard, Student Mobile Application  
**Design Direction:** Minimal, Modern, Structured, Professional

## 19.1 Overall Design Philosophy

UniWork will follow a **minimal, box-based user interface design** inspired by the Render platform.

The entire platform should feel clean, modern, organized, professional, and easy to use.

The design will mainly depend on:

- Box-shaped components with nearly square corners.
- Thin and subtle borders.
- Clear separation between sections.
- Large, readable typography.
- Generous empty space.
- Minimal use of shadows.
- Carefully controlled colors.
- Simple icons and navigation.
- Consistent spacing and alignment.
- Strong visual hierarchy.
- Responsive layouts.
- Smooth and subtle interactions.

**Main Principle:** Use borders, typography, spacing, and layout structure to create visual hierarchy instead of relying on unnecessary decoration.

---

## 19.2 Corners and Border Radius

All major UI components should use a structured, box-shaped appearance.

### Corner Rules

| Component | Border Radius |
|---|---|
| Main sections | 0–4px |
| Cards | 4px |
| Buttons | 4px |
| Inputs | 4px |
| Dialogs / Modals | 6px |
| Navigation items | 2–4px |
| Badges | 2–4px |
| Images | 4px |
| Avatars | Circular where appropriate |

### Design Requirements

- Avoid heavily rounded cards.
- Avoid pill-shaped buttons by default.
- Avoid excessively soft, bubble-like UI elements.
- Prefer rectangular layouts with sharp edges.
- Use the same corner style across the platform.

Small corner radii should provide a refined appearance without losing the structured box design.

---

## 19.3 Borders and Dividers

Borders are a primary visual element of the UniWork design system.

### Border Rules

- Use thin 1px solid borders.
- Prefer subtle gray borders.
- Avoid thick or highly contrasting borders unless highlighting focus or an important state.
- Use dividers to separate related content.
- Use borders instead of shadows for most containers.
- Maintain consistent border colors within each theme.

### Suggested Border Colors

| Theme | Border Color |
|---|---|
| Light | `#E5E5E5` |
| Dark | `#292929` |
| Strong Light Divider | `#D4D4D4` |
| Strong Dark Divider | `#404040` |

Border colors can be adjusted slightly during implementation to maintain accessibility and visual consistency.

---

## 19.4 Color System

UniWork will use a neutral design system with a limited accent color.

The UI should not become colorful or visually distracting.

### Light Theme

| Element | Color |
|---|---|
| Main Background | `#FFFFFF` |
| Secondary Background | `#FAFAFA` |
| Card Background | `#FFFFFF` |
| Primary Text | `#111111` |
| Secondary Text | `#666666` |
| Border | `#E5E5E5` |

### Dark Theme

| Element | Color |
|---|---|
| Main Background | `#0D0D0D` |
| Secondary Background | `#141414` |
| Card Background | `#171717` |
| Primary Text | `#F5F5F5` |
| Secondary Text | `#A3A3A3` |
| Border | `#292929` |

### Accent Color

A restrained violet accent is recommended based on the reference design.

**Suggested Accent:** `#7C3AED`

Use the accent color for:

- Active navigation items.
- Selected states.
- Interactive text links.
- Focus borders.
- Important highlights.
- Small icons.
- Selected filters.

Do not use the accent color everywhere.

### Semantic Colors

- Green: Success / Completed / Verified.
- Red: Error / Failed / Dangerous action.
- Amber: Warning / Pending attention.
- Blue: Information.

Use muted backgrounds and clear text for status indicators.

**Important:** The proposed colors are initial design tokens. The final brand color can be changed without changing the overall design system.

---

## 19.5 Typography

Typography should be one of the strongest design elements across UniWork.

### Typography Style

- Use a clean, modern sans-serif font.
- Prefer Inter or Geist for the web.
- Use a consistent, readable font family in the mobile application.
- Use large typography for important headings.
- Use regular or medium font weights for most content.
- Use bold text only when necessary.
- Maintain strong contrast between headings and descriptions.

### Suggested Typography Scale

| Element | Desktop Size |
|---|---|
| Landing Hero Heading | 64–88px |
| Landing Section Heading | 44–64px |
| Dashboard Page Heading | 28–36px |
| Card Heading | 18–22px |
| Body Text | 15–16px |
| Small Description | 13–14px |
| Badge / Metadata | 12–13px |

On mobile screens, typography should scale down appropriately.

### Typography Rules

- Prefer short and meaningful headings.
- Avoid unnecessary uppercase text.
- Use muted gray for secondary descriptions.
- Maintain comfortable line height.
- Avoid too many font weights.
- Keep text alignment consistent.
- Use tabular numbers where useful for payment amounts, statistics, and verification codes.

For the landing page, large typography should provide the main visual impact.

---

## 19.6 Spacing and Empty Space

Generous empty space is a major part of this design language.

The platform should never feel crowded.

### Spacing System

Use a consistent spacing scale based on 4px increments.

Examples:

`4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px`

### Spacing Guidelines

- Maintain enough distance between major sections.
- Use comfortable internal padding for cards.
- Keep consistent gaps between inputs.
- Align all content to a common grid.
- Avoid placing too many elements in small areas.
- Use more empty space on the landing page.
- Use balanced spacing for dashboards.
- Use compact but comfortable spacing on mobile.

### Recommended Padding

| Element | Padding |
|---|---|
| Desktop Dashboard Content | 32–48px |
| Web Cards | 20–24px |
| Form Containers | 24–32px |
| Landing Page Sections | 80–120px vertical |
| Mobile Screen | 16–20px horizontal |
| Mobile Cards | 16–20px |

**Important:** Empty space should be intentional. Do not add extra cards or decorative elements just to fill available space.

---

# 19.7 Landing Page Design Principles

The UniWork landing page should follow the editorial, minimal style shown in the reference screenshots.

The landing page is a public marketing website, not a dashboard.

It should have stronger typography, larger spacing, and a more visually expressive layout.

## 19.7.1 Landing Page Header

### Design

- Simple horizontal navigation.
- UniWork logo on the left.
- Navigation links across the header.
- Open Dashboard button on the right.
- Thin borders only where necessary.
- Minimal background decoration.
- Sticky navigation if it improves usability.

### Mobile Behavior

- Compact header.
- UniWork logo.
- Mobile navigation menu.
- Accessible Open Dashboard action.

## 19.7.2 Hero Section

The hero section should be the strongest visual section of the landing page.

### Structure

- Large heading.
- Short supporting description.
- Primary action button.
- Secondary action button.
- Large product-related visual or carefully designed illustration below the hero content.

### Suggested Layout

```text
---------------------------------------------------
                    NAVIGATION
---------------------------------------------------


    LARGE HERO HEADING
    WITH STRONG TYPOGRAPHY

    Short supporting description explaining
    the value of UniWork.

    [ Download Student App ] [ Open Dashboard ]


    -----------------------------------------
    |                                       |
    |     MAIN PLATFORM VISUAL / PREVIEW    |
    |                                       |
    -----------------------------------------


---------------------------------------------------
```

### Hero Design Rules

- Use large, bold typography.
- Keep descriptions short.
- Avoid unnecessary illustrations.
- Maintain substantial space around the heading.
- Use rectangular buttons.
- Use subtle grids or background patterns only when appropriate.
- Avoid overly colorful gradients.
- Keep the main visual inside a bordered rectangular container.

### Suggested Theme

A dark hero section with white typography, followed by lighter content sections.

This creates a strong visual transition similar to the reference website.

## 19.7.3 Landing Page Sections

Use large, clearly separated sections.

Potential sections:

1. Hero
2. About UniWork
3. How UniWork Works
4. Student Opportunities
5. Task Poster Information
6. Mobile App Download with QR Code
7. Footer

### Layout Rules

- Alternate between full-width editorial sections and structured grid layouts.
- Use two-column layouts for important explanations.
- Use three-column layouts for step-by-step information.
- Avoid excessive card nesting.
- Use section dividers where helpful.
- Maintain large vertical spacing.

## 19.7.4 Feature Presentation

Use the minimal feature-grid style shown in the reference screenshots.

Each feature can contain:

- Small line icon.
- Short heading.
- One or two lines of description.

Not every feature needs its own card.

For some sections, use open grid layouts without surrounding borders.

## 19.7.5 Dark and Light Section Transitions

The landing page may use both dark and light backgrounds.

Recommended approach:

- Dark hero section.
- Dark introductory content when visually appropriate.
- Light feature sections.
- Neutral backgrounds for supporting information.
- Clearly separated download section.

Avoid changing backgrounds too frequently.

---

# 19.8 Task Poster Web Dashboard Design Principles

The Task Poster Dashboard should follow the structured administrative interface shown in the reference screenshots.

The dashboard should prioritize usability, clarity, task management, and easy navigation.

## 19.8.1 Overall Dashboard Layout

Use a consistent three-part structure:

1. Top Navigation Bar
2. Left Sidebar
3. Main Content Area

Optional contextual navigation can appear on the right side for complex pages.

### Desktop Layout

```text
---------------------------------------------------------
| LOGO | Workspace / Breadcrumbs | Search | Profile    |
---------------------------------------------------------
|              |                                        |
|  SIDEBAR     |        MAIN CONTENT AREA               |
|              |                                        |
| Dashboard    |  Page Title             [Action]      |
| Posted Tasks |                                        |
| Applications |  ----------------------------------    |
| Profile      |  |                                |    |
|              |  |       CONTENT SECTION          |    |
|              |  |                                |    |
|              |  ----------------------------------    |
|              |                                        |
---------------------------------------------------------
```

## 19.8.2 Sidebar Design

### Visual Style

- Fixed or collapsible sidebar.
- Thin right border.
- Same background as the main layout or slightly different neutral background.
- Simple line icons.
- Clear navigation labels.
- Comfortable spacing between items.
- No heavy shadows.

### Active Navigation State

- Subtle accent-colored background.
- Accent-colored text and icon.
- Rectangular highlight.
- Minimal corner radius.

### Sidebar Behavior

- Remain consistent across dashboard pages.
- Highlight the current page.
- Collapse on smaller screens.
- Convert into a drawer or mobile navigation on narrow devices.

## 19.8.3 Top Navigation Bar

### Components

- UniWork logo / application identity.
- Breadcrumb navigation.
- Page or workspace information.
- Profile avatar.
- Relevant utility actions.

### Design

- Fixed-height horizontal layout.
- Thin bottom border.
- Minimal icons.
- Neutral background.
- Avoid excessive controls.

## 19.8.4 Dashboard Content Area

### Design Requirements

- Clear page title at the top.
- Short description only when necessary.
- Primary page action aligned consistently.
- Structured content beneath the heading.
- Bordered data containers.
- Consistent page padding.
- Clear separation between sections.

Avoid placing everything inside separate floating cards.

Use simple content regions with thin borders where necessary.

## 19.8.5 Dashboard Cards

Dashboard cards should use:

- Flat backgrounds.
- Thin borders.
- Small corner radius.
- Clear heading hierarchy.
- Minimal shadows.
- Consistent padding.

### Example

```text
----------------------------------------
| Posted Tasks                         |
|                                      |
|  12                                  |
|                                      |
| View all tasks                    →   |
----------------------------------------
```

Statistics should be simple and easy to scan.

## 19.8.6 Tables and Lists

Task and application data should use clean table or list layouts.

### Design

- Thin row dividers.
- Minimal background changes.
- Clear column headings.
- Status badges.
- Consistent alignment.
- Subtle hover states.
- No unnecessary colored rows.

Tables are preferred on larger screens when comparing structured data.

On small screens, tables should convert into readable stacked cards or responsive list items.

## 19.8.7 Forms

Task creation and profile forms should follow the reference dashboard's clean settings-page design.

### Form Design

- Group related fields into bordered sections.
- Use visible field labels.
- Keep descriptions short.
- Use rectangular input fields.
- Maintain consistent field heights.
- Clearly show validation errors.
- Place primary actions predictably.

### Suggested Form Layout

```text
------------------------------------------------
| Task Information                              |
|                                               |
| Task Title                                    |
| [________________________________________]    |
|                                               |
| Description                                   |
| [________________________________________]    |
| [________________________________________]    |
|                                               |
| Payment Amount                                |
| [________________________________________]    |
|                                               |
| Skills                                        |
| [________________________________________]    |
|                                               |
------------------------------------------------

------------------------------------------------
| Task Location                                 |
|                                               |
|              GOOGLE MAP                       |
|                                               |
------------------------------------------------

                            [ Publish Task ]
```

Long forms can use a wider main column and a narrow contextual information column on desktop.

## 19.8.8 Dashboard Theme

The Task Poster Dashboard should support both light and dark themes.

The same layout, dimensions, borders, and component hierarchy should remain consistent between themes.

Only semantic color tokens should change.

A light interface can be the initial dashboard default, with dark mode supported using the same design system.

---

# 19.9 Student Mobile Application Design Principles

The Student Mobile Application should use the same UniWork design identity but adapt it to mobile interaction.

**Do not directly copy desktop dashboard layouts into mobile screens.**

The mobile application should feel native, simple, lightweight, and easy to operate.

## 19.9.1 Mobile Layout

- Full-width mobile screens.
- Consistent horizontal padding.
- Clear screen titles.
- Minimal top headers.
- Bottom tab navigation.
- Scrollable content areas.
- Simple card-based task lists.

## 19.9.2 Mobile Navigation

Recommended primary tabs:

- Marketplace
- Applied Tasks
- Profile

Use simple line icons and clear text labels.

### Navigation Design

- Thin top divider above the tab bar.
- Neutral background.
- Accent color for active tab.
- Muted color for inactive tabs.
- Proper safe-area spacing.

## 19.9.3 Mobile Task Cards

Task cards should remain consistent with the box-based visual style.

Each card can show:

- Task title.
- Payment amount.
- Location badge.
- Required skills.
- Task date.
- Short description.
- View Details action.

### Card Principles

- Small border radius.
- Thin border.
- No heavy shadow.
- Clear spacing.
- Strong payment visibility.
- Readable badge styles.
- Easy-to-tap interaction areas.

## 19.9.4 Mobile Forms

Registration and task verification forms should use:

- Full-width inputs.
- Clear labels.
- Comfortable input heights.
- Suitable keyboard types.
- Visible validation errors.
- Minimal distractions.

## 19.9.5 Task Start and Verification Screens

These screens should be designed for maximum clarity.

### Important Elements

- Task title.
- Current task status.
- Four-digit code input.
- Location verification state.
- Main action button.
- Confirmation messages.

Important actions should stand out through hierarchy and contrast, not excessive colors.

## 19.9.6 Mobile Map Components

- Use a clearly bordered map container.
- Maintain enough height for interaction.
- Display task markers clearly.
- Keep map controls minimal.
- Show location status outside the map when possible.

## 19.9.7 Mobile Theme

Use the same light and dark theme tokens as the web platform.

Mobile screens must maintain readable contrast, especially outdoors where students may use the application under bright sunlight.

---

# 19.10 Buttons and Interactive Elements

## Button Styles

### Primary Button

- Solid high-contrast background.
- Rectangular shape.
- Small corner radius.
- Clear text label.

### Secondary Button

- Transparent or neutral background.
- Thin border.
- High-contrast label.

### Text Button

- No container when unnecessary.
- Subtle accent-colored text.
- Used for less important actions.

### Destructive Button

- Reserved for dangerous actions.
- Red styling where appropriate.
- Confirmation required for important destructive operations.

## Interaction Guidelines

- Subtle hover effects.
- Small background or border color changes.
- Visible keyboard focus indicators.
- No unnecessary scaling.
- No excessive bounce animations.
- Consistent disabled states.
- Touch-friendly targets on mobile.

---

# 19.11 Icons and Badges

## Icons

Use a consistent outline icon style.

**Recommended Web Icon Library:** Lucide React  
**Recommended Mobile Icon Library:** Lucide React Native

### Icon Rules

- Simple line icons.
- Consistent stroke thickness.
- Common sizes such as 16px, 20px, and 24px.
- Avoid mixing different icon styles.
- Use accent colors only where meaningful.

## Badges

Badges are useful for:

- Task locations.
- Required skills.
- Application statuses.
- Task statuses.
- Verification statuses.

### Badge Style

- Rectangular or slightly rounded.
- Compact padding.
- Small readable text.
- Subtle background.
- Clear contrast.

Status badges may use semantic colors.

Avoid overly bright or heavily saturated badge backgrounds.

---

# 19.12 Shadows and Elevation

The design should remain mostly flat.

### Shadow Rules

- Avoid shadows on normal cards.
- Use borders to separate content.
- Use very subtle shadows for floating menus.
- Use soft shadows for dialogs or overlays when necessary.
- Avoid large floating-card effects.

The reference design relies mainly on thin borders and contrast rather than elevation.

---

# 19.13 Background Patterns and Visual Effects

Subtle background details can be used to improve the landing page.

### Allowed Effects

- Very subtle grid patterns.
- Soft gradients in selected marketing sections.
- Minimal glow effects.
- Gentle background texture.
- Controlled accent color highlights.

### Avoid

- Heavy gradients on every section.
- Strong glassmorphism.
- Excessive blur.
- Large glowing borders.
- Decorative animations that distract users.
- Overlapping visual elements without purpose.

Marketing sections may be more expressive than dashboard or mobile task-management screens.

---

# 19.14 Responsive Design

The entire platform should adapt properly to different screen sizes.

## Landing Page

- Large editorial layouts on desktop.
- Reduced heading sizes on tablets.
- Single-column content on mobile.
- Stacked buttons when necessary.
- Responsive images and download section.

## Task Poster Dashboard

- Persistent sidebar on desktop.
- Collapsible sidebar on tablet.
- Drawer navigation on mobile.
- Responsive forms.
- Tables converted into cards where appropriate.
- No horizontal overflow.

## Student Mobile App

- Support common Android screen sizes.
- Respect system safe areas.
- Support different text sizes.
- Maintain comfortable touch targets.
- Avoid fixed layouts that break on small screens.

---

# 19.15 Microinteractions and Animation

Animations should be subtle and functional.

### Recommended

- Smooth navigation changes.
- Short fade transitions.
- Subtle hover color changes.
- Simple loading indicators.
- Smooth modal opening.
- Small status-change animations.

### Suggested Duration

Most basic interactions should use approximately 150–250ms transitions.

Avoid long animations that slow down task completion.

Respect reduced-motion accessibility preferences.

---

# 19.16 Loading, Empty, Error, and Success States

Every major feature should have consistent UI states.

### Loading States

- Skeleton placeholders where useful.
- Minimal loading indicators.
- Avoid unnecessary full-page spinners.

### Empty States

- Short explanation.
- Simple icon if useful.
- Clear next action.

Example: No tasks available.

### Error States

- Clear error message.
- Explain what happened in simple language.
- Provide a retry action where appropriate.

### Success States

- Minimal confirmation message.
- Green status indicator where appropriate.
- Clear next action.

Do not rely only on colors to communicate status.

---

# 19.17 Accessibility and Usability

UniWork must remain usable for students and task posters with different levels of technical experience.

### Requirements

- Strong text and background contrast.
- Readable text sizes.
- Clear interactive elements.
- Keyboard navigation for web.
- Accessible labels.
- Visible focus states.
- Touch targets of at least 44×44 logical points where practical.
- Screen reader support.
- Clear error messages.
- Simple navigation.
- Support for reduced-motion preferences.
- Do not communicate important information using color alone.

Use WCAG 2.2 AA as the accessibility target where applicable.

---

# 19.18 Consistency Across the Platform

All UniWork interfaces must feel like parts of the same product.

Shared visual principles:

- Typography.
- Border colors.
- Border radius.
- Spacing.
- Button styles.
- Form inputs.
- Badge designs.
- Icon styles.
- Status colors.
- Light and dark themes.

The landing page may be more visually expressive, while dashboards and mobile screens should prioritize functionality.

## Design Tokens

Centralize reusable design values.

Suggested token categories:

```text
Colors
  background
  surface
  surface-secondary
  text-primary
  text-secondary
  border
  border-strong
  accent
  success
  warning
  error

Spacing
  xs
  sm
  md
  lg
  xl
  2xl

Radius
  small
  medium

Typography
  font-family
  font-size
  font-weight
  line-height

Layout
  content-width
  sidebar-width
  header-height

Interaction
  transition-duration
  focus-ring
```

These values should be implemented centrally rather than being repeated as unrelated hardcoded styles.

---

# 19.19 Design Rules to Avoid

UniWork should avoid:

1. Excessively rounded cards and buttons.
2. Heavy shadows on every component.
3. Too many bright colors.
4. Large gradients throughout the dashboard.
5. Unnecessary dashboard cards.
6. Overcrowded pages.
7. Inconsistent padding and margins.
8. Mixed icon styles.
9. Excessive animations.
10. Overcomplicated navigation.
11. Decorative elements without a clear purpose.
12. Large empty boxes that contain very little useful content.
13. Inconsistent desktop and mobile visual language.
14. Using desktop layouts directly in the mobile application.
15. Sacrificing usability for appearance.

---

# 19.20 Final UniWork Design Direction

**UniWork will maintain a minimal, structured, box-based design system inspired by Render's website and dashboard interfaces.**

The platform will use sharp rectangular components, thin gray borders, neutral backgrounds, large typography, generous spacing, subtle violet accents, and minimal shadows.

The three interfaces will apply this design language differently:

**Landing Page:** Bold typography, spacious editorial sections, dark and light background transitions, rectangular CTAs, and large visual content containers.

**Task Poster Dashboard:** Structured sidebar and top bar, bordered content sections, clean tables, simple forms, and organized task-management interfaces.

**Student Mobile Application:** Compact mobile-first layouts, box-shaped task cards, bottom navigation, simple forms, clear task statuses, and accessible task verification screens.

The overall result should feel **premium, clean, consistent, trustworthy, and functional**, without unnecessary visual complexity.

**Design Reference:** Render platform screenshots provided by the UniWork team. Use them as visual inspiration while maintaining an original UniWork brand identity.