<template>
  <div class="large-screen map-screen">
    <!-- 地图 -->
    <mapScene ref="mapSceneRef" :world-options="resolvedWorldOptions"></mapScene>
    <div class="large-screen-wrap" :id="VIEW_IDS.LARGE_SCREEN">
      <m-header :title="mapViewConfig.header.title" :sub-text="mapViewConfig.header.subText">
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
          <mMenuItem v-for="item in mapViewConfig.menu.items" :key="item.index" :index="item.index">
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
            v-for="panel in mapViewConfig.panels.left"
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
            v-for="panel in mapViewConfig.panels.right"
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
        <!-- 做箭头 -->
        <div class="bottom-tray-arrow return-related">
          <img src="@/assets/images/bottom-menu-arrow-big.svg" alt="" />
          <img src="@/assets/images/bottom-menu-arrow-small.svg" alt="" />
        </div>
        <!-- 底部菜单 -->
        <div class="bottom-menu return-related">
          <div class="bottom-menu-item is-active return-btn" @click="goBack">
            <span>{{ mapViewConfig.bottomTray.returnLabel }}</span>
          </div>
        </div>
        <!-- 右箭头 -->
        <div class="bottom-tray-arrow is-reverse return-related">
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
import { computed, nextTick, shallowRef, ref, reactive, onMounted, onBeforeUnmount } from "vue"
import mapScene from "./map.vue"
import mHeader from "@/components/mHeader/index.vue"
import mMenu from "@/components/mMenu/index.vue"
import mRadar from "@/components/mRadar/index.vue"
import mMenuItem from "@/components/mMenuItem/index.vue"
import mSvglineAnimation from "@/components/mSvglineAnimation/index.vue"

import { Assets } from "./assets.js"
import { mapViewConfig } from "./config"
import { createMapSkin } from "./skin"
import emitter from "@/utils/emitter"
import gsap from "gsap"
import autofit from "autofit.js"
import {
  BOTTOM_TRAY_SVG_PATH,
  DEFAULT_MENU_ACTIVE_INDEX,
  VIEW_EVENTS,
  VIEW_IDS,
  VIEW_SELECTORS,
} from "../shared/viewConstants"

const assets = shallowRef(null)
const mapSceneRef = ref(null)
const resolvedMapSkin = createMapSkin(mapViewConfig.mapScene?.skin || {})
const resolvedWorldOptions = computed(() => ({
  ...(mapViewConfig.mapScene?.worldOptions || {}),
  skin: resolvedMapSkin,
}))
const loadingChars = mapViewConfig.loading.text.split("")
const state = reactive({
  // 进度
  progress: 0,
  // 当前顶部导航索引
  activeIndex: mapViewConfig.menu.defaultActiveIndex || mapViewConfig.menu.items[0]?.index || DEFAULT_MENU_ACTIVE_INDEX,
  // 头部日期
  currentDate: "",
  // 头部时间
  currentTime: "",
  // 卡片统计数据
  totalView: mapViewConfig.totalView.map((item) => ({ ...item })),
})

let clockTimer = null
let isUnmounted = false

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

onMounted(() => {
  isUnmounted = false
  updateHeaderDateTime()
  clockTimer = setInterval(() => {
    updateHeaderDateTime()
  }, 1000)

  // 监听地图播放完成，执行事件
  emitter.$on(VIEW_EVENTS.MAP_PLAY_COMPLETE, handleMapPlayComplete)
  // 自动适配
  autofit.init(mapViewConfig.autofit)
  // 初始化资源
  initAssets(async () => {
    if (isUnmounted) return
    // 加载地图
    emitter.$emit(VIEW_EVENTS.LOAD_MAP, assets.value)
    // 隐藏loading
    await hideLoading()
    if (isUnmounted) return
    await nextTick()
    // 播放场景
    mapSceneRef.value?.play?.()
  })
})
onBeforeUnmount(() => {
  isUnmounted = true
  emitter.$off(VIEW_EVENTS.MAP_PLAY_COMPLETE, handleMapPlayComplete)
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
  // 资源加载进度
  let params = {
    progress: 0,
  }
  assets.value.instance.on("onProgress", (path, itemsLoaded, itemsTotal) => {
    if (isUnmounted) return
    let p = Math.floor((itemsLoaded / itemsTotal) * 100)
    gsap.to(params, {
      progress: p,
      onUpdate: () => {
        state.progress = Math.floor(params.progress)
      },
    })
  })
  // 资源加载完成
  assets.value.instance.on("onLoad", () => {
    Promise.resolve(onLoadCallback?.()).catch((error) => {
      console.warn("[map-view] onLoad callback failed", error)
    })
  })
}

// 隐藏loading
async function hideLoading() {
  return new Promise((resolve, reject) => {
    let tl = gsap.timeline()
    tl.to(VIEW_SELECTORS.LOADING_TEXT_CHARS, {
      y: "200%",
      opacity: 0,
      ease: "power4.inOut",
      duration: 2,
      stagger: 0.2,
    })
    tl.to(VIEW_SELECTORS.LOADING_PROGRESS, { opacity: 0, ease: "power4.inOut", duration: 2 }, "<")
    tl.to(
      VIEW_SELECTORS.LOADING_LAYER,
      {
        opacity: 0,
        ease: "power4.inOut",
        onComplete: () => {
          resolve()
        },
      },
      "-=1"
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

.bottom-tray {
  .return-related {
    display: none !important;
  }

  .return-related.is-visible {
    display: flex !important;
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

/* 初始化动画开始位置（仅作用于 map 页面，避免影响 globe 页面） */
.map-screen {
  .m-header {
    transform: translateY(-100%);
    opacity: 0;
  }

  .top-menu {
    transform: translateY(-250%);
    opacity: 0;
  }

  .count-card {
    transform: translateY(150%);
    opacity: 0;
  }

  .left-card {
    transform: translateX(-150%);
    opacity: 0;
  }

  .right-card {
    transform: translateX(150%);
    opacity: 0;
  }

  .bottom-tray {
    transform: translateY(100%);
    opacity: 0;
  }

  .bottom-radar {
    transform: translateY(100%);
    opacity: 0;
  }
}
</style>
