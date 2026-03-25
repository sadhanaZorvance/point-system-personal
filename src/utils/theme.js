/**
 * Theme system with named theme packs and CSS variable support.
 */

// ─── Theme Packs ──────────────────────────────────────────────────────────────

export const THEME_PACKS = [
  {
    id: 'cosmic',
    name: 'Cosmic',
    emoji: '🔮',
    bgGradient: 'from-violet-950 via-indigo-900 to-purple-950',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    accentColor: '#7c3aed',
    primaryBtn: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/50',
    positiveColor: 'bg-emerald-800/70 border border-emerald-600/40 text-emerald-100',
    negativeColor: 'bg-rose-900/70 border border-rose-700/40 text-rose-100',
    rewardColor: 'bg-amber-900/70 border border-amber-600/30 text-amber-100',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
    navBg: 'bg-black/40 backdrop-blur-md border-t border-white/10',
    stars: true,
    cssVars: { primary: '#7c3aed', secondary: '#4f46e5' },
  },
  {
    id: 'rocket',
    name: 'Rocket',
    emoji: '🚀',
    bgGradient: 'from-slate-950 via-blue-950 to-orange-950',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    accentColor: '#f97316',
    primaryBtn: 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-900/50',
    positiveColor: 'bg-teal-800/70 border border-teal-600/40 text-teal-100',
    negativeColor: 'bg-orange-900/70 border border-orange-700/40 text-orange-100',
    rewardColor: 'bg-amber-900/70 border border-amber-600/30 text-amber-100',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
    navBg: 'bg-black/40 backdrop-blur-md border-t border-white/10',
    stars: true,
    cssVars: { primary: '#f97316', secondary: '#ea580c' },
  },
  {
    id: 'nature',
    name: 'Nature',
    emoji: '🌿',
    bgGradient: 'from-green-950 via-emerald-900 to-teal-950',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    accentColor: '#10b981',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50',
    positiveColor: 'bg-green-800/70 border border-green-600/40 text-green-100',
    negativeColor: 'bg-red-900/70 border border-red-700/40 text-red-100',
    rewardColor: 'bg-amber-900/70 border border-amber-600/30 text-amber-100',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
    navBg: 'bg-black/40 backdrop-blur-md border-t border-white/10',
    stars: false,
    cssVars: { primary: '#10b981', secondary: '#059669' },
  },
  {
    id: 'superheroes',
    name: 'Superheroes',
    emoji: '🦸',
    bgGradient: 'from-red-950 via-rose-900 to-yellow-950',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    accentColor: '#eab308',
    primaryBtn: 'bg-yellow-500 hover:bg-yellow-400 text-white shadow-lg shadow-yellow-900/50',
    positiveColor: 'bg-yellow-800/60 border border-yellow-600/40 text-yellow-100',
    negativeColor: 'bg-red-900/70 border border-red-700/40 text-red-100',
    rewardColor: 'bg-amber-900/70 border border-amber-600/30 text-amber-100',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
    navBg: 'bg-black/40 backdrop-blur-md border-t border-white/10',
    stars: false,
    cssVars: { primary: '#eab308', secondary: '#ca8a04' },
  },
  {
    id: 'dinosaurs',
    name: 'Dinosaurs',
    emoji: '🦕',
    bgGradient: 'from-stone-950 via-green-950 to-lime-950',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    accentColor: '#84cc16',
    primaryBtn: 'bg-lime-600 hover:bg-lime-500 text-white shadow-lg shadow-lime-900/50',
    positiveColor: 'bg-lime-900/70 border border-lime-700/40 text-lime-100',
    negativeColor: 'bg-red-900/70 border border-red-700/40 text-red-100',
    rewardColor: 'bg-amber-900/70 border border-amber-600/30 text-amber-100',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
    navBg: 'bg-black/40 backdrop-blur-md border-t border-white/10',
    stars: false,
    cssVars: { primary: '#84cc16', secondary: '#65a30d' },
  },
  {
    id: 'monster_trucks',
    name: 'Monster Trucks',
    emoji: '🚛',
    bgGradient: 'from-zinc-950 via-neutral-900 to-yellow-950',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    accentColor: '#facc15',
    primaryBtn: 'bg-yellow-400 hover:bg-yellow-300 text-gray-900 shadow-lg shadow-yellow-900/50',
    positiveColor: 'bg-green-900/70 border border-green-700/40 text-green-100',
    negativeColor: 'bg-red-900/70 border border-red-700/40 text-red-100',
    rewardColor: 'bg-amber-900/70 border border-amber-600/30 text-amber-100',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
    navBg: 'bg-black/40 backdrop-blur-md border-t border-white/10',
    stars: false,
    cssVars: { primary: '#facc15', secondary: '#eab308' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    bgGradient: 'from-cyan-950 via-blue-900 to-teal-950',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/15',
    accentColor: '#06b6d4',
    primaryBtn: 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-900/50',
    positiveColor: 'bg-teal-800/70 border border-teal-600/40 text-teal-100',
    negativeColor: 'bg-red-900/70 border border-red-700/40 text-red-100',
    rewardColor: 'bg-amber-900/70 border border-amber-600/30 text-amber-100',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
    navBg: 'bg-black/40 backdrop-blur-md border-t border-white/10',
    stars: true,
    cssVars: { primary: '#06b6d4', secondary: '#0891b2' },
  },
]

// ─── Avatar Options ────────────────────────────────────────────────────────────

export const AVATAR_OPTIONS = [
  '🦁', '🐯', '🐻', '🦊', '🐼', '🐨', '🦄', '🐉',
  '🦸', '🧙', '🚀', '⭐', '🌈', '🎮', '🏆', '💫',
  '🦋', '🐬', '🦅', '🌟',
]

// ─── Legacy THEME_OPTIONS (kept for backward compatibility) ───────────────────

export const THEME_OPTIONS = THEME_PACKS.map((p) => ({
  value: p.id,
  label: p.name,
  emoji: p.emoji,
}))

// ─── getTheme ─────────────────────────────────────────────────────────────────

/**
 * Get a theme pack by ID, with optional custom color overrides.
 * @param {string} themeId
 * @param {string|null} customPrimary - hex color
 * @param {string|null} customSecondary - hex color
 * @returns theme pack object (possibly with overridden accentColor)
 */
export function getTheme(themeId, customPrimary = null, customSecondary = null) {
  const pack = THEME_PACKS.find((t) => t.id === themeId) || THEME_PACKS[0]
  if (customPrimary || customSecondary) {
    return {
      ...pack,
      accentColor: customPrimary || pack.accentColor,
      cssVars: {
        primary: customPrimary || pack.cssVars.primary,
        secondary: customSecondary || pack.cssVars.secondary,
      },
    }
  }
  return pack
}

/**
 * Get auto theme based on time of day (maps old time-based themes to new packs).
 * @param {Date} date
 * @returns theme pack object
 */
export function getAutoTheme(date = new Date()) {
  const hour = parseInt(
    date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false,
    }),
    10
  )
  // morning → nature, afternoon/evening → cosmic, night → cosmic
  if (hour >= 6 && hour < 12) return THEME_PACKS.find((t) => t.id === 'ocean')
  if (hour >= 12 && hour < 18) return THEME_PACKS.find((t) => t.id === 'rocket')
  return THEME_PACKS.find((t) => t.id === 'cosmic')
}

/**
 * Apply CSS variables for a theme to :root.
 */
export function applyCSSVars(theme) {
  if (!theme) return
  const root = document.documentElement
  root.style.setProperty('--color-primary', theme.cssVars?.primary || theme.accentColor)
  root.style.setProperty('--color-secondary', theme.cssVars?.secondary || theme.accentColor)
}
