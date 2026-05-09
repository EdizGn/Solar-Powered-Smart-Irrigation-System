import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const SystemContext = createContext(null)

const DEFAULT_SENSORS = {
  soilMoisture: 0, temperature: 0, humidity: 0,
  rainProbability: 0, isRaining: false, batteryLevel: 0,
  batteryVoltage: 0, wifiConnected: false,
}

export function SystemProvider({ children }) {
  const [sensors, setSensors] = useState(DEFAULT_SENSORS)
  const [systemHealth, setSystemHealth] = useState('waiting')
  
  // DİKKAT: Artık frontend hesaplamıyor, backend'den gelen LLM kararını dinliyor
  const [aiDecision, setAiDecision] = useState({
    action: 'monitoring',
    message: 'Sensör verisi ve LLM kararı bekleniyor...',
    irrigationMinutes: 0,
  })

  // Diğer stateler (settings, pumpStatus vb.) burada durabilir...

  const fetchAllData = useCallback(async () => {
    try {
      // 1. Sensörleri Çek
      const sensorRes = await fetch('http://localhost:3001/api/sensors/latest');
      if (sensorRes.ok) {
        const sData = await sensorRes.json();
        setSensors({
          soilMoisture: Math.round(sData.soil_moisture || 0),
          temperature: Math.round(sData.temperature || 0),
          humidity: Math.round(sData.humidity || 0),
          rainProbability: Math.round(sData.rain_probability || 0),
          isRaining: Boolean(sData.is_raining),
          batteryLevel: Math.round(sData.battery_level || 0),
          batteryVoltage: sData.battery_voltage || 0,
          wifiConnected: true
        });
        setSystemHealth('operational');
      } else {
        setSensors(prev => ({ ...prev, wifiConnected: false }));
        setSystemHealth('error');
      }

      // 2. Backend'deki Cerebras LLM Kararını Çek
      const decisionRes = await fetch('http://localhost:3001/api/v1/decision/latest');
      if (decisionRes.ok) {
        const dData = await decisionRes.json();
        setAiDecision({
          action: dData.action ? dData.action.toLowerCase() : 'monitoring',
          message: dData.reason || 'Sistem stabil',
          irrigationMinutes: dData.duration_sec ? (dData.duration_sec / 60) : 0
        });
      }

    } catch (error) {
      setSensors(prev => ({ ...prev, wifiConnected: false }));
      setSystemHealth('error');
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 2000); 
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // (togglePump ve updateSettings fonksiyonların aynı kalabilir)

  const value = { sensors, aiDecision, systemHealth, /* ...diğerleri */ }
  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
}

export function useSystem() {
  const context = useContext(SystemContext)
  if (!context) throw new Error('useSystem must be used within a SystemProvider')
  return context
}