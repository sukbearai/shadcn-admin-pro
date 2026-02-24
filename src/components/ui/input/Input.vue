<script setup>
import { computed, useAttrs } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
})

const emit = defineEmits(["update:modelValue"])
const attrs = useAttrs()

const delegatedAttrs = computed(() => {
  const { class: _class, ...delegated } = attrs
  return delegated
})

const className = computed(() => {
  return cn(
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    attrs.class
  )
})

function onInput(event) {
  emit("update:modelValue", event.target.value)
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    v-bind="delegatedAttrs"
    :class="className"
    @input="onInput"
  />
</template>
