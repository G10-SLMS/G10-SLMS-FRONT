<template>
  <header class="navbar">
    <div class="navbar-left">
      <button class="icon-btn hamburger" @click="emit('toggle-sidebar')" aria-label="Toggle menu">
        <Menu :size="20" />
      </button>
      <button v-if="auth.isStudent" class="btn-new-request" @click="leaveModal.openCreate()">
        <Plus :size="16" />
        <span class="btn-new-request-label">New Request</span>
      </button>
    </div>

    <div class="navbar-right">
      <button class="icon-btn" title="Notifications">
        <Bell :size="20" />
      </button>

      <div class="user-menu">
        <button class="user-info" @click="toggleMenu">
          <span class="avatar"><User :size="18" /></span>
          <span class="user-text">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ roleLabel }}</span>
          </span>
          <ChevronDown class="chevron" :size="14" />
        </button>

        <div v-if="menuOpen" class="dropdown">
          <RouterLink to="/profile" class="dropdown-item" @click="menuOpen = false">
            <UserCircle :size="16" />
            <span>Profile</span>
          </RouterLink>
          <button class="dropdown-item logout" @click="logout">
            <LogOut :size="16" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useLeaveFormModalStore } from '@/stores/leaveFormModal';
import { Menu, Bell, User, ChevronDown, UserCircle, LogOut, Plus } from 'lucide-vue-next';

const router = useRouter();
const auth = useAuthStore();
const leaveModal = useLeaveFormModalStore();

const menuOpen = ref(false);
const emit = defineEmits<{ 'toggle-sidebar': [] }>();

const userName = computed(() => auth.user?.name || 'Guest User');

const roleLabel = computed(() => {
  if (auth.isAdmin) return 'Admin';
  if (auth.isTrainer) return 'Trainer';
  if (auth.isStudent) return 'Student';
  return '';
});

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

async function logout() {
  menuOpen.value = false;
  await auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.navbar {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #ffffff;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 55;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-new-request {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f97316;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-new-request:hover {
  background: #ea580c;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 8px;
  border-radius: 6px;
  transition:
    background 0.15s,
    color 0.15s;
}

.icon-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
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
  color: #334155;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.15s;
}

.user-info:hover {
  background: #f1f5f9;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  flex-shrink: 0;
}

.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-role {
  font-size: 11px;
  font-weight: 500;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.chevron {
  color: #94a3b8;
}

.dropdown {
  position: absolute;
  top: 52px;
  right: 0;
  background: white;
  color: #1f2937;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 170px;
  overflow: hidden;
  z-index: 10;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
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

@media (max-width: 1024px) {
  .navbar {
    padding: 12px 16px;
  }

  .hamburger {
    display: block;
  }

  .user-text {
    display: none;
  }

  .btn-new-request-label {
    display: none;
  }

  .btn-new-request {
    padding: 8px;
  }
}
</style>
