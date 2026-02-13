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

const layerRef = ref(null)
const canvasRef = ref(null)

let renderer = null
let scene = null
let camera = null
let cloudMesh = null
let material = null
let texture = null
let rafId = 0
let startTime = 0

const CLOUD_COUNT = 1000
const CLOUD_Z_STEP = 15
const CLOUD_RANGE_X = 320
const CLOUD_RANGE_Y = 260
const CLOUD_SIZE_W = 220
const CLOUD_SIZE_H = 140
const CLOUD_SPEED = 0.08

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
    varying vec2 vUv;
    void main() {
      float depth = gl_FragCoord.z / gl_FragCoord.w;
      float fogFactor = smoothstep(fogNear, fogFar, depth);
      vec4 color = texture2D(map, vUv);
      color.a *= pow(gl_FragCoord.z, 20.0);
      gl_FragColor = mix(color, vec4(fogColor, color.a), fogFactor);
    }
  `

  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      fogColor: { value: fog.color },
      fogNear: { value: fog.near },
      fogFar: { value: fog.far },
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
    const x = (Math.random() - 0.5) * CLOUD_RANGE_X
    const y = -Math.random() * CLOUD_RANGE_Y
    const z = i * CLOUD_Z_STEP
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
  const elapsed = performance.now() - startTime
  camera.position.z = totalDistance - ((elapsed * CLOUD_SPEED) % totalDistance)
  renderer.render(scene, camera)
}

function init() {
  if (!canvasRef.value || !layerRef.value) return

  const width = layerRef.value.clientWidth
  const height = layerRef.value.clientHeight
  const totalDistance = CLOUD_COUNT * CLOUD_Z_STEP

  scene = new THREE.Scene()
  const fog = new THREE.Fog("#102736", 1, 1200)
  scene.fog = fog

  camera = new THREE.PerspectiveCamera(70, width / height, 1, 1200)
  camera.position.x = 12
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

  startTime = performance.now()
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
}

onMounted(init)
onBeforeUnmount(destroy)
</script>

<style scoped lang="scss">
.screen-cloud-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 1;
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
