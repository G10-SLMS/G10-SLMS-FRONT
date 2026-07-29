import { ref, computed, onMounted, watch } from 'vue'
import type { Gender, UserRole, ManagedUser, UserRoleCounts, ImportUsersResult } from '@/types/user'
import { userService } from '@/services/userService'
import { extractErrorMessage } from '@/utils/errors'
import { usePagination } from '@/composables/shared/usePagination'
import { useStudentDirectoryStore } from '@/stores/studentDirectory'
import { useAuthStore } from '@/stores/auth'

export function useUserManagement() {
  // Any create/update/delete/import below can change generations, classes, or
  // student counts — the cached Student Directory snapshot must not outlive that.
  const studentDirectoryStore = useStudentDirectoryStore()
  const auth = useAuthStore()
  // ── List State ───────────────────────────────────────
  const users = ref<ManagedUser[]>([])
  const loading = ref(true)
  const errorMsg = ref('')
  const successMsg = ref('')
  const defaultPasswordHint = '12345678'

  const search = ref('')
  const roleFilter = ref<'all' | UserRole>('all')
  const generationFilter = ref('')
  const classFilter = ref('')

  // Generation/class options come from the (already-cached) Student Directory —
  // avoids a second endpoint just to list distinct values.
  const generationOptions = computed(() =>
    studentDirectoryStore.generations
      .map((g) => g.generation)
      .filter((g): g is string => g !== null),
  )
  const classOptions = computed(() => {
    if (!generationFilter.value) return []
    const group = studentDirectoryStore.generations.find((g) => g.generation === generationFilter.value)
    return (group?.classes ?? [])
      .map((c) => c.class_name)
      .filter((c): c is string => c !== null)
  })

  function onGenerationFilterChange() {
    classFilter.value = ''
    fetchUsers(1)
  }

  const page = ref(1)
  const perPage = ref(10)
  const total = ref(0)
  const lastPage = ref(1)

  const counts = ref<UserRoleCounts>({ total: 0, student: 0, educator: 0, admin: 0 })

  const totalPages = computed(() => lastPage.value)
  const { from, to, visiblePages } = usePagination(page, lastPage, perPage, total)

  // ── Bulk Selection ───────────────────────────────────
  const selectedIds = ref<Set<number>>(new Set())

  const selectableUsers = computed(() => users.value.filter((u) => u.id !== auth.user?.id))
  const selectedCount = computed(() => selectedIds.value.size)
  const allSelected = computed(
    () => selectableUsers.value.length > 0 && selectableUsers.value.every((u) => selectedIds.value.has(u.id)),
  )

  function isSelected(id: number) {
    return selectedIds.value.has(id)
  }

  function toggleSelect(id: number) {
    const next = new Set(selectedIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    selectedIds.value = next
  }

  function toggleSelectAll() {
    if (allSelected.value) {
      selectedIds.value = new Set()
    } else {
      selectedIds.value = new Set(selectableUsers.value.map((u) => u.id))
    }
  }

  function clearSelection() {
    selectedIds.value = new Set()
  }

  // ── Search & Fetch ───────────────────────────────────
  let searchTimeout: ReturnType<typeof setTimeout> | undefined

  function onSearchDebounced() {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => fetchUsers(1), 400)
  }

  async function fetchUsers(p: number = 1) {
    loading.value = true
    errorMsg.value = ''
    page.value = p
    selectedIds.value.clear()

    try {
      const result = await userService.getUsers({
        search: search.value.trim() || undefined,
        role: roleFilter.value === 'all' ? undefined : roleFilter.value,
        generation: generationFilter.value || undefined,
        class_name: classFilter.value || undefined,
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

  onMounted(() => {
    fetchUsers(1)
    studentDirectoryStore.fetchDirectory()
  })
  watch(perPage, () => fetchUsers(1))

  // ── Add / Edit Form ──────────────────────────────────
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

  async function saveUser(payload: {
    name: string
    email: string
    role: UserRole
    gender?: Gender | null
    student_id?: string | null
    class_name?: string | null
    generation?: string | null
  }) {
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

      await studentDirectoryStore.fetchDirectory(true)
      modalOpen.value = false
    } catch (err) {
      formError.value = extractErrorMessage(err, 'Failed to save user.')
    } finally {
      saving.value = false
    }
  }

  // ── Delete Confirmation ──────────────────────────────
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
      await studentDirectoryStore.fetchDirectory(true)
    } catch (err) {
      errorMsg.value = extractErrorMessage(err, 'Failed to remove user.')
    } finally {
      deletingId.value = null
    }
  }

  // ── Enable / Disable ─────────────────────────────────
  const togglingId = ref<number | null>(null)
  const confirmToggleOpen = ref(false)
  const pendingToggleUser = ref<ManagedUser | null>(null)
  const confirmToggleMessage = computed(() => {
    const u = pendingToggleUser.value
    if (!u) return ''
    return u.is_active
      ? `Are you sure you want to disable ${u.name}? They will be signed out and won't be able to log in until re-enabled.`
      : `Are you sure you want to enable ${u.name}? They will be able to log in again.`
  })

  function requestToggleStatus(u: ManagedUser) {
    pendingToggleUser.value = u
    confirmToggleOpen.value = true
  }

  function cancelToggleStatus() {
    if (togglingId.value) return
    confirmToggleOpen.value = false
    pendingToggleUser.value = null
  }

  async function confirmToggleStatus() {
    if (!pendingToggleUser.value) return
    const target = pendingToggleUser.value
    togglingId.value = target.id
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const updated = await userService.toggleUserStatus(target.id)
      const index = users.value.findIndex((existing) => existing.id === target.id)
      if (index !== -1) users.value[index] = updated
      successMsg.value = updated.is_active
        ? `${updated.name} has been enabled.`
        : `${updated.name} has been disabled.`
      confirmToggleOpen.value = false
      pendingToggleUser.value = null
    } catch (err) {
      errorMsg.value = extractErrorMessage(err, 'Failed to update user status.')
    } finally {
      togglingId.value = null
    }
  }

  // ── Bulk Delete ───────────────────────────────────────
  const bulkDeleting = ref(false)
  const bulkDeleteConfirmOpen = ref(false)
  const bulkDeleteMessage = computed(
    () =>
      `Are you sure you want to remove ${selectedCount.value} user${selectedCount.value === 1 ? '' : 's'}? This cannot be undone.`,
  )

  function requestBulkDelete() {
    if (selectedCount.value === 0) return
    bulkDeleteConfirmOpen.value = true
  }

  function cancelBulkDelete() {
    if (bulkDeleting.value) return
    bulkDeleteConfirmOpen.value = false
  }

  async function confirmBulkDelete() {
    bulkDeleting.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const { deletedCount } = await userService.bulkDeleteUsers(Array.from(selectedIds.value))
      successMsg.value = `${deletedCount} user(s) removed successfully.`
      bulkDeleteConfirmOpen.value = false
      clearSelection()
      await fetchUsers(1)
      await studentDirectoryStore.fetchDirectory(true)
    } catch (err) {
      errorMsg.value = extractErrorMessage(err, 'Failed to remove selected users.')
    } finally {
      bulkDeleting.value = false
    }
  }

  // ── Bulk Enable / Disable ────────────────────────────
  const bulkToggling = ref(false)
  const bulkToggleConfirmOpen = ref(false)
  const pendingBulkAction = ref<'enable' | 'disable' | null>(null)
  const bulkToggleMessage = computed(() =>
    pendingBulkAction.value === 'enable'
      ? `Are you sure you want to enable ${selectedCount.value} user${selectedCount.value === 1 ? '' : 's'}? They will be able to log in again.`
      : `Are you sure you want to disable ${selectedCount.value} user${selectedCount.value === 1 ? '' : 's'}? They will be signed out and won't be able to log in until re-enabled.`,
  )

  function requestBulkToggle(action: 'enable' | 'disable') {
    if (selectedCount.value === 0) return
    pendingBulkAction.value = action
    bulkToggleConfirmOpen.value = true
  }

  function cancelBulkToggle() {
    if (bulkToggling.value) return
    bulkToggleConfirmOpen.value = false
    pendingBulkAction.value = null
  }

  async function confirmBulkToggle() {
    if (!pendingBulkAction.value) return
    bulkToggling.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const { users: updatedUsers, updatedCount } = await userService.bulkToggleStatus(
        Array.from(selectedIds.value),
        pendingBulkAction.value === 'enable',
      )
      const byId = new Map(updatedUsers.map((u) => [u.id, u]))
      users.value = users.value.map((u) => byId.get(u.id) ?? u)
      successMsg.value =
        pendingBulkAction.value === 'enable'
          ? `${updatedCount} user(s) enabled.`
          : `${updatedCount} user(s) disabled.`
      bulkToggleConfirmOpen.value = false
      pendingBulkAction.value = null
      clearSelection()
    } catch (err) {
      errorMsg.value = extractErrorMessage(err, 'Failed to update selected users.')
    } finally {
      bulkToggling.value = false
    }
  }

  // ── Scope Enable / Disable (whole generation or class) ──
  const scopeToggling = ref(false)
  const scopeToggleConfirmOpen = ref(false)
  const pendingScopeAction = ref<'enable' | 'disable' | null>(null)

  // Only meaningful once a generation is selected; class is optional narrowing.
  const scopeDescription = computed(() =>
    classFilter.value ? `class "${classFilter.value}" (${generationFilter.value})` : `generation "${generationFilter.value}"`,
  )
  const canScopeToggle = computed(() => !!generationFilter.value)
  const scopeToggleMessage = computed(() =>
    pendingScopeAction.value === 'enable'
      ? `Are you sure you want to enable every student in ${scopeDescription.value}? They will be able to log in again.`
      : `Are you sure you want to disable every student in ${scopeDescription.value}? They will be signed out and won't be able to log in until re-enabled.`,
  )

  function requestScopeToggle(action: 'enable' | 'disable') {
    if (!canScopeToggle.value) return
    pendingScopeAction.value = action
    scopeToggleConfirmOpen.value = true
  }

  function cancelScopeToggle() {
    if (scopeToggling.value) return
    scopeToggleConfirmOpen.value = false
    pendingScopeAction.value = null
  }

  async function confirmScopeToggle() {
    if (!pendingScopeAction.value || !generationFilter.value) return
    scopeToggling.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const { message } = await userService.toggleStatusByScope({
        generation: generationFilter.value,
        class_name: classFilter.value || null,
        is_active: pendingScopeAction.value === 'enable',
      })
      successMsg.value = message
      scopeToggleConfirmOpen.value = false
      pendingScopeAction.value = null
      await fetchUsers(1)
      await studentDirectoryStore.fetchDirectory(true)
    } catch (err) {
      errorMsg.value = extractErrorMessage(err, 'Failed to update students for that scope.')
    } finally {
      scopeToggling.value = false
    }
  }

  // ── Excel Import ─────────────────────────────────────
  const importModalOpen = ref(false)

  async function onUsersImported(result: ImportUsersResult) {
    errorMsg.value = ''
    successMsg.value = `Import completed: ${result.summary.successful} created, ${result.summary.skipped} skipped, ${result.summary.failed} failed.`
    await fetchUsers(1)
    await studentDirectoryStore.fetchDirectory(true)
  }

  return {
    // ── list state ──
    users,
    loading,
    errorMsg,
    successMsg,
    defaultPasswordHint,
    search,
    roleFilter,
    generationFilter,
    classFilter,
    generationOptions,
    classOptions,
    onGenerationFilterChange,
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
    // ── bulk selection ──
    selectedIds,
    selectedCount,
    allSelected,
    isSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    // ── add/edit form ──
    modalOpen,
    editingUser,
    saving,
    formError,
    openAddModal,
    openEditModal,
    closeModal,
    saveUser,
    // ── delete confirmation ──
    deletingId,
    confirmOpen,
    confirmMessage,
    requestRemoveUser,
    cancelRemoveUser,
    confirmRemoveUser,
    // ── enable/disable ──
    togglingId,
    confirmToggleOpen,
    pendingToggleUser,
    confirmToggleMessage,
    requestToggleStatus,
    cancelToggleStatus,
    confirmToggleStatus,
    // ── bulk delete ──
    bulkDeleting,
    bulkDeleteConfirmOpen,
    bulkDeleteMessage,
    requestBulkDelete,
    cancelBulkDelete,
    confirmBulkDelete,
    // ── bulk enable/disable ──
    bulkToggling,
    bulkToggleConfirmOpen,
    pendingBulkAction,
    bulkToggleMessage,
    requestBulkToggle,
    cancelBulkToggle,
    confirmBulkToggle,
    // ── scope enable/disable (by generation/class) ──
    scopeToggling,
    scopeToggleConfirmOpen,
    pendingScopeAction,
    canScopeToggle,
    scopeDescription,
    scopeToggleMessage,
    requestScopeToggle,
    cancelScopeToggle,
    confirmScopeToggle,
    // ── import ──
    importModalOpen,
    onUsersImported,
  }
}
