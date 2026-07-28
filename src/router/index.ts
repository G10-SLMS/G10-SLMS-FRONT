import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/user'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guestOnly?: boolean
    roles?: UserRole[]
    provider?: 'google' | 'github'
  }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', redirect: '/dashboard' },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Login', guestOnly: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/RegisterView.vue'),
      meta: { title: 'Register', guestOnly: true },
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/ForgotPasswordView.vue'),
      meta: { title: 'Forgot Password', guestOnly: true },
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('../views/ResetPasswordView.vue'),
      meta: { title: 'Reset Password', guestOnly: true },
    },
    {
      path: '/auth/google/callback',
      name: 'GoogleCallback',
      component: () => import('../views/AuthCallbackView.vue'),
      meta: { title: 'Signing in...', provider: 'google' },
    },
    {
      path: '/auth/github/callback',
      name: 'GithubCallback',
      component: () => import('../views/AuthCallbackView.vue'),
      meta: { title: 'Signing in...', provider: 'github' },
    },
    {
      path: '/dashboard-panel',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { title: 'Dashboard', requiresAuth: true },
        },
        {
          path: '/leave-requests',
          name: 'LeaveRequests',
          component: () => import('../views/LeaveRequestView.vue'),
          meta: { title: 'Leave Requests', requiresAuth: true },
        },
        {
          path: '/approvals',
          name: 'Approvals',
          component: () => import('../views/ApprovalView.vue'),
          meta: { title: 'Approvals', requiresAuth: true, roles: ['educator', 'admin'] },
        },
        {
          path: '/calendar',
          name: 'Calendar',
          component: () => import('../views/CalendarView.vue'),
          meta: { title: 'Calendar', requiresAuth: true },
        },
        {
          path: '/reports',
          name: 'Reports',
          component: () => import('../views/ReportsView.vue'),
          meta: { title: 'Reports', requiresAuth: true, roles: ['admin', 'educator'] },
        },
        {
          path: '/users',
          name: 'UserManagement',
          component: () => import('../views/UserManagementView.vue'),
          meta: { title: 'User Management', requiresAuth: true, roles: ['admin', 'educator'] },
        },
        {
          path: '/leave-types',
          name: 'LeaveTypesManagement',
          component: () => import('../views/LeaveTypesView.vue'),
          meta: { title: 'Leave Types Management', requiresAuth: true, roles: ['admin', 'educator'] },
        },
        {
          path: '/student-directory',
          name: 'StudentDirectory',
          component: () => import('../views/StudentDirectoryView.vue'),
          meta: { title: 'Student Directory', requiresAuth: true, roles: ['admin', 'educator'] },
        },
        {
          path: '/student-directory/:generation',
          name: 'StudentDirectoryGeneration',
          component: () => import('../views/GenerationDirectoryView.vue'),
          meta: { title: 'Student Directory', requiresAuth: true, roles: ['admin', 'educator'] },
        },
        {
          path: '/student-directory/:generation/:className',
          name: 'StudentDirectoryClass',
          component: () => import('../views/ClassDirectoryView.vue'),
          meta: { title: 'Student Directory', requiresAuth: true, roles: ['admin', 'educator'] },
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('../views/ProfileView.vue'),
          meta: { title: 'My Profile', requiresAuth: true },
        },
        {
          path: '/profile/edit',
          name: 'EditProfile',
          component: () => import('../views/EditProfileView.vue'),
          meta: { title: 'Edit Profile', requiresAuth: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Page Not Found' },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'Dashboard' }
  }

  if (to.meta.roles && auth.user && !to.meta.roles.includes(auth.user.role)) {
    return { name: 'Dashboard' }
  }

  const title = to.meta.title || 'SLMS'
  document.title = `${title} · SLMS`

  return true
})

export default router
