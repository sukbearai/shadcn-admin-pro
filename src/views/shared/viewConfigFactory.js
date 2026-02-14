import { createDashboardPanels } from "./dashboardPanels"
import { DEFAULT_LOADING_TEXT, DEFAULT_MENU_ACTIVE_INDEX, VIEW_SELECTORS } from "./viewConstants"

const DEFAULT_AUTOFIT = Object.freeze({
  dh: 1080,
  dw: 1920,
  el: VIEW_SELECTORS.LARGE_SCREEN,
  resize: true,
})

const DEFAULT_TOTAL_VIEW = Object.freeze([
  {
    icon: "xiaoshoujine",
    zh: "2025年生产总值",
    en: "Gross Domestic Product in 2025",
    value: 61500,
    unit: "亿元",
  },
  {
    icon: "zongxiaoliang",
    zh: "2025年常驻人数",
    en: "resident population in 2025",
    value: 15600,
    unit: "万人",
  },
])

function clonePanels(panels) {
  return {
    left: (panels.left || []).map((panel) => ({
      ...panel,
      ...(panel.props ? { props: { ...panel.props } } : {}),
    })),
    right: (panels.right || []).map((panel) => ({
      ...panel,
      ...(panel.props ? { props: { ...panel.props } } : {}),
    })),
  }
}

function cloneTotalView(totalView) {
  return totalView.map((item) => ({ ...item }))
}

export function createViewConfig(options = {}) {
  const {
    header = {},
    loadingText = DEFAULT_LOADING_TEXT,
    menuItems = [],
    defaultActiveIndex = DEFAULT_MENU_ACTIVE_INDEX,
    panels = createDashboardPanels(),
    totalView = DEFAULT_TOTAL_VIEW,
    bottomTray = {},
    mapScene,
    autofit = DEFAULT_AUTOFIT,
  } = options

  const baseConfig = {
    header,
    loading: {
      text: loadingText,
    },
    autofit: {
      ...DEFAULT_AUTOFIT,
      ...(autofit || {}),
    },
    menu: {
      defaultActiveIndex,
      items: [...menuItems],
    },
    totalView: cloneTotalView(totalView),
    panels: clonePanels(panels),
    bottomTray: {
      ...bottomTray,
    },
  }

  if (mapScene) {
    baseConfig.mapScene = mapScene
  }

  return baseConfig
}
