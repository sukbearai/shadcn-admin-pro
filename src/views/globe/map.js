import {
  Fog,
  Group,
  MeshBasicMaterial,
  DirectionalLight,
  AmbientLight,
  PointLight,
  Vector3,
  MeshLambertMaterial,
  LineBasicMaterial,
  Color,
  MeshStandardMaterial,
  PlaneGeometry,
  Mesh,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
  AdditiveBlending,
  NormalBlending,
  VideoTexture,
  NearestFilter,
  BoxGeometry,
  TubeGeometry,
  QuadraticBezierCurve3,
  PointsMaterial,
  Sprite,
  SpriteMaterial,
  CustomBlending,
  AddEquation,
  DstColorFactor,
  OneFactor,
} from "three"
import {
  Mini3d,
  ExtrudeMap,
  BaseMap,
  Line,
  Grid,
  Label3d,
  Plane,
  Particles,
  GradientShader,
  DiffuseShader,
  Focus,
  createHistory,
  getBoundBox,
} from "@/mini3d"

import { geoMercator } from "d3-geo"
import labelIcon from "@/assets/texture/label-icon.png"
import marketingCenters, { FLYLINE_CENTER_ID } from "./map/marketingCenters"
import scatterData from "./map/scatter"
import infoData from "./map/infoData"
import gsap from "gsap"
import emitter from "@/utils/emitter"
import { InteractionManager } from "three.interactive"
import { ChildMap } from "./map/childMap"
import { createMapSkin } from "../map/skin"
function sortByValue(data) {
  data.sort((a, b) => b.value - a.value)
  return data
}

const integerFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
})

function toNumber(value, defaultValue = 0) {
  const numeric =
    typeof value === "number"
      ? value
      : Number(
          `${value ?? ""}`
            .trim()
            .replace(/,/g, "")
        )
  return Number.isFinite(numeric) ? numeric : defaultValue
}

function formatInteger(value) {
  return integerFormatter.format(Math.round(toNumber(value, 0)))
}

function resolveChildMapSuffix(childrenNum) {
  return childrenNum === 0 ? ".json" : "_full.json"
}

function resolveVector3State(value, fallback) {
  if (value instanceof Vector3) {
    return value.clone()
  }
  if (Array.isArray(value) && value.length === 3) {
    return new Vector3(toNumber(value[0], fallback.x), toNumber(value[1], fallback.y), toNumber(value[2], fallback.z))
  }
  if (value && typeof value === "object") {
    return new Vector3(
      toNumber(value.x, fallback.x),
      toNumber(value.y, fallback.y),
      toNumber(value.z, fallback.z)
    )
  }
  return fallback.clone()
}

function resolveTuple(value, fallback = []) {
  if (Array.isArray(value) && value.length === fallback.length) {
    return value.map((item, index) => toNumber(item, fallback[index]))
  }
  return [...fallback]
}

function resolveCloudLayerConfig(config, depth) {
  const defaultConfig = {
    enabled: true,
    textureName: "cloudLayer",
    secondaryTextureName: "cloudLayer",
    opacity: 0.55,
    height: depth + 0.28,
    sizeScale: 1.2,
    speedX: 0.0014,
    speedY: 0.0008,
    dualLayer: true,
    childSceneVisible: false,
    renderOrder: 6,
  }
  const resolvedConfig = {
    ...defaultConfig,
    ...(config || {}),
  }
  return {
    ...resolvedConfig,
    enabled: resolvedConfig.enabled !== false,
    dualLayer: resolvedConfig.dualLayer !== false,
    childSceneVisible: resolvedConfig.childSceneVisible === true,
    opacity: Math.min(1, Math.max(0, toNumber(resolvedConfig.opacity, defaultConfig.opacity))),
    height: toNumber(resolvedConfig.height, defaultConfig.height),
    sizeScale: Math.max(1, toNumber(resolvedConfig.sizeScale, defaultConfig.sizeScale)),
    speedX: toNumber(resolvedConfig.speedX, defaultConfig.speedX),
    speedY: toNumber(resolvedConfig.speedY, defaultConfig.speedY),
    renderOrder: Math.round(toNumber(resolvedConfig.renderOrder, defaultConfig.renderOrder)),
  }
}

export class World extends Mini3d {
  constructor(canvas, assets, options = {}) {
    super(canvas)
    const resolvedSkin = createMapSkin(options.skin || (options.theme ? { world: options.theme } : {}))
    this.skin = resolvedSkin
    this.theme = resolvedSkin.world || {}
    const defaultGeoProjectionCenter = [106, 35]
    const resolvedMarketingCenters =
      Array.isArray(options.marketingCenters) && options.marketingCenters.length ? options.marketingCenters : marketingCenters
    this.resourceNames = {
      china: "china",
      mapJson: "mapJson",
      mapStroke: "mapStroke",
      ...(options.resourceNames || {}),
    }

    this.marketingCenters = resolvedMarketingCenters
    this.flyLineCenterId = options.flyLineCenterId || FLYLINE_CENTER_ID
    const flyLineCenter =
      this.marketingCenters.find((item) => item.id === this.flyLineCenterId) ||
      this.marketingCenters[0] || {
        lng: defaultGeoProjectionCenter[0],
        lat: defaultGeoProjectionCenter[1],
      }
    // 中心坐标（营销中心覆盖区域）
    this.geoProjectionCenter =
      Array.isArray(options.geoProjectionCenter) && options.geoProjectionCenter.length === 2
        ? options.geoProjectionCenter
        : defaultGeoProjectionCenter
    // 缩放比例
    this.geoProjectionScale = typeof options.geoProjectionScale === "number" ? options.geoProjectionScale : 24
    // 飞线中心（南京）
    this.flyLineCenter = [
      toNumber(flyLineCenter.lng, this.geoProjectionCenter[0]),
      toNumber(flyLineCenter.lat, this.geoProjectionCenter[1]),
    ]
    // 业务覆盖省份
    const defaultBusinessProvinceNames = [...new Set(this.marketingCenters.map((item) => item.provinceName).filter(Boolean))]
    const configuredBusinessProvinceNames = Array.isArray(options.businessProvinceNames)
      ? [...new Set(options.businessProvinceNames.filter(Boolean))]
      : []
    this.businessProvinceNames = configuredBusinessProvinceNames.length
      ? configuredBusinessProvinceNames
      : defaultBusinessProvinceNames
    // 地图拉伸高度
    this.depth = 0.5
    const defaultMapFocusLabelInfo = {
      name: "全国分布中心",
      enName: "NATIONAL DISTRIBUTION CENTER",
      center: [106, 20],
    }
    this.mapFocusLabelInfo = {
      ...defaultMapFocusLabelInfo,
      ...(options.mapFocusLabelInfo || {}),
      center:
        Array.isArray(options.mapFocusLabelInfo?.center) && options.mapFocusLabelInfo.center.length === 2
          ? options.mapFocusLabelInfo.center
          : defaultMapFocusLabelInfo.center,
    }
    // 是否展示焦点省份之外的省份标签
    this.showOtherProvinceLabels = options.showOtherProvinceLabels ?? true
    // 是否展示主图区域名称（如江苏各城市）
    this.showMainRegionLabels = options.showMainRegionLabels ?? false
    // 是否展示柱状图
    this.showProvinceBars = options.showProvinceBars ?? true
    // 是否显示全国底图
    this.showChinaBaseMap = options.showChinaBaseMap ?? true
    // 是否显示全国轮廓光晕
    this.showChinaBlurLine = options.showChinaBlurLine ?? true
    // 柱状图展示的营销中心（默认全部）
    const defaultProvinceBarCenterIds = [...new Set(this.marketingCenters.map((item) => item.id).filter(Boolean))]
    const configuredProvinceBarCenterIds = Array.isArray(options.provinceBarCenterIds)
      ? [...new Set(options.provinceBarCenterIds.filter(Boolean))]
      : []
    this.provinceBarCenterIds = configuredProvinceBarCenterIds.length
      ? configuredProvinceBarCenterIds
      : defaultProvinceBarCenterIds
    // 是否点击
    this.clicked = false
    // 当前场景 mainScene | childScene
    this.currentScene = "mainScene"
    this.rootHistoryState = { name: options.rootName || "中国" }
    // 下钻历史
    this.history = new createHistory()
    this.history.push({ ...this.rootHistoryState })
    // 子地图对象
    this.childMap = null
    // 子图加载序列（用于取消过期回调）
    this.childMapLoadSeq = 0
    // 主场景可见性快照
    this.mainSceneVisibilityState = null
    // 返回按钮
    this.returnBtn = document.querySelector(".return-btn")
    this.returnRelatedElements = [...document.querySelectorAll(".return-related")]
    this.setReturnButtonVisible(false)
    // 省份侧面流光贴图（全局复用，避免重复绑定 tick 导致流速叠加）
    this.sideFlowTexture = null
    this.sideFlowTickHandler = null
    // 贴地云层
    this.cloudLayerOptions = resolveCloudLayerConfig(options.cloudLayer, this.depth)
    this.cloudGroup = null
    this.cloudLayers = []
    this.cloudTickHandler = null
    const defaultInitialCameraPosition = new Vector3(-13.767695123014105, 12.990152163077308, 31.5)
    const defaultMainCameraPosition = new Vector3(-0.17427287762525134, 10.6, 18.6)
    const defaultMainCameraTarget = new Vector3(0, 0, 0)
    const defaultChildCameraPosition = new Vector3(-0.35, 13.2, 17.8)
    const defaultChildCameraTarget = new Vector3(0, 0, 0)
    // 主图镜头兜底（防止快照丢失）
    this.mainCameraFallbackState = {
      position: resolveVector3State(options.mainCameraState?.position, defaultMainCameraPosition),
      target: resolveVector3State(options.mainCameraState?.target, defaultMainCameraTarget),
    }
    // 下钻镜头预设（减小俯视，视角更平）
    this.childCameraState = {
      position: resolveVector3State(options.childCameraState?.position, defaultChildCameraPosition),
      target: resolveVector3State(options.childCameraState?.target, defaultChildCameraTarget),
    }
    this.initialCameraPosition = resolveVector3State(options.initialCameraPosition, defaultInitialCameraPosition)
    // 子图缩放倍率（>1 放大子图）
    this.childMapScaleMultiplier =
      typeof options.childMapScaleMultiplier === "number" ? options.childMapScaleMultiplier : 1
    // 缓存加载失败的地图 URL（避免重复 404 请求和重复告警）
    this.failedMapUrlSet = new Set()
    // 本地下钻目录是否可用（首次 404 后自动关闭，避免每次点击都请求不存在目录）
    this.localBoundMapFetchEnabled = true
    // 远程地图源是否可用（403 后自动关闭）
    this.remoteMapFetchEnabled = true

    const sceneTheme = this.theme.scene || {}
    const fogColor = sceneTheme.fogColor ?? 0x102736
    const fogNear = toNumber(sceneTheme.fogNear, 1)
    const fogFar = toNumber(sceneTheme.fogFar, 50)
    const backgroundColor = sceneTheme.backgroundColor ?? fogColor
    // 雾
    this.scene.fog = new Fog(fogColor, fogNear, fogFar)
    // 背景
    this.scene.background = new Color(backgroundColor)

    // 相机初始位置
    this.camera.instance.position.copy(this.initialCameraPosition)
    this.camera.instance.near = 1
    this.camera.instance.far = 10000
    this.camera.instance.updateProjectionMatrix()
    // 创建交互管理
    this.interactionManager = new InteractionManager(this.renderer.instance, this.camera.instance, this.canvas)

    this.assets = assets
    // 创建环境光
    this.initEnvironment()
    this.init()
  }
  init() {
    // 标签组
    this.labelGroup = new Group()
    this.label3d = new Label3d(this)
    this.labelGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.labelGroup)
    // 子地图组
    this.childSceneGroup = new Group()
    this.scene.add(this.childSceneGroup)
    // 飞线焦点光圈组
    this.flyLineFocusGroup = new Group()
    this.flyLineFocusGroup.visible = false
    this.flyLineFocusGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.flyLineFocusGroup)
    // 区域事件元素
    this.eventElement = []
    // 鼠标移上移除的材质
    this.defaultMaterial = null // 默认材质
    this.defaultLightMaterial = null // 高亮材质
    // 创建底部高亮
    this.createBottomBg()
    // 模糊边线
    if (this.showChinaBlurLine) {
      this.createChinaBlurLine()
    }

    // 扩散网格
    this.createGrid()
    // 旋转圆环
    this.createRotateBorder()
    // 创建标签
    this.createLabel()
    // 创建地图
    this.createMap()
    // 创建贴地云层
    this.createCloudLayer()
    // 添加事件
    this.createEvent()
    // 创建飞线
    this.createFlyLine()
    // 创建飞线焦点
    this.createFocus()
    // 创建粒子
    this.createParticles()
    // 创建散点图
    this.createScatter()
    // 创建信息点（先注释停用）
    // this.createInfoPoint()
    // 创建轮廓
    this.createStorke()
    // this.time.on("tick", () => {
    //   console.log(this.camera.instance.position);
    // });
    // 创建动画时间线
    let tl = gsap.timeline({
      onComplete: () => { },
    })
    tl.pause()
    this.animateTl = tl
    tl.addLabel("focusMap", 1.5)
    tl.addLabel("focusMapOpacity", 2)
    tl.addLabel("bar", 3)
    const mainCameraPosition = this.mainCameraFallbackState.position
    tl.to(this.camera.instance.position, {
      duration: 2,
      x: mainCameraPosition.x,
      y: mainCameraPosition.y,
      z: mainCameraPosition.z,
      ease: "circ.out",
      onStart: () => {
        this.flyLineFocusGroup.visible = false
      },
    })
    tl.to(
      this.focusMapGroup.position,
      {
        duration: 1,
        x: 0,
        y: 0,
        z: 0,
      },
      "focusMap"
    )

    tl.to(
      this.focusMapGroup.scale,
      {
        duration: 1,
        x: 1,
        y: 1,
        z: 1,
        ease: "circ.out",
        onComplete: () => {
          this.flyLineGroup.visible = true
          // this.scatterGroup.visible = true // 关闭三角散点层
          // this.InfoPointGroup.visible = true
          // this.createInfoPointLabelLoop()
        },
      },
      "focusMap"
    )

    tl.to(
      this.focusMapTopMaterial,
      {
        duration: 1,
        opacity: 1,
        ease: "circ.out",
      },
      "focusMapOpacity"
    )
    tl.to(
      this.focusMapSideMaterial,
      {
        duration: 1,
        opacity: 1,
        ease: "circ.out",
        onComplete: () => {
          this.focusMapSideMaterial.transparent = false
        },
      },
      "focusMapOpacity"
    )
    this.otherLabel.map((item, index) => {
      let element = item.element.querySelector(".other-label")
      if (!element) {
        return
      }
      tl.to(
        element,
        {
          duration: 1,
          delay: 0.1 * index,
          translateY: 0,
          opacity: 1,
          ease: "circ.out",
        },
        "focusMapOpacity"
      )
    })
    tl.to(
      this.mapLineMaterial,
      {
        duration: 0.5,
        delay: 0.3,
        opacity: 1,
      },
      "focusMapOpacity"
    )
    tl.to(
      this.rotateBorder1.scale,
      {
        delay: 0.3,
        duration: 1,
        x: 1,
        y: 1,
        z: 1,
        ease: "circ.out",
      },
      "focusMapOpacity"
    )
    tl.to(
      this.rotateBorder2.scale,
      {
        duration: 1,
        delay: 0.5,
        x: 1,
        y: 1,
        z: 1,
        ease: "circ.out",
        onComplete: () => {
          this.flyLineFocusGroup.visible = true
          emitter.$emit("mapPlayComplete")
        },
      },
      "focusMapOpacity"
    )
    this.allBar.map((item, index) => {
      if (item.userData.name === "广州市") {
        return false
      }
      tl.to(
        item.scale,
        {
          duration: 1,
          delay: 0.1 * index,
          x: 1,
          y: 1,
          z: 1,
          ease: "circ.out",
        },
        "bar"
      )
    })
    this.allBarMaterial.map((item, index) => {
      tl.to(
        item,
        {
          duration: 1,
          delay: 0.1 * index,
          opacity: 1,
          ease: "circ.out",
        },
        "bar"
      )
    })

    this.allProvinceLabel.map((item, index) => {
      let element = item.element.querySelector(".provinces-label-wrap")
      if (!element) {
        return
      }
      tl.to(
        element,
        {
          duration: 1,
          delay: 0.2 * index,
          translateY: 0,
          opacity: 1,
          ease: "circ.out",
        },
        "bar"
      )
    })
    this.allGuangquan.map((item, index) => {
      const innerScale = item?.children?.[0]?.scale
      const outerScale = item?.children?.[1]?.scale
      if (!innerScale || !outerScale) {
        return
      }
      tl.to(
        innerScale,
        {
          duration: 1,
          delay: 0.1 * index,
          x: 1,
          y: 1,
          z: 1,
          ease: "circ.out",
        },
        "bar"
      )
      tl.to(
        outerScale,
        {
          duration: 1,
          delay: 0.1 * index,
          x: 1,
          y: 1,
          z: 1,
          ease: "circ.out",
        },
        "bar"
      )
    })
  }

  initEnvironment() {
    const lightTheme = this.theme.lights || {}
    const ambientTheme = lightTheme.ambient || {}
    let sun = new AmbientLight(ambientTheme.color ?? 0xffffff, toNumber(ambientTheme.intensity, 5))
    this.scene.add(sun)
    const directionalTheme = lightTheme.directional || {}
    const directionalPosition = resolveTuple(directionalTheme.position, [-30, 6, -8])
    const directionalShadowMapSize = resolveTuple(directionalTheme.shadowMapSize, [1024, 1024])
    let directionalLight = new DirectionalLight(
      directionalTheme.color ?? 0xffffff,
      toNumber(directionalTheme.intensity, 5)
    )
    directionalLight.position.set(directionalPosition[0], directionalPosition[1], directionalPosition[2])
    directionalLight.castShadow = true
    directionalLight.shadow.radius = toNumber(directionalTheme.shadowRadius, 20)
    directionalLight.shadow.mapSize.width = directionalShadowMapSize[0]
    directionalLight.shadow.mapSize.height = directionalShadowMapSize[1]
    this.scene.add(directionalLight)
    const defaultPointLights = [
      { color: "#1d5e5e", intensity: 800, distance: 10000, x: -9, y: 3, z: -3 },
      { color: "#1d5e5e", intensity: 200, distance: 10000, x: 0, y: 2, z: 5 },
    ]
    const pointLights = Array.isArray(lightTheme.points) && lightTheme.points.length ? lightTheme.points : defaultPointLights
    pointLights.forEach((pointParams) => {
      this.createPointLight(pointParams)
    })
  }
  createPointLight(pointParams) {
    const pointLight = new PointLight(
      pointParams.color ?? 0x1d5e5e,
      toNumber(pointParams.intensity, 200),
      toNumber(pointParams.distance, 10000)
    )
    pointLight.position.set(toNumber(pointParams.x, 0), toNumber(pointParams.y, 0), toNumber(pointParams.z, 0))
    this.scene.add(pointLight)
  }
  createMap() {
    let mapGroup = new Group()
    this.mapRootGroup = mapGroup
    let focusMapGroup = new Group()
    this.focusMapGroup = focusMapGroup
    let chinaLayer = this.showChinaBaseMap ? this.createChina() : null
    let { map, mapTop, mapLine } = this.createProvince()
    if (chinaLayer) {
      chinaLayer.china.setParent(mapGroup)
      chinaLayer.chinaTopLine.setParent(mapGroup)
    }
    // 创建扩散
    this.createDiffuse()
    map.setParent(focusMapGroup)
    mapTop.setParent(focusMapGroup)
    mapLine.setParent(focusMapGroup)

    let focusMapBoundBox = getBoundBox(map.mapGroup)
    this.mainMapParentBoxSize = [focusMapBoundBox.boxSize.x, focusMapBoundBox.boxSize.y]

    focusMapGroup.position.set(0, 0, -0.01)
    focusMapGroup.scale.set(1, 1, 0)
    mapGroup.add(focusMapGroup)
    mapGroup.rotation.x = -Math.PI / 2
    mapGroup.position.set(0, 0.2, 0)
    this.scene.add(mapGroup)
    this.createBar()
  }
  createCloudLayer() {
    if (!this.cloudLayerOptions.enabled) {
      return
    }
    const primaryTexture = this.assets.instance.getResource(this.cloudLayerOptions.textureName)
    if (!primaryTexture) {
      console.warn(`[map] 云层贴图资源不存在: ${this.cloudLayerOptions.textureName}`)
      return
    }

    const [mapWidth = 20, mapHeight = 20] = this.mainMapParentBoxSize || [20, 20]
    const cloudWidth = Math.max(8, mapWidth * this.cloudLayerOptions.sizeScale)
    const cloudHeight = Math.max(8, mapHeight * this.cloudLayerOptions.sizeScale)

    const cloudGroup = new Group()
    cloudGroup.rotation.x = -Math.PI / 2
    cloudGroup.position.set(0, this.cloudLayerOptions.height, 0)
    this.cloudGroup = cloudGroup
    this.scene.add(cloudGroup)

    const createCloudPlane = ({ baseTexture, opacity, scale, speedX, speedY, zOffset, rotateSpeed }) => {
      const texture = baseTexture.clone()
      texture.needsUpdate = true
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.repeat.set(2.1, 2.1)
      texture.offset.set(Math.random(), Math.random())
      texture.colorSpace = SRGBColorSpace

      const material = new MeshBasicMaterial({
        color: 0xffffff,
        map: texture,
        alphaMap: texture,
        transparent: true,
        opacity,
        depthWrite: false,
        depthTest: false,
        fog: false,
        blending: NormalBlending,
        side: DoubleSide,
      })
      const geometry = new PlaneGeometry(cloudWidth * scale, cloudHeight * scale)
      const mesh = new Mesh(geometry, material)
      mesh.renderOrder = this.cloudLayerOptions.renderOrder
      mesh.position.set(0, 0, zOffset)
      cloudGroup.add(mesh)

      this.cloudLayers.push({
        mesh,
        texture,
        material,
        speedX,
        speedY,
        rotateSpeed,
      })
    }

    createCloudPlane({
      baseTexture: primaryTexture,
      opacity: this.cloudLayerOptions.opacity,
      scale: 1,
      speedX: this.cloudLayerOptions.speedX,
      speedY: this.cloudLayerOptions.speedY,
      zOffset: 0,
      rotateSpeed: 0.00035,
    })

    if (this.cloudLayerOptions.dualLayer) {
      const secondaryTexture =
        this.assets.instance.getResource(this.cloudLayerOptions.secondaryTextureName) || primaryTexture
      createCloudPlane({
        baseTexture: secondaryTexture,
        opacity: this.cloudLayerOptions.opacity * 0.62,
        scale: 1.08,
        speedX: -this.cloudLayerOptions.speedX * 0.7,
        speedY: this.cloudLayerOptions.speedY * 0.6,
        zOffset: 0.002,
        rotateSpeed: -0.0002,
      })
    }

    this.cloudTickHandler = () => {
      this.cloudLayers.forEach((layer) => {
        layer.texture.offset.x += layer.speedX
        layer.texture.offset.y += layer.speedY
        if (layer.rotateSpeed) {
          layer.mesh.rotation.z += layer.rotateSpeed
        }
      })
    }
    this.time.on("tick", this.cloudTickHandler)
  }
  disposeCloudLayer() {
    if (this.cloudTickHandler) {
      this.time.off("tick", this.cloudTickHandler)
      this.cloudTickHandler = null
    }
    if (Array.isArray(this.cloudLayers)) {
      this.cloudLayers.forEach((layer) => {
        layer.mesh?.geometry?.dispose()
        layer.material?.dispose()
        layer.texture?.dispose()
      })
    }
    this.cloudLayers = []
    if (this.cloudGroup) {
      this.scene.remove(this.cloudGroup)
      this.cloudGroup.clear()
      this.cloudGroup = null
    }
  }
  getMapData(resourceName) {
    const resolvedResourceName = this.resourceNames?.[resourceName] || resourceName
    return this.assets.instance.getResource(resolvedResourceName)
  }
  getBusinessProvinceMapData(resourceName) {
    let mapData = this.getMapData(resourceName)
    if (!mapData) {
      return mapData
    }
    let geoData = mapData
    if (typeof mapData === "string") {
      try {
        geoData = JSON.parse(mapData)
      } catch (error) {
        return mapData
      }
    }
    if (!Array.isArray(geoData.features)) {
      return mapData
    }
    if (!this.businessProvinceNames.length) {
      return mapData
    }
    const filteredFeatures = geoData.features.filter((feature) =>
      this.businessProvinceNames.includes(feature?.properties?.name)
    )
    if (!filteredFeatures.length) {
      return mapData
    }
    const filteredGeoData = {
      ...geoData,
      features: filteredFeatures,
    }
    if (typeof mapData === "string") {
      return JSON.stringify(filteredGeoData)
    }
    return filteredGeoData
  }
  getBusinessProvinceAnchorMap() {
    const mapData = this.getBusinessProvinceMapData("mapJson")
    let geoData = mapData

    if (typeof mapData === "string") {
      try {
        geoData = JSON.parse(mapData)
      } catch (error) {
        return new Map()
      }
    }

    if (!Array.isArray(geoData?.features)) {
      return new Map()
    }

    const anchorMap = new Map()
    geoData.features.forEach((feature) => {
      const name = feature?.properties?.name
      const center = feature?.properties?.center
      const centroid = feature?.properties?.centroid
      if (name) {
        anchorMap.set(name, { center, centroid })
      }
    })

    return anchorMap
  }
  getMainRegionLabelData() {
    const mapData = this.getBusinessProvinceMapData("mapJson")
    let geoData = mapData

    if (typeof mapData === "string") {
      try {
        geoData = JSON.parse(mapData)
      } catch (error) {
        return []
      }
    }

    if (!Array.isArray(geoData?.features)) {
      return []
    }

    return geoData.features
      .map((feature) => {
        const name = feature?.properties?.name
        const center =
          feature?.properties?.center?.length === 2
            ? feature.properties.center
            : feature?.properties?.centroid?.length === 2
              ? feature.properties.centroid
              : null
        return { name, center }
      })
      .filter((item) => item.name && Array.isArray(item.center))
  }
  createChina() {
    const chinaTheme = this.theme.china || {}
    let params = {
      chinaBgMaterialColor: chinaTheme.bgColor ?? "#1a3f5c",
      chinaBgMaterialOpacity: toNumber(chinaTheme.bgOpacity, 0.88),
      lineColor: chinaTheme.lineColor ?? "#63b8ec",
      lineOpacity: toNumber(chinaTheme.lineOpacity, 0.72),
    }
    let chinaData = this.getMapData("china")
    let chinaBgMaterial = new MeshLambertMaterial({
      color: new Color(params.chinaBgMaterialColor),
      transparent: true,
      opacity: params.chinaBgMaterialOpacity,
    })
    let china = new BaseMap(this, {
      //position: new Vector3(0, 0, -0.03),
      data: chinaData,
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      merge: false,
      material: chinaBgMaterial,
      renderOrder: 2,
    })
    let chinaTopLineMaterial = new LineBasicMaterial({
      color: params.lineColor,
      transparent: true,
      opacity: params.lineOpacity,
    })
    let chinaTopLine = new Line(this, {
      // position: new Vector3(0, 0, -0.02),
      data: chinaData,
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      material: chinaTopLineMaterial,
      renderOrder: 3,
    })
    chinaTopLine.lineGroup.position.z += 0.01
    return { china, chinaTopLine }
  }
  createProvinceLayer({
    mapJsonData,
    geoProjectionCenter = this.geoProjectionCenter,
    geoProjectionScale = this.geoProjectionScale,
    mapLineOpacity = 0,
  }) {
    const provinceTheme = this.theme.province || {}
    const topSurfaceTheme = provinceTheme.topSurface || {}
    const hoverTheme = provinceTheme.hover || {}
    let [topMaterial, sideMaterial] = this.createProvinceMaterial()

    let map = new ExtrudeMap(this, {
      geoProjectionCenter,
      geoProjectionScale,
      position: new Vector3(0, 0, 0.11),
      data: mapJsonData,
      depth: this.depth,
      topFaceMaterial: topMaterial,
      sideMaterial: sideMaterial,
      renderOrder: 9,
    })

    let faceMaterial = new MeshStandardMaterial({
      color: topSurfaceTheme.baseColor ?? 0xffffff,
      transparent: true,
      opacity: toNumber(topSurfaceTheme.opacity, 0.5),
    })
    new GradientShader(faceMaterial, {
      uColor1: topSurfaceTheme.color1 ?? 0x12bbe0,
      uColor2: topSurfaceTheme.color2 ?? 0x0094b5,
    })

    let defaultMaterial = faceMaterial
    let defaultLightMaterial = defaultMaterial.clone()
    defaultLightMaterial.color = new Color(hoverTheme.color ?? "rgba(115,208,255,1)")
    defaultLightMaterial.opacity = toNumber(hoverTheme.opacity, 0.8)

    let mapTop = new BaseMap(this, {
      geoProjectionCenter,
      geoProjectionScale,
      position: new Vector3(0, 0, this.depth + 0.22),
      data: mapJsonData,
      material: faceMaterial,
      renderOrder: 2,
    })

    let eventMeshes = []
    mapTop.mapGroup.children.map((group) => {
      group.children.map((mesh) => {
        if (mesh.type === "Mesh") {
          eventMeshes.push(mesh)
        }
      })
    })

    let mapLineMaterial = new LineBasicMaterial({
      color: 0xffffff,
      opacity: mapLineOpacity,
      transparent: true,
      fog: false,
    })

    let mapLine = new Line(this, {
      geoProjectionCenter,
      geoProjectionScale,
      data: mapJsonData,
      material: mapLineMaterial,
      renderOrder: 3,
    })
    mapLine.lineGroup.position.z += this.depth + 0.23

    return {
      map,
      mapTop,
      mapLine,
      topMaterial,
      sideMaterial,
      defaultMaterial,
      defaultLightMaterial,
      mapLineMaterial,
      eventMeshes,
    }
  }

  createProvince() {
    let mapJsonData = this.getBusinessProvinceMapData("mapJson")
    let provinceLayer = this.createProvinceLayer({
      mapJsonData,
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      mapLineOpacity: 0,
    })

    this.focusMapTopMaterial = provinceLayer.topMaterial
    this.focusMapSideMaterial = provinceLayer.sideMaterial
    this.defaultMaterial = provinceLayer.defaultMaterial
    this.defaultLightMaterial = provinceLayer.defaultLightMaterial
    this.mapLineMaterial = provinceLayer.mapLineMaterial
    this.eventElement.push(...provinceLayer.eventMeshes)

    return {
      map: provinceLayer.map,
      mapTop: provinceLayer.mapTop,
      mapLine: provinceLayer.mapLine,
    }
  }
  createProvinceMaterial() {
    const provinceTheme = this.theme.province || {}
    const topGradientTheme = provinceTheme.topGradient || {}
    const sideGradientTheme = provinceTheme.sideGradient || {}
    const sideFlowTheme = provinceTheme.sideFlow || {}
    const topGradientAxisSize = toNumber(topGradientTheme.axisSize, 15.78)
    const sideGradientAxisSize = toNumber(sideGradientTheme.axisSize, 1.2)
    const topAlpha = toNumber(provinceTheme.topAlpha, 0.5)
    let topMaterial = new MeshLambertMaterial({
      color: provinceTheme.topBaseColor ?? 0xffffff,
      transparent: true,
      opacity: toNumber(provinceTheme.topOpacity, 0),
      fog: false,
      side: DoubleSide,
    })
    topMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        uColor1: { value: new Color(topGradientTheme.color1 ?? 0x2a6e92) }, // 419daa
        uColor2: { value: new Color(topGradientTheme.color2 ?? 0x102736) },
      }
      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `
        attribute float alpha;
        varying vec3 vPosition;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vPosition = position;
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        varying vec3 vPosition;
        varying float vAlpha;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        void main() {
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
      #ifdef OPAQUE
      diffuseColor.a = 1.0;
      #endif
            #ifdef USE_TRANSMISSION
      diffuseColor.a *= transmissionAlpha + 0.1;
      #endif
      vec3 gradient = mix(uColor1, uColor2, vPosition.x/${topGradientAxisSize});       
      outgoingLight = outgoingLight*gradient;
      float topAlpha = ${topAlpha};
      if(vPosition.z>0.3){
        diffuseColor.a *= topAlpha;
      }
      gl_FragColor = vec4( outgoingLight, diffuseColor.a  );
      `
      )
    }
    let sideMap = this.sideFlowTexture
    if (!sideMap) {
      sideMap = this.assets.instance.getResource("side").clone()
      sideMap.needsUpdate = true
      sideMap.wrapS = RepeatWrapping
      sideMap.wrapT = RepeatWrapping
      const sideRepeat = resolveTuple(sideFlowTheme.repeat, [1, 1.5])
      sideMap.repeat.set(sideRepeat[0], sideRepeat[1])
      sideMap.offset.y += toNumber(sideFlowTheme.startOffsetY, 0.065)
      this.sideFlowTexture = sideMap
    }
    let sideMaterial = new MeshStandardMaterial({
      color: provinceTheme.sideBaseColor ?? 0xffffff,
      map: sideMap,
      fog: false,
      opacity: toNumber(provinceTheme.sideOpacity, 0),
      side: DoubleSide,
    })
    if (!this.sideFlowTickHandler) {
      const sideFlowSpeedY = toNumber(sideFlowTheme.speedY, 0.005)
      this.sideFlowTickHandler = () => {
        if (this.sideFlowTexture) {
          this.sideFlowTexture.offset.y += sideFlowSpeedY
        }
      }
      this.time.on("tick", this.sideFlowTickHandler)
    }
    sideMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        uColor1: { value: new Color(sideGradientTheme.color1 ?? 0x2a6e92) },
        uColor2: { value: new Color(sideGradientTheme.color2 ?? 0x2a6e92) },
      }
      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `
        attribute float alpha;
        varying vec3 vPosition;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vPosition = position;
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        varying vec3 vPosition;
        varying float vAlpha;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        void main() {
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
      #ifdef OPAQUE
      diffuseColor.a = 1.0;
      #endif
            #ifdef USE_TRANSMISSION
      diffuseColor.a *= transmissionAlpha + 0.1;
      #endif
      vec3 gradient = mix(uColor1, uColor2, vPosition.z/${sideGradientAxisSize});
      outgoingLight = outgoingLight*gradient;
      gl_FragColor = vec4( outgoingLight, diffuseColor.a  );
      `
      )
    }
    return [topMaterial, sideMaterial]
  }
  createBar() {
    const barTheme = this.theme.bar || {}
    const primaryBarTheme = barTheme.primary || {}
    const secondaryBarTheme = barTheme.secondary || {}
    this.allBar = []
    this.allBarMaterial = []
    this.allGuangquan = []
    this.allProvinceLabel = []
    if (!this.showProvinceBars) {
      return
    }
    let self = this
    let data = [...this.marketingCenters].filter((item) => this.provinceBarCenterIds.includes(item.id))
    if (!data.length) {
      return
    }
    const barGroup = new Group()
    this.barGroup = barGroup
    const factor = 0.7
    const height = 4.0 * factor
    const max = data.reduce((currentMax, item) => Math.max(currentMax, toNumber(item.value, 0)), 0) || 1
    data.map((item, index) => {
      const isSecondaryBar = index > 3
      let geoHeight = height * (toNumber(item.value, 0) / max)
      let material = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,
        fog: false,
      })
      new GradientShader(material, {
        uColor1: isSecondaryBar ? (secondaryBarTheme.color1 ?? 0xfbdf88) : (primaryBarTheme.color1 ?? 0x50bbfe),
        uColor2: isSecondaryBar ? (secondaryBarTheme.color2 ?? 0xfffef4) : (primaryBarTheme.color2 ?? 0x77fbf5),
        size: geoHeight,
        dir: "y",
      })
      const geo = new BoxGeometry(0.1 * factor, 0.1 * factor, geoHeight)
      geo.translate(0, 0, geoHeight / 2)
      const mesh = new Mesh(geo, material)
      mesh.renderOrder = 5
      let areaBar = mesh
      let [x, y] = this.geoProjection([item.lng, item.lat])
      areaBar.position.set(x, -y, this.depth + 0.45)
      areaBar.scale.set(1, 1, 0)
      areaBar.userData = { ...item }
      let guangQuan = this.createQuan(new Vector3(x, this.depth + 0.44, y), index)
      let hg = this.createHUIGUANG(geoHeight, isSecondaryBar ? (secondaryBarTheme.color2 ?? 0xfffef4) : (primaryBarTheme.color2 ?? 0x77fbf5))
      areaBar.add(...hg)
      barGroup.add(areaBar)
      barGroup.rotation.x = -Math.PI / 2
      let barLabel = labelStyle04(item, index, new Vector3(x, -y, this.depth + 1.1 + geoHeight))
      this.allBar.push(areaBar)
      this.allBarMaterial.push(material)
      this.allGuangquan.push(guangQuan)
      this.allProvinceLabel.push(barLabel)
    })
    this.scene.add(barGroup)
    function labelStyle04(data, index, position) {
      let label = self.label3d.create("", "provinces-label", false)
      const centerTypeLabel = data.id === self.flyLineCenterId ? "总部" : "分中心"
      label.init(
        `<div class="provinces-label">
      <div class="provinces-label-wrap">
        <div class="name">
          <span class="zh">${data.name}</span>
          <span class="en">${data.enName.toUpperCase()}</span>
        </div>
        <div class="type">${centerTypeLabel}</div>
      </div>
    </div>`,
        position
      )
      self.label3d.setLabelStyle(label, 0.013, "x")
      label.setParent(self.labelGroup)
      return label
    }
  }
  createEvent() {
    let objectsHover = []
    const reset = (mesh) => {
      mesh.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = this.defaultMaterial
        }
      })
    }
    const move = (mesh) => {
      mesh.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = this.defaultLightMaterial
        }
      })
    }
    this.eventElement.map((mesh) => {
      this.interactionManager.add(mesh)
      mesh.addEventListener("mousedown", (event) => {
        if (this.clicked || this.currentScene !== "mainScene") return false
        this.clicked = true
        let userData = event.target.parent.userData
        if (!userData?.adcode || !userData?.childrenNum) {
          this.clicked = false
          return false
        }

        this.history.push(userData)
        this.loadChildMap(userData)
      })
      mesh.addEventListener("mouseup", () => {
        this.clicked = false
      })
      mesh.addEventListener("mouseover", (event) => {
        if (!objectsHover.includes(event.target.parent)) {
          objectsHover.push(event.target.parent)
        }
        if (this.currentScene !== "mainScene") {
          return false
        }
        document.body.style.cursor = "pointer"
        move(event.target.parent)
      })
      mesh.addEventListener("mouseout", (event) => {
        objectsHover = objectsHover.filter((n) => n.userData.name !== event.target.parent.userData.name)
        if (objectsHover.length > 0) {
          const mesh = objectsHover[objectsHover.length - 1]
        }
        reset(event.target.parent)
        document.body.style.cursor = "default"
      })
    })
  }
  applyCameraState(state, duration = 0.6) {
    if (!state) {
      return
    }

    const { position, target = new Vector3(0, 0, 0) } = state
    gsap.killTweensOf(this.camera.instance.position)
    if (this.camera.controls) {
      gsap.killTweensOf(this.camera.controls.target)
    }

    gsap.to(this.camera.instance.position, {
      duration,
      x: position.x,
      y: position.y,
      z: position.z,
      ease: "power2.out",
    })

    if (this.camera.controls) {
      gsap.to(this.camera.controls.target, {
        duration,
        x: target.x,
        y: target.y,
        z: target.z,
        ease: "power2.out",
        onUpdate: () => {
          this.camera.controls.update()
        },
      })
    }
  }

  getChildCameraState() {
    const boxSize = this.childMap?.boundBox?.boxSize
    const maxSize = boxSize ? Math.max(boxSize.x, boxSize.y) : 12

    return {
      position: new Vector3(
        this.childCameraState.position.x,
        Math.max(this.childCameraState.position.y, maxSize * 0.65),
        Math.max(this.childCameraState.position.z, maxSize * 1.05)
      ),
      target: this.childCameraState.target.clone(),
    }
  }

  loadChildMap(userData) {
    if (!userData?.adcode) {
      this.clicked = false
      return
    }

    const isEnterFromMainScene = this.currentScene === "mainScene"
    const loadSeq = ++this.childMapLoadSeq

    this.getChildMapData(userData, (data) => {
      if (loadSeq !== this.childMapLoadSeq) {
        this.clicked = false
        return
      }
      if (!data) {
        this.clicked = false
        return
      }

      this.childMap && this.childMap.destroy()
      this.childMap = new ChildMap(this, {
        adcode: userData.adcode,
        center: userData.center || userData.centroid,
        centroid: userData.centroid || userData.center,
        childrenNum: userData.childrenNum,
        mapData: data,
        parentBoxSize: this.mainMapParentBoxSize || [20, 20],
        scaleMultiplier: this.childMapScaleMultiplier,
      })

      this.childSceneGroup.add(this.childMap.instance)
      if (isEnterFromMainScene) {
        this.setMainMapVisible(false)
      }
      this.currentScene = "childScene"
      this.setReturnButtonVisible(true)
      this.applyCameraState(this.getChildCameraState(), 0.6)
      this.clicked = false
    })
  }

  getChildMapData(userData, callback) {
    const run = async () => {
      const sources = this.getChildMapRequestSources(userData)

      for (let i = 0; i < sources.length; i += 1) {
        const source = sources[i]
        if (source.type.startsWith("local") && this.failedMapUrlSet.has(source.url)) {
          continue
        }
        try {
          const data = await this.fetchMapText(source.url)
          callback && callback(data)
          return
        } catch (error) {
          const isLocal404 = source.type.startsWith("local") && error?.status === 404
          const isFirstLocal404 = isLocal404 && !this.failedMapUrlSet.has(source.url)
          if (isLocal404) {
            this.failedMapUrlSet.add(source.url)
          }
          if (source.type === "localBound" && error?.status === 404) {
            this.localBoundMapFetchEnabled = false
          }
          if (source.type === "remote" && error?.status === 403) {
            this.remoteMapFetchEnabled = false
          }
          if (!isLocal404 || isFirstLocal404) {
            console.warn(`[map] 地图数据加载失败 (${source.type}): ${source.url}`, error)
          }
        }
      }

      const fallbackData = this.getProvinceFallbackGeoData(userData.adcode)
      if (fallbackData) {
        console.warn(`[map] 使用省级轮廓兜底数据: ${userData.name || userData.adcode}`)
        callback && callback(fallbackData)
        return
      }

      this.clicked = false
      callback && callback(null)
    }

    run()
  }

  getChildMapRequestSources(userData) {
    const suffix = resolveChildMapSuffix(userData.childrenNum)
    const fileName = `${userData.adcode}${suffix}`
    const baseUrl = import.meta.env.BASE_URL
    const sources = []

    if (this.localBoundMapFetchEnabled) {
      sources.push({
        type: "localBound",
        url: `${baseUrl}assets/json/areas_v3/bound/${fileName}`,
      })
    }

    if (userData?.name) {
      sources.push({
        type: "localName",
        url: `${baseUrl}assets/json/${encodeURIComponent(userData.name)}.json`,
      })
    }

    if (this.remoteMapFetchEnabled) {
      sources.push({
        type: "remote",
        url: `https://geo.datav.aliyun.com/areas_v3/bound/${fileName}`,
      })
    }

    return sources
  }

  async fetchMapText(url) {
    const res = await fetch(url, {
      referrerPolicy: "no-referrer",
    })
    if (!res.ok) {
      const error = new Error(`地图数据加载失败: ${res.status}`)
      error.status = res.status
      throw error
    }
    return res.text()
  }

  getProvinceFallbackGeoData(adcode) {
    const mapData = this.getBusinessProvinceMapData("mapJson")
    let geoData = mapData

    if (typeof mapData === "string") {
      try {
        geoData = JSON.parse(mapData)
      } catch (error) {
        return null
      }
    }

    if (!Array.isArray(geoData?.features)) {
      return null
    }

    const feature = geoData.features.find((item) => item?.properties?.adcode === adcode)
    if (!feature) {
      return null
    }

    return JSON.stringify({
      type: "FeatureCollection",
      features: [
        {
          ...feature,
          properties: {
            ...(feature.properties || {}),
            childrenNum: 0,
          },
        },
      ],
    })
  }

  setMainLabelElementsVisible(visible) {
    const labels = [...(this.otherLabel || []), ...(this.allProvinceLabel || [])]
    labels.forEach((label) => {
      if (!label?.element) {
        return
      }
      if (visible) {
        label.show ? label.show() : (label.element.style.visibility = "visible")
      } else {
        label.hide ? label.hide() : (label.element.style.visibility = "hidden")
      }
    })
  }

  setMainMapVisible(bool) {
    if (bool === false && !this.mainSceneVisibilityState) {
      this.mainSceneVisibilityState = {
        mapRootGroup: this.mapRootGroup ? this.mapRootGroup.visible : true,
        labelGroup: this.labelGroup ? this.labelGroup.visible : true,
        flyLineGroup: this.flyLineGroup ? this.flyLineGroup.visible : false,
        flyLineFocusGroup: this.flyLineFocusGroup ? this.flyLineFocusGroup.visible : false,
        barGroup: this.barGroup ? this.barGroup.visible : false,
        guangquanVisibleList: (this.allGuangquan || []).map((group) => (group ? group.visible : false)),
        scatterGroup: this.scatterGroup ? this.scatterGroup.visible : false,
        particleGroup: this.particleGroup ? this.particleGroup.visible : false,
        rotateBorder1: this.rotateBorder1 ? this.rotateBorder1.visible : false,
        rotateBorder2: this.rotateBorder2 ? this.rotateBorder2.visible : false,
        cloudGroup: this.cloudGroup ? this.cloudGroup.visible : false,
      }
    }

    if (this.mapRootGroup) {
      this.mapRootGroup.visible = bool
    }
    if (this.labelGroup) {
      this.labelGroup.visible = bool ? this.mainSceneVisibilityState?.labelGroup ?? true : false
    }
    if (this.flyLineGroup) {
      this.flyLineGroup.visible = bool ? this.mainSceneVisibilityState?.flyLineGroup ?? false : false
    }
    if (this.flyLineFocusGroup) {
      this.flyLineFocusGroup.visible = bool ? this.mainSceneVisibilityState?.flyLineFocusGroup ?? false : false
    }
    if (this.barGroup) {
      this.barGroup.visible = bool ? this.mainSceneVisibilityState?.barGroup ?? false : false
    }
    if (Array.isArray(this.allGuangquan)) {
      this.allGuangquan.forEach((group, index) => {
        if (!group) {
          return
        }
        group.visible = bool ? this.mainSceneVisibilityState?.guangquanVisibleList?.[index] ?? true : false
      })
    }
    if (this.scatterGroup) {
      this.scatterGroup.visible = bool ? this.mainSceneVisibilityState?.scatterGroup ?? false : false
    }
    if (this.particleGroup) {
      this.particleGroup.visible = bool ? this.mainSceneVisibilityState?.particleGroup ?? false : false
    }
    if (this.rotateBorder1) {
      this.rotateBorder1.visible = bool ? this.mainSceneVisibilityState?.rotateBorder1 ?? false : false
    }
    if (this.rotateBorder2) {
      this.rotateBorder2.visible = bool ? this.mainSceneVisibilityState?.rotateBorder2 ?? false : false
    }
    if (this.cloudGroup) {
      const shouldKeepVisibleOnChild = this.cloudLayerOptions.childSceneVisible
      const visibleState = this.mainSceneVisibilityState?.cloudGroup ?? true
      this.cloudGroup.visible = !bool && shouldKeepVisibleOnChild ? visibleState : bool ? visibleState : false
    }
    this.setMainLabelElementsVisible(this.labelGroup ? this.labelGroup.visible : bool)
    if (bool === true) {
      this.mainSceneVisibilityState = null
    }
  }

  resetHistoryToRoot() {
    this.history = new createHistory()
    this.history.push({ ...this.rootHistoryState })
  }

  resetScene(duration = 0) {
    this.childMapLoadSeq += 1
    this.currentScene = "mainScene"
    this.clicked = false
    this.childMap && this.childMap.destroy()
    this.childMap = null
    this.resetHistoryToRoot()
    this.setMainMapVisible(true)
    this.setReturnButtonVisible(false)
    this.applyCameraState(this.mainCameraFallbackState, duration)
    document.body.style.cursor = "default"
  }

  goBack() {
    if (this.currentScene !== "childScene") {
      return
    }
    this.childMapLoadSeq += 1

    this.history.undo()

    if (!this.history.getIndex()) {
      this.currentScene = "mainScene"
      this.childMap && this.childMap.destroy()
      this.childMap = null
      this.setMainMapVisible(true)
      this.setReturnButtonVisible(false)
      this.applyCameraState(this.mainCameraFallbackState, 0.6)
      this.clicked = false
      return
    }

    let userData = this.history.present
    this.loadChildMap(userData)
  }

  setReturnButtonVisible(visible) {
    if (this.returnBtn) {
      this.returnBtn.style.display = visible ? "block" : "none"
    }

    if (Array.isArray(this.returnRelatedElements)) {
      this.returnRelatedElements.forEach((element) => {
        if (!element) {
          return
        }
        element.classList.toggle("is-visible", visible)
      })
    }
  }

  createHUIGUANG(h, color) {
    const huiguangTheme = this.theme.huiguang || {}
    const width = Math.max(0.05, toNumber(huiguangTheme.width, 0.35))
    const heightScale = Math.max(0.2, toNumber(huiguangTheme.heightScale, 1))
    const height = Math.max(0.01, h * heightScale)
    const resolvedColor = huiguangTheme.color ?? color
    let geometry = new PlaneGeometry(width, height)
    geometry.translate(0, height / 2, 0)
    const texture = this.assets.instance.getResource("huiguang")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    let material = new MeshBasicMaterial({
      color: resolvedColor,
      map: texture,
      transparent: true,
      opacity: toNumber(huiguangTheme.opacity, 0.4),
      depthTest: huiguangTheme.depthTest ?? false,
      depthWrite: false,
      fog: false,
      side: DoubleSide,
      blending: AdditiveBlending,
    })
    let mesh = new Mesh(geometry, material)
    mesh.renderOrder = 10
    mesh.rotateX(Math.PI / 2)
    let mesh2 = mesh.clone()
    let mesh3 = mesh.clone()
    mesh2.rotateY((Math.PI / 180) * 60)
    mesh3.rotateY((Math.PI / 180) * 120)
    return [mesh, mesh2, mesh3]
  }
  createQuan(position, index) {
    const guangquan1 = this.assets.instance.getResource("guangquan1")
    const guangquan2 = this.assets.instance.getResource("guangquan2")
    let geometry = new PlaneGeometry(0.5, 0.5)
    let material1 = new MeshBasicMaterial({
      color: 0xffffff,
      map: guangquan1,
      alphaMap: guangquan1,
      opacity: 1,
      transparent: true,
      depthTest: false,
      fog: false,
      blending: AdditiveBlending,
    })
    let material2 = new MeshBasicMaterial({
      color: 0xffffff,
      map: guangquan2,
      alphaMap: guangquan2,
      opacity: 1,
      transparent: true,
      depthTest: false,
      fog: false,
      blending: AdditiveBlending,
    })
    let mesh1 = new Mesh(geometry, material1)
    let mesh2 = new Mesh(geometry, material2)
    mesh1.renderOrder = 6
    mesh2.renderOrder = 6
    mesh1.rotateX(-Math.PI / 2)
    mesh2.rotateX(-Math.PI / 2)
    mesh1.position.copy(position)
    mesh2.position.copy(position)
    mesh2.position.y -= 0.001
    mesh1.scale.set(0, 0, 0)
    mesh2.scale.set(0, 0, 0)
    this.quanGroup = new Group()
    this.quanGroup.add(mesh1, mesh2)
    this.scene.add(this.quanGroup)
    this.time.on("tick", () => {
      mesh1.rotation.z += 0.05
    })
    return this.quanGroup
  }
  // 创建扩散
  createDiffuse() {
    const diffuseTheme = this.theme.diffuse || {}
    let geometry = new PlaneGeometry(200, 200)
    let material = new MeshBasicMaterial({
      color: 0x000000,
      depthWrite: false,
      // depthTest: false,
      transparent: true,
      blending: CustomBlending,
    })
    // 使用CustomBlending  实现混合叠加
    material.blendEquation = AddEquation
    material.blendSrc = DstColorFactor
    material.blendDst = OneFactor
    let diffuse = new DiffuseShader({
      material,
      time: this.time,
      size: toNumber(diffuseTheme.size, 60),
      diffuseSpeed: toNumber(diffuseTheme.speed, 8.0),
      diffuseColor: diffuseTheme.color ?? 0x71918e,
      diffuseWidth: toNumber(diffuseTheme.width, 2.0),
      callback: (pointShader) => {
        setTimeout(() => {
          gsap.to(pointShader.uniforms.uTime, {
            value: toNumber(diffuseTheme.targetTime, 4),
            repeat: -1,
            duration: toNumber(diffuseTheme.duration, 6),
            ease: "power1.easeIn",
          })
        }, 3)
      },
    })
    let mesh = new Mesh(geometry, material)
    mesh.renderOrder = 3
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(0, 0.21, 0)
    this.scene.add(mesh)
  }
  createGrid() {
    const gridTheme = this.theme.grid || {}
    new Grid(this, {
      gridSize: toNumber(gridTheme.gridSize, 50),
      gridDivision: toNumber(gridTheme.gridDivision, 20),
      gridColor: gridTheme.gridColor ?? 0x1b4b70,
      shapeSize: toNumber(gridTheme.shapeSize, 0.5),
      shapeColor: gridTheme.shapeColor ?? 0x2a5f8a,
      pointSize: toNumber(gridTheme.pointSize, 0.1),
      pointColor: gridTheme.pointColor ?? 0x154d7d,
    })
  }
  createBottomBg() {
    const bottomTheme = this.theme.bottom || {}
    const bottomPlaneSize = resolveTuple(bottomTheme.planeSize, [20, 20])
    const bottomPosition = resolveTuple(bottomTheme.position, [0, -0.7, 0])
    let geometry = new PlaneGeometry(bottomPlaneSize[0], bottomPlaneSize[1])
    const texture = this.assets.instance.getResource("ocean")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)
    let material = new MeshBasicMaterial({
      map: texture,
      opacity: toNumber(bottomTheme.opacity, 1),
      fog: false,
    })
    let mesh = new Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(bottomPosition[0], bottomPosition[1], bottomPosition[2])
    this.scene.add(mesh)
  }
  createChinaBlurLine() {
    const blurLineTheme = this.theme.blurLine || {}
    const blurLineSize = resolveTuple(blurLineTheme.size, [147, 147])
    const blurLinePosition = resolveTuple(blurLineTheme.position, [-19.3, -0.5, -19.7])
    let geometry = new PlaneGeometry(blurLineSize[0], blurLineSize[1])
    const texture = this.assets.instance.getResource("chinaBlurLine")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.generateMipmaps = false
    texture.minFilter = NearestFilter
    texture.repeat.set(1, 1)
    let material = new MeshBasicMaterial({
      color: blurLineTheme.color ?? 0x3f82cd,
      alphaMap: texture,
      transparent: true,
      opacity: toNumber(blurLineTheme.opacity, 0.5),
    })
    let mesh = new Mesh(geometry, material)
    mesh.rotateX(-Math.PI / 2)
    mesh.position.set(blurLinePosition[0], blurLinePosition[1], blurLinePosition[2])
    this.scene.add(mesh)
  }

  createLabel() {
    let self = this
    let labelGroup = this.labelGroup
    let label3d = this.label3d
    let otherLabel = []
    const provinceAnchorMap = this.getBusinessProvinceAnchorMap()

    this.marketingCenters.map((province) => {
      if (!this.showOtherProvinceLabels) return false
      const provinceAnchor = provinceAnchorMap.get(province.provinceName)
      const labelCenter =
        provinceAnchor?.center?.length === 2
          ? provinceAnchor.center
          : provinceAnchor?.centroid?.length === 2
            ? provinceAnchor.centroid
            : [province.lng, province.lat]

      let label = labelStyle01(
        {
          ...province,
          labelCenter,
        },
        label3d,
        labelGroup
      )
      otherLabel.push(label)
    })
    if (this.showMainRegionLabels) {
      this.getMainRegionLabelData().forEach((region) => {
        let label = labelStyle05(region, label3d, labelGroup)
        otherLabel.push(label)
      })
    }
    let mapFocusLabel = labelStyle02(
      {
        ...this.mapFocusLabelInfo,
      },
      label3d,
      labelGroup
    )
    let iconLabel1 = labelStyle03(
      {
        icon: labelIcon,
        center: [118.280637, 21.625178],
        width: "40px",
        height: "40px",
        reflect: true,
      },
      label3d,
      labelGroup
    )
    let iconLabel2 = labelStyle03(
      {
        icon: labelIcon,
        center: [106.280637, 25.625178],
        width: "20px",
        height: "20px",
        reflect: false,
      },
      label3d,
      labelGroup
    )
    otherLabel.push(mapFocusLabel)
    // otherLabel.push(iconLabel1)
    // otherLabel.push(iconLabel2)
    this.otherLabel = otherLabel
    function labelStyle01(province, label3d, labelGroup) {
      let label = label3d.create("", `china-label ${province.blur ? " blur" : ""}`, false)
      const [x, y] = self.geoProjection(province.labelCenter)
      label.init(
        `<div class="other-label"><img class="label-icon" src="${labelIcon}">${province.labelName || province.provinceName}</div>`,
        new Vector3(x, -y, 0.4)
      )
      label3d.setLabelStyle(label, 0.02, "x")
      label.setParent(labelGroup)
      return label
    }
    function labelStyle02(province, label3d, labelGroup) {
      let label = label3d.create("", "map-label", false)
      const [x, y] = self.geoProjection(province.center)
      label.init(
        `<div class="other-label"><span>${province.name}</span><span>${province.enName}</span></div>`,
        new Vector3(x, -y, 0.4)
      )
      label3d.setLabelStyle(label, 0.015, "x")
      label.setParent(labelGroup)
      return label
    }
    function labelStyle03(data, label3d, labelGroup) {
      let label = label3d.create("", `decoration-label  ${data.reflect ? " reflect" : ""}`, false)
      const [x, y] = self.geoProjection(data.center)
      label.init(
        `<div class="other-label"><img class="label-icon" style="width:${data.width};height:${data.height}" src="${data.icon}">`,
        new Vector3(x, -y, 0.4)
      )
      label3d.setLabelStyle(label, 0.02, "x")
      label.setParent(labelGroup)
      return label
    }
    function labelStyle04(data, label3d, labelGroup, index) {
      let label = label3d.create("", "provinces-label", false)
      const [x, y] = self.geoProjection(data.center)
      label.init(
        `<div class="provinces-label">
      <div class="provinces-label-wrap">
        <div class="number">${data.value}<span>万人</span></div>
        <div class="name">
          <span class="zh">${data.name}</span>
          <span class="en">${data.enName.toUpperCase()}</span>
        </div>
        <div class="no">${index + 1}</div>
      </div>
    </div>`,
        new Vector3(x, -y, 2.4)
      )
      label3d.setLabelStyle(label, 0.02, "x")
      label.setParent(labelGroup)
      return label
    }
    function labelStyle05(data, label3d, labelGroup) {
      let label = label3d.create("", "main-region-label", false)
      const [x, y] = self.geoProjection(data.center)
      label.init(`<div class="other-label">${data.name}</div>`, new Vector3(x, -y, self.depth + 0.45))
      label3d.setLabelStyle(label, 0.013, "x")
      label.setParent(labelGroup)
      return label
    }
  }
  createRotateBorder() {
    const rotateBorderTheme = this.theme.rotateBorder || {}
    const rotateBorderTheme1 = rotateBorderTheme.first || {}
    const rotateBorderTheme2 = rotateBorderTheme.second || {}
    const rotateBorderColor = rotateBorderTheme.color ?? 0x48afff
    const rotateBorderPos1 = resolveTuple(rotateBorderTheme1.position, [0, 0.28, 0])
    const rotateBorderPos2 = resolveTuple(rotateBorderTheme2.position, [0, 0.3, 0])
    let max = toNumber(rotateBorderTheme.max, 12)
    let rotationBorder1 = this.assets.instance.getResource("rotationBorder1")
    let rotationBorder2 = this.assets.instance.getResource("rotationBorder2")
    let plane01 = new Plane(this, {
      width: max * toNumber(rotateBorderTheme1.widthScale, 1.178),
      needRotate: true,
      rotateSpeed: toNumber(rotateBorderTheme1.rotateSpeed, 0.001),
      material: new MeshBasicMaterial({
        map: rotationBorder1,
        color: rotateBorderTheme1.color ?? rotateBorderColor,
        transparent: true,
        opacity: toNumber(rotateBorderTheme1.opacity, 0.2),
        side: DoubleSide,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
      position: new Vector3(rotateBorderPos1[0], rotateBorderPos1[1], rotateBorderPos1[2]),
    })
    plane01.instance.rotation.x = -Math.PI / 2
    plane01.instance.renderOrder = 6
    plane01.instance.scale.set(0, 0, 0)
    plane01.setParent(this.scene)
    let plane02 = new Plane(this, {
      width: max * toNumber(rotateBorderTheme2.widthScale, 1.116),
      needRotate: true,
      rotateSpeed: toNumber(rotateBorderTheme2.rotateSpeed, -0.004),
      material: new MeshBasicMaterial({
        map: rotationBorder2,
        color: rotateBorderTheme2.color ?? rotateBorderColor,
        transparent: true,
        opacity: toNumber(rotateBorderTheme2.opacity, 0.4),
        side: DoubleSide,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
      position: new Vector3(rotateBorderPos2[0], rotateBorderPos2[1], rotateBorderPos2[2]),
    })
    plane02.instance.rotation.x = -Math.PI / 2
    plane02.instance.renderOrder = 6
    plane02.instance.scale.set(0, 0, 0)
    plane02.setParent(this.scene)
    this.rotateBorder1 = plane01.instance
    this.rotateBorder2 = plane02.instance
  }
  createFlyLine() {
    const flyLineTheme = this.theme.flyLine || {}
    const flyLineTextureRepeat = resolveTuple(flyLineTheme.textureRepeat, [0.5, 2])
    this.flyLineGroup = new Group()
    this.flyLineGroup.visible = false
    this.scene.add(this.flyLineGroup)
    const texture = this.assets.instance.getResource("mapFlyline")
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(flyLineTextureRepeat[0], flyLineTextureRepeat[1])
    const tubeRadius = toNumber(flyLineTheme.tubeRadius, 0.1)
    const tubeSegments = toNumber(flyLineTheme.tubeSegments, 32)
    const tubeRadialSegments = toNumber(flyLineTheme.tubeRadialSegments, 2)
    const closed = false
    let [centerX, centerY] = this.geoProjection(this.flyLineCenter)
    let centerPoint = new Vector3(centerX, -centerY, 0)
    const material = new MeshBasicMaterial({
      map: texture,
      // alphaMap: texture,
      color: flyLineTheme.color ?? 0x2a6f72,
      transparent: true,
      fog: false,
      opacity: 1,
      depthTest: false,
      blending: AdditiveBlending,
    })
    const flyLineTextureSpeedX = toNumber(flyLineTheme.textureSpeedX, -0.006)
    this.time.on("tick", () => {
      texture.offset.x += flyLineTextureSpeedX
    })
    this.marketingCenters
      .filter((item) => item.id !== this.flyLineCenterId)
      .map((city) => {
        let [x, y] = this.geoProjection([city.lng, city.lat])
        let point = new Vector3(x, -y, 0)
        const center = new Vector3()
        center.addVectors(centerPoint, point).multiplyScalar(0.5)
        center.setZ(toNumber(flyLineTheme.centerArcHeight, 3))
        const curve = new QuadraticBezierCurve3(centerPoint, center, point)
        const tubeGeometry = new TubeGeometry(curve, tubeSegments, tubeRadius, tubeRadialSegments, closed)
        const mesh = new Mesh(tubeGeometry, material)
        mesh.rotation.x = -Math.PI / 2
        mesh.position.set(0, this.depth + 0.44, 0)
        mesh.renderOrder = 21
        this.flyLineGroup.add(mesh)
      })
  }
  // 创建焦点
  createFocus() {
    const focusTheme = this.theme.focus || {}
    let focusObj = new Focus(this, {
      color1: focusTheme.color1 ?? 0xbdfdfd,
      color2: focusTheme.color2 ?? 0xbdfdfd,
    })
    let [x, y] = this.geoProjection(this.flyLineCenter)
    focusObj.position.set(x, -y, this.depth + 0.44)
    focusObj.scale.set(1, 1, 1)
    this.flyLineFocusGroup.add(focusObj)
  }
  // 创建粒子
  createParticles() {
    const particlesTheme = this.theme.particles || {}
    this.particles = new Particles(this, {
      num: toNumber(particlesTheme.num, 10),
      range: toNumber(particlesTheme.range, 30),
      dir: particlesTheme.dir ?? "up",
      speed: toNumber(particlesTheme.speed, 0.05),
      material: new PointsMaterial({
        map: Particles.createTexture(),
        size: toNumber(particlesTheme.size, 1),
        color: particlesTheme.color ?? 0x00eeee,
        transparent: true,
        opacity: toNumber(particlesTheme.opacity, 1),
        depthTest: false,
        depthWrite: false,
        vertexColors: true,
        blending: AdditiveBlending,
        sizeAttenuation: true,
      }),
    })
    this.particleGroup = new Group()
    this.scene.add(this.particleGroup)
    this.particleGroup.rotation.x = -Math.PI / 2
    this.particles.setParent(this.particleGroup)
    this.particles.enable = true
    this.particleGroup.visible = true
  }
  createScatter() {
    const scatterTheme = this.theme.scatter || {}
    this.scatterGroup = new Group()
    this.scatterGroup.visible = false
    this.scatterGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.scatterGroup)
    const texture = this.assets.instance.getResource("arrow")
    const material = new SpriteMaterial({
      map: texture,
      color: scatterTheme.color ?? 0xfffef4,
      fog: false,
      transparent: true,
      depthTest: false,
    })
    let scatterAllData = sortByValue(scatterData)
    let max = scatterAllData[0].value
    const scatterMinScale = toNumber(scatterTheme.minScale, 0.1)
    const scatterScaleRange = toNumber(scatterTheme.scaleRange, 0.2)
    scatterAllData.map((data) => {
      const sprite = new Sprite(material)
      sprite.renderOrder = 23
      let scale = scatterMinScale + (data.value / max) * scatterScaleRange
      sprite.scale.set(scale, scale, scale)
      let [x, y] = this.geoProjection([data.lng, data.lat])
      sprite.position.set(x, -y, this.depth + 0.45)
      sprite.userData.position = [x, -y, this.depth + 0.45]
      this.scatterGroup.add(sprite)
    })
  }
  createInfoPoint() {
    const infoPointTheme = this.theme.infoPoint || {}
    let self = this
    this.InfoPointGroup = new Group()
    this.scene.add(this.InfoPointGroup)
    this.InfoPointGroup.visible = false
    this.InfoPointGroup.rotation.x = -Math.PI / 2
    this.infoPointIndex = 0
    this.infoPointLabelTime = null
    this.infoLabelElement = []
    let label3d = this.label3d
    const texture = this.assets.instance.getResource("point")
    let colors =
      Array.isArray(infoPointTheme.colors) && infoPointTheme.colors.length ? infoPointTheme.colors : [0xfffef4, 0x77fbf5]
    let infoAllData = sortByValue(infoData)
    let max = infoAllData[0].value
    const infoPointMinScale = toNumber(infoPointTheme.minScale, 0.7)
    const infoPointScaleRange = toNumber(infoPointTheme.scaleRange, 0.4)
    infoAllData.map((data, index) => {
      const material = new SpriteMaterial({
        map: texture,
        color: colors[index % colors.length],
        fog: false,
        transparent: true,
        depthTest: false,
      })
      const sprite = new Sprite(material)
      sprite.renderOrder = 23
      let scale = infoPointMinScale + (data.value / max) * infoPointScaleRange
      sprite.scale.set(scale, scale, scale)
      let [x, y] = this.geoProjection([data.lng, data.lat])
      let position = [x, -y, this.depth + 0.7]
      sprite.position.set(...position)
      sprite.userData.position = [...position]
      sprite.userData = {
        position: [x, -y, this.depth + 0.7],
        name: data.name,
        value: data.value,
        level: data.level,
        index: index,
      }
      this.InfoPointGroup.add(sprite)
      let label = infoLabel(data, label3d, this.InfoPointGroup)
      this.infoLabelElement.push(label)
      this.interactionManager.add(sprite)
      sprite.addEventListener("mousedown", (ev) => {
        if (this.clicked || !this.InfoPointGroup.visible) return false
        this.clicked = true
        this.infoPointIndex = ev.target.userData.index
        this.infoLabelElement.map((label) => {
          label.visible = false
        })
        label.visible = true
        this.createInfoPointLabelLoop()
      })
      sprite.addEventListener("mouseup", (ev) => {
        this.clicked = false
      })
      sprite.addEventListener("mouseover", (event) => {
        document.body.style.cursor = "pointer"
      })
      sprite.addEventListener("mouseout", (event) => {
        document.body.style.cursor = "default"
      })
    })
    function infoLabel(data, label3d, labelGroup) {
      let label = label3d.create("", "info-point", true)
      const [x, y] = self.geoProjection([data.lng, data.lat])
      label.init(
        ` <div class="info-point-wrap">
          <div class="info-point-wrap-inner">
            <div class="info-point-line">
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
            <div class="info-point-content">
              <div class="content-item"><span class="label">名称</span><span class="value">${data.name}</span></div>
              <div class="content-item"><span class="label">PM2.5</span><span class="value">${data.value}ug/m²</span></div>
              <div class="content-item"><span class="label">等级</span><span class="value">${data.level}</span></div>
            </div>
          </div>
        </div>
      `,
        new Vector3(x, -y, self.depth + 1.9)
      )
      label3d.setLabelStyle(label, 0.015, "x")
      label.setParent(labelGroup)
      label.visible = false
      return label
    }
  }
  createInfoPointLabelLoop() {
    clearInterval(this.infoPointLabelTime)
    this.infoPointLabelTime = setInterval(() => {
      this.infoPointIndex++
      if (this.infoPointIndex >= this.infoLabelElement.length) {
        this.infoPointIndex = 0
      }
      this.infoLabelElement.map((label, i) => {
        if (this.infoPointIndex === i) {
          label.visible = true
        } else {
          label.visible = false
        }
      })
    }, 3000)
  }
  createStorke() {
    const strokeTheme = this.theme.stroke || {}
    const strokeTextureRepeat = resolveTuple(strokeTheme.textureRepeat, [2, 1])
    const mapStroke = this.getBusinessProvinceMapData("mapStroke")
    const texture = this.assets.instance.getResource("pathLine3")
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(strokeTextureRepeat[0], strokeTextureRepeat[1])

    let pathLine = new Line(this, {
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      position: new Vector3(0, 0, this.depth + 0.24),
      data: mapStroke,
      material: new MeshBasicMaterial({
        color: strokeTheme.color ?? 0x2bc4dc,
        map: texture,
        alphaMap: texture,
        fog: false,
        transparent: true,
        opacity: 1,
        blending: AdditiveBlending,
      }),
      type: "Line3",
      renderOrder: 22,
      tubeRadius: toNumber(strokeTheme.tubeRadius, 0.03),
    })
    // 设置父级
    this.focusMapGroup.add(pathLine.lineGroup)
    const strokeTextureSpeedX = toNumber(strokeTheme.textureSpeedX, 0.005)
    this.time.on("tick", () => {
      texture.offset.x += strokeTextureSpeedX
    })
  }

  geoProjection(args) {
    return geoMercator().center(this.geoProjectionCenter).scale(this.geoProjectionScale).translate([0, 0])(args)
  }
  update() {
    super.update()
    this.interactionManager && this.interactionManager.update()
  }
  destroy() {
    this.disposeCloudLayer()
    if (this.sideFlowTickHandler) {
      this.time.off("tick", this.sideFlowTickHandler)
      this.sideFlowTickHandler = null
    }
    this.childMap && this.childMap.destroy()
    this.childMap = null
    this.label3d && this.label3d.destroy()
    this.setReturnButtonVisible(false)
    document.body.style.cursor = "default"
    super.destroy()
  }
}
