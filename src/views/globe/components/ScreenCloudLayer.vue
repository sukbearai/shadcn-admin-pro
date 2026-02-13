<template>
  <div class="screen-cloud-layer" ref="layerRef">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue"
import * as THREE from "three"
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js"
import cloudTextureUrl from "@/assets/texture/cloud-layer.png"
import introTransitionConfig from "../config/introTransitionConfig"

const layerRef = ref(null)
const canvasRef = ref(null)

let renderer = null
let scene = null
let camera = null
let cloudMesh = null
let material = null
let texture = null
let rafId = 0
let lastFrameTime = 0
let cloudTravelOffset = 0
let introActive = false
let introProgress = 0
let layerVisible = true

const CLOUD_SETTINGS = introTransitionConfig.cloudLayer
const CLOUD_COUNT = CLOUD_SETTINGS.count
const CLOUD_Z_STEP = CLOUD_SETTINGS.zStep
const CLOUD_RANGE_X = CLOUD_SETTINGS.rangeX
const CLOUD_RANGE_Y = CLOUD_SETTINGS.rangeY
const CLOUD_SIZE_W = CLOUD_SETTINGS.size.width
const CLOUD_SIZE_H = CLOUD_SETTINGS.size.height
const CLOUD_SPEED = CLOUD_SETTINGS.speed
const CLOUD_DISTRIBUTION = CLOUD_SETTINGS.horizontalDistribution || {}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function resetCloudMotion() {
  lastFrameTime = performance.now()
  cloudTravelOffset = 0
}

function resolveCloudX() {
  const mode = CLOUD_DISTRIBUTION.mode || "uniform"
  if (mode !== "left-right") {
    return (Math.random() - 0.5) * CLOUD_RANGE_X
  }

  const halfRange = CLOUD_RANGE_X * 0.5
  const centerGapRatio = clamp(Number(CLOUD_DISTRIBUTION.centerGapRatio ?? 0.3), 0, 0.9)
  const edgePaddingRatio = clamp(Number(CLOUD_DISTRIBUTION.edgePaddingRatio ?? 0.08), 0, 0.45)
  const leftWeight = clamp(Number(CLOUD_DISTRIBUTION.leftWeight ?? 0.5), 0, 1)
  const minAbsX = (CLOUD_RANGE_X * centerGapRatio) * 0.5
  const maxAbsX = Math.max(minAbsX + 1e-6, halfRange * (1 - edgePaddingRatio))
  const absX = minAbsX + Math.random() * (maxAbsX - minAbsX)
  const side = Math.random() < leftWeight ? -1 : 1

  return side * absX
}

function createCloudMaterial(fog) {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  const fragmentShader = `
    uniform sampler2D map;
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;
    uniform float opacity;
    varying vec2 vUv;
    void main() {
      float depth = gl_FragCoord.z / gl_FragCoord.w;
      float fogFactor = smoothstep(fogNear, fogFar, depth);
      vec4 color = texture2D(map, vUv);
      color.a *= pow(gl_FragCoord.z, ${CLOUD_SETTINGS.shader.alphaPow.toFixed(1)}) * opacity;
      color.rgb *= ${CLOUD_SETTINGS.shader.colorBoost.toFixed(2)};
      gl_FragColor = mix(color, vec4(fogColor, color.a), fogFactor);
    }
  `

  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      fogColor: { value: fog.color },
      fogNear: { value: fog.near },
      fogFar: { value: fog.far },
      opacity: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })
}

function setupCloudMesh() {
  const baseGeometry = new THREE.PlaneGeometry(CLOUD_SIZE_W, CLOUD_SIZE_H)
  const geometries = []

  for (let i = 0; i < CLOUD_COUNT; i += 1) {
    const instanceGeometry = baseGeometry.clone()
    const x = resolveCloudX()
    const y = CLOUD_SETTINGS.baseY - Math.random() * CLOUD_RANGE_Y
    const z = CLOUD_SETTINGS.startZOffset + i * CLOUD_Z_STEP
    const scale = CLOUD_SETTINGS.size.scaleMin + Math.random() * CLOUD_SETTINGS.size.scaleSpan
    instanceGeometry.scale(scale, scale, 1)
    instanceGeometry.rotateZ((Math.random() - 0.5) * CLOUD_SETTINGS.size.rotateZRange)
    instanceGeometry.translate(x, y, z)
    geometries.push(instanceGeometry)
  }

  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false)
  cloudMesh = new THREE.Mesh(mergedGeometry, material)
  cloudMesh.renderOrder = 5
  scene.add(cloudMesh)

  baseGeometry.dispose()
  geometries.forEach((geo) => geo.dispose())
}

function resize() {
  if (!layerRef.value || !renderer || !camera) return
  const width = layerRef.value.clientWidth
  const height = layerRef.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function animate() {
  rafId = requestAnimationFrame(animate)
  if (!renderer || !camera || !scene) return
  const totalDistance = CLOUD_COUNT * CLOUD_Z_STEP
  const now = performance.now()
  if (!lastFrameTime) {
    lastFrameTime = now
  }
  const deltaMs = clamp(now - lastFrameTime, 0, 100)
  lastFrameTime = now
  const introOffset = introActive ? introProgress : 0
  const speedScale = introActive ? 1 + introProgress * CLOUD_SETTINGS.introSpeedScaleDelta : 1

  cloudTravelOffset = (cloudTravelOffset + deltaMs * CLOUD_SPEED * speedScale) % totalDistance
  camera.position.x = CLOUD_SETTINGS.camera.baseX + introOffset * CLOUD_SETTINGS.camera.introDeltaX
  camera.position.y = CLOUD_SETTINGS.camera.baseY + introOffset * CLOUD_SETTINGS.camera.introDeltaY
  camera.position.z = totalDistance - cloudTravelOffset
  camera.lookAt(
    CLOUD_SETTINGS.camera.lookAtX,
    CLOUD_SETTINGS.camera.lookAtY + introOffset * CLOUD_SETTINGS.camera.lookAtIntroDeltaY,
    camera.position.z + CLOUD_SETTINGS.camera.lookAtZOffset
  )

  if (material?.uniforms?.opacity) {
    const introOpacity = introActive
      ? CLOUD_SETTINGS.opacity.introBase + introProgress * CLOUD_SETTINGS.opacity.introDelta
      : CLOUD_SETTINGS.opacity.idle
    material.uniforms.opacity.value = (layerVisible ? 1 : 0) * introOpacity
  }
  renderer.render(scene, camera)
}

function init() {
  if (!canvasRef.value || !layerRef.value) return

  const width = layerRef.value.clientWidth
  const height = layerRef.value.clientHeight
  const totalDistance = CLOUD_COUNT * CLOUD_Z_STEP

  scene = new THREE.Scene()
  const fog = new THREE.Fog(CLOUD_SETTINGS.fog.color, CLOUD_SETTINGS.fog.near, CLOUD_SETTINGS.fog.far)
  scene.fog = fog

  camera = new THREE.PerspectiveCamera(
    CLOUD_SETTINGS.camera.fov,
    width / height,
    CLOUD_SETTINGS.camera.near,
    CLOUD_SETTINGS.camera.far
  )
  camera.position.x = CLOUD_SETTINGS.camera.baseX
  camera.position.y = CLOUD_SETTINGS.camera.baseY
  camera.position.z = totalDistance

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: false,
    alpha: true,
  })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)

  texture = new THREE.TextureLoader().load(cloudTextureUrl)
  material = createCloudMaterial(fog)
  setupCloudMesh()

  resetCloudMotion()
  animate()
  window.addEventListener("resize", resize)
}

function destroy() {
  window.removeEventListener("resize", resize)
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  if (cloudMesh) {
    cloudMesh.parent?.remove(cloudMesh)
    cloudMesh.geometry?.dispose()
    cloudMesh = null
  }
  material?.dispose()
  material = null
  texture?.dispose()
  texture = null
  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
  lastFrameTime = 0
  cloudTravelOffset = 0
  introActive = false
  introProgress = 0
  layerVisible = false
}

function setIntroActive(active) {
  const nextActive = Boolean(active)
  if (nextActive && !introActive) {
    resetCloudMotion()
  }
  introActive = nextActive
  if (!introActive) {
    introProgress = 0
  }
}

function setIntroProgress(progress) {
  introProgress = clamp(Number(progress) || 0, 0, 1)
}

function setLayerVisible(visible) {
  layerVisible = Boolean(visible)
}

function resetIntro() {
  introActive = false
  introProgress = 0
  resetCloudMotion()
}

function stopAndHide() {
  introActive = false
  introProgress = 0
  layerVisible = false
  resetCloudMotion()
  if (material?.uniforms?.opacity) {
    material.uniforms.opacity.value = 0
  }
}

onMounted(init)
onBeforeUnmount(destroy)

defineExpose({
  setIntroActive,
  setIntroProgress,
  setLayerVisible,
  resetIntro,
  stopAndHide,
})
</script>

<style scoped lang="scss">
.screen-cloud-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  opacity: 1;
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
