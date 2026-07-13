<script setup lang="ts">
import IconGoogle from '@/components/icons/IconGoogle.vue'
import IconGithub from '@/components/icons/IconGithub.vue'

defineEmits<{
  login: [provider: 'google' | 'github']
}>()
</script>

<template>
  <div class="divider">OR CONTINUE WITH</div>

  <div class="social-row">
    <button type="button" class="btn-social btn-google" @click="$emit('login', 'google')">
      <IconGoogle />
      Google
    </button>
    <button type="button" class="btn-social btn-github" @click="$emit('login', 'github')">
      <IconGithub />
      GitHub
    </button>
  </div>
</template>
