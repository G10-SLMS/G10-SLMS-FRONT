<template>
  <div class="relative">
    <button
      class="inline-flex shrink-0 items-center gap-2 rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm text-white cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="disabled || exporting"
      @click="showMenu = !showMenu"
    >
      <Download :size="16" :stroke-width="1.8" />
      {{ exporting ? 'Exporting…' : 'Export' }}
    </button>

    <div
      v-if="showMenu"
      v-click-outside="closeMenu"
      class="absolute right-0 z-10 mt-1.5 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
    >
      <button
        class="block w-full cursor-pointer border-none bg-transparent px-3.5 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50"
        @click="handleExport('pdf')"
      >
        Export as PDF
      </button>
      <button
        class="block w-full cursor-pointer border-none bg-transparent px-3.5 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50"
        @click="handleExport('excel')"
      >
        Export as Excel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { vClickOutside } from '@/composables/shared/useClickOutside'

defineProps<{
  disabled?: boolean
  exporting?: boolean
}>()

const emit = defineEmits<{
  (e: 'export', format: 'pdf' | 'excel'): void
}>()

const showMenu = ref(false)

function closeMenu() {
  showMenu.value = false
}

function handleExport(format: 'pdf' | 'excel') {
  showMenu.value = false
  emit('export', format)
}
</script>
