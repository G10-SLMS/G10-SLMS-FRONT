import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LeaveRequest {
  id: number
  userId: number
  type: string
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

export const useLeaveStore = defineStore('leave', () => {
  const leaves = ref<LeaveRequest[]>([])

  function setLeaves(leaveList: LeaveRequest[]) {
    leaves.value = leaveList
  }

  function addLeave(leave: LeaveRequest) {
    leaves.value.push(leave)
  }

  function updateLeave(id: number, updates: Partial<LeaveRequest>) {
    const index = leaves.value.findIndex((l) => l.id === id)
    if (index !== -1) {
      leaves.value[index] = { ...leaves.value[index], ...updates }
    }
  }

  return { leaves, setLeaves, addLeave, updateLeave }
})