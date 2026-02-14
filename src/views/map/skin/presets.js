export const techGreenWorldSkin = {
  scene: {
    fogColor: 0x071d18,
    fogNear: 1,
    fogFar: 60,
    backgroundColor: 0x071d18,
  },
  lights: {
    ambient: { color: 0xffffff, intensity: 4.2 },
    directional: {
      color: 0xffffff,
      intensity: 4.5,
      position: [-26, 9, -7],
      shadowRadius: 16,
      shadowMapSize: [1024, 1024],
    },
    points: [
      { color: "#13d1a3", intensity: 520, distance: 10000, x: -8, y: 3, z: -2 },
      { color: "#0dbd9e", intensity: 280, distance: 10000, x: 2, y: 2, z: 5 },
    ],
  },
  china: {
    bgColor: "#123a32",
    bgOpacity: 0.9,
    lineColor: "#4de3c1",
    lineOpacity: 0.72,
  },
  province: {
    topGradient: {
      color1: 0x1fdcb5,
      color2: 0x0f3f35,
      axisSize: 15.78,
    },
    sideGradient: {
      color1: 0x1ac9a6,
      color2: 0x22806b,
      axisSize: 1.2,
    },
    topSurface: {
      baseColor: 0xffffff,
      opacity: 0.58,
      color1: 0x2be4bf,
      color2: 0x16a88b,
    },
    hover: {
      color: "rgba(96,255,214,1)",
      opacity: 0.9,
    },
  },
  bar: {
    primary: {
      color1: 0x1ad4b0,
      color2: 0x8cffea,
    },
    secondary: {
      color1: 0xaaf57e,
      color2: 0xeaffd7,
    },
  },
  diffuse: {
    size: 60,
    speed: 8,
    color: 0x3fd6b9,
    width: 2.3,
    duration: 6,
    targetTime: 4,
  },
  grid: {
    gridSize: 50,
    gridDivision: 20,
    gridColor: 0x1b6859,
    shapeSize: 0.5,
    shapeColor: 0x25917b,
    pointSize: 0.1,
    pointColor: 0x1e7a67,
  },
  bottom: {
    planeSize: [20, 20],
    position: [0, -0.7, 0],
    opacity: 1,
  },
  blurLine: {
    size: [147, 147],
    position: [-19.3, -0.5, -19.7],
    color: 0x2db99b,
    opacity: 0.45,
  },
  rotateBorder: {
    max: 12,
    color: 0x36dcb7,
    first: {
      widthScale: 1.178,
      rotateSpeed: 0.001,
      opacity: 0.2,
      position: [0, 0.28, 0],
    },
    second: {
      widthScale: 1.116,
      rotateSpeed: -0.004,
      opacity: 0.32,
      position: [0, 0.3, 0],
    },
  },
  flyLine: {
    color: 0x35d4b2,
    textureRepeat: [0.5, 2],
    textureSpeedX: -0.006,
    centerArcHeight: 3,
    tubeRadius: 0.1,
    tubeSegments: 32,
    tubeRadialSegments: 2,
  },
  focus: {
    color1: 0x6cf7d6,
    color2: 0x6cf7d6,
  },
  particles: {
    num: 10,
    range: 30,
    dir: "up",
    speed: 0.05,
    size: 1,
    color: 0x52f2cf,
    opacity: 1,
  },
  scatter: {
    color: 0xe8fff9,
    minScale: 0.1,
    scaleRange: 0.2,
  },
  infoPoint: {
    colors: [0xeafff8, 0x78f3d8],
    minScale: 0.7,
    scaleRange: 0.4,
  },
  stroke: {
    color: 0x48e5c3,
    tubeRadius: 0.03,
    textureRepeat: [2, 1],
    textureSpeedX: 0.005,
  },
}

export const techGreenMapSkin = {
  world: techGreenWorldSkin,
}

