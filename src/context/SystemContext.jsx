import { createContext, useContext, useState, useCallback, useEffect } from 'react'

/**
 * SystemContext - Sulama paneli için merkezi veri yönetim merkezi.
 * Hem sensörleri hem de bildirimleri buradan yönetiyoruz.
 */
const SystemContext = createContext(null)

/** Varsayılan değerler (Backend'e bağlanana kadar veya hata durumunda kullanılır) */
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

const DEFAULT_SETTINGS = {
  moistureThresholdLow: 30,
  moistureThresholdHigh: 80,
  rainProbabilityThreshold: 50,
  pushNotifications: true,
  emailNotifications: false,
  deepSleepInterval: 15,
  maxPumpRuntime: 20,
}

export function SystemProvider({ children }) {
  // --- DURUM YÖNETİMİ (STATE) ---
  const [sensors, setSensors] = useState(DEFAULT_SENSORS)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [pumpStatus, setPumpStatus] = useState(false)
  const [controlMode, setControlMode] = useState('automatic')
  const [manualStartTime, setManualStartTime] = useState(null)

  // Şimdilik boş kalsınlar, ileride doldururuz
  const [systemHealth, setSystemHealth] = useState('operational')
  const [componentStatus, setComponentStatus] = useState({})
  const [faultLog, setFaultLog] = useState([])
  const [irrigationHistory, setIrrigationHistory] = useState([])
  const [aiDecision, setAiDecision] = useState({
    action: 'monitoring',
    message: 'Soil conditions stable',
    irrigationMinutes: 0,
  })

  // --- MERKEZİ VERİ ÇEKME (FETCH) ---
  const fetchAllData = useCallback(async () => {
    try {
      // 1. En güncel sensör verilerini Neon'dan çek
      const sensorRes = await fetch('http://localhost:3001/api/sensors/latest');
      const sData = await sensorRes.json();

      // Veritabanındaki snake_case isimleri camelCase'e çeviriyoruz
      setSensors({
        soilMoisture: Math.round(sData.soil_moisture),
        temperature: Math.round(sData.temperature),
        humidity: Math.round(sData.humidity),
        rainProbability: Math.round(sData.rain_probability),
        isRaining: sData.is_raining,
        batteryLevel: Math.round(sData.battery_level),
        batteryVoltage: sData.battery_voltage,
        wifiConnected: sData.wifi_connected
      });

      // 2. Bildirimler tablosunu çek
      const notifyRes = await fetch('http://localhost:3001/api/notifications');
      const nData = await notifyRes.json();
      setNotifications(nData);
      setUnreadCount(nData.filter(n => !n.read).length);

      // 3. Sulama Geçmişini çek (History sayfasının canlı olması için)
      const historyRes = await fetch('http://localhost:3001/api/history');
      const hData = await historyRes.json();
      const mappedHistory = hData.map(item => ({
        id: item.id,
        date: item.start_time,
        duration: parseFloat(item.duration_minutes).toFixed(1), // Yuvarlamayı hassaslaştırdık
        trigger: item.trigger_type,
        moistureBefore: Math.round(item.moisture_before),
        moistureAfter: Math.round(item.moisture_after)
      }));
      setIrrigationHistory(mappedHistory);

      // 4. Sistem Ayarlarını çek
      const settingsRes = await fetch('http://localhost:3001/api/settings');
      const setts = await settingsRes.json();
      if (setts) {
        setSettings({
          moistureThresholdLow: setts.moisture_threshold_low,
          moistureThresholdHigh: setts.moisture_threshold_high,
          rainProbabilityThreshold: setts.rain_probability_threshold,
          pushNotifications: setts.push_notifications,
          emailNotifications: setts.email_notifications,
          deepSleepInterval: setts.deep_sleep_interval,
          maxPumpRuntime: setts.max_pump_runtime
        });
      }

    } catch (error) {
      console.error("❌ Senkronizasyon hatası:", error);
    }
  }, []);

  // --- SİSTEM DÖNGÜSÜ ---
  useEffect(() => {
    fetchAllData(); // Sayfa açılınca ilk kez çek
    const interval = setInterval(fetchAllData, 5000); // 5 saniyede bir tazele
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // --- AKSİYONLAR (ACTIONS) ---

  /** Pompayı manuel aç/kapat */
  const togglePump = useCallback(async (on) => {
    const moistureBefore = sensors.soilMoisture;

    if (on) {
      setPumpStatus(true);
      setControlMode('manual');
      const startTime = Date.now();
      setManualStartTime(startTime);

      await fetch('http://localhost:3001/api/pump/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ON', moistureBefore })
      });
    } else {
      // Kapatırken ne kadar süre geçtiğini hesaplayalım (saniyeyi dakikaya çevir)
      const durationMin = manualStartTime ? ((Date.now() - manualStartTime) / 60000).toFixed(1) : 0;

      setPumpStatus(false);
      setControlMode('automatic');
      setManualStartTime(null);

      await fetch('http://localhost:3001/api/pump/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'OFF',
          moistureBefore,
          duration: parseFloat(durationMin)
        })
      });
    }
  }, [sensors.soilMoisture, manualStartTime]);

  /** Ayarları güncelle ve backend'e gönder */
  const updateSettings = useCallback(async (newSettings) => {
    console.log("📤 Frontend: İstek gönderiliyor...", newSettings);
    setSettings((prev) => ({ ...prev, ...newSettings }))
    try {
      await fetch('http://localhost:3001/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (err) { console.error("Ayarlar kaydedilemedi:", err); }
  }, [])

  const markNotificationRead = useCallback(async (id) => {
    // Önce UI'da hemen güncelle (Hızlı tepki için)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    try {
      // Sonra veritabanına kaydet
      await fetch(`http://localhost:3001/api/notifications/${id}/read`, { method: 'PUT' });
    } catch (err) {
      console.error("Bildirim güncellenemedi:", err);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    // 1. Önce UI'da hepsini hemen okundu yap (Kullanıcı bekletilmez)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      // 2. Veritabanına toplu güncelleme isteği gönder
      await fetch('http://localhost:3001/api/notifications/read-all', { method: 'PUT' });
    } catch (err) {
      console.error("Tüm bildirimler güncellenemedi:", err);
    }
  }, []);

  // --- DIŞARIYA SUNULAN DEĞERLER ---
  const value = {
    sensors,
    notifications,
    unreadCount,
    settings,
    pumpStatus,
    controlMode,
    manualStartTime,
    aiDecision,
    systemHealth,
    componentStatus,
    faultLog,
    irrigationHistory,
    togglePump,
    updateSettings,
    markNotificationRead,
    markAllNotificationsRead,
    setSensors,
    setAiDecision,
    setSystemHealth,
    setComponentStatus,
    setFaultLog,
    setIrrigationHistory
  }

  return (
    <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
  )
}

/** Sistem bağlamına erişim kancası (Hook) */
export function useSystem() {
  const context = useContext(SystemContext)
  if (!context) throw new Error('useSystem must be used within a SystemProvider')
  return context
}