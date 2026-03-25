import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasks } from '../../hooks/useTasks'

const CATEGORIES = ['morning', 'afternoon', 'evening', 'weekend', 'any']
const CATEGORY_LABELS = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
  weekend: '🏖️ Weekend',
  any: '🔄 Any Time',
}

const EMPTY_TASK = { name: '', points: 10, category: 'any', emoji: '⭐', is_active: true }

export default function TasksManager() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_TASK)
  const [isAdding, setIsAdding] = useState(false)
  const [filter, setFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filteredTasks = filter === 'all'
    ? tasks
    : filter === 'positive'
    ? tasks.filter(t => t.points > 0)
    : filter === 'negative'
    ? tasks.filter(t => t.points < 0)
    : tasks.filter(t => t.category === filter)

  const startEdit = (task) => {
    setEditingId(task.id)
    setForm({ ...task })
    setIsAdding(false)
  }

  const startAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setForm(EMPTY_TASK)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsAdding(false)
    setForm(EMPTY_TASK)
  }

  const saveEdit = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updateTask(editingId, form)
    } else {
      addTask(form)
    }
    cancelEdit()
  }

  const handleDelete = (id) => {
    deleteTask(id)
    setConfirmDelete(null)
  }

  const TaskForm = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-violet-800/50 rounded-2xl p-4 mb-4 border border-violet-500/40"
    >
      <h3 className="text-white font-black mb-4">{isAdding ? '➕ New Task' : '✏️ Edit Task'}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-white/60 text-xs font-bold uppercase mb-1 block">Task Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Made bed"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-400 text-sm"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs font-bold uppercase mb-1 block">Emoji</label>
          <input
            type="text"
            value={form.emoji}
            onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
            placeholder="⭐"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-center text-2xl focus:outline-none focus:border-violet-400"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs font-bold uppercase mb-1 block">Points</label>
          <input
            type="number"
            value={form.points}
            onChange={e => setForm(p => ({ ...p, points: parseInt(e.target.value) || 0 }))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-violet-400 text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Negative = deduction</p>
        </div>
        <div className="col-span-2">
          <label className="text-white/60 text-xs font-bold uppercase mb-1 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setForm(p => ({ ...p, category: cat }))}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all
                  ${form.category === cat ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2 flex items-center gap-2">
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
        <button onClick={cancelEdit} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm">
          Cancel
        </button>
        <button
          onClick={saveEdit}
          disabled={!form.name.trim()}
          className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm disabled:opacity-40 transition-all"
        >
          {isAdding ? 'Add Task' : 'Save Changes'}
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-black text-lg">⚡ Tasks</h2>
          <p className="text-white/40 text-xs">{tasks.length} tasks total</p>
        </div>
        <button
          onClick={startAdd}
          className="bg-violet-600 hover:bg-violet-500 text-white font-black px-4 py-2 rounded-xl text-sm transition-all"
        >
          + Add Task
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
        {['all', 'positive', 'negative', ...CATEGORIES].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0
              ${filter === f ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/50 hover:text-white'}`}
          >
            {f === 'all' ? 'All' : f === 'positive' ? '✅ Positive' : f === 'negative' ? '❌ Negative' : CATEGORY_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {(isAdding || editingId) && <TaskForm />}
      </AnimatePresence>

      {/* Task List */}
      <div className="flex flex-col gap-2">
        {filteredTasks.map(task => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-white/10 rounded-2xl p-3 border ${
              editingId === task.id ? 'border-violet-500' : 'border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">{task.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${task.is_active ? 'text-white' : 'text-white/40'}`}>
                  {task.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-black ${task.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {task.points > 0 ? '+' : ''}{task.points} pts
                  </span>
                  <span className="text-white/30 text-xs">{CATEGORY_LABELS[task.category]}</span>
                  {!task.is_active && <span className="text-white/30 text-xs">• inactive</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => editingId === task.id ? cancelEdit() : startEdit(task)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 text-sm transition-all"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setConfirmDelete(task.id)}
                  className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 text-sm transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">⚡</p>
            <p className="text-white/40">No tasks found</p>
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
              exit={{ scale: 0.9 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-white/20"
            >
              <p className="text-white font-black text-lg mb-2">Delete Task?</p>
              <p className="text-white/60 text-sm mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
