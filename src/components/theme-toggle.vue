<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        :size="showLabel ? 'sm' : 'icon'"
        class="gap-2"
      >
        <component :is="currentIcon" class="size-4" />
        <span v-if="showLabel">{{ currentLabel }}</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-36">
      <DropdownMenuRadioGroup :model-value="currentTheme" @update:model-value="handleThemeChange">
        <DropdownMenuRadioItem :value="THEME_LIGHT">
          浅色
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem :value="THEME_DARK">
          深色
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem :value="THEME_SYSTEM">
          跟随系统
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { Monitor, Moon, Sun } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  THEME_CHANGE_EVENT,
  THEME_DARK,
  THEME_LIGHT,
  THEME_SYSTEM,
  getStoredTheme,
  resolveTheme,
  setTheme,
} from "@/utils/theme"

defineProps({
  showLabel: {
    type: Boolean,
    default: false,
  },
})

const currentTheme = ref(getStoredTheme())

const currentLabel = computed(() => {
  if (currentTheme.value === THEME_LIGHT) {
    return "浅色"
  }

  if (currentTheme.value === THEME_DARK) {
    return "深色"
  }

  return "系统"
})

const currentIcon = computed(() => {
  if (currentTheme.value === THEME_SYSTEM) {
    return Monitor
  }

  return resolveTheme(currentTheme.value) === THEME_DARK ? Moon : Sun
})

function handleThemeChange(nextTheme) {
  currentTheme.value = setTheme(nextTheme)
}

function syncTheme(event) {
  const preferredTheme = event?.detail?.preferredTheme
  currentTheme.value = preferredTheme || getStoredTheme()
}

onMounted(() => {
  window.addEventListener(THEME_CHANGE_EVENT, syncTheme)
})

onBeforeUnmount(() => {
  window.removeEventListener(THEME_CHANGE_EVENT, syncTheme)
})
</script>
