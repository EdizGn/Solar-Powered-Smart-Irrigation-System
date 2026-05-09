/**
 * Format a date string to a human-readable format.
 * @param {string|Date} date
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }
  return new Date(date).toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format a short time string (HH:MM).
 * @param {string|Date} date
 * @returns {string}
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get a human-readable relative time string (e.g., "5 min ago").
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * Clamp a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Get battery color based on level percentage.
 * @param {number} level - Battery level (0-100)
 * @returns {string} Tailwind color class
 */
export function getBatteryColor(level) {
  if (level > 50) return 'text-green-500'
  if (level > 20) return 'text-amber-500'
  return 'text-red-500'
}

/**
 * Get battery background color based on level percentage.
 * @param {number} level - Battery level (0-100)
 * @returns {string} Tailwind bg color class
 */
export function getBatteryBgColor(level) {
  if (level > 50) return 'bg-green-500'
  if (level > 20) return 'bg-amber-500'
  return 'bg-red-500'
}

/**
 * Get notification severity color classes.
 * @param {'info'|'success'|'warning'|'danger'} type
 * @returns {{ bg: string, text: string, border: string, icon: string }}
 */
export function getNotificationColors(type) {
  const colors = {
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: 'text-blue-500',
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
      icon: 'text-green-500',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: 'text-amber-500',
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      icon: 'text-red-500',
    },
  }
  return colors[type] || colors.info
}
