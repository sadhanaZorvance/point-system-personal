import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Phone-style PIN entry modal with:
 * - Virtual keypad (0–9 + backspace), no native <input> for digits
 * - Each digit visible for 600ms then masked to ●
 * - 4-box (parent) or 6-box (admin)
 * - Shake animation on wrong PIN
 * - Auto-submit when all digits entered
 * - Backdrop click to cancel
 */
export default function PinModal({ isOpen, onClose, onSuccess, type = 'parent', verifyPin }) {
  const length = type === 'admin' ? 6 : 4

  const [digits, setDigits] = useState([])           // array of entered digit strings
  const [revealed, setRevealed] = useState(new Set()) // indices currently showing the digit
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')
  const revealTimers = useRef({})

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setDigits([])
      setRevealed(new Set())
      setError('')
      setShake(false)
      // Clear any pending reveal timers
      Object.values(revealTimers.current).forEach(clearTimeout)
      revealTimers.current = {}
    }
  }, [isOpen, length])

  const checkPin = useCallback((pin) => {
    if (verifyPin(pin, type)) {
      onSuccess()
    } else {
      setError('Wrong PIN! Try again.')
      setShake(true)
      setDigits([])
      setRevealed(new Set())
      Object.values(revealTimers.current).forEach(clearTimeout)
      revealTimers.current = {}
      setTimeout(() => {
        setShake(false)
        setError('')
      }, 600)
    }
  }, [verifyPin, type, onSuccess])

  const handleDigit = useCallback((d) => {
    setDigits((prev) => {
      if (prev.length >= length) return prev
      const next = [...prev, d]
      const idx = prev.length

      // Mark as revealed immediately
      setRevealed((r) => {
        const nr = new Set(r)
        nr.add(idx)
        return nr
      })

      // After 600ms, hide it
      if (revealTimers.current[idx]) clearTimeout(revealTimers.current[idx])
      revealTimers.current[idx] = setTimeout(() => {
        setRevealed((r) => {
          const nr = new Set(r)
          nr.delete(idx)
          return nr
        })
      }, 600)

      // Auto-submit when full
      if (next.length === length) {
        setTimeout(() => checkPin(next.join('')), 100)
      }

      return next
    })
  }, [length, checkPin])

  const handleBackspace = useCallback(() => {
    setDigits((prev) => {
      if (prev.length === 0) return prev
      const idx = prev.length - 1
      if (revealTimers.current[idx]) {
        clearTimeout(revealTimers.current[idx])
        delete revealTimers.current[idx]
      }
      setRevealed((r) => {
        const nr = new Set(r)
        nr.delete(idx)
        return nr
      })
      return prev.slice(0, -1)
    })
    setError('')
  }, [])

  // Keyboard support
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      else if (e.key === 'Backspace') handleBackspace()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, handleDigit, handleBackspace])

  const title = type === 'admin' ? '🔐 Admin Access' : '🔒 Parent Panel'
  const subtitle = type === 'admin' ? 'Enter 6-digit admin PIN' : 'Enter 4-digit parent PIN'

  // Box sizing: smaller for 6-digit to fit in a row
  const boxClass = length === 6
    ? 'w-11 h-11 text-xl'
    : 'w-14 h-14 text-2xl'

  const KEYPAD_ROWS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['backspace', '0', 'confirm'],
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-gradient-to-br from-violet-900 to-indigo-900 rounded-3xl p-6 w-full max-w-xs border border-violet-500/30 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">{type === 'admin' ? '🔐' : '🔒'}</div>
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="text-violet-300 text-sm mt-1">{subtitle}</p>
            </div>

            {/* PIN boxes */}
            <motion.div
              animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="flex justify-center gap-2 mb-2 max-w-xs mx-auto flex-wrap"
            >
              {Array.from({ length }).map((_, i) => {
                const filled = i < digits.length
                const isRevealed = revealed.has(i)
                return (
                  <div
                    key={i}
                    className={`
                      ${boxClass}
                      flex items-center justify-center
                      font-bold rounded-xl border-2 transition-all duration-150
                      ${filled
                        ? 'bg-white/20 border-violet-400 text-white'
                        : 'bg-white/10 border-white/20 text-white/20'
                      }
                    `}
                  >
                    {filled
                      ? (isRevealed ? digits[i] : '●')
                      : null}
                  </div>
                )
              })}
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-center text-sm font-semibold mb-3"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Virtual Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-4 mt-4">
              {KEYPAD_ROWS.map((row, ri) =>
                row.map((key) => {
                  if (key === 'backspace') {
                    return (
                      <motion.button
                        key="backspace"
                        whileTap={{ scale: 0.88 }}
                        onClick={handleBackspace}
                        className="h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg transition-all flex items-center justify-center"
                      >
                        ⌫
                      </motion.button>
                    )
                  }
                  if (key === 'confirm') {
                    return (
                      <motion.button
                        key="confirm"
                        whileTap={{ scale: 0.88 }}
                        onClick={() => {
                          if (digits.length === length) checkPin(digits.join(''))
                        }}
                        className="h-12 rounded-2xl bg-violet-600/60 hover:bg-violet-600 text-white font-bold text-lg transition-all flex items-center justify-center"
                      >
                        ✓
                      </motion.button>
                    )
                  }
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleDigit(key)}
                      className="h-12 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-black text-xl transition-all select-none"
                    >
                      {key}
                    </motion.button>
                  )
                })
              )}
            </div>

            {/* Cancel */}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-white/10 text-white/70 hover:bg-white/20 transition-all font-semibold text-sm"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
