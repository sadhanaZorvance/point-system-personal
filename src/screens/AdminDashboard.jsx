import React, { useState } from 'react'
import { useNavigate, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import TasksManager from './admin/TasksManager'
import RewardsManager from './admin/RewardsManager'
import AdminSettings from './admin/ProfileSettings'
import BottomNav from '../components/BottomNav'
import { useTheme } from '../hooks/useTheme'

const TABS = [
  { id: 'tasks', label: 'Tasks', emoji: '⚡', path: '' },
  { id: 'rewards', label: 'Rewards', emoji: '🎁', path: 'rewards' },
  { id: 'settings', label: 'Settings', emoji: '⚙️', path: 'settings' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const theme = useTheme()

  const getCurrentTab = () => {
    const path = window.location.pathname.replace('/admin', '').replace(/^\//, '')
    const found = TABS.find((t) => t.path === path)
    return found?.id || 'tasks'
  }

  const [activeTab, setActiveTab] = useState(getCurrentTab)

  const handleTabChange = (tab) => {
    setActiveTab(tab.id)
    navigate(tab.path ? `/admin/${tab.path}` : '/admin')
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} flex flex-col`}
    >
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          <span className="text-white font-black">Admin Dashboard</span>
        </div>
        <div className="w-8" />
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────────── */}
      <div className="bg-black/20 border-b border-white/10 px-3 py-2 flex gap-2">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => handleTabChange(tab)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex-1 justify-center"
            style={
              activeTab === tab.id
                ? { backgroundColor: theme.accentColor, color: 'white' }
                : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
            }
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden pb-20">
        <Routes>
          <Route index element={<TasksManager />} />
          <Route path="rewards" element={<RewardsManager />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </div>

      <BottomNav />
    </div>
  )
}
