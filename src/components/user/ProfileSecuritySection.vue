<template>
  <section
    class="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5"
  >
    <div>
      <h3 class="text-[15px] font-bold text-slate-900">Security</h3>
      <p class="text-[13px] text-slate-400">Manage your password and account security.</p>
    </div>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      @click="$emit('change-password')"
    >
      <Lock :size="15" />
      Change Password
    </button>
  </section>
</template>

<script setup lang="ts">
import { Lock } from 'lucide-vue-next';

defineEmits<{
  'change-password': [];
}>();
</script>
