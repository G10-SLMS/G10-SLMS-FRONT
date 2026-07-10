import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/user'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guestOnly?: boolean
<<<<<<< HEAD
    /** If set, only these roles may access the route. Omit = any authenticated role. */
    roles?: UserRole[]
=======
    roles?: UserRole[]
    provider?: 'google' | 'github'
>>>>>>> dfa85ba38c1443579f95b8c9e1c560b84d61ea92
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
      path: '/oauth/callback',                            
      name: 'OAuthCallback',                                
      component: () => import('../views/OAuthCallbackView.vue'), 
    }, 
    {
      path: '/auth/google/callback',
      name: 'GoogleCallback',
      component: () => import('../views/AuthCallbackView.vue'),
      meta: { title: 'Signing in…', provider: 'google' },
    },
    {
      path: '/auth/github/callback',
      name: 'GithubCallback',
      component: () => import('../views/AuthCallbackView.vue'),
      meta: { title: 'Signing in…', provider: 'github' },
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
          meta: { title: 'Approvals', requiresAuth: true, roles: ['trainer', 'admin'] },
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
          meta: { title: 'Admin', requiresAuth: true, roles: ['admin'] },
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

  // Role-based access control: if the route restricts roles and the
  // logged-in user's role isn't in the list, bounce them to the dashboard.
  if (to.meta.roles && auth.user && !to.meta.roles.includes(auth.user.role)) {
    return { name: 'Dashboard' }
  }

  return true
})

router.beforeEach((to) => {
  const title = to.meta.title || 'SLMS'
  document.title = `${title} · SLMS`
})

router.beforeEach((to) => {
  const title = to.meta.title || 'SLMS'
  document.title = `${title} · SLMS`
})

export default router
