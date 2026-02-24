<template>
  <div
    class="h-full w-full bg-[radial-gradient(circle_at_20%_-30%,rgba(37,99,235,0.32),transparent_45%),linear-gradient(180deg,#061224_0%,#08152b_100%)] text-foreground"
  >
    <template v-if="hideLayout">
      <div class="h-full w-full">
        <PageLayout />
      </div>
    </template>

    <template v-else>
      <div v-if="navbar" class="fixed inset-x-0 top-0 z-50">
        <AppNavbar />
      </div>

      <div class="flex h-full" :style="bodyStyle">
        <aside
          v-if="renderMenu && !hideMenu"
          class="relative shrink-0 border-r border-border/70 bg-card/50 backdrop-blur"
          :style="siderStyle"
        >
          <AppMenu />
          <div class="absolute bottom-3 right-2 z-40">
            <Button
              variant="outline"
              size="icon"
              class="h-8 w-8 bg-background/70"
              @click="toggleMenuCollapse"
            >
              <PanelLeftOpen v-if="appStore.menuCollapse" class="size-4" />
              <PanelLeftClose v-else class="size-4" />
            </Button>
          </div>
        </aside>

        <main class="flex min-w-0 flex-1 flex-col">
          <TabBar v-if="appStore.tabBar" />
          <div class="overflow-auto" :style="pageStyle">
            <PageLayout />
          </div>
        </main>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { PanelLeftClose, PanelLeftOpen } from "lucide-vue-next"
import { useRoute } from "vue-router"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store"
import useResponsive from "@/hooks/responsive"
import AppNavbar from "@/components/app-navbar.vue"
import AppMenu from "@/components/app-menu/index.vue"
import TabBar from "@/components/tab-bar/index.vue"
import PageLayout from "./page-layout.vue"

const route = useRoute()
const appStore = useAppStore()
useResponsive(true)

const navbar = computed(() => appStore.navbar)
const renderMenu = computed(() => appStore.menu)
const hideMenu = computed(() => appStore.hideMenu)
const hideLayout = computed(() => route.meta?.hideLayout === true)

const menuWidth = computed(() => (appStore.menuCollapse ? 64 : appStore.menuWidth))

const bodyStyle = computed(() => {
  return {
    paddingTop: navbar.value ? "56px" : "0",
  }
})

const siderStyle = computed(() => {
  return {
    width: `${menuWidth.value}px`,
  }
})

const pageStyle = computed(() => {
  const topOffset = navbar.value ? 56 : 0
  const tabOffset = appStore.tabBar ? 44 : 0

  return {
    height: `calc(100vh - ${topOffset + tabOffset}px)`,
  }
})

function toggleMenuCollapse() {
  appStore.updateSettings({ menuCollapse: !appStore.menuCollapse })
}
</script>
