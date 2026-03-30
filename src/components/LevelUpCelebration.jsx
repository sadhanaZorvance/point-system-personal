import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fireConfetti } from './ConfettiEffect'

/**
 * Full-screen level-up celebration overlay.
 * Auto-dismisses after 4 seconds or on tap.
 */
export default function LevelUpCelebration({ levelInfo, lifetimePoints, onDismiss }) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!levelInfo) return

    // Fire confetti burst
    fireConfetti('high')

    timerRef.current = setTimeout(() => {
      onDismiss()
    }, 4000)

    return () => clearTimeout(timerRef.current)
  }, [levelInfo, onDismiss])

  if (!levelInfo) return null

  // Shimmer particles — random origins, sizes, and drift directions
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    startY: Math.random() * 100,
    drift: (Math.random() - 0.5) * 120,
    size: Math.random() * 8 + 3,
    delay: Math.random() * 2,
    duration: Math.random() * 2.5 + 1.5,
    color: ['#fbbf24', '#a78bfa', '#34d399', '#f472b6', '#60a5fa'][Math.floor(Math.random() * 5)],
  }))

  return (
    <AnimatePresence>
      {levelInfo && (
        <motion.div
          key="level-up"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={() => {
            clearTimeout(timerRef.current)
            onDismiss()
          }}
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #78350f 100%)',
                'linear-gradient(135deg, #78350f 0%, #1e1b4b 50%, #4c1d95 100%)',
                'linear-gradient(135deg, #4c1d95 0%, #78350f 50%, #1e1b4b 100%)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Backdrop blur darkening */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Shimmer particles — random origins, colors, and drift */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.startY}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: 0.6,
              }}
              animate={{
                y: [0, -(window.innerHeight * 0.5 + Math.random() * window.innerHeight * 0.5)],
                x: [0, p.drift],
                opacity: [0, 0.9, 0],
                scale: [0.5, 1.3, 0.4],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Main card */}
          <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
            {/* Level badge — scales in with spring */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className={`w-36 h-36 rounded-full flex items-center justify-center bg-gradient-to-br ${levelInfo.color} shadow-2xl relative`}
            >
              {/* Shine ring */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="shine-effect absolute inset-0 rounded-full" />
              </div>
              <span className="text-7xl z-10 relative">{levelInfo.emoji}</span>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl">
                <span className="text-sm font-black text-gray-800">{levelInfo.level}</span>
              </div>
            </motion.div>

            {/* LEVEL UP! text */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.25 }}
            >
              <p className="text-5xl font-black text-white text-shadow-lg tracking-tight">LEVEL UP!</p>
            </motion.div>

            {/* Level title */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
              className={`px-6 py-2 rounded-2xl bg-gradient-to-r ${levelInfo.color} shadow-xl`}
            >
              <p className="text-2xl font-black text-white">
                {levelInfo.emoji} {levelInfo.name}
              </p>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-white/70 text-base font-semibold"
            >
              You've earned {lifetimePoints.toLocaleString()} lifetime points!
            </motion.p>

            {/* Tap to dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.2 }}
              className="text-white/50 text-sm"
            >
              Tap anywhere to continue
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
