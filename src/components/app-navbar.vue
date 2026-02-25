<template>
  <header class="h-14 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
    <div class="flex h-full items-center justify-between px-4">
      <div class="flex min-w-0 items-center gap-2">
        <img :src="currentLogo" alt="系统 Logo" class="h-7 w-7 shrink-0 object-contain" />
        <p class="truncate text-sm font-semibold tracking-wide">恶意代码预警通报管理平台</p>
      </div>

      <div class="flex items-center gap-2">
        <div class="hidden sm:block">
          <ThemeToggle show-label />
        </div>
        <div class="sm:hidden">
          <ThemeToggle />
        </div>

        <Button variant="outline" size="sm" @click="handleLogout">
          <LogOut class="size-4" />
          退出
        </Button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { LogOut } from "lucide-vue-next"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store"
import logoDark from "@/assets/images/logo.png"
import logoLight from "@/assets/images/logo_green.png"
import ThemeToggle from "@/components/theme-toggle.vue"
import {
  THEME_CHANGE_EVENT,
  THEME_DARK,
  getStoredTheme,
  resolveTheme,
} from "@/utils/theme"

const router = useRouter()
const userStore = useUserStore()
const resolvedTheme = ref(resolveTheme(getStoredTheme()))

const currentLogo = computed(() => {
  return resolvedTheme.value === THEME_DARK ? logoDark : logoLight
})

function syncTheme(event) {
  const preferredTheme = event?.detail?.preferredTheme || getStoredTheme()
  resolvedTheme.value = resolveTheme(preferredTheme)
}

onMounted(() => {
  window.addEventListener(THEME_CHANGE_EVENT, syncTheme)
})

onBeforeUnmount(() => {
  window.removeEventListener(THEME_CHANGE_EVENT, syncTheme)
})

async function handleLogout() {
  await userStore.logout()
  router.push({
    name: "login",
    query: {
      redirect: router.currentRoute.value.fullPath,
    },
  })
}
</script>
