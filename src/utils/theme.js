/**
 * Theme configurations for different times of day and special modes.
 */

export const THEMES = {
  morning: {
    name: 'morning',
    bgGradient: 'from-amber-400 via-orange-400 to-rose-400',
    bgClass: 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400',
    cardBg: 'bg-orange-900/30',
    cardBorder: 'border-orange-300/30',
    primaryColor: 'amber',
    textPrimary: 'text-amber-900',
    textSecondary: 'text-amber-800',
    accentColor: '#f97316',
    emoji: '🌅',
    stars: false,
  },
  afternoon: {
    name: 'afternoon',
    bgGradient: 'from-sky-500 via-blue-600 to-indigo-700',
    bgClass: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700',
    cardBg: 'bg-blue-900/30',
    cardBorder: 'border-blue-300/30',
    primaryColor: 'blue',
    textPrimary: 'text-white',
    textSecondary: 'text-blue-100',
    accentColor: '#3b82f6',
    emoji: '☀️',
    stars: false,
  },
  evening: {
    name: 'evening',
    bgGradient: 'from-violet-900 via-indigo-900 to-purple-950',
    bgClass: 'bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-950',
    cardBg: 'bg-violet-900/30',
    cardBorder: 'border-violet-400/30',
    primaryColor: 'violet',
    textPrimary: 'text-white',
    textSecondary: 'text-violet-200',
    accentColor: '#7c3aed',
    emoji: '🌆',
    stars: true,
  },
  night: {
    name: 'night',
    bgGradient: 'from-slate-950 via-indigo-950 to-violet-950',
    bgClass: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950',
    cardBg: 'bg-slate-900/40',
    cardBorder: 'border-slate-600/30',
    primaryColor: 'indigo',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    accentColor: '#4f46e5',
    emoji: '🌙',
    stars: true,
  },
  default: {
    name: 'default',
    bgGradient: 'from-violet-900 via-indigo-900 to-purple-950',
    bgClass: 'bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-950',
    cardBg: 'bg-violet-900/30',
    cardBorder: 'border-violet-400/30',
    primaryColor: 'violet',
    textPrimary: 'text-white',
    textSecondary: 'text-violet-200',
    accentColor: '#7c3aed',
    emoji: '⭐',
    stars: true,
  },
}

/**
 * Get theme config by name.
 */
export function getTheme(themeName) {
  return THEMES[themeName] || THEMES.default
}

/**
 * Avatar options for kids.
 */
export const AVATAR_OPTIONS = [
  '🦁', '🐯', '🐻', '🦊', '🐼', '🐨', '🦄', '🐉',
  '🦸', '🧙', '🚀', '⭐', '🌈', '🎮', '🏆', '💫',
  '🦋', '🐬', '🦅', '🌟',
]

/**
 * Theme color options for user profile.
 */
export const THEME_OPTIONS = [
  { value: 'default', label: 'Cosmic Purple', emoji: '🔮' },
  { value: 'evening', label: 'Night Mode', emoji: '🌙' },
  { value: 'morning', label: 'Sunny Morning', emoji: '🌅' },
  { value: 'afternoon', label: 'Ocean Blue', emoji: '🌊' },
]
