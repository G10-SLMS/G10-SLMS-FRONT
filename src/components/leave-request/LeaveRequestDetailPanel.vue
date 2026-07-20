<template>
  <div class="rounded-xl bg-white shadow-sm border border-slate-100">
    <div class="border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <template v-if="request.student">
            <div
              v-if="request.studentAvatarUrl"
              class="h-10 w-10 shrink-0 rounded-full object-cover"
              :style="{ backgroundImage: `url(${request.studentAvatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
            />
            <div v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
              {{ initials(request.student) }}
            </div>
            <div class="min-w-0">
              <h3 class="truncate text-base font-bold text-slate-900">{{ request.student }}</h3>
              <p class="text-xs text-slate-500">{{ request.leaveType }}</p>
            </div>
          </template>
          <template v-else>
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-400">—</div>
            <div class="min-w-0">
              <h3 class="truncate text-base font-bold text-slate-400">—</h3>
              <p class="text-xs text-slate-400">{{ request.leaveType }}</p>
            </div>
          </template>
        </div>
        <LeaveStatusBadge :status="request.status" />
      </div>
    </div>

    <div class="px-5 py-4 sm:px-6 sm:py-5">
      <dl class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <dt class="text-xs font-medium text-slate-500">Reason</dt>
          <dd class="mt-0.5 text-sm text-slate-900">{{ request.reason || '—' }}</dd>
        </div>

        <div>
          <dt class="text-xs font-medium text-slate-500">Start Date</dt>
          <dd class="mt-0.5 text-sm text-slate-900">{{ formatDate(request.startDate) }}</dd>
        </div>

        <div>
          <dt class="text-xs font-medium text-slate-500">End Date</dt>
          <dd class="mt-0.5 text-sm text-slate-900">{{ formatDate(request.endDate) }}</dd>
        </div>

        <div>
          <dt class="text-xs font-medium text-slate-500">Attachment</dt>
          <dd class="mt-0.5 text-sm">
            <a
              v-if="request.attachment"
              :href="request.attachment.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline"
            >
              <Paperclip :size="14" />
              <span>{{ request.attachment.name }}</span>
            </a>
            <span v-else class="text-slate-400">—</span>
          </dd>
        </div>

        <div>
          <dt class="text-xs font-medium text-slate-500">Reviewer</dt>
          <dd class="mt-0.5 text-sm text-slate-900">{{ request.reviewer || '—' }}</dd>
        </div>

        <div>
          <dt class="text-xs font-medium text-slate-500">Review Date</dt>
          <dd class="mt-0.5 text-sm text-slate-900">{{ request.reviewDate ? formatDate(request.reviewDate) : '—' }}</dd>
        </div>
      </dl>

      <div v-if="request.comment" class="mt-5">
        <dt class="text-xs font-medium text-slate-500">Comment</dt>
        <dd class="mt-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700">
          {{ request.comment }}
        </dd>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Paperclip } from 'lucide-vue-next'
import LeaveStatusBadge from '@/components/leave-common/LeaveStatusBadge.vue'
import type { LeaveRequestDetail } from '@/types/leave'

const props = defineProps<{
  request: LeaveRequestDetail
}>()

function initials(name: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(value: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<script lang="ts">
if (import.meta.env.DEV) {
  import { defineComponent, h } from 'vue'
  import LeaveRequestDetailPanel from './LeaveRequestDetailPanel.vue'
  import type { LeaveRequestDetail } from '@/types/leave'

  const mockRequest: LeaveRequestDetail = {
    student: 'Alice Johnson',
    studentAvatarUrl: null,
    leaveType: 'Sick Leave',
    reason: 'Medical appointment at Bangkok Hospital. Doctor advised 2 days rest.',
    startDate: '2026-07-22',
    endDate: '2026-07-23',
    attachment: { name: 'medical_certificate.pdf', url: '#' },
    status: 'Pending',
    reviewer: null,
    reviewDate: null,
    comment: null,
  }

  const LeaveRequestDetailDemo = defineComponent({
    name: 'LeaveRequestDetailDemo',
    setup() {
      return () =>
        h('div', { class: 'mx-auto max-w-2xl p-6' }, [
          h('h2', { class: 'mb-4 text-lg font-bold text-slate-900' }, 'Leave Request Detail Panel — Demo'),
          h(LeaveRequestDetailPanel, { request: mockRequest }),
        ])
    },
  })

  export default LeaveRequestDetailDemo
}
</script>
