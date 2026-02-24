import { useUserStore } from "@/store"

export default function usePermission() {
  const userStore = useUserStore()

  return {
    accessRouter(route) {
      return (
        !route.meta?.requiresAuth ||
        !route.meta?.roles ||
        route.meta.roles.includes("*") ||
        route.meta.roles.includes(userStore.role)
      )
    },
    findFirstPermissionRoute(routes, role = "admin") {
      const routeList = [...routes]
      while (routeList.length) {
        const current = routeList.shift()
        if (
          current?.meta?.roles?.some(
            (item) => item === "*" || item === role
          )
        ) {
          return { name: current.name }
        }
        if (current?.children?.length) {
          routeList.push(...current.children)
        }
      }
      return null
    },
  }
}
