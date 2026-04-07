/**
 * Mock notification data for initial load.
 * // TODO: Replace with API call to GET /api/notifications
 */

/**
 * Generate initial mock notifications.
 * @param {number} count - Number of notifications
 * @returns {Array<{ id: number, type: string, title: string, message: string, timestamp: string, read: boolean }>}
 */
export function generateInitialNotifications(count = 15) {
  const templates = [
    { type: 'info', title: 'Irrigation started', message: 'Auto irrigation triggered - soil moisture at 28%' },
    { type: 'success', title: 'Irrigation completed', message: 'Irrigation completed - 8 min, moisture now 65%' },
    { type: 'success', title: 'Irrigation completed', message: 'Irrigation completed - 12 min, moisture now 72%' },
    { type: 'warning', title: 'Rain detected', message: 'Irrigation postponed due to rainfall' },
    { type: 'warning', title: 'High rain probability', message: 'Rain probability at 75% - irrigation on hold' },
    { type: 'danger', title: 'Low battery alert', message: 'Battery at 15% - consider solar panel check' },
    { type: 'danger', title: 'Sensor failure detected', message: 'Moisture sensor not responding - check wiring' },
    { type: 'warning', title: 'Wi-Fi disconnected', message: 'Offline mode active - data will sync when reconnected' },
    { type: 'info', title: 'System wake-up', message: 'ESP32 woke from deep sleep - sensors initializing' },
    { type: 'success', title: 'System operational', message: 'All sensors reporting normally' },
    { type: 'info', title: 'Settings updated', message: 'Moisture threshold changed to 35%' },
    { type: 'warning', title: 'Battery draining fast', message: 'Battery dropped 10% in last hour - pump usage high' },
    { type: 'success', title: 'Solar charging', message: 'Solar panel charging - battery recovering' },
    { type: 'danger', title: 'Safe mode activated', message: 'Battery below 3.3V - system entered safe mode' },
    { type: 'info', title: 'Manual override', message: 'Pump turned on manually by user' },
  ]

  const notifications = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length]
    const minutesAgo = i * 45 + Math.random() * 30

    notifications.push({
      id: now - i,
      ...template,
      timestamp: new Date(now - minutesAgo * 60 * 1000).toISOString(),
      read: i > 4, // First 5 are unread
    })
  }

  return notifications
}
