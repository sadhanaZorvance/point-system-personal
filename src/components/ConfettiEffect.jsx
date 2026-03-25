import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

/**
 * Fires confetti when `trigger` changes to true.
 * Pass `intensity` as 'low' | 'medium' | 'high'.
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

    const configs = {
      low: [
        {
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399'],
        },
      ],
      medium: [
        {
          particleCount: 80,
          spread: 70,
          origin: { x: 0.3, y: 0.6 },
          colors: ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'],
        },
        {
          particleCount: 80,
          spread: 70,
          origin: { x: 0.7, y: 0.6 },
          colors: ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'],
        },
      ],
      high: [
        {
          particleCount: 120,
          spread: 100,
          origin: { x: 0.2, y: 0.5 },
          colors: ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399', '#f472b6', '#60a5fa'],
          shapes: ['star', 'circle'],
          scalar: 1.2,
        },
        {
          particleCount: 120,
          spread: 100,
          origin: { x: 0.8, y: 0.5 },
          colors: ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399', '#f472b6', '#60a5fa'],
          shapes: ['star', 'circle'],
          scalar: 1.2,
        },
        {
          particleCount: 60,
          spread: 120,
          origin: { x: 0.5, y: 0.3 },
          colors: ['#fbbf24', '#fde68a', '#ffffff'],
          shapes: ['star'],
          scalar: 1.5,
        },
      ],
    }

    const shots = configs[intensity] || configs.medium
    shots.forEach((opts, i) => {
      setTimeout(() => confetti(opts), i * 150)
    })
  }, [trigger, intensity])

  return null
}

/**
 * Fire confetti programmatically (not component-based).
 */
export function fireConfetti(intensity = 'medium') {
  if (intensity === 'low') {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399'],
    })
    return
  }

  if (intensity === 'high') {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { x: 0.2, y: 0.5 },
      colors: ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'],
      shapes: ['star', 'circle'],
      scalar: 1.2,
    })
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.8, y: 0.5 },
        colors: ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'],
        shapes: ['star', 'circle'],
        scalar: 1.2,
      })
    }, 150)
    return
  }

  // medium
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.3, y: 0.6 },
    colors: ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'],
  })
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.7, y: 0.6 },
      colors: ['#7c3aed', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'],
    })
  }, 150)
}
