import { useEffect, useRef } from 'react'
import { useSystem } from '../context/SystemContext'
import { clamp } from '../utils/helpers'

/**
 * useSimulatedData - Custom hook that simulates real-time sensor data updates.
 * Updates soil moisture, temperature, humidity, rain probability, and battery level
 * at regular intervals using setInterval.
 * Also updates AI decision based on current sensor readings and settings.
 *
 * // TODO: Remove this hook entirely when real WebSocket/API data is connected.
 * // The SystemContext setSensors/setAiDecision should be called from the API layer instead.
 */
export function useSimulatedData() {
  const {
    sensors,
    setSensors,
    pumpStatus,
    settings,
    setAiDecision,
    addNotification,
  } = useSystem()

  const lastNotificationRef = useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prev) => {
        // Soil moisture: fluctuate between 25-85%, drift down slightly if pump is off
        const moistureDrift = pumpStatus ? 1.5 : -0.5
        const moistureNoise = (Math.random() - 0.5) * 4
        const newMoisture = clamp(
          prev.soilMoisture + moistureDrift + moistureNoise,
          25,
          85
        )

        // Temperature: fluctuate between 18-35°C
        const tempNoise = (Math.random() - 0.5) * 1.5
        const newTemp = clamp(prev.temperature + tempNoise, 18, 35)

        // Humidity: fluctuate between 30-80%
        const humidityNoise = (Math.random() - 0.5) * 3
        const newHumidity = clamp(prev.humidity + humidityNoise, 30, 80)

        // Rain probability: random walk 0-100%
        const rainNoise = (Math.random() - 0.5) * 8
        const newRainProb = clamp(prev.rainProbability + rainNoise, 0, 100)

        // Battery: slowly decrease (simulate drain), min 10%
        const batteryDrain = pumpStatus ? 0.15 : 0.05
        const newBattery = clamp(prev.batteryLevel - batteryDrain, 10, 100)
        const newVoltage = 3.0 + (newBattery / 100) * 1.2 // 3.0V - 4.2V range

        // Rain detection based on probability
        const newIsRaining = newRainProb > 70

        return {
          soilMoisture: Math.round(newMoisture * 10) / 10,
          temperature: Math.round(newTemp * 10) / 10,
          humidity: Math.round(newHumidity),
          rainProbability: Math.round(newRainProb),
          isRaining: newIsRaining,
          batteryLevel: Math.round(newBattery * 10) / 10,
          batteryVoltage: Math.round(newVoltage * 100) / 100,
          wifiConnected: prev.wifiConnected,
        }
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [pumpStatus, setSensors])

  // Update AI decision based on current sensor state
  useEffect(() => {
    const { soilMoisture, rainProbability, batteryLevel, isRaining } = sensors
    const { moistureThresholdLow, rainProbabilityThreshold } = settings

    let action, message, irrigationMinutes

    if (batteryLevel < 20) {
      action = 'standby'
      message = 'Low battery - Standby mode'
      irrigationMinutes = 0
    } else if (isRaining || rainProbability > rainProbabilityThreshold) {
      action = 'skip'
      message = 'Skip - Rain expected'
      irrigationMinutes = 0
    } else if (soilMoisture < moistureThresholdLow) {
      irrigationMinutes = Math.round((moistureThresholdLow - soilMoisture) * 0.5 + 3)
      action = 'irrigate'
      message = `Irrigate ${irrigationMinutes} min`
    } else {
      action = 'monitoring'
      message = 'Monitoring soil conditions'
      irrigationMinutes = 0
    }

    setAiDecision({ action, message, irrigationMinutes })
  }, [sensors, settings, setAiDecision])

  // Periodic notifications (every 30 seconds add a simulated notification)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastNotificationRef.current < 30000) return
      lastNotificationRef.current = now

      const { soilMoisture, batteryLevel, isRaining } = sensors

      // Pick a contextual notification
      if (batteryLevel < 20) {
        addNotification({
          type: 'danger',
          title: 'Low battery alert',
          message: `Battery at ${Math.round(batteryLevel)}% - consider charging`,
        })
      } else if (isRaining) {
        addNotification({
          type: 'warning',
          title: 'Rain detected',
          message: 'Irrigation postponed due to rainfall',
        })
      } else if (soilMoisture < 35) {
        addNotification({
          type: 'info',
          title: 'Irrigation started',
          message: `Soil moisture low (${Math.round(soilMoisture)}%) - auto irrigation triggered`,
        })
      } else {
        addNotification({
          type: 'success',
          title: 'System operational',
          message: 'All sensors reporting normally',
        })
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [sensors, addNotification])
}
