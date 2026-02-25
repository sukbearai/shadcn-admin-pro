<template>
  <div class="grid h-full place-items-center bg-background p-6">
    <Card class="w-full max-w-lg border-border/60 bg-card/75 text-center">
      <CardHeader>
        <CardTitle class="text-6xl">403</CardTitle>
        <CardDescription>你当前角色无权限访问此页面</CardDescription>
      </CardHeader>
      <CardContent>
        <Button @click="goHome">返回概览</Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const router = useRouter()

function goHome() {
  router.push({ name: "Workplace" })
}
</script>
