import { createViewConfig } from "../../shared/viewConfigFactory"
import {
  MAP_FILE_PATHS,
  MAP_FOCUS_LABELS,
  MAP_RESOURCE_KEYS,
  REGION_NAMES,
} from "../../shared/viewConstants"
import { techGreenWorldSkin } from "./skin/presets"

const chinaMapFiles = {
  [MAP_RESOURCE_KEYS.CHINA]: MAP_FILE_PATHS.CHINA,
  [MAP_RESOURCE_KEYS.MAP_JSON]: MAP_FILE_PATHS.CHINA,
  [MAP_RESOURCE_KEYS.MAP_STROKE]: MAP_FILE_PATHS.CHINA,
}

export const mapViewConfig = createViewConfig({
  header: {
    title: "网络边界威胁感知",
    subText: "Network Boundary Threat Perception",
  },
  bottomTray: {
    returnLabel: "返回上级",
  },
  mapScene: {
    skin: {
      // 仅覆盖需要替换的皮肤字段，完整结构见 src/views/visualization/map/skin/index.js
      assets: {
        mapFiles: chinaMapFiles,
      },
      world: techGreenWorldSkin,
    },
    worldOptions: {
      rootName: REGION_NAMES.CHINA,
      showOtherProvinceLabels: true,
      showMainRegionLabels: false,
      showProvinceBars: true,
      showChinaBaseMap: true,
      showChinaBlurLine: true,
      childMapScaleMultiplier: 1,
      mapFocusLabelInfo: {
        name: MAP_FOCUS_LABELS.NATIONAL_CENTER_CN,
        enName: MAP_FOCUS_LABELS.NATIONAL_CENTER_EN,
        center: [106, 20],
      },
    },
  },
})
