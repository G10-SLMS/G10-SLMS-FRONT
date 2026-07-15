<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-900">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="min-w-0 flex-1 p-4 lg:p-6">
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

function handleLeaveSubmitted() {
  // TODO: once wired to the real API, trigger a refetch of the leave
  // request list here (e.g. via the leave store) so the table updates
  // without a full page reload.
}
</script>
