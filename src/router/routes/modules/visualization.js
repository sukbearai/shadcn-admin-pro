import { DEFAULT_LAYOUT } from "../base"

const VISUALIZATION = {
  path: "/visualization",
  name: "visualization",
  component: DEFAULT_LAYOUT,
  redirect: "/visualization/map",
  meta: {
    title: "可视化场景",
    requiresAuth: true,
    order: 1,
  },
  children: [
    {
      path: "map",
      name: "MapScreen",
      component: () => import("@/views/map/index.vue"),
      meta: {
        title: "中国地图大屏",
        requiresAuth: true,
        roles: ["*"],
        hideLayout: true,
        ignoreCache: true,
      },
    },
    {
      path: "globe",
      name: "GlobeScreen",
      component: () => import("@/views/globe/index.vue"),
      meta: {
        title: "地球飞线大屏",
        requiresAuth: true,
        roles: ["admin"],
        hideLayout: true,
        ignoreCache: true,
      },
    },
  ],
}

export default VISUALIZATION
