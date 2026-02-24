import { useUserStore } from "@/store"

function checkPermission(el, binding) {
  const { value } = binding
  const userStore = useUserStore()
  const role = userStore.role

  if (Array.isArray(value) && value.length > 0) {
    const hasPermission = value.includes(role)
    if (!hasPermission && el.parentNode) {
      el.parentNode.removeChild(el)
    }
    return
  }

  throw new Error("need roles! Like v-permission=\"['admin','user']\"")
}

export default {
  mounted(el, binding) {
    checkPermission(el, binding)
  },
  updated(el, binding) {
    checkPermission(el, binding)
  },
}
