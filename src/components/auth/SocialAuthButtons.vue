<script setup lang="ts">
import IconGoogle from '@/components/icons/IconGoogle.vue'
import IconGithub from '@/components/icons/IconGithub.vue'

defineEmits<{
  login: [provider: 'google' | 'github']
}>()
</script>

<template>
  <div class="my-6 flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-wide text-gray-400 before:h-px before:flex-1 before:bg-gray-200 after:h-px after:flex-1 after:bg-gray-200">
    OR CONTINUE WITH
  </div>

  <div class="flex gap-8">
    <button
      type="button"
      class="inline-flex flex-1 items-center justify-center gap-3 whitespace-nowrap rounded-[14px] border-[1.5px] border-gray-300 bg-white px-5 py-3.5 text-[0.92rem] font-semibold text-gray-700 transition-all hover:-translate-y-px hover:bg-gray-50 hover:shadow-[0_6px_16px_-6px_rgba(0,0,0,0.08)] active:translate-y-0 active:bg-gray-100 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0"
      @click="$emit('login', 'google')"
    >
      <IconGoogle />
      Google
    </button>
    <button
      type="button"
      class="inline-flex flex-1 items-center justify-center gap-3 whitespace-nowrap rounded-[14px] border-[1.5px] border-[#d0d7de] bg-white px-5 py-3.5 text-[0.92rem] font-semibold text-[#24292f] transition-all hover:-translate-y-px hover:border-[#24292f] hover:bg-[#f6f8fa] hover:shadow-[0_6px_16px_-6px_rgba(36,41,47,0.18)] active:translate-y-0 active:bg-[#eaeef2] [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0"
      @click="$emit('login', 'github')"
    >
      <IconGithub />
      GitHub
    </button>
  </div>
</template>
