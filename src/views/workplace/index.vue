<template>
  <div class="space-y-4 p-5">
    <Card class="border-border/60 bg-card/70">
      <CardHeader class="space-y-2">
        <CardTitle>欢迎使用 GPData 架构化控制台</CardTitle>
        <CardDescription>
          这里已接入：认证鉴权、权限路由、布局体系、页签缓存与角色控制。
        </CardDescription>
      </CardHeader>

      <CardContent class="flex flex-wrap gap-2">
        <Button @click="goMap">
          <Map class="size-4" />
          进入地图大屏
        </Button>
        <Button variant="secondary" @click="goGlobe">
          <Globe class="size-4" />
          进入地球大屏（仅 admin）
        </Button>
      </CardContent>
    </Card>

    <div class="grid gap-4 md:grid-cols-3">
      <Card class="border-border/60 bg-card/60">
        <CardHeader>
          <CardDescription>当前登录用户</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-semibold">{{ userStore.name }}</p>
        </CardContent>
      </Card>

      <Card class="border-border/60 bg-card/60">
        <CardHeader>
          <CardDescription>当前角色</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge>{{ userStore.role }}</Badge>
        </CardContent>
      </Card>

      <Card class="border-border/60 bg-card/60">
        <CardHeader>
          <CardDescription>权限提示</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">
            普通用户无法访问“系统管理/地球大屏”。
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { Globe, Map } from "lucide-vue-next"
import { useRouter } from "vue-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserStore } from "@/store"

const router = useRouter()
const userStore = useUserStore()

function goMap() {
  router.push({ name: "MapScreen" })
}

function goGlobe() {
  router.push({ name: "GlobeScreen" })
}
</script>
