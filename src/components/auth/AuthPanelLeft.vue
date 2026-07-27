<template>
  <aside
    class="relative flex flex-1 min-w-[320px] basis-[45%] flex-col justify-between overflow-hidden p-10 text-white"
    :style="bgStyle"
  >
    <div class="z-10 inline-flex items-center gap-3">
      <img
        :src="logoUrl"
        :alt="logoAlt"
        class="h-[72px] w-auto rounded-[10px] px-3.5 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
        style="background-color: #fff;"
      />
    </div>

    <div class="z-10 max-w-[460px]">
      <h1 class="mb-4 text-[2.4rem] font-extrabold leading-[1.15] tracking-tight">
        {{ title }}
      </h1>
      <p class="text-base leading-relaxed text-white/80">{{ description }}</p>
    </div>

    <div class="z-10 flex flex-wrap items-center gap-x-6 gap-y-3">
      <span
        v-for="value in pncValues"
        :key="value.title"
        class="flex items-center gap-2 text-base font-semibold text-white/90 transition hover:text-cyan-400"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5a623] ring-1 ring-[#f5a623]/40"
        >
          <component :is="value.icon" class="h-4 w-4 text-white" />
        </span>
        {{ value.title }}
      </span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ShieldCheck, HeartHandshake, Users, HandHeart } from 'lucide-vue-next';
import defaultHero from '@/assets/image/p2.jpg';

const props = withDefaults(
  defineProps<{
    logoUrl: string;
    logoAlt?: string;
    title: string;
    description: string;
    heroImage?: string;
  }>(),
  {
    logoAlt: 'SLMS logo',
  },
);

const pncValues = [
  { title: 'Trust', icon: ShieldCheck },
  { title: 'Respect', icon: HeartHandshake },
  { title: 'Responsibility', icon: Users },
  { title: 'Solidarity', icon: HandHeart },
];

const bgStyle = computed(() => ({
  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.55) 100%), url(${props.heroImage ?? defaultHero})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));
</script>
