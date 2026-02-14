import { Resource } from "@/mini3d"
import { FileLoader } from "three"
import dotBlur from "@/assets/texture/dot_blur.png"
import cloudLayerTexture from "@/assets/texture/cloud-layer.png"
import { createMapSkin } from "../map/skin"

const globeExtraTextures = {
  cloudLayer: cloudLayerTexture,
  dotBlur,
}

const globeExtraMapFiles = {
  jiangsu: "assets/json/江苏省.json",
  jiangsuStroke: "assets/json/江苏省-轮廓.json",
}

function resolveMapFilePath(baseUrl, path) {
  if (typeof path !== "string") {
    return path
  }
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) {
    return path
  }
  if (path.startsWith("/")) {
    return path
  }
  return `${baseUrl}${path.replace(/^\.?\//, "")}`
}

export class Assets {
  constructor(options = {}) {
    this.skin = createMapSkin(options.skin || {})
    this.init()
  }
  init() {
    this.instance = new Resource()
    this.instance.addLoader(FileLoader, "FileLoader")

    let base_url = import.meta.env.BASE_URL
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

    const textureAssets = Object.entries(textures)
      .filter(([, path]) => Boolean(path))
      .map(([name, path]) => ({ type: "Texture", name, path }))
    const fileAssets = Object.entries(mapFiles)
      .filter(([, path]) => Boolean(path))
      .map(([name, path]) => ({
        type: "File",
        name,
        path: resolveMapFilePath(base_url, path),
      }))
    let assets = [...textureAssets, ...fileAssets]
    this.instance.loadAll(assets)
  }
}

