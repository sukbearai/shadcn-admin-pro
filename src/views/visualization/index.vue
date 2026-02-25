<template>
  <div class="space-y-4 p-5">
    <Card class="border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle>可视化大屏</CardTitle>
        <CardDescription>点击缩略图进入对应大屏。</CardDescription>
      </CardHeader>
    </Card>

    <div class="grid gap-5 lg:grid-cols-2">
      <Card
        v-for="screen in screenList"
        :key="screen.id"
        class="overflow-hidden border-border/60 bg-card/70 transition hover:shadow-md"
      >
        <button
          class="group block w-full text-left"
          :class="!hasAccess(screen) ? 'cursor-not-allowed' : 'cursor-pointer'"
          :disabled="!hasAccess(screen)"
          @click="openScreen(screen)"
        >
          <div class="relative overflow-hidden">
            <img
              :src="screen.image"
              :alt="screen.title"
              class="h-auto w-full transition duration-300 group-hover:scale-[1.02]"
            />
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
              <p class="text-sm font-semibold text-white">{{ screen.title }}</p>
            </div>
          </div>

          <CardContent class="flex items-center justify-between pt-4">
            <Badge :variant="hasAccess(screen) ? 'secondary' : 'outline'">
              {{ hasAccess(screen) ? "可访问" : "仅管理员" }}
            </Badge>
            <span class="text-sm text-muted-foreground">
              {{ hasAccess(screen) ? "点击进入大屏" : "当前账号无权限" }}
            </span>
          </CardContent>
        </button>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import thumbnail001 from "@/assets/images/screencapture-001.png"
import thumbnail002 from "@/assets/images/screencapture-002.png"
import { useUserStore } from "@/store"

const router = useRouter()
const userStore = useUserStore()

const screenList = [
  {
    id: "001",
    title: "网络边界威胁感知",
    routeName: "MapScreen",
    image: thumbnail001,
    roles: ["*"],
  },
  {
    id: "002",
    title: "恶意代码预警通报管理平台",
    routeName: "GlobeScreen",
    image: thumbnail002,
    roles: ["admin"],
  },
]

function hasAccess(screen) {
  return (
    !screen.roles ||
    screen.roles.includes("*") ||
    screen.roles.includes(userStore.role)
  )
}

function openScreen(screen) {
  if (!hasAccess(screen)) {
    return
  }

  router.push({ name: screen.routeName })
}
</script>
