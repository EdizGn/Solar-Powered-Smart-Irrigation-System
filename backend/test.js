import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: "",
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        await pool.query('SELECT 1');
    } catch (err) {
        console.error("❌ Hata (Empty URL):", err.message);
    }
}

test();
