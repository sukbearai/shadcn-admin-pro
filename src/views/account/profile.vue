<template>
  <div class="p-5">
    <Card class="max-w-xl border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle>个人信息</CardTitle>
        <CardDescription>当前登录账号信息</CardDescription>
      </CardHeader>

      <CardContent class="space-y-3">
        <div class="rounded-lg border border-border/70 bg-background/40 p-3">
          <div class="text-xs text-muted-foreground">用户名</div>
          <div class="mt-1 text-lg font-medium">{{ userStore.name }}</div>
        </div>

        <div class="rounded-lg border border-border/70 bg-background/40 p-3">
          <div class="text-xs text-muted-foreground">角色</div>
          <div class="mt-1">
            <Badge>{{ userStore.role }}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserStore } from "@/store"

const userStore = useUserStore()
</script>
