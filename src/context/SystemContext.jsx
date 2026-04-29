import { createContext, useContext, useState, useCallback } from 'react'

/**
 * SystemContext - Manages global system state for the irrigation dashboard.
 * Holds sensor data, pump state, notifications, settings, and system health.
 * // TODO: Replace mock state updates with real-time data from WebSocket/API
 */
const SystemContext = createContext(null)

/** Default sensor readings */
const DEFAULT_SENSORS = {
  soilMoisture: 62,
  temperature: 24,
  humidity: 55,
  rainProbability: 20,
  isRaining: false,
  batteryLevel: 85,
  batteryVoltage: 3.9,
  wifiConnected: true,
}

/** Default system settings */
const DEFAULT_SETTINGS = {
  plantType: 'tomato',
  pushNotifications: true,
  deepSleepInterval: 15,
  maxPumpRuntime: 20,
}

/** Default component health statuses */
const DEFAULT_COMPONENT_STATUS = {
  esp32: 'online',
  moistureSensor: 'active',
  rainSensor: 'active',
  pump: 'active',
  solarPanel: 'charging',
  battery: 'healthy',
}

/**
 * SystemProvider - Wraps the app and provides global system state.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function SystemProvider({ children }) {
  // Sensor data
  // TODO: Replace with real-time sensor data from API/WebSocket
  const [sensors, setSensors] = useState(DEFAULT_SENSORS)

  // Pump control
  const [pumpStatus, setPumpStatus] = useState(false) // true = ON
  const [controlMode, setControlMode] = useState('automatic') // 'automatic' | 'manual'
  const [manualStartTime, setManualStartTime] = useState(null)

  // AI decision
  const [aiDecision, setAiDecision] = useState({
    action: 'monitoring',
    message: 'Monitoring soil conditions',
    irrigationMinutes: 0,
  })

  // Notifications
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Settings
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  // System health
  const [systemHealth, setSystemHealth] = useState('operational') // 'operational' | 'warning' | 'fault' | 'safe_mode'
  const [componentStatus, setComponentStatus] = useState(DEFAULT_COMPONENT_STATUS)
  const [faultLog, setFaultLog] = useState([])

  // Irrigation history
  const [irrigationHistory, setIrrigationHistory] = useState([])

  /**
   * Toggle the pump manually.
   * @param {boolean} on - Whether to turn the pump on
   */
  // TODO: Replace with API call to POST /api/pump/control
  const togglePump = useCallback((on) => {
    setPumpStatus(on)
    if (on) {
      setControlMode('manual')
      setManualStartTime(Date.now())
    } else {
      setControlMode('automatic')
      setManualStartTime(null)
    }
  }, [])

  /**
   * Add a new notification to the feed.
   * @param {{ type: string, title: string, message: string }} notification
   */
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
    setUnreadCount((prev) => prev + 1)
  }, [])

  /**
   * Mark a notification as read.
   * @param {number} id - Notification ID
   */
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  /** Mark all notifications as read. */
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  /**
   * Update system settings.
   * @param {Object} newSettings - Partial settings to merge
   */
  // TODO: Replace with API call to PUT /api/settings
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

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
  }

  return (
    <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
  )
}

/**
 * Hook to access system context.
 * @returns {Object} System state and actions
 */
export function useSystem() {
  const context = useContext(SystemContext)
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider')
  }
  return context
}
