import { createRouter, createWebHashHistory } from "vue-router"

const map = () => import("@/views/map/index.vue")
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
      path: "/:pathMatch(.*)",
      redirect: "/",
    },
  ],
})

export default router
