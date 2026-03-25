/**
 * Time-of-day windows based on Eastern Time.
 * Each window has a label, emoji, and the task categories relevant to it.
 */

export const TIME_WINDOWS = [
  {
    id: 'morning_routine',
    label: 'Morning Routine',
    emoji: '🌅',
    startHour: 6,
    endHour: 9,
    categories: ['morning', 'any'],
    theme: 'morning',
  },
  {
    id: 'school_morning',
    label: 'School Morning',
    emoji: '📖',
    startHour: 9,
    endHour: 12,
    categories: ['morning', 'any'],
    theme: 'morning',
  },
  {
    id: 'lunchtime',
    label: 'Lunchtime',
    emoji: '🍽️',
    startHour: 12,
    endHour: 13.5,
    categories: ['afternoon', 'any'],
    theme: 'afternoon',
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    emoji: '☀️',
    startHour: 13.5,
    endHour: 15.5,
    categories: ['afternoon', 'any'],
    theme: 'afternoon',
  },
  {
    id: 'after_school',
    label: 'After School',
    emoji: '🎒',
    startHour: 15.5,
    endHour: 18,
    categories: ['afternoon', 'any'],
    theme: 'afternoon',
  },
  {
    id: 'evening',
    label: 'Evening',
    emoji: '🍴',
    startHour: 18,
    endHour: 20,
    categories: ['evening', 'any'],
    theme: 'evening',
  },
  {
    id: 'wind_down',
    label: 'Wind Down',
    emoji: '🌙',
    startHour: 20,
    endHour: 21,
    categories: ['evening', 'any'],
    theme: 'night',
  },
  {
    id: 'late_night',
    label: 'Late Night',
    emoji: '🌙',
    startHour: 21,
    endHour: 6,
    categories: ['any'],
    theme: 'night',
  },
]

/**
 * Get the current Eastern Time hour (fractional) from a Date object.
 * Works across timezones by using Intl.DateTimeFormat.
 */
function getEasternHour(date = new Date()) {
  const easternStr = date.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false })
  const [hourStr, minuteStr] = easternStr.split(':')
  const hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)
  return hour + minute / 60
}

function isWeekend(date = new Date()) {
  const dayStr = date.toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short' })
  return dayStr === 'Sat' || dayStr === 'Sun'
}

/**
 * Get the current time window.
 */
export function getCurrentTimeWindow(date = new Date()) {
  if (isWeekend(date)) {
    return {
      id: 'weekend',
      label: 'Weekend Mode',
      emoji: '🏖️',
      categories: ['morning', 'afternoon', 'evening', 'weekend', 'any'],
      theme: 'afternoon',
    }
  }

  const hour = getEasternHour(date)

  for (const window of TIME_WINDOWS) {
    if (window.startHour < window.endHour) {
      if (hour >= window.startHour && hour < window.endHour) return window
    } else {
      // Wraps midnight (e.g., 21–6)
      if (hour >= window.startHour || hour < window.endHour) return window
    }
  }

  return TIME_WINDOWS[TIME_WINDOWS.length - 1]
}

/**
 * Get theme name based on current time of day.
 */
export function getThemeName(date = new Date()) {
  if (isWeekend(date)) return 'afternoon'
  const window = getCurrentTimeWindow(date)
  return window.theme
}

/**
 * Get a friendly greeting based on time of day.
 */
export function getGreeting(name = 'Champion', date = new Date()) {
  const hour = getEasternHour(date)
  if (hour >= 5 && hour < 12) return `Good morning, ${name}! 🌅`
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name}! ☀️`
  if (hour >= 17 && hour < 21) return `Good evening, ${name}! 🌆`
  return `Good night, ${name}! 🌙`
}

/**
 * Format a timestamp to a friendly string.
 */
export function formatTimestamp(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Get today's date string in YYYY-MM-DD format (Eastern Time).
 */
export function getTodayString(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}
