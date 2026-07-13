# SLMS Frontend — Student Leave Management System

Vue 3 frontend for a web application that manages student leave requests — replacing manual, paper-based processes with a digital workflow connecting students, trainers, and administrators.

## 🛠️ Tech Stack
* **Framework:** Vue 3 (Composition API)
* **Language:** TypeScript
* **Build Tool:** Vite
* **Routing:** Vue Router
* **State Management:** Pinia
* **HTTP Client:** Axios


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


## 🗂️ Project Structure
src/
├── views/
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   ├── DashboardView.vue
│   ├── OAuthCallbackView.vue
│   ├── LeaveRequestView.vue
│   ├── LeaveFormView.vue
│   ├── ApprovalView.vue
│   ├── CalendarView.vue
│   ├── AdminView.vue
│   └── NotFoundView.vue
├── layouts/
│   └── DashboardLayout.vue
├── components/
|__ |__CalendarGrid.vue
|__ |__CommentSection.vue
|__ |__FileUpload.vue
|__ |__LeaveCard.vue
|__ |__StatusBadge.vue
│   ├── Navbar.vue
│   ├── Sidebar.vue
│   └── Footer.vue
├── router/
│   └── index.ts
├── stores/
│   └── auth.ts
|   |__ leave.ts
|   |__ notification.ts
├── services/
│   └── api.ts
|   |__ authService.ts
└── assets/
|   |__ images
|   |__ styles
|__ types/
|   |__user.ts

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
The application will be accessible at: `http://localhost:5173`
## 🌐 Environment Variables
Create a `.env` file in the project root directory and configure the following keys:

```ini
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
| **Trainer** | Leave request review, approve/reject actions, comment section |
| **Student** | Submit leave requests, view personal history/status, cancel pending requests |

> ⚠️ *Note: Role-based UI filtering is not yet fully implemented. The sidebar currently displays the same links to all users. This feature is planned for Sprint 2 once `auth.ts` role state is integrated with global route guards.*

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
---
## 🔗 Related Repositories
* **This Repository (Frontend):** [https://github.com/G10-SLMS/G10-SLMS-FRONT.git]
* **Backend API (Laravel):**  [https://github.com/G10-SLMS/G10-SLMS-BACK.git]
---
*Last updated: Sprint 1, Week 28 (July 10, 2026)*