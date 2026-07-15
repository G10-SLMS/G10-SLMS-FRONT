<template>
  <span class="status-badge" :class="badgeClass">
    {{ badgeLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'pending' },
  approved: { label: 'Approved', className: 'approved' },
  rejected: { label: 'Rejected', className: 'rejected' },
  cancelled: { label: 'Cancelled', className: 'cancelled' },
}

const props = defineProps<{
  status: string
}>()

const badgeInfo = computed(() => {
  const key = (props.status ?? '').trim().toLowerCase()
  return STATUS_MAP[key] || { label: 'Unknown', className: 'unknown' }
})

const badgeLabel = computed(() => badgeInfo.value.label)
const badgeClass = computed(() => badgeInfo.value.className)
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.pending {
  background: #fef3c7;
  color: #b45309;
}

.status-badge.approved {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.status-badge.cancelled {
  background: #e5e7eb;
  color: #374151;
}

.status-badge.unknown {
  background: #f3f4f6;
  color: #9ca3af;
}
</style>
