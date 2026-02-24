import { DEFAULT_LAYOUT } from "../base"

const SYSTEM = {
  path: "/system",
  name: "system",
  component: DEFAULT_LAYOUT,
  meta: {
    title: "系统管理",
    requiresAuth: true,
    order: 2,
  },
  children: [
    {
      path: "users",
      name: "SystemUsers",
      component: () => import("@/views/system/users.vue"),
      meta: {
        title: "用户管理",
        requiresAuth: true,
        roles: ["admin"],
      },
    },
  ],
}

export default SYSTEM
