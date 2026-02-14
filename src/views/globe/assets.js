import { Resource } from "@/mini3d"
import { FileLoader } from "three"
import dotBlur from "@/assets/texture/dot_blur.png"
import cloudLayerTexture from "@/assets/texture/cloud-layer.png"
import { createMapSkin } from "../map/skin"
import { MAP_FILE_PATHS } from "../shared/viewConstants"
import { createAssetsManifest } from "../shared/assetsLoader"

const globeExtraTextures = {
  cloudLayer: cloudLayerTexture,
  dotBlur,
}

const globeExtraMapFiles = {
  jiangsu: MAP_FILE_PATHS.JIANGSU,
  jiangsuStroke: MAP_FILE_PATHS.JIANGSU_STROKE,
}

export class Assets {
  constructor(options = {}) {
    this.skin = createMapSkin(options.skin || {})
    this.init()
  }

  init() {
    this.instance = new Resource()
    this.instance.addLoader(FileLoader, "FileLoader")

    const baseUrl = import.meta.env.BASE_URL
    const skinTextures = this.skin.assets?.textures || {}
    const skinMapFiles = this.skin.assets?.mapFiles || {}
    const textures = {
      ...globeExtraTextures,
      ...skinTextures,
    }
    const mapFiles = {
      ...globeExtraMapFiles,
      ...skinMapFiles,
    }
    const assets = createAssetsManifest({ textures, mapFiles, baseUrl })

    this.instance.loadAll(assets)
  }
}
