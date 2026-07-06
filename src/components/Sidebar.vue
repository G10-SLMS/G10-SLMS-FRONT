<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <nav>
      <RouterLink to="/dashboard" class="nav-item">📊 Dashboard</RouterLink>
      <RouterLink to="/leave-requests" class="nav-item">📝 Leave Requests</RouterLink>
      <RouterLink to="/calendar" class="nav-item">📅 Calendar</RouterLink>
      <RouterLink to="/admin" class="nav-item">⚙️ Admin</RouterLink>
    </nav>

  </aside>
</template>

<script setup lang="ts">
defineProps<{
  isOpen?: boolean
}>()
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
  padding: 12px 24px;
  color: #d1d5db;
  text-decoration: none;
  transition: background 0.2s;
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
    padding: 12px;
    text-align: center;
    font-size: 0;
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