<template>
  <div class="dashboard-layout">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="min-w-0 flex-1 p-4 lg:p-6">
        <RouterView />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Footer from '@/components/layout/Footer.vue'
<<<<<<< HEAD
=======
import LeaveFormModal from '@/components/leave-request/LeaveFormModal.vue'
>>>>>>> 35630a0a83a340814f7873f1f1c05fea1a4b27c1

const sidebarOpen = ref(false)
const showApprovals = ref(false)
</script>
