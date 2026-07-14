<template>
  <aside
    class="relative flex flex-1 min-w-[320px] basis-[45%] flex-col justify-between overflow-hidden p-10 text-white"
    :style="bgStyle"
  >
    <div class="z-10 inline-flex items-center gap-3">
      <img :src="logoUrl" alt="SLMS logo" class="h-[72px] w-auto rounded-[10px] bg-white px-3.5 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.25)]" />
    </div>

    <div class="z-10 max-w-[460px]">
      <h1 class="mb-4 text-[2.4rem] font-extrabold leading-[1.15] tracking-tight">{{ title }}</h1>
      <p class="text-base leading-normal text-white/[0.78]">{{ description }}</p>
    </div>

    <div class="z-10 flex items-center gap-3">
      <div class="flex">
        <span class="-ml-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white/30 bg-white/15 first:ml-0"></span>
        <span class="-ml-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white/30 bg-white/15 first:ml-0"></span>
        <span class="-ml-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white/30 bg-white/15 first:ml-0"></span>
      </div>
      <p class="text-sm font-semibold text-white/90">{{ trustText }}</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import defaultHero from '@/assets/image/p2.jpg'

const props = withDefaults(
  defineProps<{
    logoUrl: string
    title: string
    description: string
    heroImage?: string
    trustText?: string
  }>(),
  {
    trustText: 'Trusted by 1,000+ students and faculty',
  }
)

const bgStyle = computed(() => {
  const img = props.heroImage ?? defaultHero
  return {
    backgroundImage: `linear-gradient(180deg, rgba(9,22,55,.78) 0%, rgba(9,22,55,.65) 100%), url(${img})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})
</script>
