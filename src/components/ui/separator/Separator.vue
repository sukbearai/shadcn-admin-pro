<script setup>
import { computed, useAttrs } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps({
  orientation: {
    type: String,
    default: "horizontal",
  },
})

const attrs = useAttrs()

const className = computed(() => {
  return cn(
    "shrink-0 bg-border",
    props.orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
    attrs.class
  )
})
</script>

<template>
  <div role="none" v-bind="$attrs" :class="className" />
</template>
