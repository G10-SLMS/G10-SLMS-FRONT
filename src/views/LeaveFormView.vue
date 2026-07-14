<template>
  <div class="leave-form">
    <!-- Header with back -->
    <div class="header">
      <button class="back" @click="$router.push('/leave-requests')">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <h1>New Leave Request</h1>
        <p>Fill in the form to submit a leave request</p>
      </div>
    </div>

    <!-- Card -->
    <div class="card">
      <!-- Student info (read-only) -->
      <section class="section">
        <h3>Student Information</h3>
        <div class="student">
          <div class="s-item"><label>Name</label><span>{{ authStore.user?.name || '—' }}</span></div>
          <div class="s-item"><label>Email</label><span>{{ authStore.user?.email || '—' }}</span></div>
          <div class="s-item"><label>Role</label><span class="pill">{{ authStore.user?.role }}</span></div>
        </div>
      </section>

      <!-- Leave Details -->
      <section class="section">
        <h3>Leave Details</h3>

        <div class="field" :class="{ err: errors.leave_type_id }">
          <label>Leave Type <span class="req">*</span></label>
          <Combobox
            v-model="form.leave_type_id"
            :options="leaveOptions"
            placeholder="Search or type..."
            :icon="true"
            @select="onSelect"
            @custom-text="onCustom"
          />
          <p v-if="errors.leave_type_id" class="e">{{ errors.leave_type_id }}</p>
          <p v-if="isCustom" class="custom-badge">Custom: <strong>{{ customLabel }}</strong></p>
        </div>

        <div class="row">
          <div class="field" :class="{ err: errors.start_date }">
            <label>Start Date <span class="req">*</span></label>
            <div class="inp"><Calendar :size="16" class="inp-icon" /><input v-model="form.start_date" type="date" @change="onDateChange" /></div>
            <p v-if="errors.start_date" class="e">{{ errors.start_date }}</p>
          </div>
          <div class="field" :class="{ err: errors.end_date }">
            <label>End Date <span class="req">*</span></label>
            <div class="inp"><Calendar :size="16" class="inp-icon" /><input v-model="form.end_date" type="date" :min="form.start_date || ''" @change="onDateChange" /></div>
            <p v-if="errors.end_date" class="e">{{ errors.end_date }}</p>
          </div>
        </div>

        <div class="field">
          <label>Total Days</label>
          <div class="days" :class="{ active: totalDays > 0 }">
            <span class="days-num">{{ totalDays }}</span>
            <span>{{ totalDays === 1 ? 'day' : 'days' }}</span>
            <span v-if="totalDays > 0" class="days-tag">{{ totalDays === 1 ? 'Single' : 'Multiple' }}</span>
          </div>
        </div>

        <div class="field" :class="{ err: errors.reason }">
          <label>Reason for Leave <span class="req">*</span></label>
          <textarea v-model="form.reason" rows="4" placeholder="Describe your reason..." @input="clearErr('reason')" />
          <div class="ta-foot">
            <p v-if="errors.reason" class="e">{{ errors.reason }}</p>
            <span class="count">{{ form.reason.length }} / 500</span>
          </div>
        </div>

        <div class="field">
          <label>Supporting Document</label>
          <div class="drop" :class="{ has: form.file }">
            <input ref="fileRef" type="file" class="drop-inp" @change="onFile" />
            <div v-if="!form.file" class="drop-txt">
              <Upload :size="24" />
              <span>Drop file or <span class="link">browse</span></span>
              <span class="hint">PDF, DOC, JPG, PNG (max 10MB)</span>
            </div>
            <div v-else class="drop-file">
              <FileText :size="18" />
              <div class="drop-info">
                <span class="drop-name">{{ form.file.name }}</span>
                <span class="drop-size">{{ size(form.file.size) }}</span>
              </div>
              <button class="drop-x" @click="removeFile"><X :size="16" /></button>
            </div>
          </div>
        </div>
      </section>

      <!-- Error banner -->
      <div v-if="errMsg" class="banner">
        <AlertCircle :size="16" /> <span>{{ errMsg }}</span>
        <button class="bx" @click="errMsg = ''"><X :size="14" /></button>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="btn sec" @click="$router.push('/leave-requests')">Cancel</button>
        <button class="btn pri" :disabled="busy || !valid" @click="submit">
          <span v-if="busy" class="spin" /><template v-else><Send :size="16" /> Submit</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { leaveService } from '@/services/leaveService'
import type { LeaveType } from '@/types/leave'
import type { AxiosError } from 'axios'
import {
  ArrowLeft, Calendar, FileText, AlertCircle, Upload, Send, X
} from 'lucide-vue-next'
import Combobox from '@/components/Combobox.vue'
import type { ComboboxOption } from '@/components/Combobox.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const types = ref<LeaveType[]>([])
const busy = ref(false)
const errMsg = ref('')
const customLabel = ref('')
const fileRef = ref<HTMLInputElement | null>(null)

const form = reactive({
  leave_type_id: null as number | null,
  start_date: '',
  end_date: '',
  reason: '',
  file: null as File | null,
  custom: null as string | null,
})

const errors = reactive({ leave_type_id: '', start_date: '', end_date: '', reason: '' })

const leaveOptions = computed(() => types.value.map(t => ({ id: t.id, name: t.name })))
const isCustom = computed(() => form.leave_type_id === null && form.custom !== null)

const totalDays = computed(() => {
  if (!form.start_date || !form.end_date) return 0
  const s = new Date(form.start_date), e = new Date(form.end_date)
  return e < s ? 0 : Math.floor((e.getTime() - s.getTime()) / 86400000) + 1
})

const valid = computed(() => {
  const hasType = form.leave_type_id !== null || isCustom.value
  return hasType && form.start_date && form.end_date && form.reason.trim() && !errors.leave_type_id && !errors.start_date && !errors.end_date && !errors.reason
})

function clearErr(f: keyof typeof errors) { errors[f] = '' }

function onSelect(o: ComboboxOption | null) {
  if (o) { form.leave_type_id = o.id; form.custom = null; customLabel.value = '' }
  else form.leave_type_id = null
  validate()
}

function onCustom(t: string) {
  form.custom = t.trim() || null
  customLabel.value = t.trim()
}

function onDateChange() {
  if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date))
    form.end_date = form.start_date
  validate()
}

function onFile(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) form.file = f }
function removeFile() { form.file = null; if (fileRef.value) fileRef.value.value = '' }
function size(b: number) { return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB' }

function validate() {
  errors.leave_type_id = form.leave_type_id === null && !isCustom.value ? 'Select or type a leave type.' : ''
  errors.start_date = !form.start_date ? 'Select a start date.' : ''
  errors.end_date = !form.end_date ? 'Select an end date.' : form.start_date && new Date(form.end_date) < new Date(form.start_date) ? 'End date cannot be before start date.' : ''
  errors.reason = !form.reason.trim() ? 'Provide a reason.' : ''
}

async function submit() {
  validate()
  if (!valid.value) return
  busy.value = true; errMsg.value = ''
  try {
    await leaveService.createLeaveRequest({
      leave_type_id: form.leave_type_id,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason.trim(),
      supporting_document: form.file,
      custom_leave_type: form.custom,
    })
    notificationStore.addNotification({ message: 'Leave request submitted!', type: 'success', read: false })
    router.push('/leave-requests')
  } catch (err) {
    errMsg.value = (err as AxiosError<{ message?: string }>).response?.data?.message || 'Failed to submit.'
  } finally { busy.value = false }
}

onMounted(async () => {
  try { types.value = await leaveService.getLeaveTypes() }
  catch (err) { errMsg.value = 'Failed to load leave types.' }
})
</script>

<style scoped>
.leave-form { max-width: 700px; margin: 0 auto; }
.header { display: flex; gap: 14px; margin-bottom: 24px; }
.back { width: 38px; height: 38px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; flex-shrink: 0; }
.back:hover { background: #f8fafc; }
.header h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
.header p { font-size: 13px; color: #64748b; margin: 2px 0 0; }
.card { background: #fff; border-radius: 14px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.section { margin-bottom: 28px; }
.section h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 14px; }
.student { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; display: flex; gap: 16px; }
.s-item { flex: 1; }
.s-item label { display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }
.s-item span { font-size: 14px; font-weight: 600; color: #0f172a; }
.pill { display: inline-block; padding: 1px 10px; border-radius: 999px; font-size: 11px; background: #dbeafe; color: #1d4ed8; }
.field { margin-bottom: 20px; }
.field label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
.req { color: #ef4444; }
.e { font-size: 12px; color: #dc2626; margin: 4px 0 0; display: flex; align-items: center; gap: 4px; }
.row { display: flex; gap: 16px; }
.row .field { flex: 1; }
.inp { position: relative; display: flex; align-items: center; }
.inp-icon { position: absolute; left: 12px; color: #94a3b8; pointer-events: none; }
.inp input { width: 100%; padding: 10px 14px 10px 40px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; transition: border-color .15s; }
.inp input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
.err .inp input { border-color: #ef4444; }
textarea { width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; resize: vertical; min-height: 100px; line-height: 1.6; transition: border-color .15s; }
textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
.err textarea { border-color: #ef4444; }
.ta-foot { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px; }
.count { font-size: 11px; color: #94a3b8; }
.days { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #94a3b8; transition: all .2s; }
.days.active { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.days-num { font-size: 22px; font-weight: 800; }
.days-tag { font-size: 11px; font-weight: 600; background: #dcfce7; padding: 2px 10px; border-radius: 999px; margin-left: auto; }
.custom-badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; padding: 4px 12px; background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 13px; color: #1e40af; }
.drop { position: relative; border: 1.5px dashed #d1d5db; border-radius: 10px; padding: 20px; cursor: pointer; background: #fafafa; text-align: center; transition: border-color .15s; }
.drop:hover { border-color: #2563eb; }
.drop.has { border-style: solid; border-color: #93c5fd; background: #f0f7ff; padding: 12px 16px; }
.drop-inp { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.drop-txt { display: flex; flex-direction: column; align-items: center; gap: 4px; color: #94a3b8; font-size: 14px; }
.link { color: #2563eb; font-weight: 600; text-decoration: underline; }
.hint { font-size: 12px; color: #94a3b8; }
.drop-file { display: flex; align-items: center; gap: 10px; text-align: left; }
.drop-file svg { color: #2563eb; flex-shrink: 0; }
.drop-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.drop-name { font-size: 14px; font-weight: 600; color: #1e3a5f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.drop-size { font-size: 12px; color: #64748b; }
.drop-x { margin-left: auto; width: 28px; height: 28px; border: none; border-radius: 6px; background: #fee2e2; color: #dc2626; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.banner { display: flex; align-items: center; gap: 8px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 13px; padding: 10px 14px; border-radius: 10px; margin-bottom: 16px; }
.bx { margin-left: auto; background: none; border: none; color: #b91c1c; cursor: pointer; padding: 2px; border-radius: 4px; }
.actions { display: flex; justify-content: flex-end; gap: 12px; }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all .15s; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.pri { background: #2563eb; color: #fff; }
.pri:hover:not(:disabled) { background: #1d4ed8; box-shadow: 0 4px 12px rgba(37,99,235,.25); }
.sec { background: transparent; color: #64748b; }
.sec:hover { background: #f1f5f9; }
.spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) {
  .card { padding: 20px 16px; }
  .row { flex-direction: column; gap: 0; }
  .student { flex-direction: column; gap: 8px; }
}
</style>