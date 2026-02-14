import { Resource } from "@/mini3d"
import { FileLoader } from "three"
import { createMapSkin } from "./skin"

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
    // 添加Fileloader
    this.instance.addLoader(FileLoader, "FileLoader")

    // 资源加载
    let base_url = import.meta.env.BASE_URL
    const textures = this.skin.assets?.textures || {}
    const mapFiles = this.skin.assets?.mapFiles || {}
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
    // 资源加载
    this.instance.loadAll(assets)
  }
}
