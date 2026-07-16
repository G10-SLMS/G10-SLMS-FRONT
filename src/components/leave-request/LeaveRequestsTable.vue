<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[720px] border-collapse text-sm">
      <thead>
        <tr class="sticky top-0 z-10 bg-slate-50">
          <th class="border-b border-slate-200 px-4 py-3.5 pl-5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">ID</th>
          <th v-if="!auth.isStudent" class="border-b border-slate-200 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Student</th>
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
          v-for="(r, index) in items"
          :key="r.id"
          class="cursor-pointer border-b border-slate-100 transition last:border-none hover:bg-slate-50 active:bg-slate-100"
          @click="viewRequest(r.id)"
        >
          <td class="px-4 py-3.5 pl-5 text-[13px] font-bold text-blue-600">{{ props.startIndex + index }}</td>
          <td v-if="!auth.isStudent" class="px-4 py-3.5">
            <div class="flex items-center gap-2">
              <img
                v-if="r.user?.avatar?.url"
                :src="r.user.avatar.url"
                :alt="r.user.name"
                class="h-8 w-8 shrink-0 rounded-full object-cover"
              />
              <span
                v-else
                :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white', getAvatarColor(r.user?.name ?? 'User')]"
              >
                {{ getInitials(r.user?.name ?? 'User') }}
              </span>
              <p class="m-0 font-semibold text-slate-900">{{ r.user?.name ?? `User #${r.user_id}` }}</p>
            </div>
          </td>
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

              <button
                v-if="!auth.isStudent"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-600"
                title="View profile"
                @click="profileStudent = r.user"
              >
                <UserRound :size="15" />
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

  <StudentProfileModal :student="profileStudent" @close="profileStudent = null" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LeaveStatusBadge from '@/components/leave-common/LeaveStatusBadge.vue'
import StudentProfileModal from '@/components/leave-request/StudentProfileModal.vue'
import type { LeaveRequestListItem, LeaveRequestUser } from '@/types/leave'
import { Eye, Edit, XCircle, UserRound } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { getInitials, getAvatarColor } from '@/utils/initials'

const auth = useAuthStore()

const props = withDefaults(
  defineProps<{
    items: LeaveRequestListItem[]
    formatDate: (s: string) => string
    viewRequest: (id: number) => void
    editRequest: (id: number) => void
    confirmCancel: (r: LeaveRequestListItem) => void
    startIndex?: number
  }>(),
  { startIndex: 1 },
)

const profileStudent = ref<LeaveRequestUser | null>(null)
</script>
