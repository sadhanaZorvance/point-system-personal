import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Animated point counter that counts up/down when the value changes.
 */
export default function PointCounter({ value = 0, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [delta, setDelta] = useState(null)
  const animFrameRef = useRef(null)
  const prevValueRef = useRef(value)
  const deltaTimeoutRef = useRef(null)

  useEffect(() => {
    const prev = prevValueRef.current
    const diff = value - prev
    prevValueRef.current = value

    if (diff === 0) return

    // Show delta indicator
    setDelta(diff)
    clearTimeout(deltaTimeoutRef.current)
    deltaTimeoutRef.current = setTimeout(() => setDelta(null), 2000)

    // Animate count
    const start = prev
    const end = value
    const duration = Math.min(1200, Math.abs(diff) * 15)
    const startTime = performance.now()

    const easeOut = (t) => 1 - Math.pow(1 - t, 3)

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const current = Math.round(start + (end - start) * easeOut(progress))
      setDisplayValue(current)
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick)
      }
    }

    cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [value])

  const isPositiveDelta = delta > 0

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div className="relative">
        <motion.span
          key={value}
          className="font-black tabular-nums"
          initial={{ scale: delta ? 1.15 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {displayValue.toLocaleString()}
        </motion.span>

        {/* Delta indicator */}
        <AnimatePresence>
          {delta !== null && (
            <motion.div
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -40, scale: 1 }}
              exit={{ opacity: 0, y: -70, scale: 0.9 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`absolute left-1/2 -translate-x-1/2 top-0 font-black text-2xl pointer-events-none z-10
                ${isPositiveDelta ? 'text-green-400' : 'text-red-400'}`}
            >
              {isPositiveDelta ? '+' : ''}{delta}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
