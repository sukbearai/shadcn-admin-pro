import {
  Mesh,
  Vector2,
  Vector3,
  Group,
  Object3D,
  Shape,
  ExtrudeGeometry,
  MeshBasicMaterial,
  LineBasicMaterial,
  LineLoop,
  BufferGeometry,
} from "three"
import { transfromMapGeoJSON } from "@/mini3d"
import { geoMercator } from "d3-geo"

export class ExtrudeMap {
  constructor({ assets, time }, config = {}) {
    this.mapGroup = new Group()
    this.assets = assets
    this.time = time
    this.coordinates = []
    this.config = Object.assign(
      {
        position: new Vector3(0, 0, 0),
        geoProjectionCenter: new Vector2(0, 0),
        geoProjectionScale: 120,
        data: "",
        renderOrder: 1,
        topFaceMaterial: new MeshBasicMaterial({
          color: 0x18263b,
          transparent: true,
          opacity: 1,
        }),
        sideMaterial: new MeshBasicMaterial({
          color: 0x07152b,
          transparent: true,
          opacity: 1,
        }),
        lineMaterial: new LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0,
        }),
        depth: 0.1,
      },
      config
    )
    this.mapGroup.position.copy(this.config.position)

    let mapData = transfromMapGeoJSON(this.config.data)
    this.create(mapData)
  }

  geoProjection(args) {
    return geoMercator()
      .center(this.config.geoProjectionCenter)
      .scale(this.config.geoProjectionScale)
      .translate([0, 0])(args)
  }

  createLine(points) {
    const geometry = new BufferGeometry()
    geometry.setFromPoints(points)
    let line = new LineLoop(geometry, this.config.lineMaterial)
    line.renderOrder = 2
    line.name = "mapLine"
    return line
  }

  create(mapData) {
    mapData.features.forEach((feature, groupIndex) => {
      const group = new Object3D()

      let { name, center = [], centroid = [], adcode, childrenNum = 0 } = feature.properties
      let finalCentroid = centroid || center
      this.coordinates.push({
        name,
        center,
        centroid: finalCentroid,
        adcode,
        childrenNum,
      })

      group.name = "meshGroup" + groupIndex
      group.userData = {
        index: groupIndex,
        name,
        center,
        centroid: finalCentroid,
        adcode,
        childrenNum,
      }
      group.userData.materialEmissiveHex = this.config.topFaceMaterial.emissive.getHex()

      let lineGroup = new Group()
      lineGroup.name = "lineGroup" + groupIndex
      lineGroup.userData.index = groupIndex
      lineGroup.userData.adcode = adcode

      const extrudeSettings = {
        depth: this.config.depth,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelThickness: 0.1,
      }
      let materials = [this.config.topFaceMaterial.clone(), this.config.sideMaterial]

      feature.geometry.coordinates.forEach((multiPolygon) => {
        multiPolygon.forEach((polygon) => {
          const shape = new Shape()
          for (let i = 0; i < polygon.length; i++) {
            if (!polygon[i][0] || !polygon[i][1]) {
              return false
            }
            const [x, y] = this.geoProjection(polygon[i])
            if (i === 0) {
              shape.moveTo(x, -y)
            }
            shape.lineTo(x, -y)
          }

          const geometry = new ExtrudeGeometry(shape, extrudeSettings)
          const mesh = new Mesh(geometry, materials)
          mesh.renderOrder = this.config.renderOrder
          mesh.userData.name = name
          mesh.userData.adcode = adcode
          mesh.userData.childrenNum = childrenNum
          mesh.userData.materialEmissiveHex = this.config.topFaceMaterial.emissive.getHex()

          group.add(mesh)
        })

        const points = []
        let line = null
        multiPolygon[0].forEach((item) => {
          const [x, y] = this.geoProjection(item)
          points.push(new Vector3(x, -y, 0))
          line = this.createLine(points)
        })
        lineGroup.add(line)
      })

      lineGroup.position.set(0, 0, this.config.depth + 0.11)
      group.add(lineGroup)
      this.mapGroup.add(group)
    })
  }

  getCoordinates() {
    return this.coordinates
  }

  setParent(parent) {
    parent.add(this.mapGroup)
  }
}
