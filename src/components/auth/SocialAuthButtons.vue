<template>
  <div>
    <div class="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-gray-400 before:h-px before:flex-1 before:bg-gray-200 after:h-px after:flex-1 after:bg-gray-200">
      OR CONTINUE WITH
    </div>

    <div class="flex gap-4">
      <button
        v-for="provider in providers"
        :key="provider.id"
        type="button"
        class="inline-flex flex-1 items-center justify-center gap-3 whitespace-nowrap rounded-xl border-2 border-gray-200 bg-white px-5 py-3.5 text-[0.92rem] font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-px hover:bg-gray-50 hover:shadow-md active:translate-y-0 active:bg-gray-100 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0"
        @click="emit('login', provider.id)"
      >
        <component :is="provider.icon" />
        {{ provider.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconGoogle from '@/components/icons/IconGoogle.vue'
import IconGithub from '@/components/icons/IconGithub.vue'

const emit = defineEmits<{
  (e: 'login', provider: 'google' | 'github'): void
}>()

const providers = [
  { id: 'google', label: 'Google', icon: IconGoogle },
  { id: 'github', label: 'GitHub', icon: IconGithub }
] as const
</script>
