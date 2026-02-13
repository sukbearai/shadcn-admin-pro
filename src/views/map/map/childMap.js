import { Group, Vector3 } from "three"
import { geoMercator } from "d3-geo"
import labelIcon from "@/assets/texture/label-icon.png"
import { getBoundBox, emptyObject } from "@/mini3d"

export class ChildMap {
  constructor(parent, options = {}) {
    this.parent = parent
    this.instance = new Group()
    this.instance.rotateX(-Math.PI / 2)
    this.instance.position.set(0, 0.2, 0)

    let defaultOptions = {
      adcode: 10000,
      center: [0, 0],
      centroid: [0, 0],
      childrenNum: 0,
      parentBoxSize: [1, 1],
      mapData: "",
      geoProjectionScale: 120,
      scaleMultiplier: 1,
    }

    this.options = Object.assign({}, defaultOptions, options)
    this.clicked = false
    this.scale = 1
    this.boundBox = {}
    this.mapPosition = new Vector3(0, 0, 0)
    this.areaData = []
    this.areaLabels = []
    this.eventElement = []
    this.defaultMaterial = null
    this.defaultLightMaterial = null

    this.init()
  }

  init() {
    this.createModel()
    if (this.options.childrenNum) {
      this.addEvent()
    }
  }

  createModel() {
    let { map, mapTop, mapLine } = this.createMap()
    this.setScale(map, mapTop, mapLine)
    map.setParent(this.instance)
    mapTop.setParent(this.instance)
    mapLine.setParent(this.instance)
    this.addLabel()
  }

  createMap() {
    const provinceLayer = this.parent.createProvinceLayer({
      mapJsonData: this.options.mapData,
      geoProjectionCenter: this.options.center,
      geoProjectionScale: this.options.geoProjectionScale,
      mapLineOpacity: 1,
    })

    this.defaultMaterial = provinceLayer.defaultMaterial
    this.defaultLightMaterial = provinceLayer.defaultLightMaterial
    this.eventElement = provinceLayer.eventMeshes
    this.areaData = provinceLayer.map.getCoordinates ? provinceLayer.map.getCoordinates() : []

    return {
      map: provinceLayer.map,
      mapTop: provinceLayer.mapTop,
      mapLine: provinceLayer.mapLine,
    }
  }

  geoProjection(args) {
    return geoMercator().center(this.options.center).scale(this.options.geoProjectionScale).translate([0, 0])(args)
  }

  addLabel() {
    if (!Array.isArray(this.areaData) || !this.areaData.length) {
      return
    }

    const label3d = this.parent.label3d
    this.areaData.forEach((area) => {
      const labelPoint =
        Array.isArray(area.centroid) && area.centroid.length === 2
          ? area.centroid
          : Array.isArray(area.center) && area.center.length === 2
            ? area.center
            : null

      if (!labelPoint || !area?.name) {
        return
      }

      const [x, y] = this.geoProjection(labelPoint)
      const xInChildMap = x * this.scale + this.mapPosition.x
      const yInChildMap = -y * this.scale + this.mapPosition.y

      let label = label3d.create("", "china-label", false)
      label.init(
        `<div class="other-label" style="transform:translateY(0);opacity:1;"><img class="label-icon" src="${labelIcon}">${area.name}</div>`,
        new Vector3(xInChildMap, yInChildMap, 0.5)
      )
      label3d.setLabelStyle(label, 0.02, "x")
      label.setParent(this.instance)
      this.areaLabels.push(label)
    })
  }

  addEvent() {
    let objectsHover = []

    const reset = (meshGroup) => {
      meshGroup.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = this.defaultMaterial
        }
      })
    }

    const move = (meshGroup) => {
      meshGroup.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = this.defaultLightMaterial
        }
      })
    }

    this.eventElement.map((mesh) => {
      this.parent.interactionManager.add(mesh)
      mesh.addEventListener("mousedown", (event) => {
        if (this.clicked) return false
        this.clicked = true

        let userData = event.target.parent.userData
        if (!userData?.adcode || !userData?.childrenNum) {
          this.clicked = false
          return false
        }

        this.parent.history.push(userData)
        this.parent.loadChildMap(userData)
      })
      mesh.addEventListener("mouseup", () => {
        this.clicked = false
      })
      mesh.addEventListener("mouseover", (event) => {
        if (!objectsHover.includes(event.target.parent)) {
          objectsHover.push(event.target.parent)
        }
        document.body.style.cursor = "pointer"
        move(event.target.parent)
      })
      mesh.addEventListener("mouseout", (event) => {
        objectsHover = objectsHover.filter((item) => item.userData.name !== event.target.parent.userData.name)
        if (objectsHover.length > 0) {
          const meshGroup = objectsHover[objectsHover.length - 1]
        }
        reset(event.target.parent)
        document.body.style.cursor = "default"
      })
    })
  }

  calculateScale(parentBoxSize, boxSize) {
    let xScale = parentBoxSize[0] / boxSize[0]
    let yScale = parentBoxSize[1] / boxSize[1]
    const baseScale = Math.min(xScale, yScale)
    const scaleMultiplier = Number.isFinite(this.options.scaleMultiplier) ? this.options.scaleMultiplier : 1
    return baseScale * Math.max(scaleMultiplier, 0.1)
  }

  setScale(map, mapTop, mapLine) {
    let { parentBoxSize } = this.options
    let boundBox = getBoundBox(map.mapGroup)
    let scale = this.calculateScale(parentBoxSize, [boundBox.boxSize.x, boundBox.boxSize.y])

    map.mapGroup.scale.set(scale, scale, 1)
    let resizedBoundBox = getBoundBox(map.mapGroup)

    map.mapGroup.position.x = -resizedBoundBox.center.x
    map.mapGroup.position.y = -resizedBoundBox.center.y

    mapTop.mapGroup.scale.copy(map.mapGroup.scale)
    mapTop.mapGroup.position.copy(map.mapGroup.position)

    mapLine.lineGroup.scale.copy(map.mapGroup.scale)
    mapLine.lineGroup.position.x = map.mapGroup.position.x
    mapLine.lineGroup.position.y = map.mapGroup.position.y

    this.scale = scale
    this.boundBox = resizedBoundBox
    this.mapPosition.copy(map.mapGroup.position)
  }

  setParent(parent) {
    parent.add(this.instance)
  }

  destroy() {
    this.eventElement.map((mesh) => {
      this.parent.interactionManager.remove(mesh)
    })

    this.areaLabels.map((label) => {
      label.remove && label.remove()
    })
    this.areaLabels = []

    emptyObject(this.instance)
  }
}
