import { ref, computed, reactive, onMounted, watch } from 'vue'
import type { UserRole, ManagedUser, UserRoleCounts, ImportUsersResult } from '@/types/user'
import { userService } from '@/services/userService'
import { extractErrorMessage } from '@/utils/errors'
import { usePagination } from '@/composables/shared/usePagination'

export function useUserManagement() {
  const users = ref<ManagedUser[]>([])
  const loading = ref(true)
  const errorMsg = ref('')
  const successMsg = ref('')
  const defaultPasswordHint = '12345678'

  const search = ref('')
  const roleFilter = ref<'all' | UserRole>('all')

  const page = ref(1)
  const perPage = ref(10)
  const total = ref(0)
  const lastPage = ref(1)

  const counts = ref<UserRoleCounts>({ total: 0, student: 0, educator: 0, admin: 0 })

  const totalPages = computed(() => lastPage.value)
  const { from, to, visiblePages } = usePagination(page, lastPage, perPage, total)

  let searchTimeout: ReturnType<typeof setTimeout> | undefined

  function onSearchDebounced() {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => fetchUsers(1), 400)
  }

  async function fetchUsers(p: number = 1) {
    loading.value = true
    errorMsg.value = ''
    page.value = p

    try {
      const result = await userService.getUsers({
        search: search.value.trim() || undefined,
        role: roleFilter.value === 'all' ? undefined : roleFilter.value,
        page: p,
        per_page: perPage.value,
      })
      users.value = result.data
      total.value = result.meta.total
      lastPage.value = result.meta.last_page
      counts.value = result.counts
    } catch (err) {
      errorMsg.value = extractErrorMessage(err, 'Failed to load users.')
      users.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(() => fetchUsers(1))
  watch(perPage, () => fetchUsers(1))

  // --- Add / edit form ---

  const modalOpen = ref(false)
  const editingUser = ref<ManagedUser | null>(null)
  const saving = ref(false)
  const formError = ref('')

  function openAddModal() {
    editingUser.value = null
    formError.value = ''
    modalOpen.value = true
  }

  function openEditModal(u: ManagedUser) {
    editingUser.value = u
    formError.value = ''
    modalOpen.value = true
  }

  function closeModal() {
    if (saving.value) return
    modalOpen.value = false
  }

  async function saveUser(payload: { name: string; email: string; role: UserRole }) {
    saving.value = true
    formError.value = ''
    errorMsg.value = ''
    successMsg.value = ''

    try {
      if (editingUser.value) {
        await userService.updateUser(editingUser.value.id, payload)
        successMsg.value = 'User updated successfully.'
        await fetchUsers(page.value)
      } else {
        const { defaultPassword } = await userService.createUser(payload)
        successMsg.value = `User created. They can log in with the default password: ${defaultPassword}`
        await fetchUsers(1)
      }

      modalOpen.value = false
    } catch (err) {
      formError.value = extractErrorMessage(err, 'Failed to save user.')
    } finally {
      saving.value = false
    }
  }

  // --- Delete confirmation ---

  const deletingId = ref<number | null>(null)
  const confirmOpen = ref(false)
  const pendingDeleteUser = ref<ManagedUser | null>(null)
  const confirmMessage = computed(() =>
    pendingDeleteUser.value
      ? `Are you sure you want to remove ${pendingDeleteUser.value.name}? This cannot be undone.`
      : 'Are you sure you want to remove this user? This cannot be undone.',
  )

  function requestRemoveUser(u: ManagedUser) {
    pendingDeleteUser.value = u
    confirmOpen.value = true
  }

  function cancelRemoveUser() {
    if (deletingId.value) return
    confirmOpen.value = false
    pendingDeleteUser.value = null
  }

  async function confirmRemoveUser() {
    if (!pendingDeleteUser.value) return
    await removeUser(pendingDeleteUser.value.id)
    confirmOpen.value = false
    pendingDeleteUser.value = null
  }

  async function removeUser(id: number) {
    deletingId.value = id
    errorMsg.value = ''
    successMsg.value = ''

    try {
      await userService.deleteUser(id)
      successMsg.value = 'User removed successfully.'
      const nextPage = users.value.length === 1 && page.value > 1 ? page.value - 1 : page.value
      await fetchUsers(nextPage)
    } catch (err) {
      errorMsg.value = extractErrorMessage(err, 'Failed to remove user.')
    } finally {
      deletingId.value = null
    }
  }

  // --- Excel import ---

  const importModalOpen = ref(false)

  async function onUsersImported(result: ImportUsersResult) {
    errorMsg.value = ''
    successMsg.value = `Import completed: ${result.summary.successful} created, ${result.summary.skipped} skipped, ${result.summary.failed} failed.`
    await fetchUsers(1)
  }

  return {
    // list state
    users,
    loading,
    errorMsg,
    successMsg,
    defaultPasswordHint,
    search,
    roleFilter,
    page,
    perPage,
    total,
    lastPage,
    counts,
    totalPages,
    from,
    to,
    visiblePages,
    onSearchDebounced,
    fetchUsers,
    // add/edit form
    modalOpen,
    editingUser,
    saving,
    formError,
    openAddModal,
    openEditModal,
    closeModal,
    saveUser,
    // delete confirmation
    deletingId,
    confirmOpen,
    confirmMessage,
    requestRemoveUser,
    cancelRemoveUser,
    confirmRemoveUser,
    // import
    importModalOpen,
    onUsersImported,
  }
}
