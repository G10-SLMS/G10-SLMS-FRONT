<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[720px] border-collapse text-sm">
      <thead>
        <tr class="sticky top-0 z-10 bg-slate-50">
          <th class="border-b border-slate-200 px-4 py-3.5 pl-5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">ID</th>
          <th class="border-b border-slate-200 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Leave Type</th>
          <th class="border-b border-slate-200 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Start Date</th>
          <th class="border-b border-slate-200 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">End Date</th>
          <th class="border-b border-slate-200 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">Days</th>
          <th class="border-b border-slate-200 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Submitted</th>
          <th class="border-b border-slate-200 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</th>
          <th class="border-b border-slate-200 px-4 py-3.5 pr-5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="r in items"
          :key="r.id"
          class="cursor-pointer border-b border-slate-100 transition last:border-none hover:bg-slate-50 active:bg-slate-100"
          @click="viewRequest(r.id)"
        >
          <td class="px-4 py-3.5 pl-5 text-[13px] font-bold text-blue-600">#{{ r.id }}</td>
          <td class="px-4 py-3.5 font-semibold text-slate-900">{{ r.leave_type_name }}</td>
          <td class="px-4 py-3.5 text-[13px] text-slate-600">{{ formatDate(r.start_date) }}</td>
          <td class="px-4 py-3.5 text-[13px] text-slate-600">{{ formatDate(r.end_date) }}</td>
          <td class="px-4 py-3.5 text-center">
            <span class="inline-flex min-w-[34px] items-center justify-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {{ r.total_days }}d
            </span>
          </td>
          <td class="whitespace-nowrap px-4 py-3.5 text-[13px] text-slate-500">{{ r.submission_date }}</td>
          <td class="px-4 py-3.5">
            <LeaveStatusBadge :status="r.status" />
          </td>
          <td class="px-4 py-3.5 pr-5 text-right">
            <div class="inline-flex gap-1" @click.stop>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                title="View details"
                @click="viewRequest(r.id)"
              >
                <Eye :size="15" />
              </button>

              <template v-if="auth.isStudent">
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:enabled:bg-amber-50 hover:enabled:text-amber-600 disabled:opacity-20"
                  title="Edit request"
                  :disabled="r.status !== 'pending'"
                  @click="editRequest(r.id)"
                >
                  <Edit :size="15" />
                </button>

                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:enabled:bg-red-50 hover:enabled:text-red-600 disabled:opacity-20"
                  title="Cancel request"
                  :disabled="r.status !== 'pending'"
                  @click="confirmCancel(r)"
                >
                  <XCircle :size="15" />
                </button>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import LeaveStatusBadge from '@/components/leave/LeaveStatusBadge.vue'
import type { LeaveRequestListItem } from '@/types/leave'
import { Eye, Edit, XCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

defineProps<{
  items: LeaveRequestListItem[]
  formatDate: (s: string) => string
  viewRequest: (id: number) => void
  editRequest: (id: number) => void
  confirmCancel: (r: LeaveRequestListItem) => void
}>()
</script>
