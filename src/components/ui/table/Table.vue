<template>
  <div class="relative w-full overflow-auto">
    <table class="w-full caption-bottom text-sm" v-bind="$attrs">
      <slot />
    </table>
  </div>
</template>
