import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLeaveFormModalStore = defineStore('leaveFormModal', () => {
  const isOpen = ref(false)
  const editingId = ref<string | number | null>(null)

  function openCreate() {
    editingId.value = null
    isOpen.value = true
  }

  function openEdit(id: string | number) {
    editingId.value = id
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    editingId.value = null
  }

  return { isOpen, editingId, openCreate, openEdit, close }
})
