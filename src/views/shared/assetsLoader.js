export function resolveMapFilePath(baseUrl, path) {
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

export function createTextureAssets(textures = {}) {
  return Object.entries(textures)
    .filter(([, path]) => Boolean(path))
    .map(([name, path]) => ({ type: "Texture", name, path }))
}

export function createFileAssets(mapFiles = {}, baseUrl = "") {
  return Object.entries(mapFiles)
    .filter(([, path]) => Boolean(path))
    .map(([name, path]) => ({
      type: "File",
      name,
      path: resolveMapFilePath(baseUrl, path),
    }))
}

export function createAssetsManifest({ textures = {}, mapFiles = {}, baseUrl = "" } = {}) {
  return [...createTextureAssets(textures), ...createFileAssets(mapFiles, baseUrl)]
}
