import { ref, onMounted, onUnmounted } from 'vue'

export function useCurrentTimeIndicator(startHour: number, cellHeight: number) {
  const currentTimePos = ref(0)
  let timeInterval: ReturnType<typeof setInterval> | null = null

  function updateCurrentTime() {
    const now = new Date()
    const minutes = now.getHours() * 60 + now.getMinutes()
    currentTimePos.value = ((minutes - startHour * 60) / 60) * cellHeight
  }

  onMounted(() => {
    updateCurrentTime()
    timeInterval = setInterval(updateCurrentTime, 60000)
  })

  onUnmounted(() => {
    if (timeInterval) {
      clearInterval(timeInterval)
      timeInterval = null
    }
  })

  return { currentTimePos }
}
