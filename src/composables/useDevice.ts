import { ref, onMounted, onUnmounted } from 'vue'

export function useDevice() {
  const isMobile = ref(
    window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  )

  const checkMobile = () => {
    isMobile.value =
      window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  onMounted(() => {
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  return { isMobile }
}
