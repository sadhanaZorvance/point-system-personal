import React from 'react'
import { motion } from 'framer-motion'

/**
 * Compact TaskTile — designed for 2-col grid layout.
 * Approx 80px tall, emoji + points badge + task name.
 */
export default function TaskTile({ task, onTap, disabled = false, multiplier = 1 }) {
  const isPositive = task.points > 0
  const absPoints = Math.abs(task.points)
  const effectivePoints = isPositive ? absPoints * multiplier : absPoints

  const tileClasses = isPositive
    ? 'bg-emerald-800/60 border border-emerald-600/30 text-emerald-100'
    : 'bg-rose-900/60 border border-rose-700/30 text-rose-100'

  return (
    <motion.button
      className={`${tileClasses} rounded-2xl p-3 w-full text-left relative select-none overflow-hidden ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{ minHeight: '72px' }}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : () => onTap(task)}
    >
      {/* Points badge — top right */}
      <span className="absolute top-1.5 right-1.5 bg-black/30 text-white text-xs font-black px-1.5 py-0.5 rounded-full">
        {isPositive ? '+' : '-'}{effectivePoints}
        {multiplier > 1 && isPositive && (
          <span className="text-amber-300 ml-0.5">{multiplier}x</span>
        )}
      </span>

      {/* Content */}
      <div className="flex flex-col gap-1 pr-10">
        <span className="text-2xl leading-none">{task.emoji}</span>
        <p className="font-bold text-sm leading-tight line-clamp-2">{task.name}</p>
      </div>
    </motion.button>
  )
}

/**
 * Compact RewardTile — designed for 2-col grid layout.
 */
export function RewardTile({ reward, currentBalance, onTap, disabled = false }) {
  const canAfford = currentBalance >= reward.point_cost
  const isDisabled = disabled || !canAfford

  return (
    <motion.button
      className={`bg-amber-900/60 border border-amber-600/30 text-amber-100 rounded-2xl p-3 w-full text-left relative select-none overflow-hidden ${
        isDisabled ? 'opacity-50' : 'cursor-pointer'
      }`}
      style={{ minHeight: '72px' }}
      whileHover={isDisabled ? {} : { scale: 1.03 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      onClick={isDisabled ? undefined : () => onTap(reward)}
    >
      {/* Cost badge — top right */}
      <span className="absolute top-1.5 right-1.5 bg-black/30 text-white text-xs font-black px-1.5 py-0.5 rounded-full">
        {reward.point_cost}
      </span>

      {/* Content */}
      <div className="flex flex-col gap-1 pr-10">
        <span className="text-2xl leading-none">{reward.emoji}</span>
        <p className="font-bold text-sm leading-tight line-clamp-2">{reward.name}</p>
        {reward.weekend_only && (
          <span className="text-xs text-amber-300/70 font-semibold">🏖️ Weekend</span>
        )}
      </div>
    </motion.button>
  )
}
