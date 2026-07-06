<template>
  <div class="dashboard-layout">
    <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="layout-body">
      <Sidebar :is-open="sidebarOpen" />
      <main class="content">
        <RouterView />
      </main>
    </div>
    <Transition name="fade">
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'

const sidebarOpen = ref(false)
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-body {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 24px;
  background: #f5f6fa;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 1023px) {
  .content {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 40;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>