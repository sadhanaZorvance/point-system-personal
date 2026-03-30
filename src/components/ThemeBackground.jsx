import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

// ─── Cosmic: planet with rings + orbiting moon ────────────────────────────────

function CosmicBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: 0.09 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '65%',
          maxWidth: 320,
        }}
      >
        <style>{`
          @keyframes moonOrbit {
            from { transform: rotate(0deg) translateX(110px) rotate(0deg); }
            to   { transform: rotate(360deg) translateX(110px) rotate(-360deg); }
          }
          .cosmic-moon {
            transform-origin: 200px 200px;
            animation: moonOrbit 30s linear infinite;
            will-change: transform;
          }
          @keyframes ringPulse {
            0%, 100% { transform: scaleX(1); }
            50%       { transform: scaleX(1.03); }
          }
          .cosmic-ring {
            transform-origin: 200px 200px;
            animation: ringPulse 8s ease-in-out infinite;
            will-change: transform;
          }
        `}</style>

        {/* Planet body */}
        <circle cx="200" cy="200" r="70" fill="white" />

        {/* Ring ellipse */}
        <g className="cosmic-ring">
          <ellipse cx="200" cy="200" rx="108" ry="22" fill="none" stroke="white" strokeWidth="6" />
        </g>

        {/* Orbiting moon */}
        <g className="cosmic-moon">
          <circle cx="200" cy="200" r="14" fill="white" />
        </g>
      </svg>
    </div>
  )
}

// ─── Rocket: multiple rockets flying in random directions ────────────────────

function RocketSVG() {
  return (
    <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Nose cone */}
      <polygon points="50,5 38,55 62,55" fill="white" />
      {/* Body */}
      <rect x="35" y="50" width="30" height="80" rx="4" fill="white" />
      {/* Window */}
      <circle cx="50" cy="80" r="8" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
      {/* Left fin */}
      <polygon points="35,115 18,145 35,130" fill="white" />
      {/* Right fin */}
      <polygon points="65,115 82,145 65,130" fill="white" />
      {/* Flame */}
      <ellipse cx="50" cy="140" rx="10" ry="18" fill="rgba(255,255,255,0.6)" />
    </svg>
  )
}

function RocketBackground() {
  const rockets = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const angle = -30 + Math.random() * 60  // -30 to 30 degrees from vertical
      const startX = 10 + Math.random() * 80  // random horizontal start %
      const size = 40 + Math.random() * 40     // 40-80px
      const duration = 12 + Math.random() * 18 // 12-30s
      const delay = Math.random() * 10
      return { id: i, angle, startX, size, duration, delay }
    })
  }, [])

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: 0.1 }}
      aria-hidden="true"
    >
      {rockets.map((r) => (
        <motion.div
          key={r.id}
          style={{
            position: 'absolute',
            left: `${r.startX}%`,
            bottom: -120,
            width: r.size,
            height: r.size * 2,
            rotate: `${r.angle}deg`,
          }}
          animate={{
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight + 300 : 1200)],
          }}
          transition={{
            duration: r.duration,
            delay: r.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <RocketSVG />
        </motion.div>
      ))}
    </div>
  )
}

// ─── Nature: swaying trees + rotating sun ─────────────────────────────────────

function NatureBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: 0.08 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 500 300"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
        }}
      >
        <style>{`
          @keyframes treeSway {
            0%, 100% { transform: rotate(-3deg); }
            50%       { transform: rotate(3deg); }
          }
          @keyframes sunRotate {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          .tree1 { transform-origin: 80px 270px; animation: treeSway 4s ease-in-out infinite; will-change: transform; }
          .tree2 { transform-origin: 200px 280px; animation: treeSway 4.8s ease-in-out infinite 0.6s; will-change: transform; }
          .tree3 { transform-origin: 340px 265px; animation: treeSway 3.8s ease-in-out infinite 1.2s; will-change: transform; }
          .sun   { transform-origin: 430px 60px;  animation: sunRotate 60s linear infinite; will-change: transform; }
        `}</style>

        {/* Sun */}
        <g className="sun">
          <circle cx="430" cy="60" r="28" fill="white" />
          {[0,45,90,135,180,225,270,315].map((a, i) => (
            <line
              key={i}
              x1={430 + Math.cos(a * Math.PI / 180) * 34}
              y1={60  + Math.sin(a * Math.PI / 180) * 34}
              x2={430 + Math.cos(a * Math.PI / 180) * 44}
              y2={60  + Math.sin(a * Math.PI / 180) * 44}
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Tree 1 */}
        <g className="tree1">
          <polygon points="80,150 44,270 116,270" fill="white" />
          <polygon points="80,190 52,270 108,270" fill="white" />
          <rect x="72" y="270" width="16" height="26" rx="2" fill="white" />
        </g>

        {/* Tree 2 */}
        <g className="tree2">
          <polygon points="200,130 154,280 246,280" fill="white" />
          <polygon points="200,180 162,280 238,280" fill="white" />
          <rect x="190" y="280" width="20" height="18" rx="2" fill="white" />
        </g>

        {/* Tree 3 */}
        <g className="tree3">
          <polygon points="340,155 308,265 372,265" fill="white" />
          <polygon points="340,195 314,265 366,265" fill="white" />
          <rect x="333" y="265" width="14" height="22" rx="2" fill="white" />
        </g>
      </svg>

      {/* Falling leaves */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = 5 + Math.random() * 90
        const size = 8 + Math.random() * 10
        const duration = 8 + Math.random() * 10
        const delay = Math.random() * 8
        const drift = (Math.random() - 0.5) * 100
        return (
          <motion.div
            key={i}
            className="absolute text-white/30 pointer-events-none"
            style={{ left: `${x}%`, top: -20, fontSize: size }}
            animate={{
              y: [0, typeof window !== 'undefined' ? window.innerHeight + 40 : 900],
              x: [0, drift, drift * 0.5],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
          >
            🍃
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Superheroes: pulsing lightning bolt + flying stars ──────────────────────

function SuperheroBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: 20 + Math.random() * 60,
      angle: -60 + Math.random() * 120,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 6,
      size: 14 + Math.random() * 10,
    }))
  }, [])

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: 0.08 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 320"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          top: '15%',
          right: '5%',
          width: 130,
          animation: 'boltPulse 3s ease-in-out infinite',
          willChange: 'transform',
          transformOrigin: 'center center',
        }}
      >
        <style>{`
          @keyframes boltPulse {
            0%, 100% { transform: scale(1) rotate(-5deg); }
            50%       { transform: scale(1.05) rotate(-5deg); }
          }
        `}</style>
        <polygon
          points="120,10 55,140 100,140 80,310 165,155 110,155"
          fill="white"
        />
      </svg>

      {/* Shooting stars */}
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute pointer-events-none"
          style={{
            left: `${s.startX}%`,
            top: `${s.startY}%`,
            fontSize: s.size,
          }}
          animate={{
            x: [0, Math.cos(s.angle * Math.PI / 180) * 300],
            y: [0, Math.sin(s.angle * Math.PI / 180) * 300],
            opacity: [0, 1, 1, 0],
            scale: [0.3, 1, 1, 0.2],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          ⭐
        </motion.div>
      ))}
    </div>
  )
}

// ─── Dinosaurs: multiple T-Rex walking in different directions ───────────────

function DinoSVG() {
  return (
    <svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="18" cy="105" rx="22" ry="10" fill="white" transform="rotate(-20,18,105)" />
      <ellipse cx="80" cy="95" rx="50" ry="38" fill="white" />
      <rect x="108" y="55" width="22" height="45" rx="10" fill="white" transform="rotate(15,108,55)" />
      <ellipse cx="140" cy="45" rx="28" ry="20" fill="white" />
      <circle cx="152" cy="38" r="4" fill="rgba(0,0,0,0.35)" />
      <ellipse cx="163" cy="50" rx="10" ry="5" fill="white" />
      <line x1="115" y1="90" x2="128" y2="110" stroke="white" strokeWidth="7" strokeLinecap="round" />
      <line x1="128" y1="110" x2="138" y2="115" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <rect x="60" y="128" width="16" height="44" rx="7" fill="white" />
      <rect x="55" y="168" width="24" height="10" rx="4" fill="white" />
      <rect x="88" y="128" width="16" height="44" rx="7" fill="white" />
      <rect x="83" y="168" width="24" height="10" rx="4" fill="white" />
    </svg>
  )
}

function DinoBackground() {
  const dinos = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => {
      const goingRight = Math.random() > 0.5
      const bottom = 5 + Math.random() * 15
      const size = 80 + Math.random() * 80
      const duration = 20 + Math.random() * 20
      const delay = Math.random() * 12
      return { id: i, goingRight, bottom, size, duration, delay }
    })
  }, [])

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: 0.09 }}
      aria-hidden="true"
    >
      {dinos.map((d) => (
        <motion.div
          key={d.id}
          style={{
            position: 'absolute',
            bottom: `${d.bottom}%`,
            width: d.size,
            height: d.size * 0.9,
            scaleX: d.goingRight ? 1 : -1,
          }}
          animate={{
            x: d.goingRight
              ? [-(d.size + 20), typeof window !== 'undefined' ? window.innerWidth + 40 : 500]
              : [(typeof window !== 'undefined' ? window.innerWidth + 40 : 500), -(d.size + 20)],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <DinoSVG />
        </motion.div>
      ))}
    </div>
  )
}

// ─── Monster Trucks: multiple trucks driving both directions ─────────────────

function TruckSVG() {
  return (
    <svg viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="80" y="30" width="150" height="72" rx="10" fill="white" />
      <rect x="200" y="50" width="46" height="52" rx="6" fill="white" />
      <rect x="88" y="38" width="58" height="36" rx="6" fill="rgba(0,0,0,0.2)" />
      <rect x="240" y="78" width="18" height="14" rx="4" fill="white" />
      <rect x="62" y="78" width="22" height="14" rx="4" fill="white" />
      <circle cx="108" cy="120" r="36" fill="white" />
      <circle cx="108" cy="120" r="20" fill="rgba(0,0,0,0.2)" />
      <circle cx="218" cy="120" r="36" fill="white" />
      <circle cx="218" cy="120" r="20" fill="rgba(0,0,0,0.2)" />
      <rect x="90" y="116" width="36" height="8" rx="4" fill="white" />
      <rect x="200" y="116" width="36" height="8" rx="4" fill="white" />
    </svg>
  )
}

function MonsterTruckBackground() {
  const trucks = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => {
      const goingRight = i % 2 === 0
      const bottom = 3 + i * 8 + Math.random() * 5
      const size = 120 + Math.random() * 60
      const duration = 18 + Math.random() * 16
      const delay = Math.random() * 10
      return { id: i, goingRight, bottom, size, duration, delay }
    })
  }, [])

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: 0.09 }}
      aria-hidden="true"
    >
      {trucks.map((t) => (
        <motion.div
          key={t.id}
          style={{
            position: 'absolute',
            bottom: `${t.bottom}%`,
            width: t.size,
            height: t.size * 0.6,
            scaleX: t.goingRight ? 1 : -1,
          }}
          animate={{
            x: t.goingRight
              ? [-(t.size + 20), typeof window !== 'undefined' ? window.innerWidth + 40 : 500]
              : [(typeof window !== 'undefined' ? window.innerWidth + 40 : 500), -(t.size + 20)],
          }}
          transition={{
            duration: t.duration,
            delay: t.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <TruckSVG />
        </motion.div>
      ))}
    </div>
  )
}

// ─── Ocean: scrolling waves + floating bubbles ───────────────────────────────

function OceanBackground() {
  const bubbles = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      size: 6 + Math.random() * 14,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 60,
    }))
  }, [])

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: 0.08 }}
      aria-hidden="true"
    >
      {/* Two identical waves offset by 50% for seamless loop */}
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: '20%',
          width: '200%',
          height: 80,
          animation: 'waveScroll 8s linear infinite',
          willChange: 'transform',
        }}
      >
        <style>{`
          @keyframes waveScroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <path
          d="M0,60 C100,20 200,100 300,60 C400,20 500,100 600,60 C700,20 800,100 900,60 C1000,20 1100,100 1200,60 L1200,120 L0,120 Z"
          fill="white"
        />
        <path
          d="M1200,60 C1300,20 1400,100 1500,60 C1600,20 1700,100 1800,60 C1900,20 2000,100 2100,60 C2200,20 2300,100 2400,60 L2400,120 L1200,120 Z"
          fill="white"
        />
      </svg>

      {/* Second layer wave */}
      <svg
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: '14%',
          width: '200%',
          height: 60,
          opacity: 0.5,
          animation: 'waveScroll2 12s linear infinite',
          willChange: 'transform',
        }}
      >
        <style>{`
          @keyframes waveScroll2 {
            0%   { transform: translateX(-25%); }
            100% { transform: translateX(-75%); }
          }
        `}</style>
        <path
          d="M0,50 C150,10 250,90 400,50 C550,10 650,90 800,50 C950,10 1050,90 1200,50 L1200,100 L0,100 Z"
          fill="white"
        />
        <path
          d="M1200,50 C1350,10 1450,90 1600,50 C1750,10 1850,90 2000,50 C2150,10 2250,90 2400,50 L2400,100 L1200,100 Z"
          fill="white"
        />
      </svg>

      {/* Bubbles rising from random positions */}
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full border border-white/40"
          style={{
            left: `${b.x}%`,
            bottom: -20,
            width: b.size,
            height: b.size,
          }}
          animate={{
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight + 40 : 900)],
            x: [0, b.drift],
            opacity: [0, 0.6, 0.6, 0],
            scale: [0.5, 1, 1.2, 0.8],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── ThemeBackground dispatcher ───────────────────────────────────────────────

export default function ThemeBackground({ themeId }) {
  switch (themeId) {
    case 'rocket':        return <RocketBackground />
    case 'nature':        return <NatureBackground />
    case 'superheroes':   return <SuperheroBackground />
    case 'dinosaurs':     return <DinoBackground />
    case 'monster_trucks':return <MonsterTruckBackground />
    case 'ocean':         return <OceanBackground />
    default:              return <CosmicBackground />  // cosmic + any fallback
  }
}
