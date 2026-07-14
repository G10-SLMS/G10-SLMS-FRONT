<template>
  <span
    class="rounded-full px-2.5 py-1 text-xs font-medium"
    :class="{
      'bg-amber-100 text-amber-700': status.toLowerCase() === 'pending',
      'bg-green-100 text-green-700': status.toLowerCase() === 'approved',
      'bg-red-100 text-red-700': status.toLowerCase() === 'rejected',
    }"
  >
    {{ status }}
  </span>
</template>

<script setup lang="ts">
defineProps({
  status: {
    type: String,
    required: true,
  },
})
</script>
