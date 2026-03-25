export const LEVELS = [
  { level: 1, name: 'Helper', emoji: '⭐', minPoints: 0, color: 'from-gray-400 to-gray-500', textColor: 'text-gray-200' },
  { level: 2, name: 'Rising Star', emoji: '🌟', minPoints: 500, color: 'from-blue-400 to-blue-600', textColor: 'text-blue-200' },
  { level: 3, name: 'Gold Champion', emoji: '🏆', minPoints: 1500, color: 'from-yellow-400 to-amber-500', textColor: 'text-yellow-100' },
  { level: 4, name: 'Super Kid', emoji: '⚡', minPoints: 3500, color: 'from-violet-400 to-purple-600', textColor: 'text-violet-100' },
  { level: 5, name: 'Legend', emoji: '💎', minPoints: 7500, color: 'from-cyan-400 to-blue-500', textColor: 'text-cyan-100' },
]

/**
 * Get the current level info based on lifetime points.
 */
export function getLevelInfo(lifetimePoints) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (lifetimePoints >= lvl.minPoints) {
      current = lvl
    }
  }
  return current
}

/**
 * Get next level info (null if at max level).
 */
export function getNextLevel(lifetimePoints) {
  const currentLevel = getLevelInfo(lifetimePoints)
  const idx = LEVELS.findIndex(l => l.level === currentLevel.level)
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null
}

/**
 * Get progress (0–1) toward the next level.
 */
export function getLevelProgress(lifetimePoints) {
  const current = getLevelInfo(lifetimePoints)
  const next = getNextLevel(lifetimePoints)
  if (!next) return 1
  const range = next.minPoints - current.minPoints
  const earned = lifetimePoints - current.minPoints
  return Math.min(1, Math.max(0, earned / range))
}

/**
 * Points needed to reach next level.
 */
export function pointsToNextLevel(lifetimePoints) {
  const next = getNextLevel(lifetimePoints)
  if (!next) return 0
  return Math.max(0, next.minPoints - lifetimePoints)
}
