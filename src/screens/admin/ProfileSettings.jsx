import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '../../hooks/useProfile'
import { useTheme } from '../../hooks/useTheme'
import { getTodayString } from '../../utils/timeOfDay'

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ enabled, onChange, label, description, accentColor }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
      <div>
        <p className="text-white font-bold text-sm">{label}</p>
        {description && <p className="text-white/40 text-xs mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className="relative w-12 h-6 rounded-full transition-all duration-200"
        style={{ backgroundColor: enabled ? accentColor : 'rgba(255,255,255,0.2)' }}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${enabled ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

// ─── PIN Change Form ──────────────────────────────────────────────────────────

function PinChangeForm({ type, currentPin, onSave, onCancel, accentColor }) {
  const length = type === 'admin' ? 6 : 4
  const [current, setCurrent] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handle = () => {
    if (current !== currentPin) { setError('Current PIN is incorrect'); return }
    if (newPin.length !== length) { setError(`New PIN must be ${length} digits`); return }
    if (newPin !== confirm) { setError('PINs do not match'); return }
    if (!/^\d+$/.test(newPin)) { setError('PIN must contain only numbers'); return }
    onSave(newPin)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 border border-white/20 mb-4"
      style={{ backgroundColor: `${accentColor}15` }}
    >
      <h4 className="text-white font-black mb-3">Change {type === 'admin' ? 'Admin' : 'Parent'} PIN</h4>
      {['Current', 'New', 'Confirm'].map((label, i) => {
        const val = i === 0 ? current : i === 1 ? newPin : confirm
        const setter = i === 0 ? setCurrent : i === 1 ? setNewPin : setConfirm
        return (
          <div key={label} className="mb-3">
            <label className="text-white/60 text-xs font-bold uppercase mb-1 block">{label} PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={length}
              value={val}
              onChange={(e) => {
                setError('')
                setter(e.target.value.replace(/\D/g, '').slice(0, length))
              }}
              placeholder={'•'.repeat(length)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-center tracking-widest text-lg focus:outline-none"
            />
          </div>
        )
      })}
      {error && <p className="text-red-400 text-sm mb-3 font-semibold">{error}</p>}
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm">Cancel</button>
        <button
          onClick={handle}
          className="flex-1 py-2.5 rounded-xl text-white font-black text-sm transition-all"
          style={{ backgroundColor: accentColor }}
        >
          Save PIN
        </button>
      </div>
    </motion.div>
  )
}

// ─── AdminSettings ────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const { profile, updateProfile, changePin } = useProfile()
  const theme = useTheme()

  const [name, setName] = useState(profile.name)
  const [goalName, setGoalName] = useState(profile.goal_reward_name || '')
  const [goalCost, setGoalCost] = useState(profile.goal_reward_cost || '')
  const [editingPin, setEditingPin] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const today = getTodayString()
  const effectiveMultiplier =
    profile.bonus_multiplier_date === today ? (profile.bonus_multiplier || 1) : 1

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  const handleNameSave = () => {
    if (!name.trim()) return
    updateProfile({ name: name.trim() })
    showSuccess('Name saved!')
  }

  const handleGoalSave = () => {
    const cost = parseInt(goalCost) || null
    updateProfile({
      goal_reward_name: goalName.trim() || null,
      goal_reward_cost: cost,
    })
    showSuccess('Goal saved! 🎯')
  }

  const handlePinSave = (type, newPin) => {
    changePin(type, newPin)
    setEditingPin(null)
    showSuccess(`${type === 'admin' ? 'Admin' : 'Parent'} PIN updated!`)
  }

  const setMultiplier = (value) => {
    if (value === 1) {
      updateProfile({ bonus_multiplier: 1, bonus_multiplier_date: null })
    } else {
      updateProfile({ bonus_multiplier: value, bonus_multiplier_date: today })
    }
    showSuccess(value === 1 ? 'Multiplier reset to 1x' : `${value}x multiplier active!`)
  }

  const handleReset = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('starpoints_'))
    keys.forEach((k) => localStorage.removeItem(k))
    window.location.href = '/'
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 py-4">

      {/* Success Toast */}
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

      {/* ── Child's Name ──────────────────────────────────────── */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
        <h3 className="text-white font-black mb-3">Child's Name</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Champion"
            onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave() }}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none text-sm"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNameSave}
            className="px-4 py-2.5 rounded-xl text-white font-black text-sm transition-all"
            style={{ backgroundColor: theme.accentColor }}
          >
            Save
          </motion.button>
        </div>
      </div>

      {/* ── Savings Goal ─────────────────────────────────────── */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
        <h3 className="text-white font-black mb-1">Savings Goal</h3>
        <p className="text-white/40 text-xs mb-3">Set a reward the child is saving toward</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-white/60 text-xs font-bold uppercase mb-1 block">Goal Name</label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="e.g. Theme park day"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-white/60 text-xs font-bold uppercase mb-1 block">Cost (pts)</label>
            <input
              type="number"
              min="1"
              value={goalCost}
              onChange={(e) => setGoalCost(e.target.value)}
              placeholder="1000"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGoalSave}
            className="flex-1 py-2.5 rounded-xl text-white font-black text-sm transition-all"
            style={{ backgroundColor: theme.accentColor }}
          >
            Set Goal 🎯
          </motion.button>
          <button
            onClick={() => {
              setGoalName('')
              setGoalCost('')
              updateProfile({ goal_reward_name: null, goal_reward_cost: null, goal_reward_id: null })
              showSuccess('Goal cleared')
            }}
            className="px-4 py-2.5 rounded-xl bg-white/10 text-white/60 font-bold text-sm transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── Bonus Multiplier ─────────────────────────────────── */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
        <h3 className="text-white font-black mb-1">Bonus Multiplier</h3>
        <p className="text-white/40 text-xs mb-3">Award double or triple points for today. Resets at midnight.</p>

        <AnimatePresence>
          {effectiveMultiplier > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-3 mb-3 text-center font-black text-base ${
                effectiveMultiplier === 3
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              }`}
            >
              {effectiveMultiplier === 3 ? '⚡ TRIPLE POINTS ACTIVE TODAY!' : '🌟 DOUBLE POINTS ACTIVE TODAY!'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 1, label: '1x', sublabel: 'Normal' },
            { value: 2, label: '2x', sublabel: 'Double' },
            { value: 3, label: '3x', sublabel: 'Triple' },
          ].map((btn) => {
            const isActive = effectiveMultiplier === btn.value
            return (
              <button
                key={btn.value}
                onClick={() => setMultiplier(btn.value)}
                className="py-3 rounded-xl font-bold text-sm transition-all"
                style={
                  isActive
                    ? { backgroundColor: theme.accentColor, color: 'white' }
                    : { backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
                }
              >
                <div className="text-xl font-black">{btn.label}</div>
                <div className="text-xs opacity-80">{btn.sublabel}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── App Settings ─────────────────────────────────────── */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
        <h3 className="text-white font-black mb-3">App Settings</h3>
        <div className="flex flex-col gap-3">
          <ToggleSwitch
            enabled={!!profile.sound_enabled}
            onChange={(val) => updateProfile({ sound_enabled: val })}
            label="Sound Effects"
            description="Play sounds when points are added or removed"
            accentColor={theme.accentColor}
          />
          <ToggleSwitch
            enabled={!!profile.daily_login_bonus}
            onChange={(val) => updateProfile({ daily_login_bonus: val })}
            label="Daily Login Bonus"
            description="+5 bonus points on first app open each day"
            accentColor={theme.accentColor}
          />
        </div>
      </div>

      {/* ── PIN Management ────────────────────────────────────── */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
        <h3 className="text-white font-black mb-3">PIN Management</h3>

        <AnimatePresence>
          {editingPin === 'parent' ? (
            <PinChangeForm
              type="parent"
              currentPin={profile.parent_pin}
              onSave={(pin) => handlePinSave('parent', pin)}
              onCancel={() => setEditingPin(null)}
              accentColor={theme.accentColor}
            />
          ) : (
            <div className="flex items-center justify-between mb-3 p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-bold text-sm">Parent Panel PIN</p>
                <p className="text-white/40 text-xs">4-digit · {'•'.repeat(profile.parent_pin?.length || 4)}</p>
              </div>
              <button
                onClick={() => setEditingPin('parent')}
                className="px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all"
                style={{ backgroundColor: `${theme.accentColor}60` }}
              >
                Change
              </button>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editingPin === 'admin' ? (
            <PinChangeForm
              type="admin"
              currentPin={profile.admin_pin}
              onSave={(pin) => handlePinSave('admin', pin)}
              onCancel={() => setEditingPin(null)}
              accentColor={theme.accentColor}
            />
          ) : (
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-bold text-sm">Admin Dashboard PIN</p>
                <p className="text-white/40 text-xs">6-digit · {'•'.repeat(profile.admin_pin?.length || 6)}</p>
              </div>
              <button
                onClick={() => setEditingPin('admin')}
                className="px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all"
                style={{ backgroundColor: `${theme.accentColor}60` }}
              >
                Change
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
        <h3 className="text-white font-black mb-3">Stats</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ['Current Balance', `${profile.current_balance} pts`],
            ['Lifetime Points', `${profile.lifetime_points.toLocaleString()} pts`],
            ['Current Streak', `${profile.current_streak} days 🔥`],
            ['Longest Streak', `${profile.longest_streak} days`],
          ].map(([label, value]) => (
            <div key={label} className="bg-white/5 rounded-xl p-2.5">
              <p className="text-white/40 text-xs">{label}</p>
              <p className="text-white font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Danger Zone ───────────────────────────────────────── */}
      <div className="bg-red-900/30 rounded-2xl p-4 border border-red-500/30 mb-8">
        <h3 className="text-red-400 font-black mb-2">Danger Zone</h3>
        <p className="text-white/50 text-xs mb-4">
          Permanently delete all points, transactions, badges, and reset the profile. Cannot be undone.
        </p>
        {showResetConfirm ? (
          <div>
            <p className="text-red-300 font-bold text-sm mb-3">Type "RESET" to confirm:</p>
            <input
              type="text"
              placeholder="Type RESET"
              className="w-full bg-black/30 border border-red-500/40 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none text-sm mb-3"
              onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value === 'RESET') handleReset() }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Type RESET"]')
                  if (input?.value === 'RESET') handleReset()
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-black text-sm"
              >
                Reset All Data
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 rounded-xl bg-red-600/50 hover:bg-red-600 text-red-200 font-bold text-sm transition-all border border-red-500/40"
          >
            Reset All Data
          </button>
        )}
      </div>

    </div>
  )
}
