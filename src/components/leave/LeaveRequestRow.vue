<template>
  <tr>
    <td>{{ request.student }}</td>
    <td>{{ request.type }}</td>
    <td>{{ request.leaveDate }}</td>
    <td class="submitted-cell">{{ timeAgo }}</td>
    <td>
      <LeaveStatusBadge :status="request.status" />
    </td>
    <td v-if="showActions">
      <button
        v-if="request.status === 'Pending'"
        class="edit-btn"
        @click="$emit('edit', request.id)"
      >
        <Pencil :size="14" />
        Edit
      </button>
      <span v-else class="locked-hint">—</span>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { Pencil } from 'lucide-vue-next'
import LeaveStatusBadge from './LeaveStatusBadge.vue'

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['edit'])

const timeAgo = computed(() => {
  const submitted = new Date(props.request.submittedAt)
  if (Number.isNaN(submitted.getTime())) return ''

  const diffMs = Date.now() - submitted.getTime()
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return submitted.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
})
</script>

<style scoped>
tr {
  border-bottom: 1px solid #f3f4f6;
}

tr:last-child {
  border-bottom: none;
}

td {
  text-align: left;
  padding: 14px 16px;
}

.submitted-cell {
  color: #6b7280;
  white-space: nowrap;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #eff6ff;
  color: #2563eb;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.edit-btn:hover {
  background: #dbeafe;
}

.locked-hint {
  color: #9ca3af;
  font-size: 13px;
}
</style>
