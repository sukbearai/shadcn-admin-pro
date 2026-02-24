<script setup>
import { cva } from "class-variance-authority"
import { computed, useAttrs } from "vue"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "border-destructive/60 text-destructive",
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
  return cn(alertVariants({ variant: props.variant }), attrs.class)
})
</script>

<template>
  <div role="alert" v-bind="$attrs" :class="className">
    <slot />
  </div>
</template>
