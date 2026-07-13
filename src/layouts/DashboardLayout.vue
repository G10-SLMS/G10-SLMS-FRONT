<template>
  <div class="dashboard-layout">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="layout-main">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="content">
        <RouterView />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import Footer from '@/components/Footer.vue'

const sidebarOpen = ref(false)
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f6fa;
}

.layout-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 24px;
  background: #f5f6fa;
  min-width: 0;
}

@media (max-width: 1023px) {
  .content {
    padding: 16px;
  }
}
</style>
