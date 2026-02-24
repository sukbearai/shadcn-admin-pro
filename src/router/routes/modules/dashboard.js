import { DEFAULT_LAYOUT } from "../base"

const DASHBOARD = {
  path: "/dashboard",
  name: "dashboard",
  component: DEFAULT_LAYOUT,
  redirect: "/dashboard/workplace",
  meta: {
    title: "仪表盘",
    requiresAuth: true,
    order: 0,
  },
  children: [
    {
      path: "workplace",
      name: "Workplace",
      component: () => import("@/views/workplace/index.vue"),
      meta: {
        title: "工作台",
        requiresAuth: true,
        roles: ["*"],
      },
    },
  ],
}

export default DASHBOARD
