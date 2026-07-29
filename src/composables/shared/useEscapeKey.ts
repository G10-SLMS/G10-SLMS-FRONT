import { onMounted, onUnmounted } from 'vue';

export function useEscapeKey(isActive: () => boolean, onEscape: () => void) {
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isActive()) onEscape();
  }

  onMounted(() => window.addEventListener('keydown', handleKeydown));
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
}
