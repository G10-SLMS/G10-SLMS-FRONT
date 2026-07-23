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

  function pause() {
    isActive.value = false
  }

  function resume() {
    isActive.value = true
  }

  function handleVisibilityChange() {
    if (pauseWhenHidden && !document.hidden) tick()
  }

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
