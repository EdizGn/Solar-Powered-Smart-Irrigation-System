import express from 'express';
import cors from 'cors';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 1. Dashboard için en güncel sensör verisini getir
app.get('/api/sensors/latest', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sensor_logs ORDER BY recorded_at DESC LIMIT 1');
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM irrigation_history ORDER BY start_time DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/notifications', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notifications ORDER BY timestamp DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET read = true WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notifications/read-all', async (req, res) => {
    try {
        // Okunmamış olan tüm bildirimleri 'true' yapıyoruz
        await pool.query('UPDATE notifications SET read = true WHERE read = false');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pump/control', async (req, res) => {
    const { action, moistureBefore, duration } = req.body;

    try {
        if (action === 'ON') {
            // Pompa açıldığında sadece bildirim atıyoruz
            await pool.query(
                "INSERT INTO notifications (type, title, message, read, timestamp) VALUES ($1, $2, $3, $4, $5)",
                ['info', 'Manuel Sulama', 'Kullanıcı pompayı manuel olarak başlattı.', false, new Date()]
            );
            console.log("💧 Pompa AÇILDI bildirimi eklendi.");

        } else if (action === 'OFF') {
            const mb = parseFloat(moistureBefore) || 50;
            const finalDuration = parseFloat(duration) || 1.0;
            const moistureAfter = mb + 5;

            // YENİ: SQL'e NOW() yerine JavaScript'ten o anki zamanı gönderiyoruz
            const currentTime = new Date();

            await pool.query(
                `INSERT INTO irrigation_history (start_time, duration_minutes, trigger_type, moisture_before, moisture_after, liters_consumed) 
         VALUES ($1, $2, $3, $4, $5, $6)`, // 6 adet parametre ($1...$6)
                [currentTime, finalDuration, 'Manual', mb, moistureAfter, 4.5] // İlk parametre currentTime
            );

            console.log(`✅ Geçmişe kayıt eklendi: ${finalDuration} dk, Nem: %${mb}`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Pompa kontrol hatası:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports', async (req, res) => {
    const { period } = req.query; // 'Daily', 'Weekly', 'Monthly'
    let query = "";

    try {
        if (period === 'Weekly') {
            // Son 12 haftanın verilerini haftalık grupla
            query = `
                SELECT 
                    to_char(date_trunc('week', start_time), 'Mon DD') || ' - ' || to_char(date_trunc('week', start_time) + interval '6 days', 'Mon DD') as date,
                    SUM(liters_consumed) as liters,
                    SUM(duration_minutes) as duration
                FROM irrigation_history
                WHERE start_time > NOW() - interval '12 weeks'
                GROUP BY date_trunc('week', start_time)
                ORDER BY date_trunc('week', start_time) ASC;
            `;
        } else if (period === 'Monthly') {
            // Son 6 ayın verilerini aylık grupla
            query = `
                SELECT 
                    to_char(start_time, 'Mon YYYY') as date,
                    SUM(liters_consumed) as liters,
                    SUM(duration_minutes) as duration
                FROM irrigation_history
                WHERE start_time > NOW() - interval '6 months'
                GROUP BY date_trunc('month', start_time), date
                ORDER BY date_trunc('month', start_time) ASC;
            `;
        } else {
            // Varsayılan: Son 30 günü günlük grupla (Daily)
            query = `
                SELECT 
                    to_char(start_time, 'Mon DD') as date,
                    SUM(liters_consumed) as liters,
                    SUM(duration_minutes) as duration
                FROM irrigation_history
                WHERE start_time > NOW() - interval '30 days'
                GROUP BY date_trunc('day', start_time), date
                ORDER BY date_trunc('day', start_time) ASC;
            `;
        }

        const result = await pool.query(query);
        // Sayıları tamsayıya yuvarlayarak gönderelim
        const rows = result.rows.map(r => ({
            date: r.date,
            liters: Math.round(parseFloat(r.liters || 0)),
            duration: Math.round(parseFloat(r.duration || 0)),
            rainSkips: 0 // Veritabanında skip tablosu olmadığı için şimdilik 0
        }));
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM system_settings WHERE id = 1');
        // Eğer veritabanı boşsa varsayılanları dön ki frontend 35'e düşmesin
        if (result.rows.length === 0) {
            return res.json({ moisture_threshold_low: 35, moisture_threshold_high: 80, rain_probability_threshold: 50, push_notifications: true });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings', async (req, res) => {
    const {
        moistureThresholdLow, moistureThresholdHigh, rainProbabilityThreshold,
        pushNotifications, emailNotifications, deepSleepInterval, maxPumpRuntime
    } = req.body;

    try {
        await pool.query(
            `UPDATE system_settings 
             SET moisture_threshold_low = $1, moisture_threshold_high = $2, 
                 rain_probability_threshold = $3, push_notifications = $4,
                 email_notifications = $5, deep_sleep_interval = $6, 
                 max_pump_runtime = $7, updated_at = NOW() 
             WHERE id = 1`,
            [moistureThresholdLow, moistureThresholdHigh, rainProbabilityThreshold,
                pushNotifications, emailNotifications, deepSleepInterval, maxPumpRuntime]
        );
        console.log("✅ Tüm ayarlar başarıyla güncellendi.");
        res.json({ success: true });
    } catch (err) {
        console.error("❌ Kaydetme hatası:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. Login Endpoint (AuthContext.jsx için)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length > 0 && result.rows[0].password_hash === password) {
            res.json({
                success: true,
                user: { id: result.rows[0].id, name: result.rows[0].full_name, role: result.rows[0].role }
            });
        } else {
            res.status(401).json({ success: false, message: 'Hatalı kullanıcı adı veya şifre' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend ${PORT} portunda canlı!`));