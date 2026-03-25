import React from 'react'
import { motion } from 'framer-motion'

/**
 * Task tile for Parent Panel — tappable to trigger task completion.
 */
export default function TaskTile({ task, onTap, disabled = false }) {
  const isPositive = task.points > 0
  const absPoints = Math.abs(task.points)

  const tileClass = isPositive ? 'task-tile-positive' : 'task-tile-negative'

  return (
    <motion.button
      className={`${tileClass} w-full text-left ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={disabled ? undefined : () => onTap(task)}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl flex-shrink-0">{task.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-tight truncate">{task.name}</p>
          <p className="text-white/70 text-xs mt-0.5 capitalize">{task.category}</p>
        </div>
        <div className={`flex-shrink-0 font-black text-lg text-white`}>
          {isPositive ? '+' : ''}{task.points}
        </div>
      </div>
    </motion.button>
  )
}

/**
 * Reward tile for Parent Panel — tappable to redeem a reward.
 */
export function RewardTile({ reward, currentBalance, onTap, disabled = false }) {
  const canAfford = currentBalance >= reward.point_cost
  const isDisabled = disabled || !canAfford

  return (
    <motion.button
      className={`reward-tile w-full text-left ${isDisabled ? 'opacity-50' : ''}`}
      whileTap={isDisabled ? {} : { scale: 0.95 }}
      onClick={isDisabled ? undefined : () => onTap(reward)}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl flex-shrink-0">{reward.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-tight truncate">{reward.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-white/70 text-xs capitalize">{reward.category}</span>
            {reward.weekend_only && (
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full text-white/80">🏖️ Weekend</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="font-black text-white text-lg">{reward.point_cost}</p>
          <p className="text-white/60 text-xs">pts</p>
        </div>
      </div>
      {!canAfford && (
        <p className="text-white/50 text-xs mt-1 text-right">
          Need {reward.point_cost - currentBalance} more pts
        </p>
      )}
    </motion.button>
  )
}
