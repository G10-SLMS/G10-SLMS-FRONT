<template>
  <section
    class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]"
  >
    <div class="bg-linear-to-br from-[#10182b] via-[#1c2743] to-[#232f4d] px-6 py-6">
      <h3 class="flex items-center gap-1.5 text-[15px] font-bold text-white">
        <slot name="icon" />
        <slot name="title" />
      </h3>
      <p class="mt-0.5 text-[13px] text-white/50"><slot name="description" /></p>
    </div>

    <div class="px-6 py-6"><slot /></div>
  </section>
</template>

<script setup lang="ts"></script>
