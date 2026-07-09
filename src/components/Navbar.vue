<template>
  <header class="navbar">
    <div class="navbar-left">
      <button class="icon-btn hamburger" @click="emit('toggle-sidebar')" aria-label="Toggle menu">☰</button>
      <span class="logo">📋 SLMS</span>
    </div>

    <div class="navbar-right">
      <button class="icon-btn" title="Notifications">🔔</button>

      <div class="user-menu">
        <button class="user-info" @click="toggleMenu">
          <span class="avatar">👤</span>
          <span class="user-name">{{ userName }}</span>
          <span class="chevron">▾</span>
        </button>

        <div v-if="menuOpen" class="dropdown">
          <RouterLink to="/dashboard" class="dropdown-item" @click="menuOpen = false">
            📊 Dashboard
          </RouterLink>
          <RouterLink to="/profile" class="dropdown-item" @click="menuOpen = false">
            👤 Profile
          </RouterLink>
          <button class="dropdown-item logout" @click="logout">
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const userName = ref('Guest User')
const menuOpen = ref(false)
const emit = defineEmits<{ 'toggle-sidebar': [] }>()

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

async function logout() {
  menuOpen.value = false
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #1e293b;
  color: white;
  position: relative;
}

.logo {
  font-weight: bold;
  font-size: 18px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: white;
}

.hamburger {
  display: none;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.avatar {
  font-size: 20px;
}

.chevron {
  font-size: 12px;
  color: #cbd5e1;
}

.dropdown {
  position: absolute;
  top: 44px;
  right: 0;
  background: white;
  color: #1f2937;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  overflow: hidden;
  z-index: 10;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  font-size: 14px;
  text-decoration: none;
  color: #1f2937;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.logout {
  color: #ef4444;
}

@media (max-width: 1023px) {
  .navbar {
    position: sticky;
    top: 0;
    z-index: 30;
  }

  .hamburger {
    display: block;
  }

  .user-name {
    display: none;
  }
}
</style>