import { useMemo, useEffect } from 'react'
import { getTheme, applyCSSVars, THEME_PACKS } from '../utils/theme'

/**
 * Load profile from localStorage synchronously (no React dependency needed).
 */
function loadProfileSync() {
  try {
    const raw = localStorage.getItem('starpoints_profile')
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return {}
}

/**
 * Apply custom hue overrides directly as CSS variables.
 * Called on boot so hue-slider colors persist across page loads.
 */
function applyCustomHues(profile) {
  if (!profile) return
  const root = document.documentElement

  if (profile.customPrimaryHue != null) {
    const color = profile.customPrimary || `hsl(${profile.customPrimaryHue}, 70%, 55%)`
    root.style.setProperty('--color-primary', color)
  }
  if (profile.customSecondaryHue != null) {
    const color = profile.customSecondary || `hsl(${profile.customSecondaryHue}, 65%, 50%)`
    root.style.setProperty('--color-secondary', color)
  }
}

/**
 * useTheme — reads the active theme from localStorage profile, applies CSS variables,
 * and returns the resolved theme pack object.
 *
 * Call this at the top of any component that needs the current theme.
 */
export function useTheme() {
  const profile = loadProfileSync()
  const themeId = profile.theme || 'cosmic'
  const customPrimary = profile.customPrimary || null
  const customSecondary = profile.customSecondary || null

  const theme = useMemo(() => {
    // If theme is one of the new pack IDs, use it directly
    const packIds = THEME_PACKS.map((p) => p.id)
    if (packIds.includes(themeId)) {
      return getTheme(themeId, customPrimary, customSecondary)
    }
    // Legacy mapping: old time-based theme names → cosmic
    return getTheme('cosmic', customPrimary, customSecondary)
  }, [themeId, customPrimary, customSecondary])

  // Apply CSS variables on every render where theme changes
  useEffect(() => {
    applyCSSVars(theme)
    // Then layer custom hues on top (they override the pack defaults)
    applyCustomHues(loadProfileSync())
  }, [theme])

  return theme
}

/**
 * getThemeSync — synchronous version for use outside hooks (e.g., BottomNav reading localStorage).
 */
export function getThemeSync() {
  const profile = loadProfileSync()
  const themeId = profile.theme || 'cosmic'
  const customPrimary = profile.customPrimary || null
  const customSecondary = profile.customSecondary || null
  return getTheme(themeId, customPrimary, customSecondary)
}
