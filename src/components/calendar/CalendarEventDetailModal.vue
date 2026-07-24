<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 p-4"
        @click.self="handleClose"
      >
        <div
          class="flex max-h-[90vh] w-full max-w-[620px] flex-col rounded-xl bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          :aria-label="'Leave Request Details'"
        >
          <div
            class="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6"
          >
            <h2 class="m-0 text-base font-semibold text-gray-900">Leave Request Details</h2>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close"
              @click="handleClose"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div
              v-if="loadError"
              class="mb-4 rounded-md bg-red-100 px-3.5 py-2.5 text-xs text-red-700"
              role="alert"
            >
              {{ loadError }}
            </div>

            <div
              v-else-if="loadingDetail"
              class="flex flex-col items-center justify-center gap-2.5 px-5 py-8 text-center text-gray-500"
            >
              Loading details…
            </div>

            <div
            v-else-if="accessDenied"
            class="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle :size="24" class="text-red-500" />
            </div>
            <p class="text-sm font-medium text-gray-900">You do not have permission to view this request.</p>
            <p class="text-xs text-gray-500">Please contact an administrator if you believe this is an error.</p>
          </div>

          <div
            v-else-if="detail" class="space-y-5">
              <div class="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3">
                  <div
                    v-if="detail.user?.avatar?.url"
                    class="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                    :style="{ backgroundImage: `url(${detail.user.avatar.url})` }"
                    :aria-label="`${detail.user?.name}'s avatar`"
                  />
                  <div
                    v-else
                    :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white', getAvatarColor(detail.user?.name || '?')]"
                  >
                    {{ getInitials(detail.user?.name || '?') }}
                  </div>
                  <div>
                    <p class="m-0 text-sm font-semibold text-gray-900">
                      {{ detail.user?.name || 'Unknown Student' }}
                    </p>
                    <p class="m-0 text-xs text-gray-500">{{ detail.leave_type_name }}</p>
                  </div>
                </div>
                <LeaveStatusBadge :status="detail.status" />
              </div>

              <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Leave Information
                  </h3>
                  <dl class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Leave Type</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ detail.leave_type_name }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Status</dt>
                      <dd class="mt-0.5">
                        <LeaveStatusBadge :status="detail.status" />
                      </dd>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Start Date</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ formatDate(detail.start_date) }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500">End Date</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ formatDate(detail.end_date) }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Start Time</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ detail.start_time ? formatTime(detail.start_time) : '—' }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500">End Time</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ detail.end_time ? formatTime(detail.end_time) : '—' }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Duration</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ durationText }}</dd>
                    </div>
                  </dl>
                </div>

                <div
                  v-if="detail.reviewer?.name"
                  class="flex items-start gap-3 rounded-lg border px-4 py-3.5 sm:col-span-2"
                  :class="reviewTheme.box"
                >
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" :class="reviewTheme.icon">
                    <CheckCircle2 v-if="detail.status?.toLowerCase() === 'approved'" :size="18" />
                    <XCircle v-else-if="detail.status?.toLowerCase() === 'rejected'" :size="18" />
                    <UserCheck v-else :size="18" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="m-0 text-xs font-medium uppercase tracking-wide" :class="reviewTheme.text">
                      {{ reviewLabel }}
                    </p>
                    <p class="m-0 mt-0.5 text-sm font-semibold text-gray-900">{{ detail.reviewer?.name }}</p>
                    <p v-if="detail.reviewed_at" class="m-0 mt-0.5 text-xs text-gray-500">
                      {{ formatDateTime(detail.reviewed_at) }}
                    </p>
                    <p v-if="detail.review_note" class="m-0 mt-1.5 text-xs text-gray-600">
                      "{{ detail.review_note }}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="flex flex-col items-center justify-center gap-2.5 px-5 py-8 text-center text-gray-500"
            >
              No details available.
            </div>
          </div>

          <div
            class="shrink-0 flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6"
          >
            <button
              type="button"
              class="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              @click="handleClose"
            >
              Close
            </button>
            <button
              type="button"
              class="rounded-md border border-transparent bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
              @click="handleViewFullDetails"
            >
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, AlertCircle, CheckCircle2, XCircle, UserCheck } from 'lucide-vue-next'
import { leaveService } from '@/services/leaveService'
import { useLeaveFormModalStore } from '@/stores/leaveFormModal'
import { useAuthStore } from '@/stores/auth'
import LeaveStatusBadge from '@/components/leave-common/LeaveStatusBadge.vue'
import { formatDate } from '@/utils/date'
import { getInitials, getAvatarColor } from '@/utils/initials'
import type { LeaveRequestResponse, CalendarEvent } from '@/types/leave'

const auth = useAuthStore()
const leaveModal = useLeaveFormModalStore()

const props = defineProps<{
  isOpen: boolean
  eventId?: number
  event?: CalendarEvent
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const detail = ref<LeaveRequestResponse | null>(null)
const loadingDetail = ref(false)
const loadError = ref<string | null>(null)
const accessDenied = ref(false)

function canAccessEvent(event: CalendarEvent | undefined): boolean {
  if (!event) return false
  if (auth.isAdmin || auth.isEducator) return true
  if (auth.isStudent) return event.studentId === auth.user?.id
  return false
}

const durationText = computed(() => {
  const d = detail.value
  if (!d) return '—'
  if (d.start_date && d.end_date && d.start_date !== d.end_date) {
    return `${d.total_days} day${d.total_days === 1 ? '' : 's'}`
  }
  if (d.start_time && d.end_time) {
    const [sh, sm] = d.start_time.split(':').map(Number)
    const [eh, em] = d.end_time.split(':').map(Number)
    const startMins = sh * 60 + sm
    const endMins = eh * 60 + em
    const diff = endMins - startMins
    if (diff <= 0) return '0 minutes'
    const hrs = Math.floor(diff / 60)
    const mins = diff % 60
    if (hrs === 0) return `${mins} minute${mins === 1 ? '' : 's'}`
    if (mins === 0) return `${hrs} hour${hrs === 1 ? '' : 's'}`
    return `${hrs}h ${mins}m`
  }
  return `${d.total_days} day${d.total_days === 1 ? '' : 's'}`
})

const reviewLabel = computed(() => {
  const status = (detail.value?.status ?? '').toLowerCase()
  if (status === 'approved') return 'Approved by'
  if (status === 'rejected') return 'Rejected by'
  return 'Reviewed by'
})

const reviewTheme = computed(() => {
  const status = (detail.value?.status ?? '').toLowerCase()
  if (status === 'approved') {
    return { box: 'bg-green-50 border-green-100', icon: 'bg-green-100 text-green-600', text: 'text-green-800' }
  }
  if (status === 'rejected') {
    return { box: 'bg-red-50 border-red-100', icon: 'bg-red-100 text-red-600', text: 'text-red-800' }
  }
  return { box: 'bg-gray-50 border-gray-100', icon: 'bg-gray-100 text-gray-600', text: 'text-gray-800' }
})

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.eventId) {
      if (!canAccessEvent(props.event)) {
        accessDenied.value = true
        detail.value = null
        loadError.value = null
      } else {
        accessDenied.value = false
        loadDetail(props.eventId)
      }
    } else {
      detail.value = null
      loadError.value = null
      accessDenied.value = false
    }
  },
)

async function loadDetail(id: number) {
  loadingDetail.value = true
  loadError.value = null
  detail.value = null
  accessDenied.value = false
  try {
    detail.value = await leaveService.getLeaveRequest(id)
  } catch {
    loadError.value = 'Failed to load details.'
  } finally {
    loadingDetail.value = false
  }
}

function handleClose() {
  emit('close')
}

function handleViewFullDetails() {
  emit('close')
  if (props.eventId) {
    leaveModal.openView(props.eventId)
  }
}

function formatTime(value: string) {
  if (!value) return '—'
  const [hours, minutes] = value.split(':')
  const h = Number(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 || 12
  return `${displayHour}:${minutes ?? '00'} ${ampm}`
}

function formatDateTime(value: string) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
</script>
