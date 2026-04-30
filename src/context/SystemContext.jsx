import { createContext, useContext, useState, useCallback } from 'react'
import { useWebSocket, WS_STATUS } from '../hooks/useWebSocket'
import { useAuth } from './AuthContext'
import { getAccessToken } from './AuthContext'
import { authFetch } from '../utils/authFetch'

/**
 * SystemContext - Manages global system state for the irrigation dashboard.
 *
 * Real-time data pipeline (TDR §8.4, §9.4):
 *  - Subscribes to wss://<backend>/ws/live with the JWT token in the
 *    Sec-WebSocket-Protocol header (browser limitation workaround).
 *  - Handles two server-push event types:
 *      sensor.update  → updates `sensors` snapshot and pump/mode state
 *      decision.new   → updates `aiDecision` and appends to irrigationHistory
 *  - Falls back to `useSimulatedData` when backend is unavailable (dev mode).
 *  - All REST mutations (manual pump, settings) go through `authFetch`.
 *
 * TODO (backend integration): set VITE_WS_URL in .env to wss://your-api/ws/live
 */

// ---------------------------------------------------------------------------
// WebSocket URL from env — empty string disables WS (uses mock data in dev)
// ---------------------------------------------------------------------------
const WS_URL = import.meta.env.VITE_WS_URL ?? ''

// ---------------------------------------------------------------------------
// Default state constants
// ---------------------------------------------------------------------------
const DEFAULT_SENSORS = {
  soilMoisture:    62,
  temperature:     24,
  humidity:        55,
  rainProbability: 20,
  isRaining:       false,
  batteryLevel:    85,
  batteryVoltage:  3.9,
  wifiConnected:   true,
}

const DEFAULT_SETTINGS = {
  plantType:          'tomato',
  pushNotifications:  true,
  deepSleepInterval:  15,
  maxPumpRuntime:     20,
}

const DEFAULT_COMPONENT_STATUS = {
  esp32:          'online',
  moistureSensor: 'active',
  rainSensor:     'active',
  pump:           'active',
  solarPanel:     'charging',
  battery:        'healthy',
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const SystemContext = createContext(null)

/**
 * SystemProvider - Wraps the app and provides global system state.
 * @param {{ children: React.ReactNode }} props
 */
export function SystemProvider({ children }) {
  const { isAuthenticated } = useAuth()

  // ── Sensor snapshot ───────────────────────────────────────────────────────
  const [sensors, setSensors]             = useState(DEFAULT_SENSORS)

  // ── Pump control ──────────────────────────────────────────────────────────
  const [pumpStatus, setPumpStatus]       = useState(false)         // true = ON
  const [controlMode, setControlMode]     = useState('automatic')   // 'automatic' | 'manual'
  const [manualStartTime, setManualStartTime] = useState(null)

  // ── AI decision (last decision from backend) ───────────────────────────
  const [aiDecision, setAiDecision]       = useState({
    action:            'monitoring',
    message:           'Monitoring soil conditions',
    irrigationMinutes: 0,
  })

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)

  // ── Settings ──────────────────────────────────────────────────────────────
  const [settings, setSettings]           = useState(DEFAULT_SETTINGS)

  // ── System health ─────────────────────────────────────────────────────────
  const [systemHealth, setSystemHealth]   = useState('operational')
  const [componentStatus, setComponentStatus] = useState(DEFAULT_COMPONENT_STATUS)
  const [faultLog, setFaultLog]           = useState([])

  // ── Irrigation history ────────────────────────────────────────────────────
  const [irrigationHistory, setIrrigationHistory] = useState([])

  // ── WebSocket connection status ────────────────────────────────────────────
  const [wsStatus, setWsStatus]           = useState(WS_STATUS.DISCONNECTED)
  // isLiveMode becomes true permanently once the WS connects for the first time
  const [isLiveMode, setIsLiveMode]       = useState(false)

  // ── Notification helper ───────────────────────────────────────────────────
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id:        Date.now(),
      ...notification,
      timestamp: new Date().toISOString(),
      read:      false,
    }
    setNotifications((prev) => [newNotification, ...prev])
    setUnreadCount((prev) => prev + 1)
  }, [])

  // ── WebSocket message handler ─────────────────────────────────────────────
  /**
   * Processes server-push events from /ws/live (TDR §9.4).
   *
   * Expected envelope:
   *   { type: 'sensor.update' | 'decision.new', payload: { ... }, ts: ISO }
   *
   * sensor.update payload matches the sensor_logs schema (TDR §7.2):
   *   { soilMoisture, temperature, humidity, rainProbability, isRaining,
   *     batteryLevel, batteryVoltage, wifiConnected }
   *
   * decision.new payload matches the irrigation_history schema (TDR §7.3):
   *   { action, duration_sec, next_check_min, reason, mode, decision_id }
   */
  const handleWsMessage = useCallback((event) => {
    let envelope
    try {
      envelope = JSON.parse(event.data)
    } catch {
      console.warn('[WS] Non-JSON message received:', event.data)
      return
    }

    const { type, payload } = envelope

    switch (type) {
      case 'sensor.update': {
        // Map backend snake_case → frontend camelCase where needed
        setSensors((prev) => ({
          ...prev,
          soilMoisture:    payload.soil_moisture    ?? payload.soilMoisture    ?? prev.soilMoisture,
          temperature:     payload.temperature      ?? prev.temperature,
          humidity:        payload.humidity         ?? prev.humidity,
          rainProbability: payload.rain_probability ?? payload.rainProbability ?? prev.rainProbability,
          isRaining:       payload.is_raining       ?? payload.isRaining       ?? prev.isRaining,
          batteryLevel:    payload.battery_level    ?? payload.batteryLevel    ?? prev.batteryLevel,
          batteryVoltage:  payload.battery_v        ?? payload.batteryVoltage  ?? prev.batteryVoltage,
          wifiConnected:   payload.wifi_connected   ?? payload.wifiConnected   ?? prev.wifiConnected,
        }))

        // Reflect pump state from sensor packet if provided
        if (payload.pump_on !== undefined) {
          setPumpStatus(payload.pump_on)
          setControlMode(payload.pump_on && payload.mode === 'MANUAL' ? 'manual' : 'automatic')
        }
        break
      }

      case 'decision.new': {
        // Map backend decision response (TDR §9.2) → aiDecision shape
        const actionMap = { IRRIGATE: 'irrigate', SKIP: 'skip' }
        setAiDecision({
          action:            actionMap[payload.action] ?? payload.action?.toLowerCase() ?? 'monitoring',
          message:           payload.reason ?? 'AI decision received',
          irrigationMinutes: payload.duration_sec != null
            ? Math.round(payload.duration_sec / 60 * 10) / 10
            : 0,
          mode:             payload.mode,
          decisionId:       payload.decision_id,
          nextCheckMin:     payload.next_check_min,
        })

        // Append to history if irrigation occurred
        if (payload.action === 'IRRIGATE') {
          setIrrigationHistory((prev) => [
            {
              id:             payload.decision_id ?? Date.now(),
              date:           envelope.ts ?? new Date().toISOString(),
              duration:       payload.duration_sec != null ? Math.round(payload.duration_sec / 60 * 10) / 10 : 0,
              trigger:        payload.mode === 'MANUAL' ? 'Manual' : 'Automatic AI',
              moistureBefore: payload.moisture_before ?? null,
              moistureAfter:  payload.moisture_after  ?? null,
            },
            ...prev,
          ])

          addNotification({
            type:    'info',
            title:   'Irrigation started',
            message: payload.reason ?? `Auto irrigation triggered`,
          })
        }
        break
      }

      default:
        // Unknown event type — ignore silently (forward-compatible)
        break
    }
  }, [addNotification])

  // ── Status change handler ─────────────────────────────────────────────────
  const handleWsStatus = useCallback((next) => {
    setWsStatus(next)
    if (next === WS_STATUS.CONNECTED) {
      setIsLiveMode(true)   // latched — never goes back to false
    }
    if (next === WS_STATUS.DISCONNECTED || next === WS_STATUS.RECONNECTING) {
      setSystemHealth((prev) => prev === 'operational' ? 'warning' : prev)
    } else if (next === WS_STATUS.CONNECTED) {
      setSystemHealth('operational')
    }
  }, [])

  // ── Subscribe to WebSocket ────────────────────────────────────────────────
  const { sendMessage } = useWebSocket({
    url:            WS_URL,
    token:          isAuthenticated ? (getAccessToken() ?? undefined) : undefined,
    onMessage:      handleWsMessage,
    onStatusChange: handleWsStatus,
    enabled:        isAuthenticated && !!WS_URL,
  })

  // ── Pump toggle (TDR §9.1 POST /api/v1/control/manual) ──────────────────
  const togglePump = useCallback(async (on) => {
    // Optimistic UI update
    setPumpStatus(on)
    if (on) {
      setControlMode('manual')
      setManualStartTime(Date.now())
    } else {
      setControlMode('automatic')
      setManualStartTime(null)
    }

    // TODO: remove WS_URL guard when backend is live
    if (!WS_URL) return   // dev mock mode — no API call

    try {
      await authFetch('/api/v1/control/manual', {
        method: 'POST',
        body: JSON.stringify({ action: on ? 'ON' : 'OFF', duration: on ? 30 : 0 }),
      })
    } catch (err) {
      // Roll back optimistic update on failure
      console.error('[SystemContext] togglePump failed:', err.message)
      setPumpStatus(!on)
      if (!on) {
        setControlMode('manual')
        setManualStartTime(Date.now())
      } else {
        setControlMode('automatic')
        setManualStartTime(null)
      }
    }
  }, [])

  // ── Notification actions ──────────────────────────────────────────────────
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  // ── Settings update (TDR §9.1 PATCH /api/v1/settings) ───────────────────
  const updateSettings = useCallback(async (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))

    if (!WS_URL) return   // dev mock mode

    try {
      await authFetch('/api/v1/settings', {
        method: 'PATCH',
        body: JSON.stringify(newSettings),
      })
    } catch (err) {
      console.error('[SystemContext] updateSettings failed:', err.message)
    }
  }, [])

  // ── Context value ─────────────────────────────────────────────────────────
  const value = {
    // Sensors
    sensors,
    setSensors,
    // Pump
    pumpStatus,
    controlMode,
    manualStartTime,
    togglePump,
    // AI
    aiDecision,
    setAiDecision,
    // Notifications
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    // Settings
    settings,
    updateSettings,
    // System health
    systemHealth,
    setSystemHealth,
    componentStatus,
    setComponentStatus,
    faultLog,
    setFaultLog,
    // History
    irrigationHistory,
    setIrrigationHistory,
    // WebSocket
    wsStatus,
    isLiveMode,
    sendMessage,
  }

  return (
    <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
  )
}

/**
 * Hook to access system context.
 * @returns {Object} System state and actions
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSystem() {
  const context = useContext(SystemContext)
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider')
  }
  return context
}
