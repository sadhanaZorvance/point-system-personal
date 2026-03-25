import React, { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PinModal from './PinModal'
import { useProfile } from '../hooks/useProfile'
import { useTheme } from '../hooks/useTheme'

const TABS = [
  { id: 'home', label: 'Home', emoji: '🏠', path: '/', pin: null },
  { id: 'parent', label: 'Parent', emoji: '👨‍👩‍👧', path: '/parent', pin: 'parent' },
  { id: 'admin', label: 'Admin', emoji: '⚙️', path: '/admin', pin: 'admin' },
  { id: 'activities', label: 'Activities', emoji: '📅', path: '/activities', pin: null },
  { id: 'charts', label: 'Charts', emoji: '📊', path: '/charts', pin: null },
  { id: 'settings', label: 'Settings', emoji: '🎨', path: '/settings', pin: null },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyPin } = useProfile()
  const theme = useTheme()

  const [pinModal, setPinModal] = useState(null) // { tab } | null
  const [pendingPath, setPendingPath] = useState(null)

  const currentPath = location.pathname

  const getActiveTab = () => {
    // Exact match first, then prefix
    const exact = TABS.find((t) => t.path === currentPath)
    if (exact) return exact.id
    const prefix = TABS.find((t) => t.path !== '/' && currentPath.startsWith(t.path))
    if (prefix) return prefix.id
    return 'home'
  }

  const activeTabId = getActiveTab()

  const handleTabPress = useCallback((tab) => {
    if (tab.pin) {
      // Need PIN before navigating
      setPendingPath(tab.path)
      setPinModal(tab)
    } else {
      navigate(tab.path)
    }
  }, [navigate])

  const handlePinSuccess = useCallback(() => {
    setPinModal(null)
    if (pendingPath) {
      navigate(pendingPath)
      setPendingPath(null)
    }
  }, [navigate, pendingPath])

  const handlePinClose = useCallback(() => {
    setPinModal(null)
    setPendingPath(null)
  }, [])

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav
        className="bottom-nav"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-stretch max-w-2xl mx-auto">
          {TABS.map((tab) => {
            const isActive = activeTabId === tab.id
            return (
              <motion.button
                key={tab.id}
                className="flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[56px] select-none relative"
                onClick={() => handleTabPress(tab)}
                whileTap={{ scale: 0.88 }}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-dot"
                    className="absolute top-1 w-1 h-1 rounded-full"
                    style={{ backgroundColor: theme.accentColor }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <span
                  className={`text-xl leading-none mb-0.5 transition-all duration-150 ${
                    isActive ? 'scale-125' : 'scale-100 opacity-50'
                  }`}
                  style={isActive ? { filter: `drop-shadow(0 0 6px ${theme.accentColor}80)` } : {}}
                >
                  {tab.emoji}
                </span>
                <span
                  className={`text-[10px] font-bold leading-none transition-all duration-150 ${
                    isActive ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </nav>

      {/* PIN Modal */}
      <AnimatePresence>
        {pinModal && (
          <PinModal
            isOpen={true}
            onClose={handlePinClose}
            onSuccess={handlePinSuccess}
            type={pinModal.pin}
            verifyPin={verifyPin}
          />
        )}
      </AnimatePresence>
    </>
  )
}
