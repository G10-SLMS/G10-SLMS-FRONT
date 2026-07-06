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
})

router.beforeEach((to, _from, next) => {
  const title = (to.meta.title as string) || 'SLMS'
  document.title = `${title} · SLMS`
  next()
})

export default router
