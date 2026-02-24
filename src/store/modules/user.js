import { defineStore } from "pinia"
import { setToken, clearToken } from "@/utils/auth"
import { removeRouteListener } from "@/utils/route-listener"
import useAppStore from "./app"
import useTabBarStore from "./tab-bar"

const USER_INFO_KEY = "gpdata_user_info"

const MOCK_USERS = {
  admin: {
    password: "admin",
    name: "管理员",
    role: "admin",
  },
  user: {
    password: "user",
    name: "业务用户",
    role: "user",
  },
}

function persistUserInfo(userInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

function readUserInfo() {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    return null
  }
}

function clearUserInfo() {
  localStorage.removeItem(USER_INFO_KEY)
}

const useUserStore = defineStore("user", {
  state: () => ({
    name: "",
    role: "",
  }),
  getters: {
    userInfo(state) {
      return {
        name: state.name,
        role: state.role,
      }
    },
  },
  actions: {
    setInfo(partial = {}) {
      this.name = partial.name || ""
      this.role = partial.role || ""
    },
    resetInfo() {
      this.name = ""
      this.role = ""
    },
    async info() {
      const data = readUserInfo()
      if (!data || !data.role) {
        throw new Error("登录状态无效，请重新登录")
      }
      this.setInfo(data)
      return data
    },
    async login(form) {
      const { username, password } = form
      const targetUser = MOCK_USERS[username]
      if (!targetUser || targetUser.password !== password) {
        throw new Error("账号或密码错误（可用：admin/admin 或 user/user）")
      }

      const token = `token-${targetUser.role}-${Date.now()}`
      const userInfo = {
        name: targetUser.name,
        role: targetUser.role,
      }

      setToken(token)
      persistUserInfo(userInfo)
      this.setInfo(userInfo)
      return userInfo
    },
    switchRoles() {
      const role = this.role === "user" ? "admin" : "user"
      const name = role === "admin" ? "管理员" : "业务用户"
      const userInfo = { role, name }
      persistUserInfo(userInfo)
      this.setInfo(userInfo)
      return role
    },
    logoutCallBack() {
      const appStore = useAppStore()
      const tabBarStore = useTabBarStore()

      this.resetInfo()
      clearToken()
      clearUserInfo()
      removeRouteListener()
      appStore.clearServerMenu()
      tabBarStore.resetTabList()
    },
    async logout() {
      this.logoutCallBack()
    },
  },
})

export default useUserStore
