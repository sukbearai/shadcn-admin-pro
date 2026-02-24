<template>
  <header class="h-14 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
    <div class="flex h-full items-center justify-between px-4">
      <div class="leading-tight">
        <p class="text-sm font-semibold tracking-wide">GPData Console</p>
        <p class="hidden text-xs text-muted-foreground sm:block">权限控制台</p>
      </div>

      <div class="flex items-center gap-2">
        <Badge variant="secondary" class="hidden md:inline-flex">
          {{ userStore.name || "未登录" }}
        </Badge>
        <Badge variant="outline" class="hidden lg:inline-flex">
          {{ userStore.role || "-" }}
        </Badge>

        <Button variant="ghost" size="sm" class="hidden sm:inline-flex" @click="goMap">
          <Map class="size-4" />
          地图
        </Button>

        <Button variant="ghost" size="sm" class="hidden sm:inline-flex" @click="goGlobe">
          <Globe class="size-4" />
          地球
        </Button>

        <Button variant="secondary" size="sm" @click="switchRole">
          <RefreshCcw class="size-4" />
          切换角色
        </Button>

        <Button variant="outline" size="sm" @click="handleLogout">
          <LogOut class="size-4" />
          退出
        </Button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Globe, LogOut, Map, RefreshCcw } from "lucide-vue-next"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUserStore } from "@/store"

const router = useRouter()
const userStore = useUserStore()

function goMap() {
  router.push({ name: "MapScreen" })
}

function goGlobe() {
  router.push({ name: "GlobeScreen" })
}

function switchRole() {
  userStore.switchRoles()
}

async function handleLogout() {
  await userStore.logout()
  router.push({
    name: "login",
    query: {
      redirect: router.currentRoute.value.fullPath,
    },
  })
}
</script>
