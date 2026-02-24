<template>
  <div
    class="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,0.32),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.2),transparent_26%),linear-gradient(135deg,#061224,#0b2142_60%,#0f2e57)] px-4"
  >
    <Card class="w-full max-w-md border-border/60 bg-card/90 shadow-2xl backdrop-blur">
      <CardHeader class="space-y-2">
        <CardTitle>GPData 权限控制台</CardTitle>
        <CardDescription>登录后可按角色访问不同页面与功能</CardDescription>
      </CardHeader>

      <CardContent>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="username">用户名</Label>
            <Input
              id="username"
              v-model="form.username"
              autocomplete="username"
              placeholder="admin 或 user"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">密码</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="admin 或 user"
            />
          </div>

          <Alert v-if="errorMessage" variant="destructive">
            <AlertDescription>{{ errorMessage }}</AlertDescription>
          </Alert>

          <Button :disabled="loading" class="w-full" type="submit">
            {{ loading ? "登录中..." : "登录" }}
          </Button>
        </form>
      </CardContent>

      <CardFooter class="text-xs text-muted-foreground">
        测试账号：admin/admin（管理员）或 user/user（普通用户）
      </CardFooter>
    </Card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserStore } from "@/store"

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const errorMessage = ref("")

const form = reactive({
  username: "admin",
  password: "admin",
})

async function handleSubmit() {
  const username = String(form.username || "").trim()
  const password = String(form.password || "").trim()

  if (!username || !password || loading.value) {
    return
  }

  loading.value = true
  errorMessage.value = ""

  try {
    await userStore.login({ username, password })
    const redirect = router.currentRoute.value.query.redirect
    router.push((redirect && String(redirect)) || "/dashboard/workplace")
  } catch (error) {
    errorMessage.value = error.message || "登录失败"
  } finally {
    loading.value = false
  }
}
</script>
