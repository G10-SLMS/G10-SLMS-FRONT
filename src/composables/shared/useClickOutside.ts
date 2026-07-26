export const vClickOutside = {
  mounted(el: HTMLElement & { __clickOutsideHandler__?: (e: MouseEvent) => void }, binding: { value: () => void }) {
    el.__clickOutsideHandler__ = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.__clickOutsideHandler__, true)
  },
  unmounted(el: HTMLElement & { __clickOutsideHandler__?: (e: MouseEvent) => void }) {
    if (el.__clickOutsideHandler__) {
      document.removeEventListener('click', el.__clickOutsideHandler__, true)
    }
  },
}
