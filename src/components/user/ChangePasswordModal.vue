<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-5"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div class="bg-linear-to-br from-[#10182b] via-[#1c2743] to-[#232f4d] px-6 py-6">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-[15px] font-bold text-white">Change Password</h3>
                <p class="mt-0.5 text-[13px] text-white/50">
                  Choose a strong password you don't use elsewhere.
                </p>
              </div>
              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                @click="$emit('close')"
              >
                <X :size="18" />
              </button>
            </div>
          </div>

          <form class="flex flex-col gap-4 px-6 py-6" @submit.prevent="$emit('submit')">
            <ProfileFormField id="new-password" label="New Password">
              <input
                id="new-password"
                :value="next"
                type="password"
                required
                minlength="8"
                autofocus
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                @input="$emit('update:next', ($event.target as HTMLInputElement).value)"
              />
            </ProfileFormField>

            <ProfileFormField id="confirm-password" label="Confirm New Password">
              <input
                id="confirm-password"
                :value="confirm"
                type="password"
                required
                minlength="8"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                @input="$emit('update:confirm', ($event.target as HTMLInputElement).value)"
              />
            </ProfileFormField>

            <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
              {{ error }}
            </p>
            <p v-if="success" class="rounded-lg bg-green-50 px-3 py-2 text-[13px] text-green-700">
              Password updated successfully.
            </p>

            <div class="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                class="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                @click="$emit('close')"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:enabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="saving"
              >
                {{ saving ? 'Updating…' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import ProfileFormField from './ProfileFormField.vue';

defineProps<{
  open: boolean;
  next: string;
  confirm: string;
  error: string;
  success: boolean;
  saving: boolean;
}>();

defineEmits<{
  close: [];
  submit: [];
  'update:next': [value: string];
  'update:confirm': [value: string];
}>();
</script>
