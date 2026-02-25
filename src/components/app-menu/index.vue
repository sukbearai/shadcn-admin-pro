<template>
  <div class="relative h-full">
    <ScrollArea class="h-full px-2 pb-14 pt-3">
      <nav class="space-y-3">
        <template v-for="group in menuTree" :key="group.name">
          <div class="space-y-1" @mouseleave="onGroupLeave">
            <Button
              :variant="isGroupActive(group) ? 'secondary' : 'ghost'"
              :class="[
                'w-full',
                isCollapsed
                  ? 'h-10 justify-center px-0'
                  : 'h-9 justify-start px-3 text-[13px]',
              ]"
              :title="resolveGroupTitle(group)"
              @mouseenter="onGroupEnter(group, $event)"
              @click="handleGroupClick(group, $event)"
            >
              <component :is="resolveIcon(group)" class="size-4 shrink-0" />
              <span v-if="!isCollapsed" class="ml-2 truncate">
                {{ group.meta?.title || group.name }}
              </span>
              <ChevronRight
                v-if="!isCollapsed && hasChildren(group)"
                :class="[
                  'ml-auto size-3.5 text-muted-foreground transition-transform',
                  isGroupOpen(group.name) ? 'rotate-90' : '',
                ]"
                @click.stop="toggleGroup(group.name)"
              />
            </Button>

            <template v-if="!isCollapsed && hasChildren(group) && isGroupOpen(group.name)">
              <Button
                v-for="item in group.children"
                :key="item.name"
                :variant="isActive(item) ? 'secondary' : 'ghost'"
                class="h-9 w-full justify-start pl-10 pr-3 text-[13px]"
                @click="goto(item)"
              >
                <component :is="resolveIcon(item, true)" class="mr-2 size-3.5 shrink-0" />
                <span class="truncate">{{ item.meta?.title || item.name }}</span>
              </Button>
            </template>
          </div>
        </template>
      </nav>
    </ScrollArea>

    <Teleport to="body">
      <div
        v-if="isCollapsed && hoverGroup"
        class="fixed z-[120] w-56 rounded-lg border border-border/90 bg-popover p-2 text-popover-foreground shadow-2xl"
        :style="hoverPanelStyle"
        @mouseenter="cancelClosePanel"
        @mouseleave="scheduleClosePanel"
      >
        <p class="px-2 pb-1 pt-1 text-xs uppercase tracking-wider text-muted-foreground">
          {{ hoverGroup.meta?.title || hoverGroup.name }}
        </p>

        <Button
          v-for="item in hoverGroup.children"
          :key="item.name"
          :variant="isActive(item) ? 'secondary' : 'ghost'"
          class="h-9 w-full justify-start px-2.5 text-[13px]"
          @click="selectChild(item)"
        >
          <component :is="resolveIcon(item, true)" class="mr-2 size-3.5 shrink-0" />
          <span class="truncate">{{ item.meta?.title || item.name }}</span>
        </Button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import {
  BarChart3,
  ChevronRight,
  CircleDot,
  Globe,
  LayoutDashboard,
  Map,
} from "lucide-vue-next"
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppStore } from "@/store"
import useMenuTree from "./use-menu-tree"

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const { menuTree } = useMenuTree()

const iconMap = {
  dashboard: LayoutDashboard,
  Workplace: LayoutDashboard,
  visualization: BarChart3,
  MapScreen: Map,
  GlobeScreen: Globe,
}

const isCollapsed = computed(() => appStore.menuCollapse)
const hoverGroup = ref(null)
const hoverPanelStyle = ref({})
const expandedGroups = ref({})
let closeTimer = null

const matchedRouteNames = computed(() => {
  return route.matched.map((item) => item.name)
})

watch(isCollapsed, (collapsed) => {
  if (!collapsed) {
    clearHoverPanel()
  }
})

watch(
  menuTree,
  (groups) => {
    const next = {}
    groups.forEach((group) => {
      if (hasChildren(group)) {
        next[group.name] = expandedGroups.value[group.name] ?? true
      }
    })
    expandedGroups.value = next
    ensureActiveGroupExpanded()
  },
  { immediate: true }
)

watch(
  () => route.fullPath,
  () => {
    ensureActiveGroupExpanded()
  }
)

onBeforeUnmount(() => {
  cancelClosePanel()
})

function hasChildren(item) {
  return Array.isArray(item.children) && item.children.length > 0
}

function resolveGroupTitle(group) {
  if (isCollapsed.value && hasChildren(group)) {
    return undefined
  }

  return group.meta?.title || group.name
}

function resolveIcon(item, child = false) {
  return iconMap[item?.name] || (child ? CircleDot : LayoutDashboard)
}

function isActive(item) {
  const activeMenu = route.meta?.activeMenu
  if (activeMenu) {
    return item.name === activeMenu
  }

  return matchedRouteNames.value.includes(item.name)
}

function isGroupActive(group) {
  if (isActive(group)) {
    return true
  }

  if (!hasChildren(group)) {
    return false
  }

  return group.children.some((item) => isActive(item))
}

function handleGroupClick(group, event) {
  if (!hasChildren(group)) {
    goto(group)
    return
  }

  if (isCollapsed.value) {
    openHoverPanel(group, event)
    return
  }

  toggleGroup(group.name)
}

function openHoverPanel(group, event) {
  if (!isCollapsed.value || !hasChildren(group)) {
    return
  }

  const rect = event.currentTarget.getBoundingClientRect()
  const panelWidth = 224
  const panelHeight = 44 + group.children.length * 42
  const viewportPadding = 8
  const top = Math.min(
    Math.max(rect.top, viewportPadding),
    Math.max(viewportPadding, window.innerHeight - panelHeight - viewportPadding)
  )
  const left = Math.min(
    rect.right + 8,
    Math.max(viewportPadding, window.innerWidth - panelWidth - viewportPadding)
  )

  hoverGroup.value = group
  hoverPanelStyle.value = {
    left: `${Math.max(left, viewportPadding)}px`,
    top: `${top}px`,
  }
}

function onGroupEnter(group, event) {
  if (!isCollapsed.value || !hasChildren(group)) {
    return
  }

  cancelClosePanel()
  openHoverPanel(group, event)
}

function onGroupLeave() {
  if (!isCollapsed.value) {
    return
  }

  scheduleClosePanel()
}

function scheduleClosePanel() {
  cancelClosePanel()
  closeTimer = window.setTimeout(() => {
    clearHoverPanel()
  }, 140)
}

function cancelClosePanel() {
  if (closeTimer) {
    window.clearTimeout(closeTimer)
    closeTimer = null
  }
}

function clearHoverPanel() {
  hoverGroup.value = null
  hoverPanelStyle.value = {}
}

function isGroupOpen(groupName) {
  return !!expandedGroups.value[groupName]
}

function toggleGroup(groupName) {
  expandedGroups.value = {
    ...expandedGroups.value,
    [groupName]: !expandedGroups.value[groupName],
  }
}

function ensureActiveGroupExpanded() {
  if (isCollapsed.value) return

  const next = { ...expandedGroups.value }
  let changed = false

  menuTree.value.forEach((group) => {
    if (!hasChildren(group)) return
    if (!group.children.some((item) => isActive(item))) return

    if (!next[group.name]) {
      next[group.name] = true
      changed = true
    }
  })

  if (changed) {
    expandedGroups.value = next
  }
}

function selectChild(item) {
  clearHoverPanel()
  goto(item)
}

function goto(item) {
  if (item.path?.startsWith("http")) {
    window.open(item.path, "_blank", "noopener,noreferrer")
    return
  }

  router.push({ name: item.name })
}
</script>
