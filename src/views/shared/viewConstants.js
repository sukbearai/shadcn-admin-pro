export const VIEW_IDS = Object.freeze({
  LARGE_SCREEN: "large-screen",
  MAP_CANVAS: "canvasMap",
})

export const VIEW_SELECTORS = Object.freeze({
  LARGE_SCREEN: `#${VIEW_IDS.LARGE_SCREEN}`,
  RETURN_BUTTON: ".return-btn",
  RETURN_RELATED: ".return-related",
  LOADING_TEXT_CHARS: ".loading-text span",
  LOADING_PROGRESS: ".loading-progress",
  LOADING_LAYER: ".loading",
  HEADER: ".m-header",
  TOP_MENU: ".top-menu",
  BOTTOM_TRAY: ".bottom-tray",
  BOTTOM_RADAR: ".bottom-radar",
  LEFT_CARD: ".left-card",
  RIGHT_CARD: ".right-card",
  COUNT_CARD: ".count-card",
})

export const VIEW_EVENTS = Object.freeze({
  LOAD_MAP: "loadMap",
  MAP_PLAY_COMPLETE: "mapPlayComplete",
})

export const DEFAULT_LOADING_TEXT = "LOADING"
export const DEFAULT_MENU_ACTIVE_INDEX = "1"

export const MAP_SCENE_NAMES = Object.freeze({
  MAIN: "mainScene",
  CHILD: "childScene",
})

export const MAP_RESOURCE_KEYS = Object.freeze({
  CHINA: "china",
  MAP_JSON: "mapJson",
  MAP_STROKE: "mapStroke",
})

const defaultResourceNames = Object.values(MAP_RESOURCE_KEYS).reduce((result, key) => {
  result[key] = key
  return result
}, {})

export const DEFAULT_MAP_RESOURCE_NAMES = Object.freeze(defaultResourceNames)

export const MAP_FILE_SUFFIX = Object.freeze({
  NORMAL: ".json",
  FULL: "_full.json",
})

export const REGION_NAMES = Object.freeze({
  CHINA: "中国",
  JIANGSU: "江苏省",
  NANJING: "南京",
  NANJING_CITY: "南京市",
})

export const MAP_FOCUS_LABELS = Object.freeze({
  NATIONAL_CENTER_CN: "全国分布中心",
  NATIONAL_CENTER_EN: "NATIONAL DISTRIBUTION CENTER",
  JIANGSU_EN: "JIANGSU PROVINCE",
})

export const MAP_FILE_PATHS = Object.freeze({
  CHINA: "assets/json/中华人民共和国.json",
  JIANGSU: "assets/json/江苏省.json",
  JIANGSU_STROKE: "assets/json/江苏省-轮廓.json",
  WORLD: "assets/json/world.json",
})

export const CHINA_REGION_TYPE = "country"

export const DEFAULT_CHINA_REGION_NAMES = Object.freeze([
  "china",
  "中华人民共和国",
  "中国",
  "people's republic of china",
  "people republic of china",
])

export const BOTTOM_TRAY_SVG_PATH =
  "M1 56.6105C1 31.5123 185.586 10.0503 451.904 1.35519C458.942 1.12543 465.781 4.00883 470.505 9.22964L484.991 25.2383C487.971 28.4775 492.938 30.4201 498.254 30.4201H720.142"
