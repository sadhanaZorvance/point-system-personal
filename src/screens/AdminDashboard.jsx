import React, { useState } from 'react'
import { useNavigate, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import TasksManager from './admin/TasksManager'
import RewardsManager from './admin/RewardsManager'
import PointHistory from './admin/PointHistory'
import Analytics from './admin/Analytics'
import ProfileSettings from './admin/ProfileSettings'
import WeeklySummary from './admin/WeeklySummary'

const TABS = [
  { id: 'tasks', label: 'Tasks', emoji: '⚡', path: '' },
  { id: 'rewards', label: 'Rewards', emoji: '🎁', path: 'rewards' },
  { id: 'history', label: 'History', emoji: '📋', path: 'history' },
  { id: 'analytics', label: 'Charts', emoji: '📊', path: 'analytics' },
  { id: 'weekly', label: 'Weekly', emoji: '📅', path: 'weekly' },
  { id: 'settings', label: 'Settings', emoji: '⚙️', path: 'settings' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()

  const getCurrentTab = () => {
    const path = window.location.pathname.replace('/admin', '').replace('/', '')
    const found = TABS.find((t) => t.path === path)
    return found?.id || 'tasks'
  }

  const [activeTab, setActiveTab] = useState(getCurrentTab)

  const handleTabChange = (tab) => {
    setActiveTab(tab.id)
    navigate(tab.path ? `/admin/${tab.path}` : '/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 flex flex-col">
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-semibold"
        >
          <span>←</span>
          <span className="text-sm">Home</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          <span className="text-white font-black">Admin Dashboard</span>
        </div>
        <div className="w-16" />
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────── */}
      <div className="bg-black/20 border-b border-white/10 px-2 py-2 flex gap-1 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex-shrink-0
              ${activeTab === tab.id ? 'bg-violet-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route index element={<TasksManager />} />
          <Route path="rewards" element={<RewardsManager />} />
          <Route path="history" element={<PointHistory />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="weekly" element={<WeeklySummary />} />
          <Route path="settings" element={<ProfileSettings />} />
        </Routes>
      </div>
    </div>
  )
}
