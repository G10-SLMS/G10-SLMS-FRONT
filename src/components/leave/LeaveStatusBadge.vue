<template>
  <span class="badge" :class="status.toLowerCase()">
    {{ status }}
  </span>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.badge.pending {
  background: #fef3c7;
  color: #b45309;
}

.badge.approved {
  background: #dcfce7;
  color: #15803d;
}

.badge.rejected {
  background: #fee2e2;
  color: #b91c1c;
}
</style>
