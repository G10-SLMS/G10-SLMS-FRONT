<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <nav>
      <RouterLink to="/dashboard" class="nav-item">📊 Dashboard</RouterLink>
      <RouterLink to="/leave-requests" class="nav-item">📝 Leave Requests</RouterLink>
      <RouterLink v-if="canApprove" to="/approvals" class="nav-item">✅ Approvals</RouterLink>
      <RouterLink to="/calendar" class="nav-item">📅 Calendar</RouterLink>
      <RouterLink v-if="isAdmin" to="/admin" class="nav-item">⚙️ Admin</RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  isOpen?: boolean
}>()

const auth = useAuthStore()

// Approvals are only relevant to trainers (their own students) and admins (everyone).
const canApprove = computed(() => auth.isTrainer || auth.isAdmin)
const isAdmin = computed(() => auth.isAdmin)
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: #7197e8;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 0;
}

nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  color: #d1d5db;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-icon {
  font-size: 18px;
  line-height: 1;
}

.nav-label {
  font-size: 14px;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: #0b57d1;
  color: white;
}

@media (max-width: 1024px) and (min-width: 769px) {
  .sidebar {
    width: 72px;
  }
  .nav-item {
    justify-content: center;
    padding: 12px;
  }
  .nav-label {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    z-index: 50;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
