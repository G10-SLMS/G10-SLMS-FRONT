<template>
  <div class="flex min-h-screen bg-[#f5f6fa]">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="min-w-0 flex-1 bg-[#f5f6fa] p-6 max-lg:p-4">
        <RouterView />
      </main>
      <Footer />
    </div>

    <LeaveFormModal @submitted="handleLeaveSubmitted" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Footer from '@/components/layout/Footer.vue'
import LeaveFormModal from '@/components/leave/LeaveFormModal.vue'

const sidebarOpen = ref(false)

function handleLeaveSubmitted() {}
</script>
