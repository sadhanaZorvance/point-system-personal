import React from 'react'
import { motion } from 'framer-motion'
import { getLevelInfo, getNextLevel, getLevelProgress, pointsToNextLevel } from '../utils/levels'

/**
 * Animated level/rank badge.
 */
export default function LevelBadge({ lifetimePoints = 0, showProgress = true, compact = false }) {
  const level = getLevelInfo(lifetimePoints)
  const next = getNextLevel(lifetimePoints)
  const progress = getLevelProgress(lifetimePoints)
  const toNext = pointsToNextLevel(lifetimePoints)

  if (compact) {
    return (
      <motion.div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${level.color} shadow-lg`}
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-lg">{level.emoji}</span>
        <span className="font-black text-white text-sm">{level.name}</span>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className={`relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${level.color} shadow-xl`}
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="shine-effect absolute inset-0 rounded-full" />
        </div>
        <span className="text-4xl z-10 relative">{level.emoji}</span>

        {/* Level number badge */}
        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
          <span className="text-xs font-black text-gray-800">{level.level}</span>
        </div>
      </motion.div>

      <div className="text-center">
        <p className="font-black text-white text-lg leading-tight">{level.name}</p>
        <p className="text-white/50 text-xs">Level {level.level}</p>
      </div>

      {showProgress && next && (
        <div className="w-full max-w-[160px]">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Next: {next.emoji} {next.name}</span>
            <span>{toNext} pts</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${level.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {showProgress && !next && (
        <p className="text-amber-400 font-bold text-sm">MAX LEVEL! 💎</p>
      )}
    </div>
  )
}
