<template>
  <div class="login-form">
    <form class="login-form__content" novalidate @submit.prevent="handleSubmit">
      <div class="login-form__field">
        <Label for="username" class="login-form__label">账号</Label>
        <div class="login-form__input-wrap">
          <User class="login-form__input-icon" />
          <Input
            id="username"
            v-model="form.username"
            class="login-form__input focus-visible:ring-0 focus-visible:ring-offset-0"
            autocomplete="username"
            placeholder="请输入账号"
          />
        </div>
      </div>

      <div class="login-form__field">
        <Label for="password" class="login-form__label">密码</Label>
        <div class="login-form__input-wrap">
          <Lock class="login-form__input-icon" />
          <Input
            id="password"
            v-model="form.password"
            class="login-form__input login-form__input--password focus-visible:ring-0 focus-visible:ring-offset-0"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="请输入密码"
          />
          <button
            type="button"
            class="login-form__password-toggle"
            :aria-label="showPassword ? '隐藏密码' : '显示密码'"
            :title="showPassword ? '隐藏密码' : '显示密码'"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="size-4" />
            <Eye v-else class="size-4" />
          </button>
        </div>
      </div>

      <div class="login-form__field">
        <Label for="captcha" class="login-form__label">验证码</Label>
        <div class="login-form__captcha-row">
          <div class="login-form__input-wrap login-form__input-wrap--captcha">
            <Shield class="login-form__input-icon" />
            <Input
              id="captcha"
              v-model="form.captcha"
              class="login-form__input focus-visible:ring-0 focus-visible:ring-offset-0"
              autocomplete="off"
              placeholder="请输入验证码"
            />
          </div>

          <button type="button" class="login-form__captcha-box" @click="refreshCaptcha">
            <span class="login-form__captcha-code">{{ captchaCode }}</span>
          </button>
        </div>
      </div>

      <Alert v-if="errorMessage" variant="destructive" class="login-form__error">
        <AlertDescription>{{ errorMessage }}</AlertDescription>
      </Alert>

      <Button
        :disabled="loading"
        type="submit"
        class="login-form__submit h-11 rounded-md bg-white text-base tracking-[0.35em] text-[#1e4d86] hover:bg-white/90"
      >
        {{ loading ? "登录中..." : "登录" }}
      </Button>

    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import { Eye, EyeOff, Lock, Shield, User } from "lucide-vue-next"
import { useRouter } from "vue-router"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserStore } from "@/store"

const CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const errorMessage = ref("")
const captchaCode = ref(createCaptcha())
const showPassword = ref(false)

const form = reactive({
  username: "admin",
  password: "admin",
  captcha: "",
})

function createCaptcha(length = 4) {
  return Array.from({ length })
    .map(() => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)])
    .join("")
}

function refreshCaptcha() {
  captchaCode.value = createCaptcha()
}

async function handleSubmit() {
  const username = String(form.username || "").trim()
  const password = String(form.password || "").trim()
  const captcha = String(form.captcha || "").trim().toUpperCase()

  if (!username || !password || !captcha || loading.value) {
    if (!username) {
      errorMessage.value = "请输入账号"
      return
    }
    if (!password) {
      errorMessage.value = "请输入密码"
      return
    }
    if (!captcha) {
      errorMessage.value = "请输入验证码"
      return
    }
    if (loading.value) {
      return
    }
    return
  }

  if (captcha !== captchaCode.value) {
    errorMessage.value = "验证码错误，请重新输入"
    form.captcha = ""
    refreshCaptcha()
    return
  }

  loading.value = true
  errorMessage.value = ""

  try {
    await userStore.login({ username, password })
    const redirect = router.currentRoute.value.query.redirect
    router.push((redirect && String(redirect)) || "/dashboard/overview")
  } catch (error) {
    errorMessage.value = error.message || "登录失败"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form {
  width: 100%;
}

.login-form__content {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.login-form__field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.login-form__label {
  color: rgba(174, 209, 244, 0.82);
  font-size: 13px;
  letter-spacing: 0.2em;
}

.login-form__input-wrap {
  position: relative;
}

.login-form__input-icon {
  position: absolute;
  top: 50%;
  left: 8px;
  z-index: 1;
  width: 16px;
  height: 16px;
  color: rgba(125, 183, 255, 0.85);
  transform: translateY(-50%);
  pointer-events: none;
}

.login-form__input {
  height: 42px;
  border: 0;
  border-bottom: 1px solid rgba(85, 149, 231, 0.85);
  border-radius: 0;
  background: transparent;
  padding-right: 0;
  padding-left: 34px;
  color: #d8edff;
  font-size: 15px;
}

.login-form__input::placeholder {
  color: rgba(146, 181, 225, 0.65);
}

.login-form__input--password {
  padding-right: 38px;
}

.login-form__password-toggle {
  position: absolute;
  top: 50%;
  right: 0;
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: rgba(152, 193, 240, 0.76);
  transform: translateY(-50%);
  cursor: pointer;
}

.login-form__password-toggle:hover {
  color: rgba(186, 221, 255, 0.95);
}

.login-form__captcha-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.login-form__input-wrap--captcha {
  flex: 1;
}

.login-form__captcha-box {
  position: relative;
  width: 118px;
  height: 42px;
  border: 1px solid rgba(180, 198, 217, 0.9);
  border-radius: 4px;
  background: #f6f8fb;
  color: #3c6ea7;
  cursor: pointer;
  overflow: hidden;
}

.login-form__captcha-box::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
      40deg,
      rgba(87, 121, 161, 0.1) 0%,
      rgba(87, 121, 161, 0.1) 40%,
      transparent 40%,
      transparent 60%,
      rgba(87, 121, 161, 0.12) 60%
    ),
    linear-gradient(120deg, rgba(87, 121, 161, 0.05), rgba(87, 121, 161, 0.15));
}

.login-form__captcha-code {
  position: relative;
  z-index: 1;
  font-family: "D-DIN-Bold", "AlibabaPuHuiTi", sans-serif;
  font-size: 29px;
  letter-spacing: 0.09em;
  line-height: 42px;
  transform: skewX(-10deg);
}

.login-form__error {
  border-color: rgba(245, 95, 95, 0.5);
  background: rgba(86, 16, 16, 0.45);
  padding: 9px 12px;
}

.login-form__submit {
  margin-top: 4px;
}

@media (max-width: 768px) {
  .login-form__captcha-box {
    width: 106px;
  }
}
</style>
