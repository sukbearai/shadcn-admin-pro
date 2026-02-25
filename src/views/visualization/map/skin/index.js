import pathLine from "@/assets/texture/pathLine4.png"
import pathLine3 from "@/assets/texture/pathLine2.png"
import pathLine2 from "@/assets/texture/pathLine.png"
import side from "@/assets/texture/side.png"
import ocean from "@/assets/texture/ocean-bg.png"
import rotationBorder1 from "@/assets/texture/rotationBorder1.png"
import rotationBorder2 from "@/assets/texture/rotationBorder2.png"
import chinaBlurLine from "@/assets/texture/chinaBlurLine.png"
import guangquan1 from "@/assets/texture/guangquan01.png"
import guangquan2 from "@/assets/texture/guangquan02.png"
import huiguang from "@/assets/texture/huiguang.png"
import arrow from "@/assets/texture/arrow.png"
import point from "@/assets/texture/point1.png"
import flyLineFocus from "@/assets/texture/guangquan01.png"
import mapFlyline from "@/assets/texture/flyline6.png"
import focusArrowsTexture from "@/assets/texture/focus/focus_arrows.png"
import focusBarTexture from "@/assets/texture/focus/focus_bar.png"
import focusBgTexture from "@/assets/texture/focus/focus_bg.png"
import focusMidQuanTexture from "@/assets/texture/focus/focus_mid_quan.png"
import focusMoveBgTexture from "@/assets/texture/focus/focus_move_bg.png"

export const defaultMapSkin = {
  assets: {
    textures: {
      flyline: pathLine,
      pathLine: pathLine,
      pathLine2: pathLine2,
      pathLine3: pathLine3,
      huiguang,
      rotationBorder1,
      rotationBorder2,
      guangquan1,
      guangquan2,
      chinaBlurLine,
      ocean,
      side,
      flyLineFocus,
      mapFlyline,
      arrow,
      point,
      focusArrows: focusArrowsTexture,
      focusBar: focusBarTexture,
      focusBg: focusBgTexture,
      focusMidQuan: focusMidQuanTexture,
      focusMoveBg: focusMoveBgTexture,
    },
    mapFiles: {
      china: "assets/json/中华人民共和国.json",
      mapJson: "assets/json/中华人民共和国.json",
      mapStroke: "assets/json/中华人民共和国.json",
    },
  },
  world: {
    scene: {
      fogColor: 0x102736,
      fogNear: 1,
      fogFar: 50,
      backgroundColor: 0x102736,
    },
    lights: {
      ambient: { color: 0xffffff, intensity: 5 },
      directional: {
        color: 0xffffff,
        intensity: 5,
        position: [-30, 6, -8],
        shadowRadius: 20,
        shadowMapSize: [1024, 1024],
      },
      points: [
        { color: "#1d5e5e", intensity: 800, distance: 10000, x: -9, y: 3, z: -3 },
        { color: "#1d5e5e", intensity: 200, distance: 10000, x: 0, y: 2, z: 5 },
      ],
    },
    china: {
      bgColor: "#1a3f5c",
      bgOpacity: 0.88,
      lineColor: "#63b8ec",
      lineOpacity: 0.72,
    },
    province: {
      topBaseColor: 0xffffff,
      topOpacity: 0,
      topAlpha: 0.5,
      topGradient: {
        color1: 0x2a6e92,
        color2: 0x102736,
        axisSize: 15.78,
      },
      sideBaseColor: 0xffffff,
      sideOpacity: 0,
      sideGradient: {
        color1: 0x2a6e92,
        color2: 0x2a6e92,
        axisSize: 1.2,
      },
      sideFlow: {
        repeat: [1, 1.5],
        startOffsetY: 0.065,
        speedY: 0.005,
      },
      topSurface: {
        baseColor: 0xffffff,
        opacity: 0.5,
        color1: 0x12bbe0,
        color2: 0x0094b5,
      },
      hover: {
        color: "rgba(115,208,255,1)",
        opacity: 0.8,
      },
    },
    bar: {
      primary: {
        color1: 0x50bbfe,
        color2: 0x77fbf5,
      },
      secondary: {
        color1: 0xfbdf88,
        color2: 0xfffef4,
      },
    },
    huiguang: {
      opacity: 0.4,
      width: 0.35,
      heightScale: 1,
      depthTest: false,
    },
    diffuse: {
      size: 60,
      speed: 8,
      color: 0x71918e,
      width: 2,
      duration: 6,
      targetTime: 4,
    },
    grid: {
      gridSize: 50,
      gridDivision: 20,
      gridColor: 0x1b4b70,
      shapeSize: 0.5,
      shapeColor: 0x2a5f8a,
      pointSize: 0.1,
      pointColor: 0x154d7d,
    },
    bottom: {
      planeSize: [20, 20],
      position: [0, -0.7, 0],
      opacity: 1,
    },
    blurLine: {
      size: [147, 147],
      position: [-19.3, -0.5, -19.7],
      color: 0x3f82cd,
      opacity: 0.5,
    },
    rotateBorder: {
      max: 12,
      color: 0x48afff,
      first: {
        widthScale: 1.178,
        rotateSpeed: 0.001,
        opacity: 0.2,
        position: [0, 0.28, 0],
      },
      second: {
        widthScale: 1.116,
        rotateSpeed: -0.004,
        opacity: 0.4,
        position: [0, 0.3, 0],
      },
    },
    flyLine: {
      color: 0x2a6f72,
      textureRepeat: [0.5, 2],
      textureSpeedX: -0.006,
      centerArcHeight: 3,
      tubeRadius: 0.1,
      tubeSegments: 32,
      tubeRadialSegments: 2,
    },
    focus: {
      color1: 0xbdfdfd,
      color2: 0xbdfdfd,
    },
    particles: {
      num: 10,
      range: 30,
      dir: "up",
      speed: 0.05,
      size: 1,
      color: 0x00eeee,
      opacity: 1,
    },
    scatter: {
      color: 0xfffef4,
      minScale: 0.1,
      scaleRange: 0.2,
    },
    infoPoint: {
      colors: [0xfffef4, 0x77fbf5],
      minScale: 0.7,
      scaleRange: 0.4,
    },
    stroke: {
      color: 0x2bc4dc,
      tubeRadius: 0.03,
      textureRepeat: [2, 1],
      textureSpeedX: 0.005,
    },
  },
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]"
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item))
  }
  if (isPlainObject(value)) {
    let result = {}
    Object.keys(value).forEach((key) => {
      result[key] = cloneValue(value[key])
    })
    return result
  }
  return value
}

function mergeInto(target, source) {
  if (!isPlainObject(source)) {
    return target
  }
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key]
    if (sourceValue === undefined) {
      return
    }
    if (Array.isArray(sourceValue)) {
      target[key] = sourceValue.map((item) => cloneValue(item))
      return
    }
    if (isPlainObject(sourceValue)) {
      const currentTarget = isPlainObject(target[key]) ? target[key] : {}
      target[key] = mergeInto(currentTarget, sourceValue)
      return
    }
    target[key] = sourceValue
  })
  return target
}

export function createMapSkin(overrideSkin = {}) {
  const baseSkin = cloneValue(defaultMapSkin)
  return mergeInto(baseSkin, overrideSkin)
}
