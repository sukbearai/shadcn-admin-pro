import { createRouter, createWebHashHistory } from "vue-router"

const map = () => import("@/views/map/index.vue")
const globe = () => import("@/views/globe/index.vue")
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: map,
    },
    {
      path: "/map",
      redirect: "/",
    },
    {
      path: "/globe",
      component: globe,
    },

    {
      path: "/:pathMatch(.*)",
      redirect: "/",
    },
  ],
})

export default router
