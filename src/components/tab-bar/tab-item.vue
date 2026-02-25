<template>
  <Button
    :variant="isActive ? 'default' : 'ghost'"
    size="sm"
    :class="[
      'h-8 rounded-full border px-3',
      isActive
        ? 'border-primary/70 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
        : 'border-border/60 text-muted-foreground hover:border-border hover:bg-accent/60 hover:text-foreground',
    ]"
    @click="goto(itemData)"
  >
    <span class="max-w-[160px] truncate">{{ itemData.title || itemData.name }}</span>
    <span
      v-if="index > 0"
      class="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
      @click.stop="tagClose(itemData, index)"
    >
      <X class="size-3" />
    </span>
  </Button>
</template>

<script setup>
import { computed } from "vue"
import { X } from "lucide-vue-next"
import { useRoute, useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import { useTabBarStore } from "@/store"

const props = defineProps({
  itemData: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
})

const router = useRouter()
const route = useRoute()
const tabBarStore = useTabBarStore()

const tagList = computed(() => tabBarStore.getTabList)
const isActive = computed(() => props.itemData.fullPath === route.fullPath)

function goto(tag) {
  router.push({ name: tag.name, query: tag.query })
}

function tagClose(tag, idx) {
  tabBarStore.deleteTag(idx, tag)

  if (tag.fullPath === route.fullPath) {
    const latest = tagList.value[idx - 1]
    router.push({ name: latest.name, query: latest.query })
  }
}
</script>
