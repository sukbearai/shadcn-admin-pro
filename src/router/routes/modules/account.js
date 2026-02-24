import { DEFAULT_LAYOUT } from "../base"

const ACCOUNT = {
  path: "/account",
  name: "account",
  component: DEFAULT_LAYOUT,
  meta: {
    title: "个人中心",
    requiresAuth: true,
    order: 3,
  },
  children: [
    {
      path: "profile",
      name: "AccountProfile",
      component: () => import("@/views/account/profile.vue"),
      meta: {
        title: "我的信息",
        requiresAuth: true,
        roles: ["*"],
      },
    },
  ],
}

export default ACCOUNT
