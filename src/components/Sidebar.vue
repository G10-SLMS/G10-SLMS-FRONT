<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-brand">
      <img :src="logoUrl" alt="SLMS logo" class="sidebar-logo" />
      <span class="sidebar-name">PNC-SLMS</span>
    </div>

    <nav>
      <RouterLink to="/dashboard" class="nav-item">
        <LayoutDashboard class="nav-icon" :size="18" />
        <span class="nav-label">Dashboard</span>
      </RouterLink>
      <RouterLink to="/leave-requests" class="nav-item">
        <FileText class="nav-icon" :size="18" />
        <span class="nav-label">Leave Requests</span>
      </RouterLink>
      <RouterLink v-if="canApprove" to="/approvals" class="nav-item">
        <CheckSquare class="nav-icon" :size="18" />
        <span class="nav-label">Approvals</span>
      </RouterLink>
      <RouterLink to="/calendar" class="nav-item">
        <Calendar class="nav-icon" :size="18" />
        <span class="nav-label">Calendar</span>
      </RouterLink>
      <RouterLink v-if="isAdmin" to="/admin" class="nav-item">
        <Settings class="nav-icon" :size="18" />
        <span class="nav-label">Admin</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/image/logo.png'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  Settings,
} from 'lucide-vue-next'

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
  height: 100vh;
  position: sticky;
  top: 0;
  align-self: flex-start;
  background: #ffffff;
  color: #334155;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-right: 1px solid #e2e8f0;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-logo {
  height: 32px;
  width: auto;
  display: block;
  flex-shrink: 0;
}

.sidebar-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  margin: 0 8px;
  border-radius: 6px;
  color: #64748b;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.nav-icon {
  flex-shrink: 0;
  stroke-width: 2;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.nav-item.router-link-active {
  background: #eff6ff;
  color: #2563eb;
}

.nav-item.router-link-active .nav-icon {
  color: #2563eb;
}

@media (max-width: 1024px) and (min-width: 769px) {
  .sidebar {
    width: 72px;
  }
  .sidebar-brand {
    justify-content: center;
    padding: 0 0 16px;
  }
  .sidebar-logo {
    height: 28px;
  }
  .sidebar-name {
    display: none;
  }
  .nav-item {
    justify-content: center;
    padding: 12px;
    margin: 0 8px;
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
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
