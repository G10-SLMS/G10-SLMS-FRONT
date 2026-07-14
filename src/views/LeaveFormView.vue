<template>
  <div class="max-w-[640px]">
    <div class="mb-5 flex items-center gap-3.5">
      <button
        class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
        @click="goBack"
      >
        <ArrowLeft :size="18" />
        Back
      </button>
      <h1 class="m-0 text-xl">{{ isEditMode ? 'Edit Leave Request' : 'New Leave Request' }}</h1>
    </div>

    <div class="rounded-[10px] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div v-if="loadError" class="mb-4 rounded-md bg-red-100 px-3.5 py-2.5 text-[13px] text-red-700" role="alert">{{ loadError }}</div>

      <div v-else-if="isEditMode && !editableLoaded" class="flex flex-col items-center justify-center gap-2.5 px-5 py-10 text-center text-gray-500">
        Loading request…
      </div>

      <div v-else-if="isEditMode && !canEdit" class="flex flex-col items-center justify-center gap-2.5 px-5 py-10 text-center text-gray-500 [&_svg]:text-amber-500">
        <Lock :size="32" :stroke-width="1.5" />
        <p>This request can no longer be edited because its status is <strong>{{ originalStatus }}</strong>.</p>
        <button
          class="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
          @click="goBack"
        >Back to Leave Requests</button>
      </div>

      <form v-else @submit.prevent="handleSubmit" novalidate>
        <div v-if="submitError" class="mb-4 rounded-md bg-red-100 px-3.5 py-2.5 text-[13px] text-red-700" role="alert">{{ submitError }}</div>

        <div class="mb-[18px]">
          <label class="mb-1.5 block text-[13px] font-medium text-gray-700" for="type">Leave Type</label>
          <div class="relative flex items-center">
            <span class="absolute left-3 flex text-gray-400"><FileText :size="18" /></span>
            <select
              id="type"
              v-model="form.type"
              required
              :disabled="submitting"
              class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-[38px] pr-3 text-sm text-gray-800 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus:outline-none"
            >
              <option value="" disabled>Select leave type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Academic Leave">Academic Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="mb-[18px]">
            <label class="mb-1.5 block text-[13px] font-medium text-gray-700" for="startDate">Start Date</label>
            <div class="relative flex items-center">
              <span class="absolute left-3 flex text-gray-400"><Calendar :size="18" /></span>
              <input
                id="startDate"
                v-model="form.startDate"
                type="date"
                :min="todayStr"
                required
                :disabled="submitting"
                class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-[38px] pr-3 text-sm text-gray-800 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus:outline-none"
                @change="onStartDateChange"
              />
            </div>
          </div>

          <div class="mb-[18px]">
            <label class="mb-1.5 block text-[13px] font-medium text-gray-700" for="endDate">End Date</label>
            <div class="relative flex items-center">
              <span class="absolute left-3 flex text-gray-400"><Calendar :size="18" /></span>
              <input
                id="endDate"
                v-model="form.endDate"
                type="date"
                :min="form.startDate || todayStr"
                required
                :disabled="submitting"
                class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-[38px] pr-3 text-sm text-gray-800 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus:outline-none"
              />
            </div>
          </div>
        </div>
        <p v-if="dateRangeError" class="-mt-3 mb-4 text-xs text-red-700">{{ dateRangeError }}</p>

        <div class="mb-[18px]">
          <label class="mb-1.5 block text-[13px] font-medium text-gray-700" for="reason">Reason</label>
          <textarea
            id="reason"
            v-model.trim="form.reason"
            rows="4"
            placeholder="Briefly explain the reason for your leave"
            required
            :disabled="submitting"
            maxlength="500"
            class="w-full resize-y rounded-md border border-gray-300 px-3 py-2.5 font-sans text-sm text-gray-800 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus:outline-none"
          ></textarea>
          <span class="mt-1 block text-right text-[11px] text-gray-400">{{ form.reason.length }}/500</span>
        </div>

        <div class="mb-[18px]">
          <label class="mb-1.5 block text-[13px] font-medium text-gray-700" for="attachment">Supporting Document (optional)</label>
          <div class="flex items-center gap-2">
            <label
              for="attachment"
              class="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-3.5 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
            >
              <Paperclip :size="16" />
              {{ form.attachment ? form.attachment.name : 'Choose file' }}
            </label>
            <input
              id="attachment"
              type="file"
              class="absolute h-px w-px overflow-hidden opacity-0"
              accept=".pdf,.jpg,.jpeg,.png"
              :disabled="submitting"
              @change="onFileChange"
            />
            <button
              v-if="form.attachment"
              type="button"
              class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md border-none bg-red-100 text-red-700 cursor-pointer hover:bg-red-200"
              :disabled="submitting"
              @click="removeFile"
            >
              <X :size="14" />
            </button>
          </div>
          <span class="mt-1.5 block text-xs text-gray-400">PDF, JPG, or PNG — max 5MB</span>
        </div>

        <div class="mt-6 flex justify-end gap-2.5 border-t border-gray-100 pt-5">
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 cursor-pointer enabled:hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="submitting"
            @click="goBack"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-md border-none bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!canSubmit"
          >
            {{ submitting ? (isEditMode ? 'Saving…' : 'Submitting…') : (isEditMode ? 'Save Changes' : 'Submit Request') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ArrowLeft, FileText, Calendar, Paperclip, X, Lock } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isEditMode = computed(() => !!route.params.id)
const requestId = computed(() => route.params.id as string | undefined)

const submitting = ref(false)
const submitError = ref('')
const loadError = ref('')
const editableLoaded = ref(false)
const canEdit = ref(true)
const originalStatus = ref('')

const todayStr = new Date().toISOString().slice(0, 10)

const form = reactive({
  type: '',
  startDate: '',
  endDate: '',
  reason: '',
  attachment: null as File | null,
})

const dateRangeError = computed(() => {
  if (!form.startDate || !form.endDate) return ''
  return form.endDate < form.startDate ? 'End date cannot be before start date.' : ''
})

const canSubmit = computed(() =>
  !submitting.value &&
  form.type.length > 0 &&
  form.startDate.length > 0 &&
  form.endDate.length > 0 &&
  form.reason.trim().length > 0 &&
  !dateRangeError.value
)

function onStartDateChange() {
  // If end date is now before the new start date, clear it so the user re-picks.
  if (form.endDate && form.endDate < form.startDate) {
    form.endDate = ''
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    submitError.value = 'File is too large. Maximum size is 5MB.'
    target.value = ''
    return
  }

  submitError.value = ''
  form.attachment = file
}

function removeFile() {
  form.attachment = null
}

function goBack() {
  router.push('/leave-requests')
}

onMounted(async () => {
  if (!isEditMode.value) return

  try {
    // TODO: replace with real fetch, e.g. GET /api/leave-requests/:id
    // const { data } = await api.get(`/leave-requests/${requestId.value}`)
    const data = await fakeFetchRequest(requestId.value!)

    // Ownership + status guard — mirrors the server-side check that
    // must also exist on the actual PATCH endpoint. This is a UX
    // guard only; the API must independently reject edits from
    // non-owners or non-pending requests regardless of what the
    // client sends.
    if (data.studentId !== auth.user?.id) {
      loadError.value = 'You do not have permission to edit this request.'
      return
    }

    originalStatus.value = data.status
    canEdit.value = data.status === 'Pending'

    form.type = data.type
    form.startDate = data.startDate
    form.endDate = data.endDate
    form.reason = data.reason
  } catch (err) {
    loadError.value = 'Failed to load this leave request.'
  } finally {
    editableLoaded.value = true
  }
})

// Placeholder loader — remove once wired to the real API
async function fakeFetchRequest(id: string) {
  await new Promise((r) => setTimeout(r, 300))
  return {
    id,
    studentId: auth.user?.id,
    type: 'Sick Leave',
    startDate: '2026-07-08',
    endDate: '2026-07-09',
    reason: 'Fever and flu symptoms.',
    status: 'Pending',
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return

  submitting.value = true
  submitError.value = ''

  try {
    const payload = new FormData()
    payload.append('type', form.type)
    payload.append('startDate', form.startDate)
    payload.append('endDate', form.endDate)
    payload.append('reason', form.reason)
    if (form.attachment) payload.append('attachment', form.attachment)

    if (isEditMode.value) {
      // TODO: await api.patch(`/leave-requests/${requestId.value}`, payload)
      await new Promise((r) => setTimeout(r, 500))
    } else {
      // TODO: await api.post('/leave-requests', payload)
      await new Promise((r) => setTimeout(r, 500))
    }

    router.push('/leave-requests')
  } catch (err) {
    submitError.value = 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
