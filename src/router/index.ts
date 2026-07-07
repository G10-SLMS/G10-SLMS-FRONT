import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guestOnly?: boolean
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
      path: '/dashboard-panel',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { title: 'Dashboard', requiresAuth: true },
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
          path: '/leave/new',
          name: 'NewLeave',
          component: () => import('../views/LeaveFormView.vue'),
          meta: { title: 'New Leave Request', requiresAuth: true },
        },
        {
          path: '/leave/:id/edit',
          name: 'EditLeave',
          component: () => import('../views/LeaveFormView.vue'),
          meta: { title: 'Edit Leave Request', requiresAuth: true },
        },
        {
          path: '/approvals',
          name: 'Approvals',
          component: () => import('../views/ApprovalView.vue'),
          meta: { title: 'Approvals', requiresAuth: true },
        },
        {
          path: '/calendar',
          name: 'Calendar',
          component: () => import('../views/CalendarView.vue'),
          meta: { title: 'Calendar', requiresAuth: true },
        },
        {
          path: '/admin',
          name: 'Admin',
          component: () => import('../views/AdminView.vue'),
          meta: { title: 'Admin', requiresAuth: true },
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

  return true
})

router.beforeEach((to) => {
  const title = to.meta.title || 'SLMS'
  document.title = `${title} · SLMS`
})

export default router
