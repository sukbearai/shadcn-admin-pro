<template>
  <div class="large-screen">
    <!-- 地图 -->
    <mapScene ref="mapSceneRef" :world-options="resolvedWorldOptions"
      :class="{ 'map-scene-hidden': state.showEarthIntro }"></mapScene>
    <!-- 地球飞线过渡层 -->
    <IntroEarthFlyline :active="state.showEarthIntro" ref="introEarthFlylineRef"></IntroEarthFlyline>
    <!-- 全屏云层（独立于地图） -->
    <ScreenCloudLayer ref="screenCloudLayerRef"></ScreenCloudLayer>
    <div class="large-screen-wrap" :id="VIEW_IDS.LARGE_SCREEN" :class="{ 'is-earth-intro': state.showEarthIntro }">
      <m-header :title="globeViewConfig.header.title" :sub-text="globeViewConfig.header.subText">
        <!--左侧 天气（暂时注释，后续可恢复）
        <template v-slot:left>
          <div class="m-header-weather"><span>小雪</span><span>-4℃</span></div>
        </template>
-->
        <!--右侧 日期 -->
        <template v-slot:right>
          <div class="m-header-date"><span>{{ state.currentDate }}</span><span>{{ state.currentTime }}</span></div>
        </template>
      </m-header>
      <!-- 顶部菜单 -->
      <div class="top-menu">
        <mMenu :default-active="state.activeIndex" @select="handleMenuSelect">
          <mMenuItem v-for="item in globeViewConfig.menu.items" :key="item.index" :index="item.index">
            {{ item.label }}
          </mMenuItem>
        </mMenu>
      </div>
      <!-- 顶部统计卡片（暂时注释，后续可恢复）
      <div class="top-count-card">
        <mCountCard v-for="(item, index) in state.totalView" :info="item" :key="index"></mCountCard>
      </div>
      -->
      <!-- 左边布局 图表 -->
      <div class="left-wrap">
        <div class="left-wrap-3d">
          <component
            v-for="panel in globeViewConfig.panels.left"
            :key="panel.id"
            :is="panel.component"
            v-bind="panel.props || {}"
          ></component>
        </div>
      </div>
      <!-- 右边布局 图表 -->
      <div class="right-wrap">
        <div class="right-wrap-3d">
          <component
            v-for="panel in globeViewConfig.panels.right"
            :key="panel.id"
            :is="panel.component"
            v-bind="panel.props || {}"
          ></component>
        </div>
      </div>
      <!-- 底部托盘 -->
      <div class="bottom-tray">
        <!-- svg线条动画 -->
        <mSvglineAnimation class="bottom-svg-line-left" :width="721" :height="57" color="#30DCFF" :strokeWidth="2"
          :dir="[0, 1]" :length="50"
          :path="BOTTOM_TRAY_SVG_PATH">
        </mSvglineAnimation>
        <mSvglineAnimation class="bottom-svg-line-left bottom-svg-line-right" :width="721" :height="57" color="#30DCFF"
          :strokeWidth="2" :dir="[0, 1]" :length="50"
          :path="BOTTOM_TRAY_SVG_PATH">
        </mSvglineAnimation>
        <!-- 左箭头 -->
        <div class="bottom-tray-arrow">
          <img src="@/assets/images/bottom-menu-arrow-big.svg" alt="" />
          <img src="@/assets/images/bottom-menu-arrow-small.svg" alt="" />
        </div>
        <!-- 底部菜单（所有按钮放在同一对箭头中） -->
        <div class="bottom-menu bottom-menu-group">
          <div class="bottom-menu-item is-active switch-view-btn"
            :class="{ 'is-disabled': state.isViewSwitching || (state.showEarthIntro && !state.awaitingChinaClick) }"
            @click="toggleView">
            <span>{{ globeViewConfig.bottomTray.switchViewLabel }}</span>
          </div>
          <div v-if="state.showEarthIntro" class="bottom-menu-item is-active cloud-toggle-btn" @click="toggleCloudLayer">
            <span>{{
              state.cloudIdleVisible
                ? globeViewConfig.bottomTray.cloudOffLabel
                : globeViewConfig.bottomTray.cloudOnLabel
            }}</span>
          </div>
          <div class="bottom-menu-item is-active return-btn return-related" @click="goBack">
            <span>{{ globeViewConfig.bottomTray.returnLabel }}</span>
          </div>
        </div>
        <!-- 右箭头 -->
        <div class="bottom-tray-arrow is-reverse">
          <img src="@/assets/images/bottom-menu-arrow-big.svg" alt="" />
          <img src="@/assets/images/bottom-menu-arrow-small.svg" alt="" />
        </div>
      </div>
      <!-- 雷达 -->
      <div class="bottom-radar">
        <mRadar></mRadar>
      </div>
      <!-- 左右装饰线 -->
      <div class="large-screen-left-zsline"></div>
      <div class="large-screen-right-zsline"></div>
    </div>

    <!-- loading动画 -->
    <div class="loading">
      <div class="loading-text">
        <span
          v-for="(char, index) in loadingChars"
          :key="`${char}-${index}`"
          :style="{ '--index': index + 1 }"
        >
          {{ char }}
        </span>
      </div>
      <div class="loading-progress">
        <span class="value">{{ state.progress }}</span>
        <span class="unit">%</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, shallowRef, ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue"
import mapScene from "./map.vue"
import mHeader from "@/components/mHeader/index.vue"
import mMenu from "@/components/mMenu/index.vue"
import mRadar from "@/components/mRadar/index.vue"
import mMenuItem from "@/components/mMenuItem/index.vue"
import mSvglineAnimation from "@/components/mSvglineAnimation/index.vue"
import introTransitionConfig from "./config/introTransitionConfig"
import globeViewConfig from "./config/viewConfig"
import ScreenCloudLayer from "./components/ScreenCloudLayer.vue"
import IntroEarthFlyline from "./components/IntroEarthFlyline.vue"

import { Assets } from "./assets.js"
import globeWorldOptions from "./config/worldOptions.js"
import { createMapSkin } from "../map/skin"
import emitter from "@/utils/emitter"
import gsap from "gsap"
import autofit from "autofit.js"
import {
  BOTTOM_TRAY_SVG_PATH,
  CHINA_REGION_TYPE as DEFAULT_CHINA_REGION_TYPE,
  DEFAULT_CHINA_REGION_NAMES,
  DEFAULT_MENU_ACTIVE_INDEX,
  VIEW_EVENTS,
  VIEW_IDS,
  VIEW_SELECTORS,
} from "../shared/viewConstants"

const assets = shallowRef(null)
const mapSceneRef = ref(null)
const screenCloudLayerRef = ref(null)
const introEarthFlylineRef = ref(null)
const resolvedMapSkin = createMapSkin(globeWorldOptions?.skin || {})
const resolvedWorldOptions = computed(() => ({
  ...globeWorldOptions,
  skin: resolvedMapSkin,
}))
const loadingChars = globeViewConfig.loading.text.split("")
const INTRO_EARTH_SETTINGS = introTransitionConfig.introEarth || {}
const INTRO_TRANSITION_SETTINGS = introTransitionConfig.transition
const CLOUD_TRANSITION_SETTINGS = INTRO_TRANSITION_SETTINGS.cloud || {}
const LOADING_SETTINGS = INTRO_TRANSITION_SETTINGS.loading || {}
const LOADING_TWEEN_SETTINGS = LOADING_SETTINGS.tweenDuration || {}
const LOADING_HIDE_SETTINGS = LOADING_SETTINGS.hideAnimation || {}
const CHINA_CLICK_SETTINGS = INTRO_EARTH_SETTINGS.clickToMap || {}
const CHINA_REGION_TYPE = CHINA_CLICK_SETTINGS.chinaRegionType || DEFAULT_CHINA_REGION_TYPE
const CHINA_MATCH_KEYWORD = DEFAULT_CHINA_REGION_NAMES[0]
const EARTH_RENDERABLE_TIMEOUT = Number(INTRO_EARTH_SETTINGS.mapData?.renderableTimeout ?? 9000)
const loadingProgress = reactive({
  assets: 0,
  earth: 0,
})
const state = reactive({
  // 进度
  progress: 0,
  // 地球飞线过渡动画显示
  showEarthIntro: false,
  // 是否等待点击中国进入地图
  awaitingChinaClick: false,
  // 是否已触发场景切换
  hasStartedMapTransition: false,
  // 视图切换中
  isViewSwitching: false,
  // 是否展示 idle 云层
  cloudIdleVisible: CLOUD_TRANSITION_SETTINGS.idleVisible !== false,
  // 当前顶部导航索引
  activeIndex:
    globeViewConfig.menu.defaultActiveIndex || globeViewConfig.menu.items[0]?.index || DEFAULT_MENU_ACTIVE_INDEX,
  // 头部日期
  currentDate: "",
  // 头部时间
  currentTime: "",
  // 卡片统计数据
  totalView: globeViewConfig.totalView.map((item) => ({ ...item })),
})

let clockTimer = null
let earthIntroReadyPromise = null
let disposeEarthChartClick = null
let isUnmounted = false

const LOADING_WEIGHTS = {
  assets: Number(LOADING_SETTINGS.weights?.assets ?? 0.82),
  earth: Number(LOADING_SETTINGS.weights?.earth ?? 0.18),
}
const CHINA_REGION_NAMES = new Set(
  (Array.isArray(CHINA_CLICK_SETTINGS.chinaRegionNames) && CHINA_CLICK_SETTINGS.chinaRegionNames.length
    ? CHINA_CLICK_SETTINGS.chinaRegionNames
    : DEFAULT_CHINA_REGION_NAMES
  ).map((name) => `${name ?? ""}`.trim().toLowerCase())
)

function clamp01(value) {
  return Math.min(1, Math.max(0, Number(value) || 0))
}

function syncLoadingProgress() {
  const weightedProgress = loadingProgress.assets * LOADING_WEIGHTS.assets + loadingProgress.earth * LOADING_WEIGHTS.earth
  state.progress = Math.min(100, Math.floor(weightedProgress * 100))
}

function tweenLoadingProgress(key, value, duration) {
  const tweenDuration = Number(duration ?? LOADING_TWEEN_SETTINGS.default ?? 0.32)
  const target = clamp01(value)
  gsap.to(loadingProgress, {
    [key]: target,
    duration: tweenDuration,
    ease: "power2.out",
    onUpdate: syncLoadingProgress,
  })
}

function waitNextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function normalizeCountryName(value) {
  return `${value ?? ""}`.trim().toLowerCase()
}

function resolveClickedCountryName(params) {
  const userData = params?.userData || {}
  return userData.name || params?.name || userData.country || userData.countryName || ""
}

function isChinaRegionClick(params) {
  if (!params || params?.userData?.type !== CHINA_REGION_TYPE) {
    return false
  }
  const normalizedName = normalizeCountryName(resolveClickedCountryName(params))
  if (!normalizedName) {
    return false
  }
  return CHINA_REGION_NAMES.has(normalizedName) || normalizedName.includes(CHINA_MATCH_KEYWORD)
}

function unbindEarthIntroClick() {
  if (typeof disposeEarthChartClick === "function") {
    disposeEarthChartClick()
  }
  disposeEarthChartClick = null
}

function bindEarthIntroClick() {
  const introPlayer = introEarthFlylineRef.value
  if (!introPlayer?.onChartClick) {
    return
  }
  unbindEarthIntroClick()
  disposeEarthChartClick = introPlayer.onChartClick((event, params) => {
    if (!state.awaitingChinaClick || state.hasStartedMapTransition) {
      return
    }
    if (!isChinaRegionClick(params)) {
      return
    }
    startMapTransition()
  })
}

async function preloadEarthIntro() {
  await nextTick()
  const introPlayer = introEarthFlylineRef.value
  if (!introPlayer?.waitUntilReady) {
    tweenLoadingProgress("earth", 1, LOADING_TWEEN_SETTINGS.complete)
    return
  }
  try {
    await introPlayer.waitUntilReady({
      onProgress: (progress) => {
        tweenLoadingProgress("earth", progress, LOADING_TWEEN_SETTINGS.earthProgress)
      },
    })
  } catch (error) {
    console.warn("[earth-flyline] preload failed", error)
  } finally {
    tweenLoadingProgress("earth", 1, LOADING_TWEEN_SETTINGS.complete)
  }
}

async function prepareEarthIntroReveal() {
  const introPlayer = introEarthFlylineRef.value
  if (!introPlayer?.waitUntilRenderable) {
    return
  }
  try {
    await introPlayer.waitUntilRenderable({ timeout: EARTH_RENDERABLE_TIMEOUT })
  } catch (error) {
    console.warn("[earth-flyline] wait renderable failed", error)
  }
  introPlayer?.ensureVisible?.()
}

async function startMapTransition() {
  if (state.hasStartedMapTransition) {
    return
  }

  state.hasStartedMapTransition = true
  state.awaitingChinaClick = false
  unbindEarthIntroClick()

  try {
    await playEarthFlylineIntro({
      keepVisible: true,
      ...INTRO_TRANSITION_SETTINGS.startMapTransition,
    })
  } finally {
    mapSceneRef.value?.play?.()
    await waitNextFrame()
    state.showEarthIntro = false
    screenCloudLayerRef.value?.stopAndHide?.()
    introEarthFlylineRef.value?.resetViewState?.()
  }
}

async function switchToEarthIntro() {
  unbindEarthIntroClick()
  state.awaitingChinaClick = false
  state.hasStartedMapTransition = false
  screenCloudLayerRef.value?.stopAndHide?.()
  mapSceneRef.value?.resetScene?.()
  state.showEarthIntro = true
  await nextTick()
  introEarthFlylineRef.value?.resetViewState?.()
  introEarthFlylineRef.value?.focusChina?.()
  introEarthFlylineRef.value?.ensureVisible?.()
  if (isCloudIdleVisible()) {
    screenCloudLayerRef.value?.setIntroActive?.(false)
    screenCloudLayerRef.value?.setIntroProgress?.(0)
    screenCloudLayerRef.value?.setLayerVisible?.(true)
  }
  bindEarthIntroClick()
  state.awaitingChinaClick = true
}

function formatDateTime() {
  const now = new Date()
  const formatNum = (num) => String(num).padStart(2, "0")

  return {
    date: `${now.getFullYear()}-${formatNum(now.getMonth() + 1)}-${formatNum(now.getDate())}`,
    time: `${formatNum(now.getHours())}:${formatNum(now.getMinutes())}:${formatNum(now.getSeconds())}`,
  }
}

function updateHeaderDateTime() {
  const { date, time } = formatDateTime()
  state.currentDate = date
  state.currentTime = time
}

function isCloudEnabled() {
  return CLOUD_TRANSITION_SETTINGS.enabled !== false
}

function isCloudIdleVisible() {
  return isCloudEnabled() && state.cloudIdleVisible
}

onMounted(() => {
  isUnmounted = false
  updateHeaderDateTime()
  syncLoadingProgress()
  screenCloudLayerRef.value?.stopAndHide?.()
  earthIntroReadyPromise = preloadEarthIntro()
  clockTimer = setInterval(() => {
    updateHeaderDateTime()
  }, 1000)

  // 监听地图播放完成，执行事件
  emitter.$on(VIEW_EVENTS.MAP_PLAY_COMPLETE, handleMapPlayComplete)
  // 自动适配
  autofit.init(globeViewConfig.autofit)
  // 初始化资源
  initAssets(async () => {
    if (isUnmounted) return
    await earthIntroReadyPromise
    if (isUnmounted) return
    // 加载地图
    emitter.$emit(VIEW_EVENTS.LOAD_MAP, assets.value)
    // 等待地球场景可渲染，避免loading结束后空窗
    await prepareEarthIntroReveal()
    // loading结束后默认展示地球，等待用户点击中国
    state.showEarthIntro = true
    await nextTick()
    introEarthFlylineRef.value?.focusChina?.()
    introEarthFlylineRef.value?.ensureVisible?.()
    bindEarthIntroClick()
    // 隐藏loading
    await hideLoading()
    if (isUnmounted) return
    // 首屏云层是否展示由配置控制
    if (isCloudIdleVisible()) {
      screenCloudLayerRef.value?.setIntroActive?.(false)
      screenCloudLayerRef.value?.setIntroProgress?.(0)
      screenCloudLayerRef.value?.setLayerVisible?.(true)
    } else {
      screenCloudLayerRef.value?.stopAndHide?.()
    }
    state.awaitingChinaClick = true
    state.hasStartedMapTransition = false
  })
})
onBeforeUnmount(() => {
  isUnmounted = true
  emitter.$off(VIEW_EVENTS.MAP_PLAY_COMPLETE, handleMapPlayComplete)
  unbindEarthIntroClick()
  state.awaitingChinaClick = false
  state.hasStartedMapTransition = false
  screenCloudLayerRef.value?.resetIntro?.()
  autofit.off(VIEW_SELECTORS.LARGE_SCREEN)
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
  assets.value?.instance?.destroy?.()
  assets.value = null
})
// 初始化加载资源
function initAssets(onLoadCallback) {
  assets.value = new Assets({ skin: resolvedMapSkin })

  assets.value.instance.on("onProgress", (path, itemsLoaded, itemsTotal) => {
    if (isUnmounted) return
    const progress = itemsTotal > 0 ? itemsLoaded / itemsTotal : 0
    tweenLoadingProgress("assets", progress)
  })
  // 资源加载完成
  assets.value.instance.on("onLoad", () => {
    tweenLoadingProgress("assets", 1, LOADING_TWEEN_SETTINGS.complete)
    Promise.resolve(onLoadCallback?.()).catch((error) => {
      console.warn("[globe-view] onLoad callback failed", error)
    })
  })
}

// 隐藏loading
async function hideLoading() {
  const textTranslateY = LOADING_HIDE_SETTINGS.textTranslateY || "120%"
  const textDuration = Number(LOADING_HIDE_SETTINGS.textDuration ?? 0.65)
  const textStagger = Number(LOADING_HIDE_SETTINGS.textStagger ?? 0.06)
  const progressDuration = Number(LOADING_HIDE_SETTINGS.progressDuration ?? 0.45)
  const layerDuration = Number(LOADING_HIDE_SETTINGS.layerDuration ?? 0.45)
  const overlapOffset = Number(LOADING_HIDE_SETTINGS.overlapOffset ?? 0.18)
  return new Promise((resolve, reject) => {
    let tl = gsap.timeline()
    tl.to(VIEW_SELECTORS.LOADING_TEXT_CHARS, {
      y: textTranslateY,
      opacity: 0,
      ease: "power2.inOut",
      duration: textDuration,
      stagger: textStagger,
    })
    tl.to(VIEW_SELECTORS.LOADING_PROGRESS, { opacity: 0, ease: "power2.inOut", duration: progressDuration }, "<")
    tl.to(
      VIEW_SELECTORS.LOADING_LAYER,
      {
        opacity: 0,
        duration: layerDuration,
        ease: "power2.out",
        onComplete: () => {
          resolve()
        },
      },
      `-=${overlapOffset}`
    )
  })
}

function handleMenuSelect(index) {
  state.activeIndex = index
}

function goBack() {
  mapSceneRef.value && mapSceneRef.value.goBack()
}

function tweenIfTargets(timeline, targets, vars, position) {
  const targetList = Array.isArray(targets) ? targets : gsap.utils.toArray(targets)
  if (!targetList.length) {
    return
  }
  timeline.to(targetList, vars, position)
}
function toggleCloudLayer() {
  state.cloudIdleVisible = !state.cloudIdleVisible
  if (!state.showEarthIntro) {
    return
  }
  if (isCloudIdleVisible()) {
    screenCloudLayerRef.value?.setIntroActive?.(false)
    screenCloudLayerRef.value?.setIntroProgress?.(0)
    screenCloudLayerRef.value?.setLayerVisible?.(true)
    return
  }
  screenCloudLayerRef.value?.stopAndHide?.()
}

async function toggleView() {
  if (state.isViewSwitching) {
    return
  }
  if (state.progress < 100) {
    return
  }

  state.isViewSwitching = true
  try {
    if (state.showEarthIntro) {
      if (!state.awaitingChinaClick) {
        return
      }
      await startMapTransition()
      return
    }
    await switchToEarthIntro()
  } finally {
    state.isViewSwitching = false
  }
}

async function playEarthFlylineIntro(options = {}) {
  const cloudEnabled = isCloudEnabled()
  const defaultPlayConfig = INTRO_TRANSITION_SETTINGS.playDefaults
  const {
    keepVisible = false,
    onProgress,
    fadeOutDuration = defaultPlayConfig.fadeOutDuration,
    introDuration = defaultPlayConfig.introDuration,
    holdDuration = defaultPlayConfig.holdDuration,
  } = options
  const CLOUD_START_PROGRESS = Number(CLOUD_TRANSITION_SETTINGS.startProgress ?? 0)
  const introStepDuration = Math.max(0.1, Number(introDuration) || 0.1)
  const introHoldDuration = Math.max(0, Number(holdDuration) || 0)
  const totalDuration = introStepDuration + introHoldDuration
  const cloudPushStartProgress = totalDuration > 0 ? introHoldDuration / totalDuration : 0

  if (!keepVisible) {
    state.showEarthIntro = true
    await nextTick()
  }

  const cloudLayer = screenCloudLayerRef.value
  cloudLayer?.setLayerVisible?.(false)
  cloudLayer?.setIntroActive?.(false)
  cloudLayer?.setIntroProgress?.(0)

  try {
    const introPlayer = introEarthFlylineRef.value
    if (!introPlayer?.play) {
      return
    }
    await introPlayer.play({
      duration: introDuration,
      holdDuration,
      fadeOutDuration,
      onProgress: (progress) => {
        typeof onProgress === "function" && onProgress(progress)
        if (!cloudEnabled) {
          cloudLayer?.stopAndHide?.()
          return
        }
        if (progress < CLOUD_START_PROGRESS) {
          cloudLayer?.setLayerVisible?.(false)
          cloudLayer?.setIntroActive?.(false)
          cloudLayer?.setIntroProgress?.(0)
          return
        }
        const normalizedCloudProgress = progress <= cloudPushStartProgress
          ? 0
          : (progress - cloudPushStartProgress) / (1 - cloudPushStartProgress)
        cloudLayer?.setLayerVisible?.(true)
        cloudLayer?.setIntroActive?.(true)
        cloudLayer?.setIntroProgress?.(normalizedCloudProgress)
      },
    })
  } finally {
    cloudLayer?.stopAndHide?.()
  }
}
// 地图开始动画播放完成
function handleMapPlayComplete() {
  let tl = gsap.timeline({ paused: false })
  let leftCards = gsap.utils.toArray(VIEW_SELECTORS.LEFT_CARD)
  let rightCards = gsap.utils.toArray(VIEW_SELECTORS.RIGHT_CARD)
  let countCards = gsap.utils.toArray(VIEW_SELECTORS.COUNT_CARD)
  tl.addLabel("start", 0.5)
  tl.addLabel("menu", 0.5)
  tl.addLabel("card", 1)
  tl.addLabel("countCard", 3)
  tweenIfTargets(tl, VIEW_SELECTORS.HEADER, { y: 0, opacity: 1, duration: 1.5, ease: "power4.out" }, "start")
  tweenIfTargets(
    tl,
    VIEW_SELECTORS.BOTTOM_TRAY,
    { y: 0, opacity: 1, duration: 1.5, ease: "power4.out" },
    "start"
  )
  tweenIfTargets(
    tl,
    VIEW_SELECTORS.TOP_MENU,
    {
      y: 0,
      opacity: 1,
      duration: 1.5,
      ease: "power4.out",
    },
    "-=1"
  )
  tweenIfTargets(
    tl,
    VIEW_SELECTORS.BOTTOM_RADAR,
    { y: 0, opacity: 1, duration: 1.5, ease: "power4.out" },
    "-=2"
  )
  tweenIfTargets(tl, leftCards, { x: 0, opacity: 1, stagger: 0.2, duration: 1.5, ease: "power4.out" }, "card")
  tweenIfTargets(tl, rightCards, { x: 0, opacity: 1, stagger: 0.2, duration: 1.5, ease: "power4.out" }, "card")
  tweenIfTargets(
    tl,
    countCards,
    {
      y: 0,
      opacity: 1,
      stagger: 0.2,
      duration: 1.5,
      ease: "power4.out",
    },
    "card"
  )
}
</script>

<style lang="scss">
@use "~@/assets/style/home.scss";

.m-header-weather,
.m-header-date {
  span {
    padding-right: 10px;
    color: #c4f3fe;
    font-size: 14px;
  }
}

.top-menu {
  position: absolute;
  left: 0px;
  right: 0px;
  top: 40px;
  z-index: 3;
  display: flex;
  justify-content: center;

  .top-menu-mid-space {
    width: 800px;
  }
}

.large-screen-wrap {
  z-index: 5;
}

.map-scene-hidden {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

.bottom-tray {
  .bottom-menu-group {
    padding: 0 14px;
    gap: 10px;
  }

  .return-related {
    display: none !important;
  }

  .return-related.is-visible {
    display: block !important;
  }

  .switch-view-btn,
  .cloud-toggle-btn,
  .return-btn {
    width: 120px;

    span {
      width: 120px;
    }
  }

  .switch-view-btn.is-disabled {
    opacity: 0.7;
    pointer-events: none;
  }
}

.large-screen-wrap.is-earth-intro {
  .return-related {
    display: none !important;
  }
}

.bottom-radar {
  position: absolute;
  right: 500px;
  bottom: 100px;
  z-index: 3;
}

.main-btn-group {
  display: flex;
  left: 50%;
  transform: translateX(-50%);
  bottom: 10px;
  z-index: 999;

  &.disabled {
    pointer-events: none;
  }

  .btn {
    margin-right: 10px;
  }
}

.bottom-svg-line-left,
.bottom-svg-line-right {
  position: absolute;
  right: 50%;
  width: 721px;
  height: 57px;
  margin-right: -5px;
  bottom: -21px;
}

.bottom-svg-line-right {
  transform: scaleX(-1);
  left: 50%;
  right: inherit;
  margin-right: inherit;
  margin-left: -5px;
}
</style>
