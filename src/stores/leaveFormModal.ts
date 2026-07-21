import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export type LeaveFormMode = 'create' | 'edit' | 'view'

export const useLeaveFormModalStore = defineStore('leaveFormModal', () => {
  const isOpen = ref(false)
  const editingId = ref<string | number | null>(null)
  const mode = ref<LeaveFormMode>('create')

  // Bumped whenever a request is created/updated so any open list can
  // reactively refetch without manual event wiring between components.
  const refreshToken = ref(0)

  function openCreate() {
    // Only students may submit new leave requests. Admins/trainers only
    // review requests — this guard protects against any UI entry point
    // that forgets to check the role before calling this.
    const auth = useAuthStore()
    if (!auth.isStudent) return

    editingId.value = null
    mode.value = 'create'
    isOpen.value = true
  }

  function openEdit(id: string | number) {
    const auth = useAuthStore()
    if (!auth.isStudent) return

    editingId.value = id
    mode.value = 'edit'
    isOpen.value = true
  }

  function openView(id: string | number) {
    editingId.value = id
    mode.value = 'view'
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    editingId.value = null
  }

  function notifySubmitted() {
    refreshToken.value++
  }

  return { isOpen, editingId, mode, refreshToken, openCreate, openEdit, openView, close, notifySubmitted }
})
