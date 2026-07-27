<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center bg-white/45 p-4" @click.self="emit('close')">
      <div class="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
        <h2 class="mb-4 text-lg">{{ user ? 'Edit User' : 'Add User' }}</h2>

        <div v-if="displayError" class="mb-3.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {{ displayError }}
        </div>

        <label class="mb-3.5 flex flex-col gap-1.5 text-[13px] text-gray-700">
          <span>Full Name</span>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Sokha Chan"
            class="rounded-md border border-gray-200 px-2.5 py-[9px] text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
          />
        </label>

        <label class="mb-3.5 flex flex-col gap-1.5 text-[13px] text-gray-700">
          <span>Email</span>
          <input
            v-model="form.email"
            type="email"
            placeholder="name@example.com"
            class="rounded-md border border-gray-200 px-2.5 py-[9px] text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
          />
        </label>

        <label class="mb-3.5 flex flex-col gap-1.5 text-[13px] text-gray-700">
          <span>Role</span>
          <select
            v-model="form.role"
            class="rounded-md border border-gray-200 px-2.5 py-[9px] text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="student">Student</option>
            <option value="educator">Educator</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <label class="mb-3.5 flex flex-col gap-1.5 text-[13px] text-gray-700">
          <span>Gender</span>
          <select
            v-model="form.gender"
            class="rounded-md border border-gray-200 px-2.5 py-[9px] text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <p v-if="!user" class="mb-3.5 rounded-md bg-blue-50 px-3 py-2 text-[12.5px] text-blue-700">
          New users are created with the default password
          <strong>{{ defaultPasswordHint }}</strong>. Share it with them so they can log in and change it.
        </p>

        <div class="mt-5 flex justify-end gap-2.5">
          <button
            class="rounded-md border-none bg-gray-100 px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-200"
            :disabled="saving"
            @click="emit('close')"
          >Cancel</button>
          <button
            class="rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="saving"
            @click="onSubmit"
          >
            {{ saving ? 'Saving…' : user ? 'Save Changes' : 'Add User' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Gender, ManagedUser, UserRole } from '@/types/user'

const props = defineProps<{
  open: boolean
  user: ManagedUser | null
  saving: boolean
  serverError: string
  defaultPasswordHint: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { name: string; email: string; role: UserRole; gender: Gender | null }): void
}>()

const form = reactive({ name: '', email: '', role: 'student' as UserRole, gender: null as Gender | null })
const localError = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    form.name = props.user?.name ?? ''
    form.email = props.user?.email ?? ''
    form.role = props.user?.role ?? 'student'
    form.gender = props.user?.gender ?? null
    localError.value = ''
  },
)

const displayError = computed(() => localError.value || props.serverError)

function onSubmit() {
  const name = form.name.trim()
  const email = form.email.trim()
  if (!name || !email) {
    localError.value = 'Name and email are required.'
    return
  }
  localError.value = ''
  emit('submit', { name, email, role: form.role, gender: form.gender })
}
</script>
