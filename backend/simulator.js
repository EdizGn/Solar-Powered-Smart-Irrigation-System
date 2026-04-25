import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// --- YARDIMCI FONKSİYONLAR ---
function getNaturalMoisture(hour) {
    let base = 62;
    if (hour >= 6 && hour < 12) base = 65 - (hour - 6) * 3;
    else if (hour >= 12 && hour < 18) base = 45 + (hour - 12) * 2;
    else if (hour >= 18 && hour < 22) base = 55 + (hour - 18) * 2;
    return Math.max(25, Math.min(85, base + (Math.random() - 0.5) * 10));
}

// --- SEED FONKSİYONU: VERİTABANINI GEÇMİŞLE DOLDURUR ---
async function seedDatabase() {
    try {
        const check = await pool.query('SELECT COUNT(*) FROM sensor_logs');
        const count = parseInt(check.rows[0].count);

        if (count > 50) {
            console.log("✅ Veritabanında yeterli veri var, seeding atlanıyor.");
            return;
        }

        console.log("🌱 Veritabanı boş veya yetersiz. 30 günlük geçmiş veriler oluşturuluyor...");

        // 1. Son 30 Günlük Sensör Verisi (Raporlar Sayfası İçin)
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            for (let h = 0; h < 24; h += 4) { // Her 4 saatte bir örnek veri (günde 6 kayıt)
                const timestamp = new Date(date);
                timestamp.setHours(h, 0, 0, 0);
                const moisture = getNaturalMoisture(h);
                await pool.query(
                    `INSERT INTO sensor_logs (soil_moisture, temperature, humidity, rain_probability, is_raining, recorded_at) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [moisture, 22 + Math.random() * 5, 50 + Math.random() * 10, 10, false, timestamp]
                );
            }
        }

        // 2. 50 Adet Sulama Geçmişi (History Sayfası İçin)
        for (let i = 0; i < 50; i++) {
            const hoursAgo = i * 14 + Math.random() * 10;
            const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
            const moistureBefore = 25 + Math.random() * 15;
            await pool.query(
                `INSERT INTO irrigation_history (start_time, duration_minutes, trigger_type, moisture_before, moisture_after, liters_consumed) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [timestamp, 10 + Math.random() * 5, i % 4 === 0 ? 'Manual' : 'Automatic AI', moistureBefore, moistureBefore + 25, 8.5]
            );
        }

        // 3. 15 Adet Bildirim (Notifications Sayfası İçin)
        const types = ['info', 'success', 'warning', 'danger'];
        const titles = ['Sistem Güncellemesi', 'Sulama Tamamlandı', 'Düşük Nem Uyarısı', 'Bağlantı Hatası'];
        for (let i = 0; i < 15; i++) {
            await pool.query(
                `INSERT INTO notifications (type, title, message, read, timestamp) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [types[i % 4], titles[i % 4], 'Geçmiş veri simülasyon kaydı #' + (i + 1), i > 5, new Date(Date.now() - i * 7200000)]
            );
        }

        console.log("🚀 Seeding başarıyla tamamlandı! Artık raporlar ve geçmiş sayfaların dolu görünecek.");
    } catch (err) {
        console.error("❌ Seeding Hatası:", err.message);
    }
}

// --- CANLI SİMÜLASYON DÖNGÜSÜ ---
async function runSimulation() {
    try {
        // 1. Veritabanından güncel eşik değerini çek (id=1 olan satır)
        const settingsRes = await pool.query("SELECT moisture_threshold_low FROM system_settings WHERE id=1");

        // Eğer veritabanında ayar satırı yoksa (id=1), varsayılan olarak 35 kullan
        const threshold = settingsRes.rows[0]?.moisture_threshold_low || 35;

        const now = new Date();
        const moisture = getNaturalMoisture(now.getHours()); // Mevcut saate göre doğal nem üret

        // 2. Sensör verilerini sensor_logs tablosuna kaydet
        await pool.query(
            `INSERT INTO sensor_logs 
            (soil_moisture, temperature, humidity, rain_probability, is_raining, battery_level, battery_voltage, wifi_connected, recorded_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [moisture, 24.5, 55.0, 10.0, false, 88.0, 3.9, true, now]
        );

        // 3. Eşik Kontrolü: Eğer nem, veritabanından gelen eşiğin altındaysa sulama başlat
        if (moisture < threshold) {
            console.log(`💧 Nem (%${Math.round(moisture)}) eşiğin (%${threshold}) altında! Otomatik sulama başlıyor...`);

            // Sulama geçmişine (history) kayıt ekle
            await pool.query(
                `INSERT INTO irrigation_history (start_time, duration_minutes, trigger_type, moisture_before, moisture_after, liters_consumed) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [now, 15.0, 'Automatic AI', moisture, moisture + 20, 12.5]
            );

            // Bildirimler tablosuna kayıt ekle
            await pool.query(
                `INSERT INTO notifications (type, title, message, read, timestamp) 
                 VALUES ('info', 'Otomatik Sulama', 'Nem %' || $1 || ' olduğu için sistem devreye girdi.', false, $2)`,
                [Math.round(moisture), now]
            );

            console.log("✅ Sulama kaydı ve bildirim başarıyla oluşturuldu.");
        }

        // Terminale her 5 saniyede bir durumu yazdır (Hata ayıklama için)
        console.log(`[OK] Veri Basıldı | Nem: %${Math.round(moisture)} | Eşik: %${threshold}`);

    } catch (err) {
        // Bir hata oluşursa terminalde kırmızı renkte görelim
        console.error("❌ Simülatör Döngü Hatası:", err.message);
    }
}

// --- ANA ÇALIŞTIRICI ---
(async () => {
    await seedDatabase(); // Önce veritabanını doldur (gerekiyorsa)
    setInterval(runSimulation, 5000); // Sonra 5 saniyede bir canlı akışı başlat
    console.log("🚀 Simülatör ve Seeder aktif!");
})();