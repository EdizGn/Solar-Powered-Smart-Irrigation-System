import nodemailer from 'nodemailer';
import 'dotenv/config';

// Nodemailer yapılandırması
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // 587 portu için false, TLS kullanılacak
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    }
});

// E-posta Gönderme Fonksiyonu
export async function sendPumpEmail(action, details) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.warn("⚠️ E-posta gönderilemedi: ADMIN_EMAIL ayarlı değil.");
        return;
    }

    const dateStr = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    let subject = "";
    let htmlContent = "";

    if (action === 'ON') {
        subject = `💧 Pompa Açıldı! (${details.mode})`;
        htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px; max-width: 600px; margin: auto;">
                <h2 style="color: #2b6cb0;">💧 Sulama Pompası Açıldı</h2>
                <p><strong>Zaman:</strong> ${dateStr}</p>
                <p><strong>Mod:</strong> ${details.mode}</p>
                <p><strong>Süre:</strong> ${details.duration ? details.duration + ' dakika' : 'Bilinmiyor (Otomatik/Manuel kapanacak)'}</p>
                <hr style="border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #777;">Bu e-posta Gazi Akıllı Sulama Sistemi tarafından otomatik olarak gönderilmiştir.</p>
            </div>
        `;
    } else if (action === 'OFF') {
        subject = `🛑 Pompa Kapandı! (${details.mode})`;
        htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px; max-width: 600px; margin: auto;">
                <h2 style="color: #c53030;">🛑 Sulama Pompası Kapandı</h2>
                <p><strong>Zaman:</strong> ${dateStr}</p>
                <p><strong>Mod:</strong> ${details.mode}</p>
                <p><strong>Sulama Süresi:</strong> ${details.duration} dakika</p>
                <p><strong>Toprak Nemi (Öncesi):</strong> %${details.moistureBefore}</p>
                <p><strong>Toprak Nemi (Sonrası):</strong> %${details.moistureAfter}</p>
                <hr style="border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #777;">Bu e-posta Gazi Akıllı Sulama Sistemi tarafından otomatik olarak gönderilmiştir.</p>
            </div>
        `;
    }

    const mailOptions = {
        from: `"Akıllı Sulama Sistemi" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 E-posta Başarıyla Gönderildi: ${info.messageId}`);
    } catch (error) {
        console.error("❌ E-posta gönderme hatası:", error);
    }
}
