import { DEFAULT_LAYOUT } from "../base"

const VISUALIZATION = {
  path: "/visualization",
  name: "visualization",
  component: DEFAULT_LAYOUT,
  redirect: "/visualization/screens",
  meta: {
    title: "可视化大屏",
    requiresAuth: true,
    order: 1,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: "screens",
      name: "VisualizationScreens",
      component: () => import("@/views/visualization/index.vue"),
      meta: {
        title: "可视化大屏",
        requiresAuth: true,
        roles: ["*"],
        hideInMenu: true,
      },
    },
    {
      path: "map",
      name: "MapScreen",
      component: () => import("@/views/visualization/map/index.vue"),
      meta: {
        title: "中国地图大屏",
        requiresAuth: true,
        roles: ["*"],
        hideLayout: true,
        hideInMenu: true,
        hideInTab: true,
        ignoreCache: true,
      },
    },
    {
      path: "globe",
      name: "GlobeScreen",
      component: () => import("@/views/visualization/globe/index.vue"),
      meta: {
        title: "地球飞线大屏",
        requiresAuth: true,
        roles: ["admin"],
        hideLayout: true,
        hideInMenu: true,
        hideInTab: true,
        ignoreCache: true,
      },
    },
  ],
}

export default VISUALIZATION
