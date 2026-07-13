<template>
  <div class="table-card">
    <table v-if="requests.length">
      <thead>
        <tr>
          <th>Student</th>
          <th>Leave Type</th>
          <th>Leave Date</th>
          <th>Submitted</th>
          <th>Status</th>
          <th v-if="showActions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <LeaveRequestRow
          v-for="request in requests"
          :key="request.id"
          :request="request"
          :show-actions="showActions"
          @edit="$emit('edit', $event)"
        />
      </tbody>
    </table>

    <LeaveRequestEmptyState v-else />
  </div>
</template>

<script setup>
import LeaveRequestRow from './LeaveRequestRow.vue'
import LeaveRequestEmptyState from './LeaveRequestEmptyState.vue'

defineProps({
  requests: {
    type: Array,
    required: true,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['edit'])
</script>

<style scoped>
.table-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  text-align: left;
  padding: 14px 16px;
  color: #6b7280;
  font-weight: 500;
  font-size: 13px;
  border-bottom: 1px solid #e5e7eb;
}
</style>
