import { appRoutes } from "../routes"

const appClientMenus = appRoutes.map((item) => {
  const { name, path, meta, redirect, children } = item
  return {
    name,
    path,
    meta,
    redirect,
    children,
  }
})

export default appClientMenus
