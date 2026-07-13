<script setup lang="ts">
withDefaults(
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
</script>

<template>
  <aside
    class="auth-panel-left"
    :style="heroImage ? { backgroundImage: `linear-gradient(rgba(10,14,24,.55), rgba(10,14,24,.75)), url(${heroImage})` } : undefined"
  >
    <div class="auth-brand">
      <img :src="logoUrl" alt="SLMS logo" class="auth-brand-logo" />
    </div>

    <div class="auth-hero">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>

    <div class="auth-trust">
      <div class="auth-trust-avatars">
        <span></span><span></span><span></span>
      </div>
      <p>{{ trustText }}</p>
    </div>
  </aside>
</template>

<style scoped>
.auth-brand {
  display: inline-flex;
}

.auth-brand-logo {
  height: 72px;
  width: auto;
  background: #ffffff;
  padding: 8px 14px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}
</style>
