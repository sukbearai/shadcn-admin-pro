const modules = import.meta.glob("./modules/*.js", { eager: true })

function formatModules(rawModules, result = []) {
  Object.keys(rawModules).forEach((key) => {
    const mod = rawModules[key].default
    if (!mod) return
    const routeList = Array.isArray(mod) ? [...mod] : [mod]
    result.push(...routeList)
  })
  return result
}

export const appRoutes = formatModules(modules, [])
