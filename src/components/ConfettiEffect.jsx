import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

const COLORS = ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399', '#f472b6', '#60a5fa']

function randomOrigin() {
  return { x: 0.15 + Math.random() * 0.7, y: 0.3 + Math.random() * 0.4 }
}

function randomAngle() {
  return 55 + Math.random() * 70
}

/**
 * Fires confetti when `trigger` changes to true.
 * Pass `intensity` as 'low' | 'medium' | 'high'.
 * Origins and angles are randomized each time.
 */
export default function ConfettiEffect({ trigger, intensity = 'medium' }) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (!trigger) {
      firedRef.current = false
      return
    }
    if (firedRef.current) return
    firedRef.current = true

    fireConfetti(intensity)
  }, [trigger, intensity])

  return null
}

/**
 * Fire confetti programmatically (not component-based).
 * Origins and spread angles are randomized for variety.
 */
export function fireConfetti(intensity = 'medium') {
  if (intensity === 'low') {
    confetti({
      particleCount: 40,
      spread: 50 + Math.random() * 30,
      angle: randomAngle(),
      origin: randomOrigin(),
      colors: COLORS.slice(0, 4),
    })
    return
  }

  if (intensity === 'high') {
    const burstCount = 3
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 80 + Math.floor(Math.random() * 50),
          spread: 80 + Math.random() * 40,
          angle: randomAngle(),
          origin: randomOrigin(),
          colors: COLORS,
          shapes: ['star', 'circle'],
          scalar: 1 + Math.random() * 0.4,
        })
      }, i * 180)
    }
    return
  }

  // medium — two bursts from random spots
  for (let i = 0; i < 2; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 60 + Math.floor(Math.random() * 40),
        spread: 60 + Math.random() * 30,
        angle: randomAngle(),
        origin: randomOrigin(),
        colors: COLORS.slice(0, 5),
      })
    }, i * 150)
  }
}
