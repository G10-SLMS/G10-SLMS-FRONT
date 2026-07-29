<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-surface-darker">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="min-w-0 flex-1 p-4 lg:p-6">
        <RouterView />
      </main>
      <Footer />
    </div>

    <LeaveFormModal />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import Footer from '@/components/layout/Footer.vue';
import LeaveFormModal from '@/components/leave-request/modal/LeaveFormModal.vue';

const sidebarOpen = ref(false);
</script>
