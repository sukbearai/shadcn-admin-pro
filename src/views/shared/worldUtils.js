import { Vector3 } from "three"
import { MAP_FILE_SUFFIX } from "./viewConstants"

const integerFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
})

export function sortByValue(data) {
  data.sort((a, b) => b.value - a.value)
  return data
}

export function toNumber(value, defaultValue = 0) {
  const numeric =
    typeof value === "number"
      ? value
      : Number(
          `${value ?? ""}`
            .trim()
            .replace(/,/g, "")
        )
  return Number.isFinite(numeric) ? numeric : defaultValue
}

export function formatInteger(value) {
  return integerFormatter.format(Math.round(toNumber(value, 0)))
}

export function resolveChildMapSuffix(childrenNum) {
  return childrenNum === 0 ? MAP_FILE_SUFFIX.NORMAL : MAP_FILE_SUFFIX.FULL
}

export function resolveVector3State(value, fallback) {
  if (value instanceof Vector3) {
    return value.clone()
  }
  if (Array.isArray(value) && value.length === 3) {
    return new Vector3(toNumber(value[0], fallback.x), toNumber(value[1], fallback.y), toNumber(value[2], fallback.z))
  }
  if (value && typeof value === "object") {
    return new Vector3(
      toNumber(value.x, fallback.x),
      toNumber(value.y, fallback.y),
      toNumber(value.z, fallback.z)
    )
  }
  return fallback.clone()
}

export function resolveTuple(value, fallback = []) {
  if (Array.isArray(value) && value.length === fallback.length) {
    return value.map((item, index) => toNumber(item, fallback[index]))
  }
  return [...fallback]
}
