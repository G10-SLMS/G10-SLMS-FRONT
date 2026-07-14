<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="cancelTarget" class="lr-modal-overlay" @click.self="emitClose">
        <div class="lr-modal">
          <div class="lr-modal-glow" />
          <div class="lr-modal-head">
            <div class="lr-modal-icon lr-modal-icon--warn">
              <AlertTriangle :size="22" />
            </div>
            <div>
              <h3>Cancel Leave Request</h3>
              <p>This will change the status to <strong>Cancelled</strong></p>
            </div>
            <button class="lr-modal-x" @click="emitClose"><X :size="18" /></button>
          </div>

          <div class="lr-modal-body">
            <div class="lr-modal-detail" v-if="cancelTarget">
              <div class="lr-modal-detail-row">
                <span>Leave Type</span>
                <strong>{{ cancelTarget.leave_type_name }}</strong>
              </div>
              <div class="lr-modal-detail-row">
                <span>Date Range</span>
                <strong>{{ formatDate(cancelTarget.start_date) }} — {{ formatDate(cancelTarget.end_date) }}</strong>
              </div>
              <div class="lr-modal-detail-row">
                <span>Total Days</span>
                <strong>{{ cancelTarget.total_days }} day{{ cancelTarget.total_days !== 1 ? 's' : '' }}</strong>
              </div>
            </div>
            <p class="lr-modal-note">
              This action cannot be undone. The request will remain in the system with a "Cancelled" status.
            </p>
          </div>

          <div class="lr-modal-foot">
            <button class="lr-btn lr-btn-ghost" @click="emitClose">Keep Request</button>
            <button class="lr-btn lr-btn-danger" :disabled="cancelling" @click="doCancel">
              <span v-if="cancelling" class="lr-spin-sm"></span>
              <span v-else class="lr-btn-content"><XCircle :size="16" /> Yes, Cancel Request</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { LeaveRequestListItem } from '@/types/leave'
import { AlertTriangle, X, XCircle } from 'lucide-vue-next'

const props = defineProps<{
  cancelTarget: LeaveRequestListItem | null
  cancelling: boolean
  formatDate: (s: string) => string
  doCancel: () => Promise<void>
  emitClose: () => void
}>()

const { cancelTarget } = props
</script>

