import { computed } from "vue"
import usePermission from "@/hooks/permission"
import { useAppStore } from "@/store"
import appClientMenus from "@/router/app-menus"

function cloneRoutes(routes = []) {
  return routes.map((item) => ({
    ...item,
    meta: { ...(item.meta || {}) },
    children: cloneRoutes(item.children || []),
  }))
}

export default function useMenuTree() {
  const permission = usePermission()
  const appStore = useAppStore()

  const appRoute = computed(() => {
    if (appStore.menuFromServer) {
      return appStore.appAsyncMenus
    }
    return appClientMenus
  })

  const menuTree = computed(() => {
    const routes = cloneRoutes(appRoute.value)

    routes.sort((a, b) => (a.meta?.order || 0) - (b.meta?.order || 0))

    function travel(routeList, layer = 0) {
      if (!routeList?.length) return []

      return routeList
        .map((item) => {
          if (!permission.accessRouter(item)) {
            return null
          }

          if (item.meta?.hideChildrenInMenu || !item.children?.length) {
            item.children = []
            return item
          }

          item.children = item.children.filter(
            (child) => child.meta?.hideInMenu !== true
          )

          const subMenus = travel(item.children, layer + 1)

          if (subMenus.length) {
            item.children = subMenus
            return item
          }

          if (layer > 0) {
            item.children = []
            return item
          }

          if (item.meta?.hideInMenu === false) {
            return item
          }

          return null
        })
        .filter(Boolean)
    }

    return travel(routes, 0)
  })

  return {
    menuTree,
  }
}
