import { useUserStore } from "@/store"
import { isLogin } from "@/utils/auth"

export default function setupUserLoginInfoGuard(router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    if (isLogin()) {
      if (userStore.role) {
        if (to.name === "login") {
          next({ name: "Workplace" })
          return
        }
        next()
      } else {
        try {
          await userStore.info()
          if (to.name === "login") {
            next({ name: "Workplace" })
            return
          }
          next()
        } catch (error) {
          await userStore.logout()
          next({
            name: "login",
            query: {
              redirect: to.fullPath,
              ...to.query,
            },
          })
        }
      }
    } else {
      if (to.meta?.requiresAuth === false || to.name === "login") {
        next()
        return
      }
      next({
        name: "login",
        query: {
          redirect: to.fullPath,
          ...to.query,
        },
      })
    }
  })
}
