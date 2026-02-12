import { createRouter, createWebHashHistory } from "vue-router"

const map = () => import("@/views/map/index.vue")
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/map",
      component: map,
    },
    {
      path: "/map",
      component: map,
    },

    {
      path: "/:pathMatch(.*)",
      redirect: "/",
    },
  ],
})

export default router
