export const THEME_STORAGE_KEY = "gpdata-theme"
export const THEME_CHANGE_EVENT = "gpdata-theme-change"

export const THEME_LIGHT = "light"
export const THEME_DARK = "dark"
export const THEME_SYSTEM = "system"

const THEME_VALUES = [THEME_LIGHT, THEME_DARK, THEME_SYSTEM]

let hasBoundSystemThemeListener = false

function normalizeTheme(theme) {
  return THEME_VALUES.includes(theme) ? theme : THEME_SYSTEM
}

export function getSystemTheme() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return THEME_LIGHT
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? THEME_DARK : THEME_LIGHT
}

export function resolveTheme(theme) {
  const normalizedTheme = normalizeTheme(theme)
  return normalizedTheme === THEME_SYSTEM ? getSystemTheme() : normalizedTheme
}

function emitThemeChange(payload) {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: payload }))
}

export function applyTheme(theme) {
  const preferredTheme = normalizeTheme(theme)
  const resolvedTheme = resolveTheme(preferredTheme)

  if (typeof document !== "undefined") {
    const root = document.documentElement
    root.classList.toggle("dark", resolvedTheme === THEME_DARK)
    root.style.colorScheme = resolvedTheme
  }

  return {
    preferredTheme,
    resolvedTheme,
  }
}

export function getStoredTheme() {
  if (typeof window === "undefined") {
    return THEME_SYSTEM
  }

  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return THEME_SYSTEM
  }
}

export function setTheme(theme) {
  const nextTheme = applyTheme(theme)

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme.preferredTheme)
    } catch {
      // ignore storage failures
    }
  }

  emitThemeChange(nextTheme)
  return nextTheme.preferredTheme
}

function bindSystemThemeListener() {
  if (
    hasBoundSystemThemeListener ||
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  const handleThemeChange = () => {
    if (getStoredTheme() !== THEME_SYSTEM) {
      return
    }

    const nextTheme = applyTheme(THEME_SYSTEM)
    emitThemeChange(nextTheme)
  }

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleThemeChange)
  } else {
    mediaQuery.addListener(handleThemeChange)
  }

  hasBoundSystemThemeListener = true
}

export function initTheme() {
  bindSystemThemeListener()
  return setTheme(getStoredTheme())
}

export function toggleTheme(currentTheme) {
  const activeTheme = resolveTheme(currentTheme || getStoredTheme())
  const nextTheme = activeTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK
  return setTheme(nextTheme)
}
