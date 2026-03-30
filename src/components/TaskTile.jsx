import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Compact TaskTile — designed for 2-col grid layout.
 * Approx 80px tall, emoji + points badge + task name.
 * Sparkle burst on tap with random directions.
 */
export default function TaskTile({ task, onTap, disabled = false, multiplier = 1 }) {
  const isPositive = task.points > 0
  const absPoints = Math.abs(task.points)
  const effectivePoints = isPositive ? absPoints * multiplier : absPoints
  const [sparkles, setSparkles] = useState([])

  const handleTap = useCallback(() => {
    if (disabled) return
    // Spawn sparkle particles from random positions within the tile
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,  // % within tile
      y: 20 + Math.random() * 60,
      dx: (Math.random() - 0.5) * 80,  // random travel direction
      dy: -20 - Math.random() * 50,
      size: 4 + Math.random() * 6,
    }))
    setSparkles(newSparkles)
    setTimeout(() => setSparkles([]), 600)
    onTap(task)
  }, [disabled, onTap, task])

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
      onClick={handleTap}
    >
      {/* Sparkle burst */}
      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              background: isPositive
                ? 'radial-gradient(circle, #34d399, #fbbf24)'
                : 'radial-gradient(circle, #f87171, #fb923c)',
            }}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 0.3, x: s.dx, y: s.dy }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

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
 * Sparkle burst on tap with random directions.
 */
export function RewardTile({ reward, currentBalance, onTap, disabled = false }) {
  const canAfford = currentBalance >= reward.point_cost
  const isDisabled = disabled || !canAfford
  const [sparkles, setSparkles] = useState([])

  const handleTap = useCallback(() => {
    if (isDisabled) return
    const newSparkles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      dx: (Math.random() - 0.5) * 70,
      dy: -15 - Math.random() * 45,
      size: 4 + Math.random() * 5,
    }))
    setSparkles(newSparkles)
    setTimeout(() => setSparkles([]), 600)
    onTap(reward)
  }, [isDisabled, onTap, reward])

  return (
    <motion.button
      className={`bg-amber-900/60 border border-amber-600/30 text-amber-100 rounded-2xl p-3 w-full text-left relative select-none overflow-hidden ${
        isDisabled ? 'opacity-50' : 'cursor-pointer'
      }`}
      style={{ minHeight: '72px' }}
      whileHover={isDisabled ? {} : { scale: 1.03 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      onClick={handleTap}
    >
      {/* Sparkle burst */}
      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              background: 'radial-gradient(circle, #fbbf24, #f59e0b)',
            }}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 0.3, x: s.dx, y: s.dy }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

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
