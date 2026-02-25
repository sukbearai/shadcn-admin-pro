<template>
  <div class="flex h-11 items-center border-b border-border/70 bg-card/40 px-3 backdrop-blur">
    <ScrollArea class="flex-1">
      <div class="flex items-center gap-2 py-1">
        <TabItem
          v-for="(tag, index) in tagList"
          :key="tag.fullPath"
          :index="index"
          :item-data="tag"
        />
      </div>
    </ScrollArea>

    <div class="ml-3 flex items-center">
      <Button size="sm" variant="outline" class="rounded-full px-3" @click="closeAll">关闭全部</Button>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { listenerRouteChange } from "@/utils/route-listener"
import { useTabBarStore } from "@/store"
import { DEFAULT_ROUTE_NAME } from "@/router/constants"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import TabItem from "./tab-item.vue"

const router = useRouter()
const tabBarStore = useTabBarStore()

const tagList = computed(() => tabBarStore.getTabList)
const hiddenTabNames = new Set([
  "notFound",
  "403",
  "MapScreen",
  "GlobeScreen",
  "Redirect",
  "redirectWrapper",
  "WorkplaceLegacy",
])

pruneHiddenTabs()

const disposeRouteListener = listenerRouteChange((route) => {
  pruneHiddenTabs()
  if (
    !route.meta?.hideInTab &&
    !route.meta?.noAffix &&
    !tagList.value.some((tag) => tag.fullPath === route.fullPath)
  ) {
    tabBarStore.updateTabList(route)
  }
}, true)

onUnmounted(() => {
  disposeRouteListener()
})

function closeAll() {
  tabBarStore.resetTabList()
  router.push({ name: DEFAULT_ROUTE_NAME })
}

function pruneHiddenTabs() {
  const filtered = tagList.value.filter((tag, index) => {
    if (index === 0) {
      return true
    }
    return !hiddenTabNames.has(tag.name)
  })

  if (filtered.length !== tagList.value.length) {
    tabBarStore.freshTabList(filtered)
  }
}
</script>
