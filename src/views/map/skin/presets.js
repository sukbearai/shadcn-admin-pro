export const techGreenWorldSkin = {
  scene: {
    fogColor: 0x081b31,
    fogNear: 1,
    fogFar: 60,
    backgroundColor: 0x081b31,
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
      { color: "#2c9dca", intensity: 520, distance: 10000, x: -8, y: 3, z: -2 },
      { color: "#25c7bd", intensity: 280, distance: 10000, x: 2, y: 2, z: 5 },
    ],
  },
  china: {
    bgColor: "#1a3d5c",
    bgOpacity: 0.9,
    lineColor: "#63c4ef",
    lineOpacity: 0.72,
  },
  province: {
    topGradient: {
      color1: 0x38b9ee,
      color2: 0x1b3f63,
      axisSize: 15.78,
    },
    sideGradient: {
      color1: 0x36b9e7,
      color2: 0x2f8ab8,
      axisSize: 1.2,
    },
    topSurface: {
      baseColor: 0xffffff,
      opacity: 0.6,
      color1: 0x65d3ff,
      color2: 0x2fb2e8,
    },
    hover: {
      color: "rgba(110,220,255,1)",
      opacity: 0.9,
    },
  },
  bar: {
    primary: {
      color1: 0x50bbfe,
      color2: 0x77fbf5,
    },
    secondary: {
      color1: 0xaaf57e,
      color2: 0xeaffd7,
    },
  },
  diffuse: {
    size: 60,
    speed: 8,
    color: 0x4cb6cf,
    width: 2.3,
    duration: 6,
    targetTime: 4,
  },
  grid: {
    gridSize: 50,
    gridDivision: 20,
    gridColor: 0x1f4e77,
    shapeSize: 0.5,
    shapeColor: 0x2e6e9c,
    pointSize: 0.1,
    pointColor: 0x1a5b88,
  },
  bottom: {
    planeSize: [20, 20],
    position: [0, -0.7, 0],
    opacity: 1,
  },
  blurLine: {
    size: [147, 147],
    position: [-19.3, -0.5, -19.7],
    color: 0x4d9ed8,
    opacity: 0.42,
  },
  rotateBorder: {
    max: 12,
    color: 0x4eb3f1,
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
    color: 0x3f98c5,
    textureRepeat: [0.5, 2],
    textureSpeedX: -0.006,
    centerArcHeight: 3,
    tubeRadius: 0.1,
    tubeSegments: 32,
    tubeRadialSegments: 2,
  },
  focus: {
    color1: 0x88e8ff,
    color2: 0x88e8ff,
  },
  particles: {
    num: 10,
    range: 30,
    dir: "up",
    speed: 0.05,
    size: 1,
    color: 0x6cdfff,
    opacity: 1,
  },
  scatter: {
    color: 0xf3feff,
    minScale: 0.1,
    scaleRange: 0.2,
  },
  infoPoint: {
    colors: [0xffffff, 0x9fe8ff],
    minScale: 0.7,
    scaleRange: 0.4,
  },
  stroke: {
    color: 0x4fc7ec,
    tubeRadius: 0.03,
    textureRepeat: [2, 1],
    textureSpeedX: 0.005,
  },
}

export const techGreenMapSkin = {
  world: techGreenWorldSkin,
}
