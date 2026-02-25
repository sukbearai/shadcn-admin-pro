import { DEFAULT_LAYOUT } from "../base"

const DASHBOARD = {
  path: "/dashboard",
  name: "dashboard",
  component: DEFAULT_LAYOUT,
  redirect: "/dashboard/overview",
  meta: {
    title: "概览",
    requiresAuth: true,
    order: 0,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: "workplace",
      name: "WorkplaceLegacy",
      redirect: "/dashboard/overview",
      meta: {
        requiresAuth: true,
        hideInMenu: true,
        hideInTab: true,
      },
    },
    {
      path: "overview",
      name: "Workplace",
      component: () => import("@/views/workplace/index.vue"),
      meta: {
        title: "概览",
        requiresAuth: true,
        roles: ["*"],
      },
    },
  ],
}

export default DASHBOARD
