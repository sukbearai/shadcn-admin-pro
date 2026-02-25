import { defineStore } from "pinia"
import {
  DEFAULT_ROUTE,
  DEFAULT_ROUTE_NAME,
  REDIRECT_ROUTE_NAME,
} from "@/router/constants"

function formatTag(route) {
  const { name, meta, fullPath, query } = route
  return {
    title: meta?.title || "",
    name: String(name),
    fullPath,
    query,
    ignoreCache: meta?.ignoreCache,
  }
}

function uniquePush(list, value) {
  if (!list.includes(value)) {
    list.push(value)
  }
}

const useTabBarStore = defineStore("tabBar", {
  state: () => ({
    cacheTabList: [DEFAULT_ROUTE_NAME],
    tagList: [DEFAULT_ROUTE],
  }),
  getters: {
    getTabList(state) {
      return state.tagList
    },
    getCacheList(state) {
      return state.cacheTabList
    },
  },
  actions: {
    updateTabList(route) {
      if (!route?.name || route.name === REDIRECT_ROUTE_NAME || route.meta?.hideInTab) {
        return
      }

      const exists = this.tagList.some((item) => item.fullPath === route.fullPath)
      if (exists) {
        return
      }

      this.tagList.push(formatTag(route))
      if (!route.meta?.ignoreCache) {
        uniquePush(this.cacheTabList, route.name)
      }
    },
    deleteTag(idx, tag) {
      this.tagList.splice(idx, 1)
      this.cacheTabList = this.cacheTabList.filter((item) => item !== tag.name)
    },
    addCache(name) {
      if (typeof name === "string" && name) {
        uniquePush(this.cacheTabList, name)
      }
    },
    deleteCache(tag) {
      this.cacheTabList = this.cacheTabList.filter((item) => item !== tag.name)
    },
    freshTabList(tags) {
      this.tagList = tags
      this.cacheTabList = []
      this.tagList
        .filter((item) => !item.ignoreCache)
        .map((item) => item.name)
        .forEach((name) => uniquePush(this.cacheTabList, name))
    },
    resetTabList() {
      this.tagList = [DEFAULT_ROUTE]
      this.cacheTabList = [DEFAULT_ROUTE_NAME]
    },
  },
})

export default useTabBarStore
