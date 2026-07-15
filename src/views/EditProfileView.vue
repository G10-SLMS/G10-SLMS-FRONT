<template>
  <div class="mx-auto max-w-[900px] px-8 py-10">
    <header class="mb-8">
      <RouterLink
        to="/profile"
        class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 no-underline hover:text-cyan-600"
      >
        <ArrowLeft :size="16" />
        Back to Profile
      </RouterLink>
      <p class="mb-0.5 mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
        Institutional Record
      </p>
      <h1 class="text-[26px] font-bold tracking-tight text-slate-900">Edit Profile</h1>
    </header>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]">
        <div class="bg-gradient-to-br from-[#10182b] via-[#1c2743] to-[#232f4d] px-6 py-6">
          <h3 class="text-[15px] font-bold text-white">Basic Information</h3>
          <p class="mt-0.5 text-[13px] text-white/50">Update your name, email, and avatar.</p>
        </div>

        <div class="px-6 py-6">
          <div class="mb-6 border-b border-dotted border-slate-300 pb-6">
            <div class="mb-3 flex items-center gap-4">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-slate-100 bg-slate-700 text-[22px] font-bold text-white shadow-md">
                <img v-if="selectedAvatarUrl" :src="selectedAvatarUrl" alt="Avatar preview" class="h-full w-full object-cover" />
                <span v-else>{{ initials }}</span>
              </div>
              <p class="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">Choose an avatar below</p>
            </div>

            <div v-if="loadingAvatars" class="text-[13px] text-slate-400">Loading avatars…</div>
            <div v-else class="flex flex-wrap gap-2.5">
              <button
                v-for="avatar in defaultAvatars"
                :key="avatar.id"
                type="button"
                class="h-12 w-12 overflow-hidden rounded-full border-2 transition"
                :class="form.avatar_id === avatar.id ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-transparent hover:border-slate-200'"
                @click="form.avatar_id = avatar.id"
              >
                <img :src="avatar.url" :alt="avatar.filename" class="h-full w-full object-cover" />
              </button>
            </div>
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="submitProfile">
            <div class="flex flex-col gap-1.5">
              <label for="name" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Full Name</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="email" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Email Address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="phone" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Phone</label>
              <input
                id="phone"
                v-model="form.phone"
                type="text"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <!-- Student-only fields — required by UpdateProfileRequest when role === 'student' -->
            <template v-if="isStudent">
              <div class="flex flex-col gap-1.5">
                <label for="gender" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Gender</label>
                <select
                  id="gender"
                  v-model="form.gender"
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="id_card" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">ID Card Number</label>
                <input
                  id="id_card"
                  v-model="form.id_card"
                  type="text"
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="class" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Class</label>
                <input
                  id="class"
                  v-model="form.class"
                  type="text"
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="generation" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Generation</label>
                <input
                  id="generation"
                  v-model="form.generation"
                  type="text"
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="province" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Province</label>
                <input
                  id="province"
                  v-model="form.province"
                  type="text"
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>
            </template>

            <p v-if="profileError" class="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">{{ profileError }}</p>
            <p v-if="profileSuccess" class="rounded-lg bg-green-50 px-3 py-2 text-[13px] text-green-700">Profile updated successfully.</p>

            <div class="flex justify-end pt-2">
              <button
                type="submit"
                class="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:enabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="savingProfile"
              >
                {{ savingProfile ? 'Saving…' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section id="security" class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]">
        <div class="bg-gradient-to-br from-[#10182b] via-[#1c2743] to-[#232f4d] px-6 py-6">
          <h3 class="flex items-center gap-1.5 text-[15px] font-bold text-white">
            <Lock :size="16" />
            Change Password
          </h3>
          <p class="mt-0.5 text-[13px] text-white/50">Choose a strong password you don't use elsewhere.</p>
        </div>

        <div class="px-6 py-6">
          <form class="flex flex-col gap-4" @submit.prevent="submitPassword">
            <div class="flex flex-col gap-1.5">
              <label for="new-password" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">New Password</label>
              <input
                id="new-password"
                v-model="passwordForm.next"
                type="password"
                required
                minlength="8"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="confirm-password" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Confirm New Password</label>
              <input
                id="confirm-password"
                v-model="passwordForm.confirm"
                type="password"
                required
                minlength="8"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <p v-if="passwordError" class="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">{{ passwordError }}</p>
            <p v-if="passwordSuccess" class="rounded-lg bg-green-50 px-3 py-2 text-[13px] text-green-700">Password updated successfully.</p>

            <div class="flex justify-end pt-2">
              <button
                type="submit"
                class="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:enabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="savingPassword"
              >
                {{ savingPassword ? 'Updating…' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ArrowLeft, Lock } from 'lucide-vue-next'
import { authService } from '@/services/authService'
import type { AxiosError } from 'axios'
import type { DefaultAvatar, Gender } from '@/types/user'

const auth = useAuthStore()
const user = computed(() => auth.user)
const isStudent = computed(() => user.value?.role === 'student')

const initials = computed(() =>
  (user.value?.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const defaultAvatars = ref<DefaultAvatar[]>([])
const loadingAvatars = ref(true)
const selectedAvatarUrl = computed(
  () => defaultAvatars.value.find((a) => a.id === form.avatar_id)?.url ?? null,
)

const form = reactive({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
  phone: user.value?.phone ?? '',
  gender: (user.value?.gender ?? '') as Gender | '',
  id_card: user.value?.id_card ?? '',
  class: user.value?.class ?? '',
  generation: user.value?.generation ?? '',
  province: user.value?.province ?? '',
  avatar_id: user.value?.avatar_id ?? null,
})

function extractError(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>
  const errors = axiosErr.response?.data?.errors
  if (errors) {
    const first = Object.values(errors)[0]?.[0]
    if (first) return first
  }
  return axiosErr.response?.data?.message ?? fallback
}

const savingProfile = ref(false)
const profileError = ref('')
const profileSuccess = ref(false)

async function submitProfile() {
  savingProfile.value = true
  profileError.value = ''
  profileSuccess.value = false
  try {
    await auth.updateProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      avatar_id: form.avatar_id,
      ...(isStudent.value
        ? {
            gender: form.gender || undefined,
            id_card: form.id_card,
            class: form.class,
            generation: form.generation,
            province: form.province,
          }
        : {}),
    })
    profileSuccess.value = true
  } catch (err) {
    profileError.value = extractError(err, 'Could not update profile.')
  } finally {
    savingProfile.value = false
  }
}

const passwordForm = reactive({ next: '', confirm: '' })
const savingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

async function submitPassword() {
  passwordError.value = ''
  passwordSuccess.value = false

  if (passwordForm.next !== passwordForm.confirm) {
    passwordError.value = 'New password and confirmation do not match.'
    return
  }

  savingPassword.value = true
  try {
    await auth.updateProfile({
      password: passwordForm.next,
      password_confirmation: passwordForm.confirm,
    })
    passwordSuccess.value = true
    passwordForm.next = ''
    passwordForm.confirm = ''
  } catch (err) {
    passwordError.value = extractError(err, 'Could not update password.')
  } finally {
    savingPassword.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await authService.getDefaultAvatars()
    defaultAvatars.value = data.avatars
  } catch {
    defaultAvatars.value = []
  } finally {
    loadingAvatars.value = false
  }

  if (window.location.hash === '#security') {
    document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' })
  }
})
</script>
