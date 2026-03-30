import React, { useState, useCallback } from 'react'
import { useTasks } from '../hooks/useTasks'
import { generatePDF } from '../utils/generatePDF'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { useTheme } from '../hooks/useTheme'
import { AVATAR_OPTIONS, THEME_PACKS, applyCSSVars, getTheme } from '../utils/theme'
import BottomNav from '../components/BottomNav'

// ─── Mini gradient swatch for theme card ──────────────────────────────────────

function ThemeSwatch({ pack }) {
  return (
    <div className={`w-full h-8 rounded-lg bg-gradient-to-br ${pack.bgGradient} border border-white/10`} />
  )
}

// ─── Main SettingsScreen (public — avatar, themes, colors only) ───────────────

export default function SettingsScreen() {
  const { profile, updateProfile } = useProfile()
  const { tasks, rewards } = useTasks()
  const theme = useTheme()
  const [pdfLoading, setPdfLoading] = useState(false)

  const handlePrint = useCallback(async () => {
    setPdfLoading(true)
    try { generatePDF(profile, tasks, rewards) }
    catch (err) { console.error('PDF error:', err) }
    finally { setPdfLoading(false) }
  }, [profile, tasks, rewards])

  const [successMsg, setSuccessMsg] = useState('')

  // Hue state — initialized from profile (falls back to defaults)
  const [primaryHue, setPrimaryHue] = useState(() => {
    return profile.customPrimaryHue ?? 262  // default violet hue
  })
  const [secondaryHue, setSecondaryHue] = useState(() => {
    return profile.customSecondaryHue ?? 239 // default indigo hue
  })

  const hslPrimary = `hsl(${primaryHue}, 70%, 55%)`
  const hslSecondary = `hsl(${secondaryHue}, 65%, 50%)`

  const showSuccess = useCallback((msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 2500)
  }, [])

  const handleThemeChange = (packId) => {
    updateProfile({ theme: packId })
    const pack = getTheme(packId, profile.customPrimary || null, profile.customSecondary || null)
    applyCSSVars(pack)
    showSuccess(`Theme: ${pack.name}!`)
  }

  const handlePrimaryChange = (e) => {
    const hue = Number(e.target.value)
    setPrimaryHue(hue)
    const color = `hsl(${hue}, 70%, 55%)`
    document.documentElement.style.setProperty('--color-primary', color)
    updateProfile({ customPrimaryHue: hue, customPrimary: color })
  }

  const handleSecondaryChange = (e) => {
    const hue = Number(e.target.value)
    setSecondaryHue(hue)
    const color = `hsl(${hue}, 65%, 50%)`
    document.documentElement.style.setProperty('--color-secondary', color)
    updateProfile({ customSecondaryHue: hue, customSecondary: color })
  }

  const handleResetColors = () => {
    const pack = getTheme(profile.theme || 'cosmic', null, null)
    updateProfile({ customPrimary: null, customSecondary: null, customPrimaryHue: null, customSecondaryHue: null })
    applyCSSVars(pack)
    // Reset hue sliders to defaults for the active theme's pack
    setPrimaryHue(262)
    setSecondaryHue(239)
    showSuccess('Colors reset to defaults!')
  }

  const activePackId = profile.theme || 'cosmic'

  return (
    <div className={`h-full bg-gradient-to-br ${theme.bgGradient} relative overflow-y-auto scrollbar-hide`}>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-28">

        <h1 className="text-white font-black text-xl mb-5">🎨 Appearance</h1>

        {/* Success toast */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-white font-bold px-4 py-3 rounded-2xl mb-4 text-center text-sm"
              style={{ backgroundColor: theme.accentColor }}
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Avatar ────────────────────────────────────────────── */}
        <div className="star-card mb-4">
          <h3 className="text-white font-black mb-3">Avatar</h3>
          <div className="grid grid-cols-10 gap-2">
            {AVATAR_OPTIONS.map((avatar) => (
              <motion.button
                key={avatar}
                onClick={() => { updateProfile({ avatar }); showSuccess('Avatar updated!') }}
                whileTap={{ scale: 0.9 }}
                className="text-2xl p-1.5 rounded-xl transition-all"
                style={
                  profile.avatar === avatar
                    ? { backgroundColor: theme.accentColor, transform: 'scale(1.1)' }
                    : { backgroundColor: 'rgba(255,255,255,0.1)' }
                }
              >
                {avatar}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Theme Packs ──────────────────────────────────────── */}
        <div className="star-card mb-4">
          <h3 className="text-white font-black mb-3">Theme Pack</h3>
          <div className="grid grid-cols-2 gap-3">
            {THEME_PACKS.map((pack) => {
              const isActive = activePackId === pack.id
              return (
                <motion.button
                  key={pack.id}
                  onClick={() => handleThemeChange(pack.id)}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-2xl p-3 text-left transition-all border"
                  style={
                    isActive
                      ? { backgroundColor: `${theme.accentColor}30`, borderColor: theme.accentColor, borderWidth: 2 }
                      : { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }
                  }
                >
                  <ThemeSwatch pack={pack} />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg">{pack.emoji}</span>
                    <div>
                      <p className={`font-black text-sm ${isActive ? 'text-white' : 'text-white/70'}`}>{pack.name}</p>
                      {isActive && (
                        <p className="text-xs font-bold" style={{ color: theme.accentColor }}>Active</p>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── Custom Colors ─────────────────────────────────────── */}
        <div className="star-card mb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-black">Custom Colors</h3>
            <button
              onClick={handleResetColors}
              className="text-white/50 hover:text-white text-xs font-semibold transition-colors"
            >
              Reset to defaults
            </button>
          </div>
          <p className="text-white/40 text-xs mb-4">Override accent colors with a custom hue</p>

          {/* Primary Color Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/60 text-xs font-bold uppercase">Primary Color</label>
              <div
                className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg transition-all duration-150"
                style={{ backgroundColor: hslPrimary }}
              />
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="360"
                value={primaryHue}
                onChange={handlePrimaryChange}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, hsl(0,70%,55%), hsl(30,70%,55%), hsl(60,70%,55%), hsl(90,70%,55%), hsl(120,70%,55%), hsl(150,70%,55%), hsl(180,70%,55%), hsl(210,70%,55%), hsl(240,70%,55%), hsl(270,70%,55%), hsl(300,70%,55%), hsl(330,70%,55%), hsl(360,70%,55%))'
                }}
              />
            </div>
            <p className="text-white/30 text-xs mt-1 text-right">{hslPrimary}</p>
          </div>

          {/* Secondary Color Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/60 text-xs font-bold uppercase">Secondary Color</label>
              <div
                className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg transition-all duration-150"
                style={{ backgroundColor: hslSecondary }}
              />
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="360"
                value={secondaryHue}
                onChange={handleSecondaryChange}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, hsl(0,65%,50%), hsl(30,65%,50%), hsl(60,65%,50%), hsl(90,65%,50%), hsl(120,65%,50%), hsl(150,65%,50%), hsl(180,65%,50%), hsl(210,65%,50%), hsl(240,65%,50%), hsl(270,65%,50%), hsl(300,65%,50%), hsl(330,65%,50%), hsl(360,65%,50%))'
                }}
              />
            </div>
            <p className="text-white/30 text-xs mt-1 text-right">{hslSecondary}</p>
          </div>

          {/* Live preview swatches */}
          <div className="flex items-center gap-3 mt-1 p-3 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-xl shadow transition-all duration-150" style={{ backgroundColor: hslPrimary }} />
            <div className="w-9 h-9 rounded-xl shadow transition-all duration-150" style={{ backgroundColor: hslSecondary }} />
            <span className="text-white/40 text-xs ml-1">Live preview</span>
          </div>
        </div>

        {/* ── Print Chart ─────────────────────────────────────────── */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          disabled={pdfLoading}
          className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white/70 hover:text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>🖨️</span>
          <span>{pdfLoading ? 'Generating...' : 'Print Chart'}</span>
        </motion.button>

      </div>

      <BottomNav />
    </div>
  )
}
