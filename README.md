# SLMS Frontend — Student Leave Management System

Vue 3 frontend for a web application that manages student leave requests — replacing manual, paper-based processes with a digital workflow connecting students, trainers, and administrators.

## 🛠️ Tech Stack
* **Framework:** Vue 3 (Composition API)
* **Language:** TypeScript
* **Build Tool:** Vite
* **Routing:** Vue Router
* **State Management:** Pinia
* **HTTP Client:** Axios
* **Charts:** Chart.js


## 📅 Sprint 1 — Project Setup & Authentication
* **Duration:** Week 28 (July 6, 2026)
* **Goal:** Establish project foundation, authentication system, and basic dashboard shell.

### 1. Completed Features
* **Project Scaffolding:** Initialized with Vite + TypeScript.
* **Router Configuration (`vue-router`):** Configured lazy-loaded routes, dynamic page titles via meta fields, scroll-reset on navigation, and a 404 catch-all route.
* **Dashboard Layout Shell:** Built a responsive skeleton containing Navbar, Sidebar, and Footer.
* **Fully Responsive Design:**
  * **Desktop:** Full sidebar with text labels.
  * **Tablet (769px–1024px):** Icon-only collapsed sidebar.
  * **Mobile (≤768px):** Off-canvas drawer sidebar toggled via a hamburger menu.
* **Placeholder Views:** Dashboard, Leave Requests, Calendar, and Admin.
* **Calendar View:** Features Buddhist Era year + 12-year zodiac cycle labels.
* **Pinia Auth Store (`auth.ts`):** Handles login, register, logout, and persistent token storage across page refreshes.
* **Axios API Service (`api.ts`):** Implements a request interceptor to attach the Bearer token and a response interceptor to handle 401 session expiration.

### 2. Sprint 1 Deliverable Checklist
- [x] Vue 3 project connected to Laravel backend API
- [x] Dashboard layout renders correctly across desktop / tablet / mobile
- [x] User login and registration fully working end-to-end
- [x] Role-based UI (sidebar/nav) structure prepared (Filtering logic pending)

## 📅 Sprint 2 — Leave Request System
* **Duration:** Week 29 (July 14–20, 2026)
* **Goal:** Implement the core leave request system — full CRUD for leave requests and leave types, connected to the real backend API, so students can submit and track requests, and admins can manage leave type configurations end-to-end.

### 1. Completed Features
* **Leave Request Form (`LeaveFormView.vue`):** Single reusable component handling both Create and Edit modes (detected via route param). Auto-calculates total leave days, validates required fields and date order, restricts editing to `Pending` requests only, and shows success/error notifications with redirect on save.
* **Leave Request List (`LeaveRequestView.vue`):** Connected to the real `GET /leave-requests` API, with search, filters (Leave Type, Status, Date Range), pagination, and role-scoped data.
* **Cancel Action:** Confirmation modal before cancelling; updates status to `Cancelled` via API instead of deleting the record.
* **Approve / Reject Leave Requests:** Trainer/Admin workflow for reviewing requests.
* **Leave History:** Search, filter, sort, and pagination across past requests.
* **Reusable Components:**
  * `StatusBadge.vue` — color-coded status pill (Pending/Approved/Rejected/Cancelled), reused across Leave Request List, Admin, and Approval views.
  * `Combobox.vue` (Leave Type Dropdown) — searchable dropdown fetching from `GET /leave-types`, with an `editable` prop toggling strict-dropdown vs. custom-text entry, validation, and empty-state handling.
* **Admin Leave Type Management:** Full CRUD (create/edit/delete) wired to the real API, with loading states, confirmation before delete, and immediate UI updates.
* **Profile & Avatar:**
  * Profile page fetches live user data on load, with loading/error states.
  * Profile updates sync immediately across navbar/sidebar.
  * Change Password flow with current-password validation.
  * Avatar Picker — gender-aware default avatar selection (Male/Female tabs), connected to the real API.

### 2. Sprint 2 Deliverable Checklist
- [x] Students can create, edit, and cancel leave requests
- [x] Students can view leave request status and history
- [x] Admin can manage leave types through the UI
- [x] Reusable Status Badge and Leave Type Dropdown used consistently
- [x] Avatar Picker fully gender-aware end-to-end
- [x] Profile page fetches live data on load
## 📅 Sprint 3 — Approval System, Comments & File Upload
* **Duration:** Week 30 (July 21–27, 2026)
* **Goal:** Build the approval workflow UI, a commenting system, and file attachment support — so trainers/admins can review and act on leave requests with context, and students receive real-time notifications when their request status changes.

### 1. Completed Features
* **Approval Dashboard:** Dedicated page for Trainers/Admins to review, approve, and reject leave requests.
* **Leave Request Detail Panel:** Full request context in one view — comments, attachments, and approval tracking history.
* **Approve / Reject Actions:** Wired directly into the Detail Panel.
* **Comment System:** Review Comment Modal connected to the backend Comment API, with `@mention` parsing and comment notifications.
* **File Upload:** Supporting document attachments (PNG/JPG/PDF/DOCX), with per-leave-type upload requirements enforced.
* **Notifications:** Bell & dropdown UI wired to the real Notifications API, with real-time delivery and deep-linking to the related leave request.
* **Calendar View:** Built using a calendar library, displaying leave requests across the month.
* **Reports Dashboard:** Charts (Chart.js) with filters, hourly/daily options, date range picker, and a Top 10 Students by Leave Requests report.
* **Role Rename:** "Trainer" renamed to "Educator" across the entire UI.
* **Time-Based Leave Requests:** Support for leave requests with time granularity, beyond full-day requests.

### 2. Sprint 3 Deliverable Checklist
- [x] Trainers/Admins can approve or reject leave requests through a dedicated dashboard UI
- [x] Users can add, view, and reply to comments on a leave request, with @mention support
- [x] Students can upload supporting documents to their leave requests
- [x] Notifications are created and shown in real time when a request's status changes or a user is mentioned
- [x] Calendar view and Reports Dashboard implemented


## 🗂️ Project Structure
src/
├── views/
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   ├── DashboardView.vue
│   ├── AuthCallbackView.vue
│   ├── LeaveRequestView.vue
│   ├── LeaveFormView.vue
│   ├── ApprovalView.vue
│   ├── CalendarView.vue
│   ├── AdminView.vue
│   ├── UserManagementView.vue
│   ├── ReportsView.vue
│   ├── LeaveTypesView.vue
│   ├── ProfileView.vue
│   ├── EditProfileView.vue
│   └── NotFoundView.vue
├── layouts/
│   └── DashboardLayout.vue
├── components/
│   ├── Navbar.vue
│   ├── Sidebar.vue
│   ├── Footer.vue
│   ├── StatusBadge.vue
│   ├── CalendarGrid.vue
│   ├── LeaveCard.vue
│   ├── CommentSection.vue
│   ├── FileUpload.vue
│   ├── auth/
│   │   ├── FormField.vue
│   │   ├── AuthTabs.vue
│   │   ├── AuthPanelLeft.vue
│   │   ├── SocialAuthButtons.vue
│   │   ├── SelectField.vue
│   │   └── PasswordField.vue
│   ├── layout/
│   │   ├── SidebarNavLink.vue
│   │   ├── SidebarNavGroup.vue
│   │   ├── NotificationBell.vue
│   │   └── NotificationItem.vue
│   ├── charts/
│   │   ├── Chart.js
│   │   ├── Chart.vue
│   │   └── ChartFilterBar.vue
│   ├── calendar/
│   │   ├── CalendarPanel.vue
│   │   └── CalendarEventDetailModal.vue
│   ├── leave-type/
│   │   ├── LeaveTypeRow.vue
│   │   ├── LeaveTypeCard.vue
│   │   └── LeaveTypeModal.vue
│   ├── dashboard/
│   │   ├── DashboardCharts.vue
│   │   ├── TodayLeaveListItem.vue
│   │   ├── DateRangeFilter.vue
│   │   ├── PendingTodayCard.vue
│   │   ├── ApprovedTodayCard.vue
│   │   └── RejectedTodayCard.vue
│   ├── user/
│   │   ├── UserCard.vue
│   │   ├── UserMenu.vue
│   │   ├── AvatarPicker.vue
│   │   ├── ProfileBadgeCard.vue
│   │   ├── ProfileSectionCard.vue
│   │   ├── ProfileFieldRow.vue
│   │   ├── ProfileFormField.vue
│   │   ├── ProfileProviderRow.vue
│   │   ├── ProfileSecuritySection.vue
│   │   ├── ChangePasswordModal.vue
│   │   └── LogoutConfirmModal.vue
│   ├── ui/
│   │   ├── StatCard.vue
│   │   ├── TimePicker.vue
│   │   ├── LeaveCard.vue
│   │   ├── FileUpload.vue
│   │   ├── CommentSection.vue
│   │   └── CommentRow.vue
│   └── icons/
│       ├── IconGoogle.vue
│       └── IconGithub.vue
├── router/
│   └── index.ts
├── stores/
│   ├── auth.ts
│   ├── leave.ts
│   ├── notification.ts
│   ├── leaveNotifications.ts
│   └── leaveFormModal.ts
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── userService.ts
│   ├── leaveService.ts
│   ├── commentService.ts
│   ├── notificationService.ts
│   └── reportService.ts
├── composables/
│   ├── usePolling.ts
│   ├── useLeaveRequests.ts
│   ├── useDefaultAvatars.ts
│   └── useChangePassword.ts
├── utils/
│   ├── date.js
│   ├── dateRange.js
│   ├── errors.js
│   ├── formatters.js
│   ├── initials.js
│   ├── leaveStatusConfig.js
│   ├── reportExport.js
│   └── dateRange.d.ts
├── types/
│   ├── user.ts
│   ├── leave.ts
│   ├── comment.ts
│   ├── notification.ts
│   ├── attachment.ts
│   └── stats.ts
└── assets/
    ├── images/
    └── styles/

## 💻 Getting Started
### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```
### 2. Development Server
Run the local development server:
```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173`

## 🌐 Environment Variables
Create a `.env` file in the project root directory and configure the following keys:

```ini
# Point this at your Laravel backend's API root
VITE_API_BASE_URL=http://localhost:8000/api

# OAuth Credentials
VITE_GOOGLE_CLIENT_ID=://googleusercontent.com
VITE_GITHUB_CLIENT_ID=Ov23liQ90k5noocjxO60
```

*Requirement: Ensures that the SLMS backend (Laravel) is running locally with CORS configured to explicitly allow requests from `http://localhost:5173`.*

---

## 👥 User Roles & UI Access

| Role | UI Access / Permissions |
| :--- | :--- |
| **Admin** | Full dashboard, user management, leave type management, system settings |
| **Educator** | Leave request review, approve/reject actions, comment section |
| **Student** | Submit leave requests, view personal history/status, cancel pending requests |

> ✅ Role-based UI filtering is active. The sidebar dynamically shows or hides links based on the authenticated user's role (`isAdmin`, `isEducator`, `isStudent`), and route guards enforce role-based access for protected routes.

---

## Team Workflow

### 🚀 Production Branches
* **`main` (Default Branch)**: Hosts the stable, production-ready source code that is currently live for end-users.
* **`production`**: Used for staging or final production sync. 
* **Rules**: Both are protected branches. Direct commits or direct pushes are forbidden. Code must only be merged via an approved Pull Request (PR).

### 🛠️ Development & Fix Branches
* **`develop`**: The main integration branch where all feature branches are merged for testing before going to production.
* **`fix-code-error-front`**: Used for fixing urgent frontend bugs or errors.

### 🌿 Feature Branches
* **Purpose**: Used for developing new features or components.
* **Branch Naming Convention**: Must follow the pattern `feature/<short-description>`
* **Examples based on repository**:
  * `feature/dashboard-layout`
  * `feature/api-service-configuration`
  * `feature/login-register-ui`
  * `feature/pinia-auth`
  * `feature/router-configuration`
  * `feature/social-login`
  * `feature/leave-request`
  * `feature/avatar-picker`
  * `feature/calendar-view`
  * `feature/api-integration`
  * `feature/readme-documentation`

## 🔗 Related Repositories
* **This Repository (Frontend):** [https://github.com/G10-SLMS/G10-SLMS-FRONT.git]
* **Backend API (Laravel):**  [https://github.com/G10-SLMS/G10-SLMS-BACK.git]

## 📜 Document History

| Sprint | Duration | Updated |
|---|---|---|
| Sprint 1 — Project Setup & Authentication | Jul 6 – 10, 2026 | Jul 10, 2026 |
| Sprint 2 — Leave Request System | Jul 14 – 20, 2026 | Jul 20, 2026 |
| Sprint 3 — Approval System, Comments & File Upload | Jul 21 – 27, 2026 | Jul 27, 2026 |

*Last updated: Sprint 3, Week 30 (July 27, 2026)*