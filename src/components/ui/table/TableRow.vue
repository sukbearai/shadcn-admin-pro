<template>
  <tr class="border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted" v-bind="$attrs">
    <slot />
  </tr>
</template>
