/**
 * Mock sensor data for development.
 * // TODO: Replace with real API data from ESP32 endpoints
 */

/**
 * Generate mock moisture history data for the last 24 hours.
 * @returns {Array<{ time: string, moisture: number }>}
 */
export function generateMoistureHistory() {
  const data = []
  const now = Date.now()
  for (let i = 24 * 12; i >= 0; i--) {
    // Every 5 minutes for 24 hours = 288 data points
    const time = new Date(now - i * 5 * 60 * 1000)
    const hour = time.getHours()

    // Simulate natural moisture pattern: drops during day, stable at night
    let baseMoisture = 60
    if (hour >= 6 && hour < 12) {
      baseMoisture = 65 - (hour - 6) * 3 // Morning: gradual decrease
    } else if (hour >= 12 && hour < 18) {
      baseMoisture = 45 + (hour - 12) * 2 // Afternoon: slow recovery (irrigation)
    } else if (hour >= 18 && hour < 22) {
      baseMoisture = 55 + (hour - 18) * 2 // Evening: stable/slight increase
    } else {
      baseMoisture = 62 // Night: stable
    }

    const noise = (Math.random() - 0.5) * 10
    const moisture = Math.max(25, Math.min(85, baseMoisture + noise))

    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      moisture: Math.round(moisture),
    })
  }
  return data
}

/** Initial sensor values */
export const initialSensorData = {
  soilMoisture: 62,
  temperature: 24,
  humidity: 55,
  rainProbability: 20,
  isRaining: false,
  batteryLevel: 85,
  batteryVoltage: 3.9,
  wifiConnected: true,
}
