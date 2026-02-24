<script setup>
import { cva } from "class-variance-authority"
import { computed, useAttrs } from "vue"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const props = defineProps({
  variant: {
    type: String,
    default: "default",
  },
})

const attrs = useAttrs()

const className = computed(() => {
  return cn(badgeVariants({ variant: props.variant }), attrs.class)
})
</script>

<template>
  <div v-bind="$attrs" :class="className">
    <slot />
  </div>
</template>
