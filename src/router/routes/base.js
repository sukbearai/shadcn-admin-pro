export const DEFAULT_LAYOUT = () => import("@/layout/default-layout.vue")

export const REDIRECT_MAIN = {
  path: "/redirect",
  name: "redirectWrapper",
  component: DEFAULT_LAYOUT,
  meta: {
    requiresAuth: true,
    hideInMenu: true,
    hideInTab: true,
  },
  children: [
    {
      path: "/redirect/:path(.*)",
      name: "Redirect",
      component: () => import("@/views/redirect/index.vue"),
      meta: {
        requiresAuth: true,
        hideInMenu: true,
        hideInTab: true,
      },
    },
  ],
}

export const NOT_FOUND_ROUTE = {
  path: "/:pathMatch(.*)*",
  name: "notFound",
  component: () => import("@/views/not-found/index.vue"),
  meta: {
    requiresAuth: false,
    hideInMenu: true,
    hideInTab: true,
  },
}
