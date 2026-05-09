/**
 * Mock irrigation history data.
 * // TODO: Replace with API call to GET /api/irrigation/history
 */

const TRIGGER_TYPES = ['Automatic AI', 'Manual', 'Skipped (Rain)']

/**
 * Generate mock past irrigation events.
 * @param {number} count - Number of events to generate
 * @returns {Array<{ id: number, date: string, duration: number, trigger: string, moistureBefore: number, moistureAfter: number }>}
 */
export function generateIrrigationHistory(count = 50) {
  const events = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    // Events spread over last 30 days, roughly 1-2 per day
    const hoursAgo = i * 14 + Math.random() * 10
    const timestamp = new Date(now - hoursAgo * 60 * 60 * 1000)

    const triggerIndex = Math.random()
    let trigger, duration, moistureBefore, moistureAfter

    if (triggerIndex < 0.55) {
      // Automatic AI - most common
      trigger = 'Automatic AI'
      moistureBefore = 25 + Math.random() * 15 // 25-40%
      duration = 5 + Math.random() * 15 // 5-20 min
      moistureAfter = moistureBefore + 15 + Math.random() * 20 // +15-35%
    } else if (triggerIndex < 0.75) {
      // Manual
      trigger = 'Manual'
      moistureBefore = 30 + Math.random() * 25 // 30-55%
      duration = 3 + Math.random() * 20 // 3-23 min
      moistureAfter = moistureBefore + 10 + Math.random() * 20 // +10-30%
    } else {
      // Skipped due to rain
      trigger = 'Skipped (Rain)'
      moistureBefore = 35 + Math.random() * 30 // 35-65%
      duration = 0
      moistureAfter = moistureBefore + 5 + Math.random() * 10 // rain adds some moisture
    }

    events.push({
      id: count - i,
      date: timestamp.toISOString(),
      duration: Math.round(duration * 10) / 10,
      trigger,
      moistureBefore: Math.round(moistureBefore),
      moistureAfter: Math.min(85, Math.round(moistureAfter)),
    })
  }

  return events
}
