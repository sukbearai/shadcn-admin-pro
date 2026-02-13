const introTransitionConfig = {
  introEarth: {
    mapName: "intro_globe_map",
    focusChina: {
      lon: 104,
      lat: 35,
      tiltX: -0.22,
      rollZ: 0.18,
    },
    preloadProgress: {
      mapLoading: 0.08,
      mapReady: 0.5,
      sceneReady: 0.74,
      dataReady: 0.9,
    },
    controls: {
      enableZoom: true,
      enableRotate: true,
      enablePan: false,
      minDistance: 260,
      maxDistance: 980,
    },
    sceneConfig: {
      R: 150,
      zoom: 1,
      enableZoom: true,
      stopRotateByHover: false,
      bgStyle: {
        color: "#102736",
        opacity: 0,
      },
      earth: {
        color: "#0e2942",
        material: "MeshPhongMaterial",
      },
      mapStyle: {
        areaColor: "#1d4d73",
        lineColor: "#76d7ff",
        opacity: 1,
        material: "MeshLambertMaterial",
      },
      spriteStyle: {
        color: "#72f1ff",
        show: true,
        size: 2.9,
      },
      pathStyle: {
        color: "rgba(118, 247, 255, 0.45)",
        show: true,
        size: 0.35,
      },
      flyLineStyle: {
        color: "#77f8ff",
        size: 1.2,
      },
      roadStyle: {
        flyLineStyle: {
          color: "#77f8ff",
          size: 1.1,
        },
        pathStyle: {
          color: "rgba(118, 247, 255, 0.34)",
          show: true,
          size: 0.26,
        },
      },
      scatterStyle: {
        color: "#77f8ff",
        show: false,
        size: 0.8,
      },
      hoverRegionStyle: {
        areaColor: "#86e7ff",
        opacity: 0.95,
        show: false,
      },
      barStyle: {
        color: "#86e7ff",
        width: 0.2,
        height: 0.25,
      },
    },
    flyLineStyle: {
      color: "#77f8ff",
      size: 2.2,
    },
    flyLinePathStyle: {
      show: true,
      color: "rgba(119, 248, 255, 0.38)",
      size: 1.2,
    },
    pointStyle: {
      normalColor: "#77f8ff",
      normalSize: 1.5,
      centerColor: "#fef99e",
      centerSize: 2.1,
    },
    textMark: {
      style: {
        fontSize: 20,
        color: "#ffffff",
      },
      centerStyle: {
        fontSize: 22,
        color: "#ffdf7a",
      },
    },
    animation: {
      cameraPushScale: 0.52,
      globeScaleEnd: 1.72,
      cameraFovEnd: 42,
      rotateSpeedPushStart: 0.0025,
      rotateSpeedPushEnd: 0.011,
      minDuration: 0.1,
      defaultDuration: 5.8,
      defaultHoldDuration: 2.6,
      defaultFadeOutDuration: 0.9,
      fadeOverlapMax: 0.8,
    },
  },
  cloudLayer: {
    count: 1000,
    zStep: 15,
    startZOffset: 680,
    rangeX: 320,
    rangeY: 240,
    baseY: -95,
    speed: 0.055,
    size: {
      width: 220,
      height: 140,
      scaleMin: 0.68,
      scaleSpan: 1.28,
      rotateZRange: 0.5,
    },
    fog: {
      color: "#102736",
      near: 1,
      far: 1200,
    },
    camera: {
      fov: 70,
      near: 1,
      far: 1200,
      baseX: 12,
      baseY: -16,
      introDeltaX: 3,
      introDeltaY: 4,
      lookAtX: 0,
      lookAtY: -132,
      lookAtIntroDeltaY: 8,
      lookAtZOffset: -420,
    },
    shader: {
      alphaPow: 16,
      colorBoost: 1.03,
    },
    opacity: {
      idle: 0.38,
      introBase: 0.34,
      introDelta: 0.2,
    },
    introSpeedScaleDelta: 0.28,
  },
  transition: {
    cloud: {
      enabled: true,
      idleVisible: false,
      startProgress: 0,
    },
    startMapTransition: {
      holdDuration: 0,
      introDuration: 2.4,
      fadeOutDuration: 0,
    },
    playDefaults: {
      introDuration: 7.2,
      holdDuration: 3.2,
      fadeOutDuration: 0,
    },
  },
}

export default introTransitionConfig
