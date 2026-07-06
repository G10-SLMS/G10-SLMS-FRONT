import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LeaveRequestView from '@/views/LeaveRequestView.vue'
import LeaveFormView from '@/views/LeaveFormView.vue'
import ApprovalView from '@/views/ApprovalView.vue'
import CalendarView from '@/views/CalendarView.vue'
import AdminView from '@/views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/register', name: 'Register', component: RegisterView },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView },
    { path: '/leave-requests', name: 'LeaveRequests', component: LeaveRequestView },
    { path: '/leave/new', name: 'NewLeave', component: LeaveFormView },
    { path: '/leave/:id/edit', name: 'EditLeave', component: LeaveFormView },
    { path: '/approvals', name: 'Approvals', component: ApprovalView },
    { path: '/calendar', name: 'Calendar', component: CalendarView },
    { path: '/admin', name: 'Admin', component: AdminView },
  ],
})

export default router