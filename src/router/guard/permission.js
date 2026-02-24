import usePermission from "@/hooks/permission"
import { useUserStore } from "@/store"
import { appRoutes } from "../routes"
import { NOT_FOUND } from "../constants"

export default function setupPermissionGuard(router) {
  router.beforeEach((to, from, next) => {
    const permission = usePermission()
    const userStore = useUserStore()

    const allow = permission.accessRouter(to)
    if (allow) {
      next()
      return
    }

    if (to.meta?.requiresAuth) {
      if (userStore.role) {
        const destination =
          permission.findFirstPermissionRoute(appRoutes, userStore.role) || {
            name: "403",
          }
        next(destination)
        return
      }
    }

    next(NOT_FOUND)
  })
}
