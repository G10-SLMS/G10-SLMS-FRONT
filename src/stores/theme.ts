import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

type ThemeMode = 'light' | 'dark'

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem('theme_mode')
  if (stored === 'light' || stored === 'dark') return stored

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(isDark: boolean): void {
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(getStoredTheme())

  const isDark = computed(() => mode.value === 'dark')

  function setMode(newMode: ThemeMode): void {
    mode.value = newMode
    localStorage.setItem('theme_mode', newMode)
  }

  function toggle(): void {
    setMode(mode.value === 'dark' ? 'light' : 'dark')
  }

  function init(): void {
    applyTheme(isDark.value)
  }

  // Watch for mode changes and apply theme
  watch(isDark, (val) => {
    applyTheme(val)
  })

  return {
    mode,
    isDark,
    setMode,
    toggle,
    init,
  }
})
