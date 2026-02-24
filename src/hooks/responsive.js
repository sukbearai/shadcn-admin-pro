import { onMounted, onBeforeUnmount } from "vue"
import { useAppStore } from "@/store"

const WIDTH = 992

function isMobile() {
  return document.body.getBoundingClientRect().width < WIDTH
}

export default function useResponsive(immediate = false) {
  const appStore = useAppStore()

  const handler = () => {
    const mobile = isMobile()
    appStore.toggleDevice(mobile ? "mobile" : "desktop")
    appStore.toggleMenu(mobile)
  }

  onMounted(() => {
    if (immediate) {
      handler()
    }
    window.addEventListener("resize", handler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", handler)
  })
}
