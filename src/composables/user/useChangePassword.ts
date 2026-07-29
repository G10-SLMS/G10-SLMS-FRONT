import { reactive, ref } from "vue";
import { authService } from "../../services/authService";
import { extractErrorMessage } from "../../utils/errors";

interface UseChangePasswordOptions {
  autoCloseMs?: number
}

export function useChangePassword(options: UseChangePasswordOptions = {}) {
  // ── State ────────────────────────────────────────────
  const form = reactive({
    current: '',
    next: '',
    confirm: '',
  })

  const saving = ref(false)
  const error = ref('')
  const success = ref(false)
  const isOpen = ref(false)

  // ── Reset / Open / Close ─────────────────────────────
  function reset() {
    form.current = ''
    form.next = ''
    form.confirm = ''
    error.value = ''
    success.value = false
    saving.value = false
  }

  function open() {
    reset()
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    reset()
  }

  // ── Submit ───────────────────────────────────────────
  async function submit(onSuccess?: () => void) {
    error.value = ''
    success.value = false

    if (form.next !== form.confirm) {
      error.value = 'New password and confirmation do not match.'
      return
    }

    saving.value = true
    try {
      await authService.changePassword({
        current_password: form.current,
        new_password: form.next,
        new_password_confirmation: form.confirm,
      })
      success.value = true

      if (options.autoCloseMs) {
        setTimeout(() => onSuccess?.(), options.autoCloseMs)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      error.value = extractErrorMessage(err, 'Could not change password.')
    } finally {
      saving.value = false
    }
  }

  return { form, saving, error, success, submit, reset, isOpen, open, close }
}
