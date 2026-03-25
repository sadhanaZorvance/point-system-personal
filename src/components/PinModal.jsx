import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * PIN entry modal. Supports 4-digit (parent) or 6-digit (admin) PINs.
 */
export default function PinModal({ isOpen, onClose, onSuccess, type = 'parent', verifyPin }) {
  const length = type === 'admin' ? 6 : 4
  const [digits, setDigits] = useState(Array(length).fill(''))
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (isOpen) {
      setDigits(Array(length).fill(''))
      setError('')
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [isOpen, length])

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    setError('')

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (value && index === length - 1) {
      // Auto-submit when last digit entered
      const pin = [...next].join('')
      if (pin.length === length) {
        setTimeout(() => checkPin(pin), 100)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      const pin = digits.join('')
      if (pin.length === length) checkPin(pin)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const next = Array(length).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    if (pasted.length === length) {
      setTimeout(() => checkPin(pasted), 100)
    }
  }

  const checkPin = (pin) => {
    if (verifyPin(pin, type)) {
      onSuccess()
    } else {
      setError('Wrong PIN! Try again.')
      setShake(true)
      setDigits(Array(length).fill(''))
      setTimeout(() => {
        setShake(false)
        inputRefs.current[0]?.focus()
      }, 600)
    }
  }

  const title = type === 'admin' ? '🔐 Admin Access' : '🔒 Parent Panel'
  const subtitle = type === 'admin' ? 'Enter 6-digit admin PIN' : 'Enter 4-digit parent PIN'

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
            className="bg-gradient-to-br from-violet-900 to-indigo-900 rounded-3xl p-8 w-full max-w-sm border border-violet-500/30 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{type === 'admin' ? '🔐' : '🔒'}</div>
              <h2 className="text-2xl font-black text-white">{title}</h2>
              <p className="text-violet-300 mt-1">{subtitle}</p>
            </div>

            <motion.div
              animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="flex gap-3 justify-center mb-4"
            >
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="pin-input"
                  style={{ fontSize: digit ? '1.5rem' : '0.5rem' }}
                  placeholder="•"
                />
              ))}
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-center text-sm font-semibold mb-4"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-white/10 text-white/70 hover:bg-white/20 transition-all font-semibold"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
