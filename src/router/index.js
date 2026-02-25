import { createRouter, createWebHashHistory } from "vue-router"
import { appRoutes } from "./routes"
import { REDIRECT_MAIN, NOT_FOUND_ROUTE } from "./routes/base"
import createRouteGuard from "./guard"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard/overview",
      meta: {
        requiresAuth: true,
        hideInMenu: true,
        hideInTab: true,
      },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/login/index.vue"),
      meta: {
        requiresAuth: false,
        hideInMenu: true,
        hideInTab: true,
      },
    },
    {
      path: "/403",
      name: "403",
      component: () => import("@/views/exception/403.vue"),
      meta: {
        requiresAuth: true,
        hideInMenu: true,
        hideInTab: true,
      },
    },
    ...appRoutes,
    REDIRECT_MAIN,
    NOT_FOUND_ROUTE,
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

createRouteGuard(router)

export default router
