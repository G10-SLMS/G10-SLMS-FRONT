<<<<<<< HEAD
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LeaveRequestView from '@/views/LeaveRequestView.vue'
import LeaveFormView from '@/views/LeaveFormView.vue'
import ApprovalView from '@/views/ApprovalView.vue'
import CalendarView from '@/views/CalendarView.vue'
import AdminView from '@/views/AdminView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/leave-requests',
    name: 'LeaveRequests',
    component: LeaveRequestView,
    meta: { requiresAuth: true },
  },
  {
    path: '/leave/new',
    name: 'NewLeave',
    component: LeaveFormView,
    meta: { requiresAuth: true },
  },
  {
    path: '/leave/:id/edit',
    name: 'EditLeave',
    component: LeaveFormView,
    meta: { requiresAuth: true },
  },
  {
    path: '/approvals',
    name: 'Approvals',
    component: ApprovalView,
    meta: { requiresAuth: true },
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
=======
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { 
      path: '/login', 
      name: 'Login', 
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Login' }
    },
    { 
      path: '/register', 
      name: 'Register', 
      component: () => import('../views/RegisterView.vue'),
      meta: { title: 'Register' }
    },
    {
      path: '/dashboard-panel',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { title: 'Dashboard' },
      children: [
        { 
          path: '/dashboard', 
          name: 'Dashboard', 
          component: () => import('../views/DashboardView.vue'),
          meta: { title: 'Dashboard' }
        },
        { 
          path: '/leave-requests', 
          name: 'LeaveRequests', 
          component: () => import('../views/LeaveRequestView.vue'),
          meta: { title: 'Leave Requests' }
        },
        { 
          path: '/leave/new', 
          name: 'NewLeave', 
          component: () => import('../views/LeaveFormView.vue'),
          meta: { title: 'New Leave Request' }
        },
        { 
          path: '/leave/:id/edit', 
          name: 'EditLeave', 
          component: () => import('../views/LeaveFormView.vue'),
          meta: { title: 'Edit Leave Request' }
        },
        { 
          path: '/approvals', 
          name: 'Approvals', 
          component: () => import('../views/ApprovalView.vue'),
          meta: { title: 'Approvals' }
        },
        { 
          path: '/calendar', 
          name: 'Calendar', 
          component: () => import('../views/CalendarView.vue'),
          meta: { title: 'Calendar' }
        },
        { 
          path: '/admin', 
          name: 'Admin', 
          component: () => import('../views/AdminView.vue'),
          meta: { title: 'Admin' }
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Page Not Found' }
    },
  ],
>>>>>>> feature/dashboard-layout
})

<<<<<<< HEAD
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
=======
router.beforeEach((to, _from, next) => {
  const title = (to.meta.title as string) || 'SLMS'
  document.title = `${title} · SLMS`
  next()
>>>>>>> feature/router-configuration
})

export default router
