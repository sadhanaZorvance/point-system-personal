import React from 'react'
import { motion } from 'framer-motion'

/**
 * Goal progress bar — shows progress toward a reward goal.
 */
export default function GoalProgressBar({ currentBalance = 0, goalCost = null, goalName = null, goalEmoji = '🎯' }) {
  if (!goalCost || !goalName) {
    return (
      <div className="star-card text-center py-3">
        <p className="text-white/40 text-sm">No goal set</p>
        <p className="text-white/30 text-xs mt-0.5">Set a goal in the Parent Panel</p>
      </div>
    )
  }

  const progress = Math.min(1, currentBalance / goalCost)
  const percentage = Math.round(progress * 100)
  const remaining = Math.max(0, goalCost - currentBalance)
  const isComplete = currentBalance >= goalCost

  return (
    <div className="star-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{goalEmoji}</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{goalName}</p>
            <p className="text-white/50 text-xs">{goalCost} pts goal</p>
          </div>
        </div>
        <div className="text-right">
          {isComplete ? (
            <motion.span
              className="text-green-400 font-black text-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              READY! 🎉
            </motion.span>
          ) : (
            <>
              <span className="text-amber-400 font-black text-lg">{percentage}%</span>
              <p className="text-white/50 text-xs">{remaining} pts to go</p>
            </>
          )}
        </div>
      </div>

      <div className="h-4 bg-white/20 rounded-full overflow-hidden relative">
        <motion.div
          className={`h-full rounded-full ${isComplete
            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
            : 'bg-gradient-to-r from-amber-400 to-amber-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        {isComplete && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      <div className="flex justify-between text-xs text-white/40 mt-1">
        <span>{currentBalance} pts</span>
        <span>{goalCost} pts</span>
      </div>
    </div>
  )
}
