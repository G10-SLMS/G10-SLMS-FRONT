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
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import LeaveRequestView from '../views/LeaveRequestView.vue'
import LeaveFormView from '../views/LeaveFormView.vue'
import ApprovalView from '../views/ApprovalView.vue'
import CalendarView from '../views/CalendarView.vue'
import AdminView from '../views/AdminView.vue'
import NotFoundView from '../views/NotFoundView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/register', name: 'Register', component: RegisterView },
    {
      path: '/dashboard-panel',
      component: DashboardLayout,
      children: [
        { path: '/dashboard', name: 'Dashboard', component: DashboardView },
        { path: '/leave-requests', name: 'LeaveRequests', component: LeaveRequestView },
        { path: '/leave/new', name: 'NewLeave', component: LeaveFormView },
        { path: '/leave/:id/edit', name: 'EditLeave', component: LeaveFormView },
        { path: '/approvals', name: 'Approvals', component: ApprovalView },
        { path: '/calendar', name: 'Calendar', component: CalendarView },
        { path: '/admin', name: 'Admin', component: AdminView },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
>>>>>>> feature/dashboard-layout
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
