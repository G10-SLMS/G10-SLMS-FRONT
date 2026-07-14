<template>
  <div class="lr-table-wrap">
    <table class="lr-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Leave Type</th>
          <th>Duration</th>
          <th class="td-center">Days</th>
          <th>Submitted</th>
          <th>Status</th>
          <th class="td-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in items" :key="r.id" class="lr-row" @click="viewRequest(r.id)">
          <td class="td-id">#{{ r.id }}</td>
          <td>
            <span class="lr-type-label">{{ r.leave_type_name }}</span>
          </td>
          <td class="td-date">
            <span class="lr-date">{{ formatDate(r.start_date) }}</span>
            <ArrowRight :size="12" class="lr-date-arrow" />
            <span class="lr-date">{{ formatDate(r.end_date) }}</span>
          </td>
          <td class="td-center">
            <span class="lr-days-badge">{{ r.total_days }}d</span>
          </td>
          <td class="td-date-sm">{{ r.submission_date }}</td>
          <td>
            <span class="lr-status" :class="`lr-status--${r.status}`">
              <span class="lr-status-dot" />
              {{ statusLabel(r.status) }}
            </span>
          </td>
          <td class="td-right">
            <div class="lr-actions" @click.stop>
              <button class="lr-act lr-act--view" title="View details" @click="viewRequest(r.id)">
                <Eye :size="15" />
              </button>

              <button
                class="lr-act lr-act--edit"
                title="Edit request"
                :disabled="r.status !== 'pending'"
                @click="editRequest(r.id)"
              >
                <Edit :size="15" />
              </button>

              <button
                class="lr-act lr-act--cancel"
                title="Cancel request"
                :disabled="r.status !== 'pending'"
                @click="confirmCancel(r)"
              >
                <XCircle :size="15" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { LeaveRequestListItem } from '@/types/leave'
import { ArrowRight, Eye, Edit, XCircle } from 'lucide-vue-next'

defineProps<{
  items: LeaveRequestListItem[]
  formatDate: (s: string) => string
  statusLabel: (status: string) => string
  viewRequest: (id: number) => void
  editRequest: (id: number) => void
  confirmCancel: (r: LeaveRequestListItem) => void
}>()
</script>

