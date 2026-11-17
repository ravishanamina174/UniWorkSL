# UniWork Sri Lanka — Complete Development Context & Project Requirements

**Project:** UniWork Sri Lanka  
**Project Type:** University Final Year Project  
**Team Size:** 4 Members  
**Development Stage:** Initial Development — Version 1 (MVP)  
**Target Market:** Sri Lanka  
**Platforms:** Public Landing Page, Task Poster Web Dashboard, Student Mobile Application

---

# 1. Project Description

**UniWork Sri Lanka** is a student-focused, location-based micro-task marketplace that connects Sri Lankan university students with people who need help completing small physical tasks.

The platform aims to help university students earn additional income while continuing their studies, especially students facing financial difficulties.

People in society can publish tasks with descriptions, offered payments, required skills, dates, and physical locations.

University students can browse these opportunities, submit applications, and complete tasks after being selected by task posters.

Unlike traditional freelance platforms, UniWork focuses primarily on **physical, location-based work**, rather than remote digital freelancing.

### Examples of Tasks

- Grass cutting and gardening
- Wall painting
- Household item moving
- Flower decoration
- Event assistance
- Photography
- Furniture moving and arrangement
- Other suitable small physical tasks

### Payment Model

Payments are made directly between task posters and students after task completion.

**UniWork does not collect, hold, transfer, or process payments in Version 1.**

The platform handles task discovery, applications, task coordination, location verification, task status tracking, and feedback.

---

# 2. What We Are Building

UniWork consists of three main applications/interfaces connected to a single backend system.

## 2.1 Public Landing Page

A publicly accessible website that introduces UniWork and directs users to the correct platform.

- No authentication required.
- Accessible to students, task posters, and visitors.
- Provides information about the platform.
- Students can download the Android APK through a download button or QR code.
- Task posters can click **Open Dashboard** to access the Task Poster Web Application.

## 2.2 Task Poster Web Application

A responsive web application for people who create tasks and hire students.

- Supports desktop and mobile browsers.
- Provides task publishing and management.
- Allows posters to review student applications.
- Supports student selection and task-start coordination.
- Provides task histories and profile management.

**Only Task Posters use the Web Dashboard in Version 1.**

## 2.3 Student Mobile Application

A React Native Expo mobile application specifically for university students.

- Android application distributed through APK initially.
- Provides the task marketplace.
- Allows students to apply for tasks.
- Displays application and task statuses.
- Supports location verification and task initiation.
- Allows task completion and feedback.

**Only Students use the Mobile Application in Version 1.**

Both applications communicate with the same Spring Boot backend and PostgreSQL database.

---

# 3. Confirmed Technology Stack

| Layer | Technology |
|---|---|
| Programming Languages | TypeScript and Java |
| Landing Page | Next.js |
| Task Poster Web App | Next.js + TypeScript |
| Student Mobile App | React Native + Expo + TypeScript |
| Backend | Java Spring Boot |
| Backend API | REST API |
| Database | PostgreSQL |
| Geospatial Extension | PostGIS |
| Database Access | Spring Data JPA / Hibernate |
| Authentication | Clerk |
| Backend Authorization | Spring Security |
| Styling | Tailwind CSS (Web) |
| Mobile Styling | To be finalized with UI design |
| Task Creation Map | Google Maps API |
| Other Map Views | MapLibre with a suitable map tile provider |
| Mobile Geolocation | Expo Location |
| Web Geolocation | Browser Geolocation API |
| Web Deployment | Vercel |
| Backend Deployment | Render |
| Database Hosting | Managed PostgreSQL with PostGIS support |
| Mobile Distribution | Android APK |

Additional development tools and libraries may be selected as needed, without changing the confirmed core stack.

## 3.1 Why Java Spring Boot?

Spring Boot is selected because the development team already has experience with Java and Spring Boot.

It provides:

- Structured backend development.
- Reliable REST API communication with both Next.js and React Native.
- Spring Security integration with Clerk JWT authentication.
- Transaction management for important task operations.
- PostgreSQL and PostGIS integration.
- Support for future AI agents through LangChain4j or Spring AI.
- Integration with future machine learning models through separate Python services or Java inference libraries.
- Good performance when properly configured and deployed.
- A maintainable foundation for future platform expansion.

---

# 4. Project Architecture

## 4.1 Architectural Style

**Modular Monolith Architecture + REST API + Client-Server Architecture**

We will use one Spring Boot backend application divided into separate business modules.

We are not using microservices for the initial MVP because a modular monolith is more suitable for a four-member university team.

Benefits:

- Easier development and deployment.
- Reduced infrastructure complexity.
- Centralized business logic.
- Database transaction consistency.
- Clear separation of responsibilities.
- Easier testing and maintenance.
- Possibility of splitting modules into services in the future.

## 4.2 High-Level System Architecture

```text
                  UNIWORK PLATFORM
                         |
             -------------------------
             |                       |
        PUBLIC WEBSITE          USER APPLICATIONS
         Next.js                       |
                              --------------------
                              |                  |
                        TASK POSTER         STUDENT MOBILE
                         Next.js            React Native
                              |                  |
                              --------------------
                                       |
                                  REST API
                                       |
                              SPRING BOOT BACKEND
                              (Modular Monolith)
                                       |
                         ---------------------------
                         |                         |
                    Spring Security           Business Modules
                    Clerk JWT Auth                  |
                                                   |
                     ------------------------------------------
                     |           |            |             |
                  Users         Tasks      Applications   Task Execution
                     |           |            |             |
                     ------------------------------------------
                                       |
                                 Other Modules
                             Reviews / Safety / Maps
                                       |
                              PostgreSQL + PostGIS
```

External services include Clerk for authentication, map providers, and device geolocation.

## 4.3 Backend Modules

### Authentication and Authorization Module

- Validate Clerk authentication tokens.
- Identify authenticated users.
- Enforce Student and Task Poster roles.
- Protect backend API endpoints.

### User and Profile Module

- Student profiles.
- Task poster profiles.
- Role management.
- Profile updates.
- User account relationships.

### Task Management Module

- Create tasks.
- Publish tasks.
- Retrieve available tasks.
- Update and manage tasks.
- Track task statuses.
- Retrieve tasks belonging to a poster.

### Application Management Module

- Submit student applications.
- Retrieve applications.
- Accept one student for a task.
- Track accepted and rejected applications.
- Prevent duplicate applications and conflicting selections.

### Task Execution Module

- Manage task-start verification.
- Generate and validate four-digit codes.
- Record task initiation.
- Record completion confirmation.
- Maintain task execution history.

### Location Module

- Store task coordinates.
- Calculate student-to-task distance.
- Validate the initial 100-meter arrival boundary.
- Store location verification results.
- Support future location-based features.

### Review and Safety Module

- Store task poster reviews.
- Record task location feedback.
- Maintain safety-related task records.
- Support future reports and dispute management.

## 4.4 Database Design Direction

Use PostgreSQL as the primary relational database.

Use PostGIS for geographic data, location filtering, and distance calculations.

Initial main database entities:

- Users
- Student Profiles
- Task Poster Profiles
- Universities
- Faculties
- Skills
- Tasks
- Task Skills
- Task Applications
- Task Execution Records
- Task Verification Records
- Task Reviews
- Task Location Feedback
- Safety Reports (if included in MVP safety scope)

Final database relationships and schema will be designed before implementation.

All clients must access business data through the backend REST API rather than directly connecting to PostgreSQL.

---

# 5. Authentication and User Registration

Authentication will be handled using Clerk.

The registration experience is different for students and task posters.

## 5.1 Student Registration — Mobile Application

1. Student downloads and opens the Android application.
2. Student signs up or signs in using Clerk.
3. Student selects or confirms the Student role.
4. Student completes the registration form.
5. Student accesses the mobile application.

### Student Profile Fields

- Full Name
- Age
- Gender
- Address
- Phone Number
- NIC
- University
- Faculty

## 5.2 Task Poster Registration — Web Application

1. Task poster opens the public landing page.
2. Clicks **Open Dashboard**.
3. Signs up or signs in using Clerk.
4. Selects or confirms the Task Poster role.
5. Completes the registration form.
6. Accesses the Task Poster Dashboard.

### Task Poster Profile Fields

- Full Name
- Address
- Phone Number
- NIC
- Gender

## 5.3 Authentication Rules

- Landing page is public.
- Dashboard requires authentication as a Task Poster.
- Mobile student features require Student authentication.
- Role access must be validated by the backend.
- Users must not be able to change protected roles simply by editing frontend requests.
- Users can only access or modify resources they are authorized to manage.
- Authentication and identity verification are different. Strict identity verification is not included initially.
- Sensitive personal information, especially NIC and addresses, must be protected and should not be publicly displayed.

---

# 6. Complete User Stories

## 6.1 Public Visitor User Stories

**US-01:** As a visitor, I want to access the landing page without signing in so that I can learn about UniWork.

**US-02:** As a visitor, I want to understand how UniWork works for students and task posters.

**US-03:** As a student, I want to scan a QR code and download the Android application.

**US-04:** As a student, I want to download the APK directly using a download button.

**US-05:** As a task poster, I want to click Open Dashboard to access the Task Poster Web Application.

## 6.2 Student User Stories

### Authentication and Profile

**US-06:** As a student, I want to register using Clerk so that I can securely access the mobile application.

**US-07:** As a student, I want to complete my student profile with personal and university information.

**US-08:** As a student, I want to view and update my profile information.

### Marketplace

**US-09:** As a student, I want to see available published tasks in the marketplace.

**US-10:** As a student, I want to open a task and read its full details.

**US-11:** As a student, I want to see the offered payment, required skills, task date, and location.

**US-12:** As a student, I want to view the task location on a map.

### Applications

**US-13:** As a student, I want to apply for available tasks.

**US-14:** As a student, I want to view all my submitted applications.

**US-15:** As a student, I want to see whether an application is pending, accepted, or rejected.

**US-16:** As a student, I want to open an accepted task and view its information.

### Task Execution

**US-17:** As a student, I want to access the task-start page when I arrive at the agreed task location.

**US-18:** As a student, I want to initiate task-start verification.

**US-19:** As a student, I want to enter the four-digit code provided by the task poster.

**US-20:** As a student, I want to grant location permission so that my arrival location can be checked.

**US-21:** As a student, I want the platform to record whether I am within the 100-meter task boundary.

**US-22:** As a student, I want to start my task even if the location check does not pass, according to Version 1 rules.

**US-23:** As a student, I want to see that my task has started successfully.

### Completion and Feedback

**US-24:** As a student, I want to mark my task completed after finishing the work and receiving direct payment.

**US-25:** As a student, I want to provide feedback about the task poster.

**US-26:** As a student, I want to submit feedback about the task location and experience.

**US-27:** As a student, I want to view the history of tasks I have completed.

## 6.3 Task Poster User Stories

### Authentication and Profile

**US-28:** As a task poster, I want to register and sign in using Clerk through the web application.

**US-29:** As a task poster, I want to complete my personal profile.

**US-30:** As a task poster, I want to view and update my profile.

### Task Creation

**US-31:** As a task poster, I want to create a new task.

**US-32:** As a task poster, I want to enter the title, description, payment, required skills, and task date/time.

**US-33:** As a task poster, I want to select the physical task location using Google Maps.

**US-34:** As a task poster, I want to select my current browser location with permission.

**US-35:** As a task poster, I want to publish the task to the student marketplace.

### Task Management

**US-36:** As a task poster, I want to view my published tasks.

**US-37:** As a task poster, I want to view details and statuses of my tasks.

**US-38:** As a task poster, I want to manage my tasks according to their current status.

### Applications

**US-39:** As a task poster, I want to view applications submitted by students.

**US-40:** As a task poster, I want to view relevant student profile information before selecting a student.

**US-41:** As a task poster, I want to accept one suitable student for a task.

**US-42:** As a task poster, I want the accepted student to receive an updated application status.

### Task Execution

**US-43:** As a task poster, I want to open the task-start page for an accepted task.

**US-44:** As a task poster, I want to see a four-digit verification code when the student initiates task-start verification.

**US-45:** As a task poster, I want to communicate the code to the student in person.

**US-46:** As a task poster, I want to see the task's started status after verification.

**US-47:** As a task poster, I want to see relevant task execution and completion information.

---

# 7. Task Gig Data Structure

Each task should contain the following core details.

| Field | Description |
|---|---|
| Task ID | Unique identifier |
| Poster ID | Task creator |
| Title | Task title |
| Description | Detailed task information |
| Amount | Offered payment in LKR |
| Skills | Required task skills |
| Task Date | Expected task date |
| Task Time | Expected task time |
| Location | Task address / selected place |
| Latitude | Geographic latitude |
| Longitude | Geographic longitude |
| Status | Current task status |
| Created At | Creation timestamp |
| Updated At | Last update timestamp |

### Task Statuses

Suggested lifecycle:

`Published → Accepted → Started → Completed`

Other applicable statuses:

- Cancelled
- Closed

Application statuses should be maintained separately:

- Pending
- Accepted
- Rejected
- Withdrawn (if supported)

Task and application state changes must be validated on the backend.

---

# 8. Complete Task Workflow

## Phase 1 — Task Publishing

1. Task poster signs in to the dashboard.
2. Opens the Create Task page.
3. Enters the task details.
4. Selects the physical task location.
5. The application saves the coordinates.
6. Task poster publishes the task.
7. The backend stores the task with Published status.
8. The task appears in the student marketplace.

## Phase 2 — Task Application

1. Student opens the marketplace.
2. Selects an available task.
3. Reviews the task details.
4. Submits an application.
5. The backend records the application as Pending.
6. Task poster receives the application in the web dashboard.
7. Poster reviews the received applications.
8. Poster accepts one student.
9. Selected application becomes Accepted.
10. Other applications are marked Rejected or closed according to the finalized workflow.
11. The task becomes unavailable for new applications.
12. The selected student can access the accepted task.

The backend must enforce the one-selected-student rule using database transactions and constraints.

## Phase 3 — Task Start and Verification

1. Student arrives at the physical task location.
2. Student opens Applied Tasks in the mobile application.
3. Student selects the accepted task.
4. Student opens the Task Start screen.
5. Task poster opens the matching task page in the web dashboard.
6. Student clicks **Start Task** to begin the verification process.
7. Backend generates a temporary four-digit verification code.
8. Task poster sees the code in the web dashboard.
9. Poster communicates the code directly to the student.
10. Student enters the code into the mobile application.
11. Backend validates the code.
12. Mobile application requests device location permission.
13. Student's current coordinates are sent to the backend.
14. Backend checks the distance from the stored task location.
15. Backend records whether the student is within the 100-meter radius.
16. Task moves into Started status after successful code verification.

### Important Version 1 Rule

Location verification is recorded but does not block task initiation.

If the location check fails or permission is denied, the system records the result and can still allow the task to start following valid code verification.

The system should never incorrectly record an unverified location as a successful arrival.

### Verification Security

- Four-digit codes must have an expiration time.
- Codes must have limited attempts.
- A code must be associated with one specific task and verification session.
- Codes must not be reusable after successful verification.
- The backend must control verification and task status changes.

## Phase 4 — Task Completion

1. Student finishes the assigned work.
2. Task poster pays the student physically.
3. Student confirms that payment was received.
4. Student selects Complete Task.
5. Backend records the completion event.
6. Task status becomes Completed.
7. Student can submit feedback about the task poster.
8. Student can submit feedback about the task location.
9. Review and task history data are stored.

**Important:** The platform records the student's payment confirmation. It does not independently verify or guarantee that the payment occurred.

---

# 9. Public Landing Page — Pages and Components

The landing page is a public Next.js interface.

No sign-in is required to view it.

## 9.1 Landing Page (`/`)

### Components

**Header / Navigation**
- UniWork logo.
- Navigation links to public page sections.
- Open Dashboard button.

**Hero Section**
- Platform introduction.
- Main project message.
- Student application download CTA.
- Task Poster Dashboard CTA.

**About UniWork Section**
- Purpose of the platform.
- Problems it aims to solve.
- Target users.

**How It Works Section**
- Steps for students.
- Steps for task posters.

**Student Application Section**
- Mobile application introduction.
- Android APK download button.
- QR code linking to APK download.
- Basic download instructions, if needed.

**Task Poster Section**
- Introduction to publishing tasks.
- Open Dashboard button.

**Footer**
- Platform information.
- Relevant navigation.
- Contact details if available.
- Privacy and terms links when prepared.

## 9.2 Public Landing Page Routing

```text
/
  Public Landing Page

/dashboard
  Task Poster Dashboard Entry
  (Redirect to sign-in if unauthenticated)
```

The exact authentication route structure can be finalized during development.

---

# 10. Task Poster Web Application — Pages and Components

**Framework:** Next.js + TypeScript  
**Target:** Responsive Desktop and Mobile Web  
**User Role:** Task Poster Only

## 10.1 Authentication Pages

### Sign In

Components:
- Clerk Sign In component.
- Navigation back to the landing page.

### Sign Up

Components:
- Clerk Sign Up component.
- Role confirmation.
- Registration onboarding.

### Complete Profile

Components:
- Full name input.
- Address input.
- Phone number input.
- NIC input.
- Gender input.
- Submit button.
- Input validation and error messages.

## 10.2 Dashboard Layout

Shared components:

- Dashboard sidebar / mobile navigation.
- Dashboard header.
- User profile menu.
- Page title.
- Loading states.
- Error states.
- Empty states.
- Confirmation dialogs.
- Status badges.
- Notification / feedback messages.

## 10.3 Dashboard Home

**Route:** `/dashboard`

Components:
- Dashboard overview.
- Total posted tasks summary.
- Active tasks summary.
- Pending applications summary.
- Completed tasks summary.
- Recent tasks section.
- Create Task button.

## 10.4 Posted Tasks Page

**Route:** `/dashboard/tasks`

Components:
- Task list.
- Task cards or table.
- Task status badges.
- Task title and payment.
- Task date and location summary.
- View Task action.
- Create Task action.
- Task filtering.

## 10.5 Create Task Page

**Route:** `/dashboard/tasks/new`

Components:
- Task title input.
- Description textarea.
- Payment amount input (LKR).
- Skills selection.
- Task date picker.
- Task time picker.
- Location input.
- Google Maps location picker.
- Current location button.
- Selected location preview.
- Form validation.
- Publish Task button.

### Location Picker Component

- Google Maps API integration.
- Map click to select coordinates.
- Map marker.
- Browser geolocation option.
- Latitude / longitude storage.
- Selected location display.

## 10.6 Task Details Page

**Route:** `/dashboard/tasks/[taskId]`

Components:
- Task title.
- Description.
- Payment amount.
- Required skills.
- Scheduled date and time.
- Task location map.
- Current task status.
- Task information section.
- Application access.
- Applicable task management actions.

## 10.7 Applications Page

**Route:** `/dashboard/applications`

Components:
- Applications list.
- Related task information.
- Student summary.
- Application status.
- View Application action.
- Filtering by application status.

## 10.8 Task Applications Detail

**Route:** `/dashboard/tasks/[taskId]/applications`

Components:
- Task information summary.
- Student applicant cards.
- Student details appropriate for selection.
- Application status.
- Accept Student button.
- Acceptance confirmation dialog.
- Selected student information.

## 10.9 Task Start / Ongoing Task Page

**Route:** `/dashboard/tasks/[taskId]/start`

Components:
- Task details summary.
- Selected student information.
- Verification status.
- Four-digit code display.
- Code expiration information.
- Task start status.
- Task progress / ongoing status.
- Task completion status.

The four-digit code should only become visible for a valid verification session.

The page should support synchronization with backend status updates.

## 10.10 Poster Profile Page

**Route:** `/dashboard/profile`

Components:
- Profile information.
- Edit Profile form.
- Personal details.
- Clerk account management entry.
- Save changes button.

---

# 11. Student Mobile Application — Screens and Components

**Framework:** React Native + Expo + TypeScript  
**Target:** Android  
**User Role:** Student Only

## 11.1 Authentication Screens

### Sign In Screen

Components:
- Clerk authentication interface.
- Sign-in actions.
- Navigation to registration.

### Sign Up Screen

Components:
- Clerk sign-up interface.
- Student role onboarding.

### Complete Student Profile Screen

Components:
- Full name input.
- Age input.
- Gender selection.
- Address input.
- Phone number input.
- NIC input.
- University selection.
- Faculty selection.
- Save Profile button.
- Form validation.

## 11.2 Main Mobile Navigation

Recommended main navigation:

- Marketplace
- Applied Tasks
- Profile

The Task Start screen is accessed from an accepted task rather than appearing as a separate main navigation tab.

## 11.3 Task Marketplace Screen

Components:
- Screen header.
- Available task list.
- Task cards.
- Task search input.
- Task filters.
- Task category / skills badges.
- Payment amount.
- Task location summary.
- Task date.
- Empty state.
- Loading state.

### Task Card Component

Displays:
- Task title.
- Short description.
- Payment amount in LKR.
- Location badge.
- Required skills.
- Task date.
- View Details action.

## 11.4 Task Details Screen

Components:
- Task title.
- Full description.
- Payment amount.
- Required skills.
- Date and time.
- Task location.
- Location map preview.
- Task status.
- Apply for Task button.
- Application confirmation.

## 11.5 Applied Tasks Screen

Components:
- Submitted applications list.
- Pending applications.
- Accepted applications.
- Rejected applications.
- Started / ongoing tasks.
- Completed task history.
- Application status badges.
- Task cards.
- View Task action.

## 11.6 Accepted Task Details Screen

Components:
- Accepted task information.
- Task poster information appropriate to the assignment.
- Task date and time.
- Task location map.
- Task instructions.
- Start Task button.
- Current task status.

## 11.7 Task Start Screen

Components:
- Task summary.
- Start Task button.
- Verification code input.
- Submit Code button.
- Verification feedback.
- Location permission request.
- Location check status.
- Distance / 100-meter boundary result.
- Task started confirmation.
- Error handling.

### Verification Code Input

- Four-digit numeric input.
- Validation.
- Loading indicator.
- Expired / incorrect code feedback.

### Location Verification Component

- Request GPS permission.
- Retrieve current device coordinates.
- Send coordinates to backend.
- Display location verification result.
- Handle denied permission and unavailable location.
- Record verification result through backend.

## 11.8 Ongoing Task Screen

Components:
- Task information.
- Started status.
- Task start timestamp.
- Task location.
- Completion instructions.
- Complete Task button.

## 11.9 Task Completion Screen

Components:
- Task completion confirmation.
- Payment received confirmation.
- Complete Task action.
- Task completion success state.

## 11.10 Review and Feedback Screen

Components:
- Task poster rating.
- Positive / negative feedback.
- Optional written review.
- Task location feedback.
- Submit Review button.

## 11.11 Student Profile Screen

Components:
- Student profile summary.
- Personal details.
- University information.
- Faculty information.
- Edit Profile action.
- Completed tasks summary.
- Clerk account management entry.
- Sign Out button.

## 11.12 Edit Profile Screen

Components:
- Editable student profile fields.
- Input validation.
- Save Changes button.

---

# 12. Shared Reusable Components

These components should be designed for reuse within their respective web and mobile applications.

## Web Components

- Buttons
- Inputs
- Textareas
- Select fields
- Dialogs
- Forms
- Status badges
- Task cards
- Application cards
- Profile components
- Map components
- Loading indicators
- Error messages
- Empty states
- Confirmation dialogs
- Dashboard navigation

## Mobile Components

- Buttons
- Text inputs
- Task cards
- Skill badges
- Payment badges
- Location badges
- Status badges
- Screen headers
- Loading indicators
- Empty states
- Error messages
- Verification input
- Location verification indicator
- Confirmation dialogs
- Review components

Shared business types and API contracts can be maintained consistently across the TypeScript clients.

---

# 13. Location and Mapping Requirements

## 13.1 Task Creation

- Task poster chooses the location using Google Maps.
- Map supports selecting a point.
- Browser location can be used with permission.
- Backend stores latitude and longitude in PostgreSQL/PostGIS.

## 13.2 Student Marketplace

- Task locations can be displayed on a map.
- Use MapLibre with a suitable tile provider where licensing permits.
- Allow students to view the location of tasks.

## 13.3 Arrival Verification

- Student gives location permission through Expo Location.
- Mobile app retrieves coordinates and location accuracy.
- Backend receives location data.
- PostGIS calculates distance from the task location.
- Initial accepted radius for arrival verification is 100 meters.
- Backend stores the result and timestamp.

### Important

Location verification should consider GPS accuracy and the possibility of inaccurate or spoofed device locations.

The 100-meter radius is an initial project requirement, not a guarantee of physical presence or safety.

---

# 14. API Design Principles

The Spring Boot application will expose versioned REST APIs.

Suggested prefix:

`/api/v1/`

Example resource groups:

```text
/api/v1/users
/api/v1/students
/api/v1/posters
/api/v1/tasks
/api/v1/tasks/{taskId}
/api/v1/tasks/{taskId}/applications
/api/v1/applications
/api/v1/task-executions
/api/v1/location-verifications
/api/v1/reviews
```

These are initial API group suggestions, not finalized endpoint specifications.

### API Requirements

- JSON request and response format.
- Clerk JWT validation.
- Role-based authorization.
- Resource ownership checks.
- Consistent HTTP status codes.
- Input validation.
- Centralized exception handling.
- Pagination for task and application lists.
- Database transactions for critical operations.
- Consistent API response contracts where useful.
- API documentation using OpenAPI / Swagger.

The backend must be responsible for important business decisions, not the frontend.

---

# 15. Security and Safety Requirements

UniWork includes real-world physical activities and interactions between people who may not know each other.

Security and safety must be considered throughout development.

## Initial Technical Security Requirements

- Clerk authentication.
- Spring Security authorization.
- HTTPS communication.
- Protected API endpoints.
- User role validation.
- Resource ownership validation.
- Input validation.
- Secure management of API keys and secrets.
- Rate limiting.
- Task-start code expiration and attempt limits.
- Task lifecycle validation.
- Audit records for important actions.
- Privacy protection for personal information.

## Student Safety Requirements

Safety research will determine the final MVP safety features.

Important areas include:

- Fraudulent task prevention.
- Unsafe or misleading task descriptions.
- Suspicious task posters.
- Harassment and threats.
- Non-payment.
- Unsafe locations.
- Reporting and dispute handling.
- Appropriate task restrictions.
- Protection of student contact details.
- Location privacy.
- User feedback and safety history.

User safety should be treated as a core platform requirement rather than an optional future improvement.

Sensitive registration data should only be collected where necessary, stored securely, and handled according to applicable privacy requirements.

---

# 16. Project Codebase Organization

Recommended repository structure:

```text
uniwork/
│
├── apps/
│   │
│   ├── web/
│   │   └── Next.js
│   │       Landing Page
│   │       Task Poster Dashboard
│   │
│   └── mobile/
│       └── React Native Expo
│           Student Application
│
├── backend/
│   └── Spring Boot
│       │
│       ├── auth/
│       ├── user/
│       ├── student/
│       ├── poster/
│       ├── task/
│       ├── application/
│       ├── execution/
│       ├── location/
│       ├── review/
│       ├── safety/
│       └── common/
│
├── packages/
│   └── api-contracts/
│       Shared TypeScript API contracts
│
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   └── research/
│
└── README.md
```

The backend will follow a modular structure within one Spring Boot application.

Typical backend layering:

```text
Controller
    |
Service
    |
Repository
    |
PostgreSQL / PostGIS
```

Additional DTOs, configuration, security, validation, exception handling, and mapping classes will be organized inside the appropriate modules.

The repository structure can be refined before implementation.

---

# 17. Deployment Architecture

## Web Application

- Deploy Next.js to Vercel.
- Host the public landing page and Task Poster Dashboard.
- Configure Clerk for the production domain.
- Connect the frontend to the deployed Spring Boot REST API.

## Backend

- Deploy Spring Boot to Render.
- Configure production environment variables.
- Connect Spring Security with Clerk authentication.
- Establish secure database connectivity.
- Enable HTTPS API access.
- Configure CORS for the authorized web origin.

## Database

- Use managed PostgreSQL with PostGIS support.
- Store application data in a private database.
- Allow authorized backend connections.
- Use database migrations and backups.

## Mobile Application

- Build the Android APK with Expo EAS Build.
- Configure the production backend API URL.
- Integrate Clerk authentication.
- Provide the APK through the public landing page.
- Generate a QR code pointing to the APK download URL.

Both the deployed web and mobile applications will communicate with the same Spring Boot backend.

---

# 18. Development Priorities

The initial development should follow this order:

### Phase 1 — Project Foundation

- Initialize repository structure.
- Configure Next.js.
- Configure React Native Expo.
- Configure Spring Boot.
- Configure PostgreSQL/PostGIS.
- Establish REST API connectivity.
- Configure development environments.

### Phase 2 — Authentication and Profiles

- Clerk authentication.
- Student onboarding.
- Task poster onboarding.
- Backend authorization.
- Profile management.

### Phase 3 — Task Marketplace

- Task creation.
- Google Maps location selection.
- Task publishing.
- Student marketplace.
- Task details.

### Phase 4 — Applications

- Student task applications.
- Application management.
- Student selection.
- Application status updates.

### Phase 5 — Task Execution

- Four-digit task-start verification.
- Location permission.
- PostGIS location checks.
- Task status changes.
- Task completion records.

### Phase 6 — Reviews and Safety

- Student feedback.
- Location feedback.
- Safety-related records.
- MVP safety features determined through research.

### Phase 7 — Testing and Deployment

- Backend API tests.
- Web application tests.
- Mobile application tests.
- Database integration tests.
- End-to-end task workflow testing.
- Security and authorization testing.
- Production deployment.
- Android APK distribution.

---

# 19. UI Design Principles

---

# 20. Important Development Instructions

When assisting with the development of UniWork:

1. Follow the confirmed technology stack.
2. Use Java Spring Boot for the backend.
3. Use Next.js for the public landing page and Task Poster Dashboard.
4. Use React Native Expo for the student mobile application.
5. Keep the Task Poster Dashboard web-only and the Student Application mobile-only.
6. Keep the public landing page accessible without authentication.
7. Use PostgreSQL with PostGIS for database and geospatial functionality.
8. Maintain a Modular Monolith architecture.
9. Use one shared REST API backend for both applications.
10. Follow clear separation of frontend, backend, and database responsibilities.
11. Keep business logic and security-critical validation in the backend.
12. Follow the agreed task publishing, application, verification, and completion workflows.
13. Do not implement online payment processing in Version 1.
14. Do not add strict identity verification as an assumed implemented MVP feature.
15. Give priority to student safety, personal data protection, and secure system design.
16. Build reusable and maintainable components.
17. Keep the project manageable for a four-member Final Year Project team.
18. Avoid unnecessary architecture complexity and features outside the agreed MVP.
19. Do not assume proposed features or design details are confirmed without discussion.
20. Use the UI Design Principles provided later when designing and implementing user interfaces.

---

**End of UniWork Sri Lanka — Development Context (Version 1.0)**