import { techGreenWorldSkin } from "@/views/map/skin/presets"

const globeWorldOptions = {
  rootName: "江苏省",
  geoProjectionCenter: [119.486506, 32.983991],
  geoProjectionScale: 75,
  skin: {
    world: techGreenWorldSkin,
  },
  businessProvinceNames: ["江苏省"],
  resourceNames: {
    mapJson: "jiangsu",
    mapStroke: "jiangsu",
  },
  mapFocusLabelInfo: {
    name: "江苏省",
    enName: "JIANGSU PROVINCE",
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
      name: "南京",
      enName: "NANJING",
      labelName: "南京市",
      provinceName: "江苏省",
      cityName: "南京市",
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
