import { Resource } from "@/mini3d"
import { FileLoader } from "three"
import { createMapSkin } from "./skin"
import { createAssetsManifest } from "../shared/assetsLoader"

export class Assets {
  constructor(options = {}) {
    this.skin = createMapSkin(options.skin || {})
    this.init()
  }

  init() {
    this.instance = new Resource()
    this.instance.addLoader(FileLoader, "FileLoader")

    const baseUrl = import.meta.env.BASE_URL
    const textures = this.skin.assets?.textures || {}
    const mapFiles = this.skin.assets?.mapFiles || {}
    const assets = createAssetsManifest({ textures, mapFiles, baseUrl })

    this.instance.loadAll(assets)
  }
}
