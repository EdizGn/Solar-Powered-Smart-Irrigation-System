-- 1. Mevcut tabloları ve onlara bağlı her şeyi temizle
DROP TABLE IF EXISTS sensor_logs CASCADE;
DROP TABLE IF EXISTS irrigation_history CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- 2. Kullanıcılar Tablosu (AuthContext.jsx ile uyumlu)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin'
);

-- 3. Sensör Verileri Tablosu (SystemContext.jsx ve mockSensorData.js ile uyumlu)
CREATE TABLE sensor_logs (
    id SERIAL PRIMARY KEY,
    soil_moisture FLOAT NOT NULL,      -- Frontend: soilMoisture
    temperature FLOAT,                 -- Frontend: temperature
    humidity FLOAT,                    -- Frontend: humidity
    rain_probability FLOAT,            -- Frontend: rainProbability
    is_raining BOOLEAN DEFAULT false,  -- Frontend: isRaining
    battery_level FLOAT,               -- Frontend: batteryLevel
    battery_voltage FLOAT,             -- Frontend: batteryVoltage
    wifi_connected BOOLEAN DEFAULT true, -- Frontend: wifiConnected
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sulama Geçmişi Tablosu (mockHistory.js ve mockReports.js ile uyumlu)
CREATE TABLE irrigation_history (
    id SERIAL PRIMARY KEY,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes FLOAT,            -- Frontend: duration
    trigger_type VARCHAR(50),          -- Frontend: trigger ('Automatic AI', 'Manual', 'Skipped (Rain)')
    moisture_before FLOAT,             -- Frontend: moistureBefore
    moisture_after FLOAT,              -- Frontend: moistureAfter
    liters_consumed FLOAT              -- Frontend: liters (Raporlar için)
);

-- 5. Sistem Ayarları Tablosu (SystemContext.jsx DEFAULT_SETTINGS ile uyumlu)
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    moisture_threshold_low FLOAT DEFAULT 30,
    moisture_threshold_high FLOAT DEFAULT 80,
    rain_probability_threshold FLOAT DEFAULT 50,
    push_notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT false,
    deep_sleep_interval INT DEFAULT 15,
    max_pump_runtime INT DEFAULT 20
);

