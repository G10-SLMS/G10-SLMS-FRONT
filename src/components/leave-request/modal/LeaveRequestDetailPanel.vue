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
              :aria-label="`${request.student}'s avatar`"
            />
            <div v-else :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white', getAvatarColor(request.student)]" :aria-label="`${request.student}'s avatar`">
              {{ getInitials(request.student) }}
            </div>
            <div class="min-w-0">
              <h3 class="truncate text-base font-bold text-slate-900">{{ request.student }}</h3>
              <p class="text-xs text-slate-500">{{ request.leaveType }}</p>
            </div>
          </template>
          <template v-else>
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-400" aria-label="Student avatar">—</div>
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
              :aria-label="`Download attachment: ${request.attachment.name}`"
              class="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline"
            >
              <Paperclip :size="14" />
              <span>{{ request.attachment.name }}</span>
            </a>
            <span v-else class="text-slate-400">—</span>
          </dd>
        </div>
      </dl>

      <div
        v-if="request.reviewer"
        class="mt-5 flex items-start gap-3 rounded-lg border px-4 py-3.5"
        :class="reviewTheme.box"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" :class="reviewTheme.icon">
          <CheckCircle2 v-if="request.status?.toLowerCase() === 'approved'" :size="18" />
          <XCircle v-else-if="request.status?.toLowerCase() === 'rejected'" :size="18" />
          <UserSearch v-else-if="request.status?.toLowerCase() === 'under_review'" :size="18" />
          <UserCheck v-else :size="18" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="m-0 text-xs font-medium uppercase tracking-wide" :class="reviewTheme.text">
            {{ reviewLabel }}
          </p>
          <p class="m-0 mt-0.5 text-sm font-semibold text-slate-900">{{ request.reviewer }}</p>
          <p v-if="request.reviewDate" class="m-0 mt-0.5 text-xs text-slate-500">
            {{ formatDate(request.reviewDate) }}
          </p>
        </div>
      </div>

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
import { computed } from 'vue'
import { Paperclip, CheckCircle2, XCircle, UserCheck, UserSearch } from 'lucide-vue-next'
import LeaveStatusBadge from '@/components/leave-common/LeaveStatusBadge.vue'
import { getInitials, getAvatarColor } from '@/utils/initials'
import { formatDate } from '@/utils/date'
import type { LeaveRequestDetail } from '@/types/leave'

const props = defineProps<{
  request: LeaveRequestDetail
}>()

const reviewLabel = computed(() => {
  const status = (props.request.status ?? '').toLowerCase()
  if (status === 'approved') return 'Approved by'
  if (status === 'rejected') return 'Rejected by'
  if (status === 'under_review') return 'Marked under review by'
  return 'Reviewed by'
})

const reviewTheme = computed(() => {
  const status = (props.request.status ?? '').toLowerCase()
  if (status === 'approved') {
    return { box: 'bg-green-50 border-green-100', icon: 'bg-green-100 text-green-600', text: 'text-green-800' }
  }
  if (status === 'rejected') {
    return { box: 'bg-red-50 border-red-100', icon: 'bg-red-100 text-red-600', text: 'text-red-800' }
  }
  if (status === 'under_review') {
    return { box: 'bg-cyan-50 border-cyan-100', icon: 'bg-cyan-100 text-cyan-600', text: 'text-cyan-800' }
  }
  return { box: 'bg-slate-50 border-slate-100', icon: 'bg-slate-100 text-slate-600', text: 'text-slate-800' }
})
</script>


