<template>
  <div class="login-page">
    <div class="login-page__bg" :style="{ backgroundImage: `url(${loginBg})` }"></div>
    <div class="login-page__overlay"></div>
    <div class="login-page__panel-mask"></div>

    <section class="login-page__panel">
      <header class="login-page__brand">
        <img :src="logo" alt="平台标识" class="login-page__logo" />
        <h1 class="login-page__title">恶意代码预警通报管理平台</h1>
      </header>

      <LoginForm class="login-page__form" />

      <p class="login-page__copyright">版权所有 © 江苏政采数据科技有限公司</p>
    </section>
  </div>
</template>

<script setup>
import loginBg from "@/assets/images/login-bg.png"
import logo from "@/assets/images/logo.png"
import LoginForm from "./components/LoginForm.vue"
</script>

<style scoped>
.login-page {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  color: #d7ebff;
}

.login-page__bg {
  position: absolute;
  inset: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.login-page__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(3, 30, 78, 0.18), rgba(1, 16, 43, 0.38));
}

.login-page__panel-mask {
  position: absolute;
  top: 0;
  right: 0;
  width: min(30vw, 480px);
  min-width: 360px;
  height: 100%;
  border-left: 1px solid rgba(78, 146, 233, 0.35);
  background: linear-gradient(180deg, rgba(2, 10, 31, 0.8) 0%, rgba(4, 20, 60, 0.78) 100%);
  backdrop-filter: blur(2px);
}

.login-page__panel {
  position: absolute;
  inset: 0 0 0 auto;
  z-index: 3;
  display: flex;
  width: min(30vw, 480px);
  min-width: 360px;
  flex-direction: column;
  align-items: center;
  padding: 168px 38px 20px;
}

.login-page__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.login-page__logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.login-page__title {
  margin: 0;
  border-bottom: 1px solid rgba(94, 157, 238, 0.6);
  padding: 0 6px 8px;
  color: #c5e4ff;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-align: center;
}

.login-page__form {
  margin-top: 44px;
}

.login-page__copyright {
  margin-top: auto;
  color: rgba(176, 204, 239, 0.56);
  font-size: 12px;
}

@media (max-width: 1024px) {
  .login-page__panel-mask,
  .login-page__panel {
    width: min(42vw, 460px);
  }
}

@media (max-width: 768px) {
  .login-page__panel-mask,
  .login-page__panel {
    width: 100%;
    min-width: 0;
  }

  .login-page__panel {
    padding: 88px 24px 20px;
    background: linear-gradient(180deg, rgba(2, 12, 36, 0.2) 0%, rgba(2, 10, 31, 0.82) 40%);
  }

  .login-page__title {
    font-size: 20px;
  }
}
</style>
