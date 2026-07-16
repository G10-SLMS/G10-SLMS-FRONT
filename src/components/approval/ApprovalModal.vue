<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click.self="close">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <CheckSquare :size="20" />
            <div>
              <h3>Approvals</h3>
              <span class="sub" v-if="items.length">{{ items.length }} pending</span>
            </div>
          </div>
          <button class="btn-close" @click="close"><X :size="18" /></button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading">
          <div class="sk" v-for="n in 3" :key="n">
            <div class="sk-line w-40"></div>
            <div class="sk-line w-60"></div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="errMsg" class="err-banner">
          <AlertCircle :size="14" />
          <span>{{ errMsg }}</span>
          <button @click="errMsg = ''"><X :size="14" /></button>
        </div>

        <!-- Empty -->
        <div v-else-if="items.length === 0" class="empty">
          <CheckCircle :size="36" />
          <h4>All caught up!</h4>
          <p>No pending requests to review.</p>
        </div>

        <!-- List -->
        <div v-else class="list">
          <div v-for="r in items" :key="r.id" class="item">
            <div class="item-row">
              <div class="item-user">
                <span class="avatar">{{ r.user_name?.charAt(0)?.toUpperCase() || '?' }}</span>
                <div class="item-info">
                  <strong>{{ r.user_name || 'Unknown' }}</strong>
                  <span>{{ r.leave_type_name }}</span>
                </div>
              </div>
              <div class="item-dates">
                <span>{{ formatDate(r.start_date) }}</span>
                <ArrowRight :size="10" />
                <span>{{ formatDate(r.end_date) }}</span>
                <span class="days">{{ r.total_days }}d</span>
              </div>
            </div>
            <div class="item-actions">
              <button class="act act-approve" :disabled="processingId === r.id" @click="approve(r.id)">
                <Check :size="14" /> Approve
              </button>
              <button class="act act-reject" :disabled="processingId === r.id" @click="openReject(r)">
                <X :size="14" /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reject dialog -->
      <div v-if="rejectTarget" class="reject-backdrop" @click.self="rejectTarget = null">
        <div class="reject-dialog">
          <h4>Reject Request</h4>
          <p>Reason for rejection:</p>
          <textarea v-model="rejectReason" rows="2" placeholder="Enter reason..." />
          <div class="reject-actions">
            <button class="act act-ghost" @click="rejectTarget = null">Cancel</button>
            <button class="act act-danger" :disabled="!rejectReason.trim() || processingId === rejectTarget?.id" @click="doReject">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { leaveService } from '@/services/leaveService'
import { useNotificationStore } from '@/stores/notification'
import { CheckSquare, Check, X, ArrowRight, AlertCircle, CheckCircle } from 'lucide-vue-next'
import type { LeaveRequestListItem } from '@/types/leave'
import type { AxiosError } from 'axios'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const notificationStore = useNotificationStore()

const items = ref<(LeaveRequestListItem & { user_name?: string })[]>([])
const loading = ref(false)
const errMsg = ref('')
const processingId = ref<number | null>(null)
const rejectTarget = ref<LeaveRequestListItem | null>(null)
const rejectReason = ref('')

function formatDate(s: string) {
  if (!s) return '—'
  return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function fetchPending() {
  loading.value = true
  errMsg.value = ''
  try {
    const result = await leaveService.getLeaveRequests({ status: 'pending', per_page: 50 })
    items.value = result.data.map((r) => ({ ...r, user_name: '' })) as any
  } catch (err) {
    errMsg.value = (err as AxiosError<{ message?: string }>).response?.data?.message || 'Failed to load.'
  } finally {
    loading.value = false
  }
}

async function approve(id: number) {
  processingId.value = id
  try {
    await leaveService.cancelLeaveRequest(id)
    notificationStore.addNotification({ message: 'Approved!', type: 'success', read: false })
    items.value = items.value.filter((i) => i.id !== id)
  } catch {
    errMsg.value = 'Failed to approve.'
  } finally {
    processingId.value = null
  }
}

function openReject(r: LeaveRequestListItem) {
  rejectTarget.value = r
  rejectReason.value = ''
}

async function doReject() {
  if (!rejectTarget.value || !rejectReason.value.trim()) return
  const id = rejectTarget.value.id
  processingId.value = id
  try {
    notificationStore.addNotification({ message: 'Rejected.', type: 'info', read: false })
    items.value = items.value.filter((i) => i.id !== id)
    rejectTarget.value = null
    rejectReason.value = ''
  } catch {
    errMsg.value = 'Failed to reject.'
  } finally {
    processingId.value = null
  }
}

function close() {
  emit('close')
}

watch(
  () => props.isOpen,
  (v) => {
    if (v) fetchPending()
    document.body.style.overflow = v ? 'hidden' : ''
  },
)
</script>

<style scoped>
/* Backdrop */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}

/* Content */
.modal-content {
  width: 100%; max-width: 520px; max-height: 85vh;
  background: #fff; border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  display: flex; flex-direction: column; overflow: hidden;
}

/* Header */
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 10px; color: #2563eb; }
.header-left h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
.header-left .sub { font-size: 12px; color: #64748b; }

.btn-close {
  width: 30px; height: 30px; border: none; border-radius: 6px;
  background: transparent; color: #94a3b8; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.btn-close:hover { background: #f1f5f9; color: #0f172a; }

/* Loading */
.loading { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.sk { display: flex; flex-direction: column; gap: 6px; padding: 12px; background: #f8fafc; border-radius: 8px; }
.sk-line { height: 12px; background: #e2e8f0; border-radius: 4px; }
.w-40 { width: 40%; } .w-60 { width: 60%; }

/* Error */
.err-banner {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  background: #fef2f2; color: #b91c1c; font-size: 13px; margin: 12px 16px; border-radius: 8px;
}
.err-banner button { margin-left: auto; background: none; border: none; color: #b91c1c; cursor: pointer; }

/* Empty */
.empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 36px 20px; text-align: center; color: #94a3b8;
}
.empty svg { color: #16a34a; margin-bottom: 12px; }
.empty h4 { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0 0 4px; }
.empty p { font-size: 13px; margin: 0; }

/* List */
.list { overflow-y: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
.item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
.item-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.item-user { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.item-info { display: flex; flex-direction: column; min-width: 0; }
.item-info strong { font-size: 13px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-info span { font-size: 11px; color: #64748b; }
.item-dates { display: flex; align-items: center; gap: 4px; flex-shrink: 0; font-size: 11px; color: #475569; }
.item-dates svg { color: #94a3b8; flex-shrink: 0; }
.days { font-size: 10px; font-weight: 600; background: #e2e8f0; padding: 1px 6px; border-radius: 999px; margin-left: 4px; }

/* Actions */
.item-actions { display: flex; gap: 6px; margin-top: 8px; }
.act {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  cursor: pointer; border: none; transition: all .15s;
}
.act:disabled { opacity: .5; cursor: not-allowed; }
.act-approve { background: #dcfce7; color: #15803d; }
.act-approve:hover:not(:disabled) { background: #bbf7d0; }
.act-reject { background: #fee2e2; color: #b91c1c; }
.act-reject:hover:not(:disabled) { background: #fecaca; }
.act-ghost { background: transparent; color: #64748b; }
.act-ghost:hover { background: #f1f5f9; }
.act-danger { background: #dc2626; color: #fff; }

/* Reject dialog */
.reject-backdrop {
  position: absolute; inset: 0;
  background: rgba(15,23,42,0.3);
  display: flex; align-items: center; justify-content: center; z-index: 10; padding: 16px;
}
.reject-dialog {
  background: #fff; border-radius: 12px; padding: 20px;
  width: 100%; max-width: 360px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.reject-dialog h4 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
.reject-dialog p { font-size: 13px; color: #64748b; margin: 0 0 10px; }
.reject-dialog textarea {
  width: 100%; padding: 8px 10px; border: 1.5px solid #e2e8f0; border-radius: 6px;
  font-size: 13px; font-family: inherit; outline: none; resize: vertical;
  min-height: 50px; line-height: 1.4; box-sizing: border-box;
}
.reject-dialog textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.reject-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; }

/* Responsive */
@media (max-width: 480px) {
  .modal-content { max-height: 90vh; border-radius: 12px; }
  .modal-header { padding: 12px 14px; }
  .list { padding: 8px 10px; }
  .item { padding: 10px; }
  .item-row { flex-direction: column; align-items: flex-start; }
  .item-dates { margin-top: 4px; }
}
</style>