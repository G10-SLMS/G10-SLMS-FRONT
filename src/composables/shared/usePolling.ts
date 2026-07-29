import { onMounted, onUnmounted, ref } from 'vue'

export interface PollingOptions {
  interval?: number
  skipImmediate?: boolean
  pauseWhenHidden?: boolean
}

export function usePolling(callback: () => void | Promise<void>, options: PollingOptions = {}) {
  const { interval = 15000, skipImmediate = false, pauseWhenHidden = true } = options

  const isActive = ref(true)
  let timer: ReturnType<typeof setInterval> | null = null

  function tick() {
    if (isActive.value && (!pauseWhenHidden || !document.hidden)) {
      callback()
    }
  }

  // ── Start / Stop the Interval ─────────────────────────
  function start() {
    stop()
    if (!skipImmediate) tick()
    timer = setInterval(tick, interval)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // ── Pause / Resume (without tearing down the timer) ───
  function pause() {
    isActive.value = false
  }

  function resume() {
    isActive.value = true
  }

  // Also fire immediately when the tab becomes visible again, so data isn't stale.
  function handleVisibilityChange() {
    if (pauseWhenHidden && !document.hidden) tick()
  }

  // ── Lifecycle ─────────────────────────────────────────
  onMounted(() => {
    start()
    if (pauseWhenHidden) document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    stop()
    if (pauseWhenHidden) document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return { pause, resume, isActive }
}
