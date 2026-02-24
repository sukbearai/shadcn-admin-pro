import { defineStore } from "pinia"
import defaultSettings from "@/config/settings"

const useAppStore = defineStore("app", {
  state: () => ({ ...defaultSettings }),
  getters: {
    appAsyncMenus(state) {
      return state.serverMenu || []
    },
  },
  actions: {
    updateSettings(partial) {
      this.$patch(partial)
    },
    toggleDevice(device) {
      this.device = device
    },
    toggleMenu(value) {
      this.hideMenu = value
    },
    clearServerMenu() {
      this.serverMenu = []
    },
  },
})

export default useAppStore
