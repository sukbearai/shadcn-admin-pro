<template>
  <div></div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router"

const router = useRouter()
const route = useRoute()

const targetPath = route.params.path

router.replace({ path: `/${targetPath}` })
</script>
