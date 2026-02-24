<script setup>
import { computed, useAttrs } from "vue"
import { cn } from "@/lib/utils"

const attrs = useAttrs()

const className = computed(() => {
  return cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", attrs.class)
})
</script>

<template>
  <label v-bind="$attrs" :class="className">
    <slot />
  </label>
</template>
