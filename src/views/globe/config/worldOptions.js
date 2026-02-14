import { techGreenWorldSkin } from "@/views/map/skin/presets"
import { MAP_FOCUS_LABELS, MAP_RESOURCE_KEYS, REGION_NAMES } from "@/views/shared/viewConstants"

const globeWorldOptions = {
  rootName: REGION_NAMES.JIANGSU,
  geoProjectionCenter: [119.486506, 32.983991],
  geoProjectionScale: 75,
  skin: {
    world: techGreenWorldSkin,
  },
  businessProvinceNames: [REGION_NAMES.JIANGSU],
  resourceNames: {
    [MAP_RESOURCE_KEYS.MAP_JSON]: "jiangsu",
    [MAP_RESOURCE_KEYS.MAP_STROKE]: "jiangsu",
  },
  mapFocusLabelInfo: {
    name: REGION_NAMES.JIANGSU,
    enName: MAP_FOCUS_LABELS.JIANGSU_EN,
    center: [119.486506, 29.8],
  },
  initialCameraPosition: [-12.8, 12.2, 27.8],
  mainCameraState: {
    position: [-0.17427287762525134, 10.6, 15.2],
    target: [0, 0, 0],
  },
  childCameraState: {
    position: [-0.35, 12.2, 15.8],
    target: [0, 0, 0],
  },
  marketingCenters: [
    {
      id: "nanjing",
      name: REGION_NAMES.NANJING,
      enName: "NANJING",
      labelName: REGION_NAMES.NANJING_CITY,
      provinceName: REGION_NAMES.JIANGSU,
      cityName: REGION_NAMES.NANJING_CITY,
      lng: 118.767413,
      lat: 32.041544,
      value: 168,
    },
  ],
  flyLineCenterId: "nanjing",
  showOtherProvinceLabels: false,
  showMainRegionLabels: true,
  childMapScaleMultiplier: 1.6,
  showChinaBaseMap: false,
  showChinaBlurLine: false,
  cloudLayer: {
    enabled: false,
    textureName: "cloudLayer",
    secondaryTextureName: "cloudLayer",
    opacity: 0.55,
    height: 0.78,
    sizeScale: 1.2,
    speedX: 0.0014,
    speedY: 0.0008,
    dualLayer: true,
    childSceneVisible: false,
  },
}

export default globeWorldOptions
