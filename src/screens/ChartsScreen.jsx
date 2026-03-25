import React from 'react'
import Analytics from './admin/Analytics'
import BottomNav from '../components/BottomNav'
import { useTheme } from '../hooks/useTheme'

export default function ChartsScreen() {
  const theme = useTheme()

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} relative`}>
      <div className="max-w-2xl mx-auto pt-4 pb-24">
        <Analytics />
      </div>
      <BottomNav />
    </div>
  )
}
