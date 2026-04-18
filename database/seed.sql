-- 6. Örnek Verileri Yükle (Seed Data)
-- Grafiklerin ve listelerin boş kalmaması için
INSERT INTO users (username, password_hash, full_name) 
VALUES ('admin', 'admin123', 'Admin User');

INSERT INTO sensor_logs (soil_moisture, temperature, humidity, rain_probability, battery_voltage, battery_level)
VALUES 
(62, 24, 55, 20, 3.9, 85),
(45, 26, 50, 10, 3.8, 82),
(28, 27, 48, 5, 3.7, 80);

INSERT INTO irrigation_history (duration_minutes, trigger_type, moisture_before, moisture_after, liters_consumed)
VALUES 
(12.5, 'Automatic AI', 28, 65, 25.0),
(8.0, 'Manual', 45, 70, 15.5),
(0, 'Skipped (Rain)', 35, 40, 0);