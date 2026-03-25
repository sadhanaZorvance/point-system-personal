import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasks } from '../../hooks/useTasks'

const CATEGORIES = ['daily', 'weekly', 'big']
const CATEGORY_LABELS = { daily: '📅 Daily', weekly: '📆 Weekly', big: '🎮 Big' }

const EMPTY_REWARD = { name: '', point_cost: 50, category: 'daily', emoji: '🎁', weekend_only: false, is_active: true }

export default function RewardsManager() {
  const { rewards, addReward, updateReward, deleteReward } = useTasks()
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_REWARD)
  const [isAdding, setIsAdding] = useState(false)
  const [filter, setFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filteredRewards = filter === 'all' ? rewards : rewards.filter(r => r.category === filter)

  const startEdit = (reward) => {
    setEditingId(reward.id)
    setForm({ ...reward })
    setIsAdding(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsAdding(false)
    setForm(EMPTY_REWARD)
  }

  const saveEdit = () => {
    if (!form.name.trim()) return
    if (editingId) updateReward(editingId, form)
    else addReward(form)
    cancelEdit()
  }

  const RewardForm = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-900/40 rounded-2xl p-4 mb-4 border border-amber-500/40"
    >
      <h3 className="text-white font-black mb-4">{isAdding ? '➕ New Reward' : '✏️ Edit Reward'}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-white/60 text-xs font-bold uppercase mb-1 block">Reward Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Extra screen time"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-400 text-sm"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs font-bold uppercase mb-1 block">Emoji</label>
          <input
            type="text"
            value={form.emoji}
            onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
            placeholder="🎁"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-center text-2xl focus:outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs font-bold uppercase mb-1 block">Point Cost</label>
          <input
            type="number"
            min="1"
            value={form.point_cost}
            onChange={e => setForm(p => ({ ...p, point_cost: Math.max(1, parseInt(e.target.value) || 1) }))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="text-white/60 text-xs font-bold uppercase mb-1 block">Category</label>
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setForm(p => ({ ...p, category: cat }))}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all
                  ${form.category === cat ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-white/60 text-xs font-bold uppercase">Weekend Only</label>
          <button
            onClick={() => setForm(p => ({ ...p, weekend_only: !p.weekend_only }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.weekend_only ? 'bg-amber-500' : 'bg-gray-600'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow
              ${form.weekend_only ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-white/60 text-xs font-bold uppercase">Active</label>
          <button
            onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-600'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow
              ${form.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={cancelEdit} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm">Cancel</button>
        <button
          onClick={saveEdit}
          disabled={!form.name.trim()}
          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black text-sm disabled:opacity-40 transition-all"
        >
          {isAdding ? 'Add Reward' : 'Save Changes'}
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-black text-lg">🎁 Rewards</h2>
          <p className="text-white/40 text-xs">{rewards.length} rewards total</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); setForm(EMPTY_REWARD) }}
          className="bg-amber-500 hover:bg-amber-400 text-white font-black px-4 py-2 rounded-xl text-sm transition-all"
        >
          + Add Reward
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['all', ...CATEGORIES].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0
              ${filter === f ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/50 hover:text-white'}`}
          >
            {f === 'all' ? '🎯 All' : CATEGORY_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {(isAdding || editingId) && <RewardForm />}
      </AnimatePresence>

      {/* Reward List */}
      <div className="flex flex-col gap-2">
        {filteredRewards.map(reward => (
          <motion.div
            key={reward.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-white/10 rounded-2xl p-3 border ${
              editingId === reward.id ? 'border-amber-500' : 'border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">{reward.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${reward.is_active ? 'text-white' : 'text-white/40'}`}>
                  {reward.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-amber-400 font-black text-xs">{reward.point_cost} pts</span>
                  <span className="text-white/30 text-xs">{CATEGORY_LABELS[reward.category]}</span>
                  {reward.weekend_only && <span className="text-white/40 text-xs">🏖️ Weekend</span>}
                  {!reward.is_active && <span className="text-white/30 text-xs">• inactive</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => editingId === reward.id ? cancelEdit() : startEdit(reward)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 text-sm transition-all"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setConfirmDelete(reward.id)}
                  className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 text-sm transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎁</p>
            <p className="text-white/40">No rewards found</p>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-white/20"
            >
              <p className="text-white font-black text-lg mb-2">Delete Reward?</p>
              <p className="text-white/60 text-sm mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold">Cancel</button>
                <button onClick={() => { deleteReward(confirmDelete); setConfirmDelete(null) }} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
