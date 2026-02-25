<template>
  <div class="earth-flyline-intro" :class="{ 'is-active': active }" ref="layerRef">
    <div class="earth-flyline-stage" ref="stageRef"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue"
import earthFlyLine from "earth-flyline"
import gsap from "gsap"
import marketingCenters, { FLYLINE_CENTER_ID } from "@/views/visualization/map/map/marketingCenters"
import introTransitionConfig from "../config/introTransitionConfig"
import { DEFAULT_CHINA_REGION_NAMES } from "@/views/shared/viewConstants"

const stageRef = ref(null)
const layerRef = ref(null)
const readyProgress = ref(0)
const readyProgressListeners = new Set()

const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
})

let chartScene = null
let readyPromise = null
let playPromise = null
let playTimeline = null
let chartClickBound = false
let sceneBaseState = null
const chartClickListeners = new Set()

const INTRO_EARTH_SETTINGS = introTransitionConfig.introEarth
const INTRO_MAP_NAME = INTRO_EARTH_SETTINGS.mapName
const INTRO_MAP_DATA_SETTINGS = INTRO_EARTH_SETTINGS.mapData || {}
const INTRO_ANIMATION_SETTINGS = INTRO_EARTH_SETTINGS.animation || {}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function resolveFiniteNumber(value, fallback) {
  return Number.isFinite(value) ? value : Number(fallback) || 0
}

function emitReadyProgress(value) {
  const normalized = clamp(Number(value) || 0, 0, 1)
  readyProgress.value = normalized
  readyProgressListeners.forEach((listener) => {
    listener(normalized)
  })
}

function subscribeReadyProgress(listener) {
  if (typeof listener !== "function") {
    return () => {}
  }
  readyProgressListeners.add(listener)
  listener(readyProgress.value)
  return () => {
    readyProgressListeners.delete(listener)
  }
}

function notifyChartClick(event, params) {
  chartClickListeners.forEach((listener) => {
    try {
      listener(event, params)
    } catch (error) {
      console.warn("[earth-flyline] click listener error", error)
    }
  })
}

function bindChartClickEvent() {
  if (chartClickBound || !chartScene?.on) {
    return
  }
  chartClickBound = true
  chartScene.on("click", (event, params) => {
    notifyChartClick(event, params)
  })
}

function onChartClick(listener) {
  if (typeof listener !== "function") {
    return () => {}
  }
  chartClickListeners.add(listener)
  bindChartClickEvent()
  return () => {
    chartClickListeners.delete(listener)
  }
}

function normalizeVec3(vector) {
  const length = Math.hypot(vector.x || 0, vector.y || 0, vector.z || 0)
  if (length <= 1e-8) {
    return { x: 0, y: 0, z: 1 }
  }
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  }
}

function lonLatToGlobeVector(lon, lat) {
  const lonRadian = (-Number(lon) || 0) * Math.PI / 180
  const latRadian = (Number(lat) || 0) * Math.PI / 180
  return normalizeVec3({
    x: Math.cos(latRadian) * Math.cos(lonRadian),
    y: Math.sin(latRadian),
    z: Math.cos(latRadian) * Math.sin(lonRadian),
  })
}

function normalizeRadian(value) {
  let result = Number(value) || 0
  while (result > Math.PI) {
    result -= Math.PI * 2
  }
  while (result < -Math.PI) {
    result += Math.PI * 2
  }
  return result
}

function focusGlobeByLonLat(lon, lat) {
  const container = chartScene?.mainContainer
  const camera = chartScene?.camera
  if (!container || !camera || !container.rotation) {
    return
  }

  // Keep globe upright: only adjust yaw so China faces camera.
  const target = lonLatToGlobeVector(lon, lat)
  const targetYaw = Math.atan2(target.z, target.x)
  const cameraYaw = Math.atan2(camera.position?.z || 1, camera.position?.x || 0)
  container.rotation.order = "YXZ"
  container.rotation.x = INTRO_EARTH_SETTINGS.focusChina.tiltX
  container.rotation.y = normalizeRadian(targetYaw - cameraYaw)
  container.rotation.z = Number(INTRO_EARTH_SETTINGS.focusChina.rollZ ?? 0)
  container.updateMatrixWorld?.(true)
}

function focusChina() {
  focusGlobeByLonLat(INTRO_EARTH_SETTINGS.focusChina.lon, INTRO_EARTH_SETTINGS.focusChina.lat)
}

function createEmptyFeatureCollection() {
  return {
    type: "FeatureCollection",
    features: [],
  }
}

function captureBaseViewState() {
  if (!chartScene?.camera || !chartScene?.mainContainer) {
    sceneBaseState = null
    return
  }
  const camera = chartScene.camera
  const container = chartScene.mainContainer
  const controls = chartScene.controls
  sceneBaseState = {
    cameraPosition: {
      x: camera.position?.x || 0,
      y: camera.position?.y || 0,
      z: camera.position?.z || 0,
    },
    cameraFov: Number.isFinite(camera.fov) ? camera.fov : 75,
    containerScale: {
      x: container.scale?.x || 1,
      y: container.scale?.y || 1,
      z: container.scale?.z || 1,
    },
    containerRotation: {
      x: container.rotation?.x || 0,
      y: container.rotation?.y || 0,
      z: container.rotation?.z || 0,
      order: container.rotation?.order || "XYZ",
    },
    controlTarget: controls?.target
      ? {
          x: controls.target.x,
          y: controls.target.y,
          z: controls.target.z,
        }
      : null,
  }
  controls?.saveState?.()
}

function resetViewState() {
  const camera = chartScene?.camera
  const container = chartScene?.mainContainer
  const controls = chartScene?.controls
  if (!camera || !container) {
    return
  }

  playTimeline && playTimeline.kill()
  playTimeline = null
  playPromise = null

  chartScene.options.autoRotate = false
  chartScene.setRotateSpeed && chartScene.setRotateSpeed(0)
  if (typeof controls?.enabled === "boolean") {
    controls.enabled = true
  }

  if (sceneBaseState?.cameraPosition) {
    camera.position.set(
      sceneBaseState.cameraPosition.x,
      sceneBaseState.cameraPosition.y,
      sceneBaseState.cameraPosition.z
    )
  }
  if (Number.isFinite(sceneBaseState?.cameraFov)) {
    camera.fov = sceneBaseState.cameraFov
    camera.updateProjectionMatrix()
  }
  if (container.scale && sceneBaseState?.containerScale) {
    container.scale.set(
      sceneBaseState.containerScale.x,
      sceneBaseState.containerScale.y,
      sceneBaseState.containerScale.z
    )
  }
  if (container.rotation && sceneBaseState?.containerRotation) {
    container.rotation.order = sceneBaseState.containerRotation.order || container.rotation.order
    container.rotation.x = sceneBaseState.containerRotation.x
    container.rotation.y = sceneBaseState.containerRotation.y
    container.rotation.z = sceneBaseState.containerRotation.z
  }
  const lookAt = INTRO_ANIMATION_SETTINGS.lookAt || {}
  focusChina()
  camera.lookAt(
    resolveFiniteNumber(lookAt.x, 0),
    resolveFiniteNumber(lookAt.y, 0),
    resolveFiniteNumber(lookAt.z, 0)
  )
  if (controls?.target) {
    const controlTarget = sceneBaseState?.controlTarget || {
      x: resolveFiniteNumber(lookAt.x, 0),
      y: resolveFiniteNumber(lookAt.y, 0),
      z: resolveFiniteNumber(lookAt.z, 0),
    }
    controls.target.set(controlTarget.x, controlTarget.y, controlTarget.z)
  }
  controls?.reset?.()
  if (controls?.target && sceneBaseState?.controlTarget) {
    controls.target.set(sceneBaseState.controlTarget.x, sceneBaseState.controlTarget.y, sceneBaseState.controlTarget.z)
  }
  controls?.update?.()
  container.updateMatrixWorld?.(true)
  resetIntroLayer()
}

function hasRenderableScene() {
  const canvas = stageRef.value?.querySelector?.("canvas")
  const hasCanvas = Boolean(canvas && canvas.width > 0 && canvas.height > 0)
  const container = chartScene?.mainContainer
  const hasContainer = Boolean(container)
  const hasChildren = Boolean(container?.children?.length)
  return hasCanvas && hasContainer && hasChildren
}

async function waitForRenderableScene(options = {}) {
  const { timeout = 0 } = options
  const start = performance.now()
  return new Promise((resolve) => {
    const tick = () => {
      if (hasRenderableScene()) {
        requestAnimationFrame(() => resolve(true))
        return
      }
      if (timeout > 0 && performance.now() - start >= timeout) {
        resolve(false)
        return
      }
      requestAnimationFrame(tick)
    }
    tick()
  })
}

function normalizeFeatureCollection(raw) {
  if (!raw || typeof raw !== "object") {
    return createEmptyFeatureCollection()
  }
  const features = Array.isArray(raw.features) ? raw.features : []
  return {
    type: "FeatureCollection",
    features,
  }
}

function normalizeRegionName(value) {
  return `${value || ""}`.trim().toLowerCase()
}

function resolveChinaRegionNames() {
  const configuredNames = INTRO_EARTH_SETTINGS.mapStreamLine?.targetNames
    || INTRO_EARTH_SETTINGS.clickToMap?.chinaRegionNames
    || DEFAULT_CHINA_REGION_NAMES
  return configuredNames.map((name) => normalizeRegionName(name)).filter(Boolean)
}

function isFeatureMatchedByRegionNames(feature, regionNames) {
  if (!feature || !feature.properties || !regionNames.length) {
    return false
  }

  const properties = feature.properties
  const fieldCandidates = [
    properties.name,
    properties.NAME,
    properties.name_en,
    properties.NAME_EN,
    properties.admin,
    properties.ADMIN,
    properties.name_long,
    properties.NAME_LONG,
  ]

  const candidates = fieldCandidates
    .filter((value) => value !== undefined && value !== null)
    .map((value) => normalizeRegionName(value))
    .filter(Boolean)

  if (!candidates.length) {
    Object.values(properties).forEach((value) => {
      if (typeof value === "string") {
        candidates.push(normalizeRegionName(value))
      }
    })
  }

  return candidates.some((candidate) => {
    return regionNames.some((regionName) => {
      return candidate === regionName || candidate.includes(regionName) || regionName.includes(candidate)
    })
  })
}

function findRegionFeatureByNames(mapGeoJson, regionNames) {
  const features = Array.isArray(mapGeoJson?.features) ? mapGeoJson.features : []
  return features.find((feature) => isFeatureMatchedByRegionNames(feature, regionNames)) || null
}

function resolveMapStreamGeometryList(geometry) {
  if (!geometry) {
    return []
  }

  if (geometry.type === "Polygon" && Array.isArray(geometry.coordinates)) {
    return [geometry.coordinates]
  }
  if (geometry.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates
  }
  if (geometry.type === "GeometryCollection" && Array.isArray(geometry.geometries)) {
    return geometry.geometries.flatMap((item) => resolveMapStreamGeometryList(item))
  }
  return []
}

function resolveIntroMapStreamLineStyle() {
  const style = {
    ...(INTRO_EARTH_SETTINGS.sceneConfig?.mapStreamStyle || {}),
    ...(INTRO_EARTH_SETTINGS.mapStreamLine?.style || {}),
  }
  if (!style.color) {
    style.color =
      INTRO_EARTH_SETTINGS.sceneConfig?.mapStyle?.lineColor
      || INTRO_EARTH_SETTINGS.sceneConfig?.pathStyle?.color
      || INTRO_EARTH_SETTINGS.flyLineStyle?.color
  }
  return style
}

function createIntroMapStreamLineData(mapGeoJson) {
  if (INTRO_EARTH_SETTINGS.mapStreamLine?.enabled === false) {
    return []
  }

  const regionNames = resolveChinaRegionNames()
  const regionFeature = findRegionFeatureByNames(mapGeoJson, regionNames)
  if (!regionFeature) {
    console.warn("[earth-flyline] mapStreamLine target region not found", regionNames)
    return []
  }

  const polygonList = resolveMapStreamGeometryList(regionFeature.geometry)
  if (!polygonList.length) {
    return []
  }

  const streamLineStyle = resolveIntroMapStreamLineStyle()
  return polygonList.map((coordinates) => {
    return {
      data: coordinates,
      style: { ...streamLineStyle },
    }
  })
}

async function loadIntroMapGeoJson() {
  const baseUrl = import.meta.env.BASE_URL || "/"
  const sourcePaths = Array.isArray(INTRO_MAP_DATA_SETTINGS.sourcePaths) && INTRO_MAP_DATA_SETTINGS.sourcePaths.length
    ? INTRO_MAP_DATA_SETTINGS.sourcePaths
    : ["assets/json/world.json", "assets/json/中华人民共和国.json"]
  const useEncodedFallback = INTRO_MAP_DATA_SETTINGS.useEncodedFallback !== false
  const fetchOptions = {
    referrerPolicy: "no-referrer",
    ...(INTRO_MAP_DATA_SETTINGS.fetchOptions || {}),
  }
  const urlCandidates = []
  sourcePaths.forEach((pathValue) => {
    const path = `${pathValue || ""}`.replace(/^\//, "")
    if (!path) {
      return
    }
    urlCandidates.push(`${baseUrl}${path}`)
    if (!useEncodedFallback) {
      return
    }
    const encodedPath = encodeURI(path)
    if (encodedPath !== path) {
      urlCandidates.push(`${baseUrl}${encodedPath}`)
    }
  })

  for (let i = 0; i < urlCandidates.length; i += 1) {
    const url = urlCandidates[i]
    try {
      const response = await fetch(url, fetchOptions)
      if (!response.ok) {
        continue
      }
      const data = await response.json()
      const normalized = normalizeFeatureCollection(data)
      if (normalized.features.length) {
        return normalized
      }
    } catch (error) {
      // noop
    }
  }

  console.warn("[earth-flyline] intro map data fallback to empty feature collection")
  return createEmptyFeatureCollection()
}

function createIntroConfig() {
  const sceneConfig = INTRO_EARTH_SETTINGS.sceneConfig
  const textMarkConfig = INTRO_EARTH_SETTINGS.textMark || {}
  return {
    dom: stageRef.value,
    map: INTRO_MAP_NAME,
    mode: "3d",
    autoRotate: false,
    rotateSpeed: 0,
    controls: "builtIn",
    config: {
      R: sceneConfig.R,
      zoom: sceneConfig.zoom,
      enableZoom: sceneConfig.enableZoom,
      stopRotateByHover: sceneConfig.stopRotateByHover,
      bgStyle: { ...sceneConfig.bgStyle },
      earth: { ...sceneConfig.earth },
      mapStyle: { ...sceneConfig.mapStyle },
      spriteStyle: { ...sceneConfig.spriteStyle },
      pathStyle: { ...sceneConfig.pathStyle },
      flyLineStyle: { ...sceneConfig.flyLineStyle },
      roadStyle: {
        flyLineStyle: { ...sceneConfig.roadStyle.flyLineStyle },
        pathStyle: { ...sceneConfig.roadStyle.pathStyle },
      },
      mapStreamStyle: { ...(sceneConfig.mapStreamStyle || {}) },
      scatterStyle: { ...sceneConfig.scatterStyle },
      hoverRegionStyle: { ...sceneConfig.hoverRegionStyle },
      barStyle: { ...sceneConfig.barStyle },
      textMark: {
        style: { ...(textMarkConfig.style || {}) },
      },
    },
  }
}

function getFlyLineCenter() {
  return marketingCenters.find((item) => item.id === FLYLINE_CENTER_ID) || marketingCenters[0]
}

function createIntroFlyLineData() {
  const center = getFlyLineCenter()
  if (!center) {
    return []
  }
  return marketingCenters
    .filter((item) => item.id !== center.id)
    .map((item, index) => {
      return {
        id: `intro-flyline-${index}`,
        from: {
          id: `intro-center-${center.id}`,
          lon: center.lng,
          lat: center.lat,
        },
        to: {
          id: `intro-target-${item.id}`,
          lon: item.lng,
          lat: item.lat,
        },
        style: {
          flyLineStyle: { ...INTRO_EARTH_SETTINGS.flyLineStyle },
          pathStyle: { ...INTRO_EARTH_SETTINGS.flyLinePathStyle },
        },
      }
    })
}

function createIntroPointData() {
  const center = getFlyLineCenter()
  return marketingCenters.map((item) => {
    const isCenter = center && item.id === center.id
    return {
      id: `intro-point-${item.id}`,
      lon: item.lng,
      lat: item.lat,
      style: {
        color: isCenter ? INTRO_EARTH_SETTINGS.pointStyle.centerColor : INTRO_EARTH_SETTINGS.pointStyle.normalColor,
        size: isCenter ? INTRO_EARTH_SETTINGS.pointStyle.centerSize : INTRO_EARTH_SETTINGS.pointStyle.normalSize,
      },
    }
  })
}

function createIntroTextMarkData() {
  const center = getFlyLineCenter()
  if (!center) {
    return []
  }
  const textMarkConfig = INTRO_EARTH_SETTINGS.textMark || {}
  return [
    {
      id: `intro-textmark-${center.id}`,
      text:
        center.labelName ||
        center.cityName ||
        center.name ||
        textMarkConfig.centerFallbackText ||
        "南京市",
      position: {
        lon: center.lng,
        lat: center.lat,
      },
      style: { ...(textMarkConfig.centerStyle || {}) },
    },
  ]
}

async function initIntroScene() {
  if (!stageRef.value) {
    emitReadyProgress(1)
    return
  }

  try {
    emitReadyProgress(INTRO_EARTH_SETTINGS.preloadProgress.mapLoading)
    const mapGeoJson = await loadIntroMapGeoJson()
    emitReadyProgress(INTRO_EARTH_SETTINGS.preloadProgress.mapReady)

    earthFlyLine.registerMap(INTRO_MAP_NAME, mapGeoJson)
    chartScene = earthFlyLine.init(createIntroConfig())
    const controlSettings = INTRO_EARTH_SETTINGS.controls
    if (chartScene?.controls) {
      if ("enableZoom" in chartScene.controls) {
        chartScene.controls.enableZoom = controlSettings.enableZoom
      }
      if ("enablePan" in chartScene.controls) {
        chartScene.controls.enablePan = controlSettings.enablePan
      }
      if ("enableRotate" in chartScene.controls) {
        chartScene.controls.enableRotate = controlSettings.enableRotate
      }
      if ("minDistance" in chartScene.controls) {
        chartScene.controls.minDistance = controlSettings.minDistance
      }
      if ("maxDistance" in chartScene.controls) {
        chartScene.controls.maxDistance = controlSettings.maxDistance
      }
    }
    bindChartClickEvent()
    emitReadyProgress(INTRO_EARTH_SETTINGS.preloadProgress.sceneReady)

    const mapStreamLineData = createIntroMapStreamLineData(mapGeoJson)
    await Promise.all([
      chartScene.setData("flyLine", createIntroFlyLineData()),
      chartScene.setData("point", createIntroPointData()),
      chartScene.setData("textMark", createIntroTextMarkData()),
      ...(mapStreamLineData.length ? [chartScene.setData("mapStreamLine", mapStreamLineData[0])] : []),
    ])
    if (mapStreamLineData.length > 1) {
      await Promise.all(
        mapStreamLineData
          .slice(1)
          .map((item) => chartScene.addData("mapStreamLine", item))
      )
    }
    focusChina()
    captureBaseViewState()
    emitReadyProgress(INTRO_EARTH_SETTINGS.preloadProgress.dataReady)
    await waitForRenderableScene()
    emitReadyProgress(1)
  } catch (error) {
    emitReadyProgress(1)
    console.warn("[earth-flyline] intro scene init failed", error)
  }
}

function resetIntroLayer() {
  if (!layerRef.value) {
    return
  }
  gsap.set(layerRef.value, { opacity: 1 })
}

function ensureVisible() {
  resetIntroLayer()
}

async function play(options = {}) {
  const animationSettings = INTRO_ANIMATION_SETTINGS
  const {
    duration = animationSettings.defaultDuration,
    holdDuration = animationSettings.defaultHoldDuration,
    fadeOutDuration = animationSettings.defaultFadeOutDuration,
    onProgress,
  } = options

  await readyPromise
  if (!chartScene || !chartScene.camera || !layerRef.value) {
    return
  }
  if (playPromise) {
    return playPromise
  }

  playTimeline && playTimeline.kill()
  resetIntroLayer()

  const camera = chartScene.camera
  const container = chartScene.mainContainer
  const controls = chartScene.controls
  const controlEnabledBeforePlay = typeof controls?.enabled === "boolean" ? controls.enabled : null
  if (typeof controls?.enabled === "boolean") {
    controls.enabled = false
  }
  const cameraStartFallback = animationSettings.cameraStartFallback || {}
  const lookAt = animationSettings.lookAt || {}
  const containerStartScaleFallback = resolveFiniteNumber(animationSettings.containerStartScale, 1)

  const cameraStart = {
    x: resolveFiniteNumber(camera.position.x, cameraStartFallback.x),
    y: resolveFiniteNumber(camera.position.y, cameraStartFallback.y),
    z: resolveFiniteNumber(camera.position.z, cameraStartFallback.z),
  }
  const cameraEnd = {
    x: cameraStart.x * animationSettings.cameraPushScale,
    y: cameraStart.y * animationSettings.cameraPushScale,
    z: cameraStart.z * animationSettings.cameraPushScale,
  }
  const cameraFovStart = resolveFiniteNumber(camera.fov, animationSettings.cameraFovStart)
  camera.fov = cameraFovStart
  camera.updateProjectionMatrix()
  camera.lookAt(
    resolveFiniteNumber(lookAt.x, 0),
    resolveFiniteNumber(lookAt.y, 0),
    resolveFiniteNumber(lookAt.z, 0)
  )

  const containerStartScale = {
    x: resolveFiniteNumber(container?.scale?.x, containerStartScaleFallback),
    y: resolveFiniteNumber(container?.scale?.y, containerStartScaleFallback),
    z: resolveFiniteNumber(container?.scale?.z, containerStartScaleFallback),
  }

  const containerEndScale = {
    x: containerStartScale.x * animationSettings.globeScaleEnd,
    y: containerStartScale.y * animationSettings.globeScaleEnd,
    z: containerStartScale.z * animationSettings.globeScaleEnd,
  }

  const progressState = { value: 0 }
  const rotateState = { value: animationSettings.rotateSpeedPushStart }
  const clampedHoldDuration = Math.max(0, Number(holdDuration) || 0)
  const pushDuration = Math.max(animationSettings.minDuration, Number(duration) || animationSettings.minDuration)
  const totalDuration = clampedHoldDuration + pushDuration
  chartScene.options.autoRotate = true
  chartScene.setRotateSpeed && chartScene.setRotateSpeed(rotateState.value)
  typeof onProgress === "function" && onProgress(0)

  playPromise = new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (typeof controls?.enabled === "boolean" && controlEnabledBeforePlay !== null) {
          controls.enabled = controlEnabledBeforePlay
        }
        chartScene.options.autoRotate = false
        chartScene.setRotateSpeed && chartScene.setRotateSpeed(0)
        typeof onProgress === "function" && onProgress(1)
        playTimeline = null
        playPromise = null
        resolve()
      },
    })

    tl.to(progressState, {
      value: 1,
      duration: totalDuration,
      ease: "none",
      onUpdate: () => {
        typeof onProgress === "function" && onProgress(progressState.value)
      },
    }, 0)

    tl.to(rotateState, {
      value: animationSettings.rotateSpeedPushEnd,
      duration: pushDuration,
      ease: "power2.out",
      onUpdate: () => {
        chartScene.setRotateSpeed && chartScene.setRotateSpeed(rotateState.value)
      },
    }, clampedHoldDuration)

    if (container?.scale) {
      tl.to(container.scale, {
        duration: pushDuration,
        x: containerEndScale.x,
        y: containerEndScale.y,
        z: containerEndScale.z,
        ease: "power2.out",
      }, clampedHoldDuration)
    }

    tl.to(camera.position, {
      duration: pushDuration,
      x: cameraEnd.x,
      y: cameraEnd.y,
      z: cameraEnd.z,
      ease: "power2.out",
      onUpdate: () => {
        camera.lookAt(
          resolveFiniteNumber(lookAt.x, 0),
          resolveFiniteNumber(lookAt.y, 0),
          resolveFiniteNumber(lookAt.z, 0)
        )
      },
    }, clampedHoldDuration)

    tl.to(camera, {
      duration: pushDuration,
      fov: animationSettings.cameraFovEnd,
      ease: "power2.out",
      onUpdate: () => {
        camera.updateProjectionMatrix()
      },
    }, clampedHoldDuration)

    tl.to(layerRef.value, {
      opacity: 0,
      duration: fadeOutDuration,
      ease: "power2.out",
    }, `>-${Math.min(animationSettings.fadeOverlapMax, fadeOutDuration)}`)

    playTimeline = tl
  })

  return playPromise
}

function destroyScene() {
  playTimeline && playTimeline.kill()
  playTimeline = null
  playPromise = null
  chartClickBound = false
  chartClickListeners.clear()
  sceneBaseState = null
  if (!chartScene) {
    return
  }
  if (typeof chartScene.destroy === "function") {
    chartScene.destroy()
  } else if (typeof chartScene.destory === "function") {
    chartScene.destory()
  }
  chartScene = null
}

async function waitUntilReady(options = {}) {
  const { onProgress } = options
  let unsubscribe = () => {}
  if (typeof onProgress === "function") {
    unsubscribe = subscribeReadyProgress(onProgress)
  }
  try {
    await readyPromise
  } finally {
    unsubscribe()
  }
}

async function waitUntilRenderable(options = {}) {
  await readyPromise
  return waitForRenderableScene(options)
}

onMounted(() => {
  readyPromise = initIntroScene()
})

onBeforeUnmount(() => {
  destroyScene()
})

defineExpose({
  play,
  destroyScene,
  waitUntilReady,
  waitUntilRenderable,
  ensureVisible,
  focusChina,
  resetViewState,
  onChartClick,
})
</script>

<style scoped lang="scss">
.earth-flyline-intro {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  background: radial-gradient(circle at 50% 46%, rgba(38, 110, 150, 0.2) 0%, rgba(8, 24, 41, 0.82) 74%);
}

.earth-flyline-intro.is-active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.earth-flyline-stage {
  width: 100%;
  height: 100%;
  :deep(canvas) {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
