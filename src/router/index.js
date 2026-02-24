import { createRouter, createWebHashHistory } from "vue-router"
import { appRoutes } from "./routes"
import { REDIRECT_MAIN, NOT_FOUND_ROUTE } from "./routes/base"
import createRouteGuard from "./guard"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard/workplace",
      meta: {
        requiresAuth: true,
        hideInMenu: true,
      },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/login/index.vue"),
      meta: {
        requiresAuth: false,
        hideInMenu: true,
      },
    },
    {
      path: "/403",
      name: "403",
      component: () => import("@/views/exception/403.vue"),
      meta: {
        requiresAuth: true,
        hideInMenu: true,
      },
    },
    {
      path: "/map",
      redirect: "/visualization/map",
      meta: {
        requiresAuth: true,
        hideInMenu: true,
      },
    },
    {
      path: "/globe",
      redirect: "/visualization/globe",
      meta: {
        requiresAuth: true,
        hideInMenu: true,
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
