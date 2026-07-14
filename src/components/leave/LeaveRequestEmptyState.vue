<template>
  <div class="flex flex-col items-center justify-center gap-2.5 px-5 py-[60px] text-center text-gray-400">
    <Inbox :size="36" :stroke-width="1.5" />
    <p>No leave requests yet.</p>
  </div>
</template>

<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
</script>
