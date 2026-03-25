import React from 'react'
import { motion } from 'framer-motion'

/**
 * Animated streak flame display.
 */
export default function StreakFlame({ streak = 0, compact = false }) {
  const flameScale = streak === 0 ? 0.7 : streak < 3 ? 1 : streak < 7 ? 1.15 : streak < 14 ? 1.3 : 1.5
  const flameEmoji = streak === 0 ? '💤' : streak < 3 ? '🔥' : streak < 7 ? '🔥' : streak < 14 ? '🔥' : '⚡'
  const flameColor = streak === 0
    ? 'text-gray-400'
    : streak < 3
    ? 'text-orange-400'
    : streak < 7
    ? 'text-orange-500'
    : streak < 14
    ? 'text-red-500'
    : 'text-yellow-400'

  const label = streak === 0
    ? 'No streak yet'
    : streak === 1
    ? '1 day streak!'
    : `${streak} day streak!`

  if (compact) {
    return (
      <motion.div
        className="flex items-center gap-1"
        animate={streak > 0 ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-xl">{flameEmoji}</span>
        <span className={`font-black text-lg ${flameColor}`}>{streak}</span>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={streak > 0 ? {
          scaleY: [1, 1.08, 0.96, 1.04, 1],
          scaleX: [1, 0.96, 1.02, 0.98, 1],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'bottom center', fontSize: `${2 * flameScale}rem` }}
        className="leading-none"
      >
        {flameEmoji}
      </motion.div>
      <motion.span
        className={`font-black text-2xl mt-1 ${flameColor}`}
        key={streak}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {streak}
      </motion.span>
      <span className="text-white/60 text-xs font-semibold mt-0.5 text-center leading-tight">
        {streak === 1 ? 'day' : 'days'}
      </span>
    </div>
  )
}
