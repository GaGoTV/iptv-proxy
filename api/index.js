import https from 'https';
import http from 'http';
import { URL } from 'url';

const userAgents = [
    "Mozilla/5.0 (Linux; Android 10; Televizo Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36",
    "Televizo/1.9.3.2 (Linux; Android 11; SM-G973F)",
    "VLC/3.0.11 LibVLC/3.0.11",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.7874.1190 Mobile Safari/537.36"
];

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) return res.status(400).send('URL daxil edilməyib.');

    // 1. Təsadüfi User-Agent seçimi
    const selectedUA = userAgents[Math.floor(Math.random() * userAgents.length)];

    const targetUrl = new URL(url);
    const protocol = targetUrl.protocol === 'https:' ? https : http;

    // 2. Televizo APK-nın adətən istifadə etdiyi headerlər
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': selectedUA,
            'Accept': '*/*',
            'Accept-Language': 'az-AZ,az;q=0.9,en-US;q=0.8,en;q=0.7',
            'Icy-MetaData': '1',
            'Range': req.headers.range || 'bytes=0-',
            'Connection': 'keep-alive',
            'Referer': targetUrl.origin, // Bəzi serverlər referer tələb edir
            'Host': targetUrl.host
        },
        rejectUnauthorized: false // Sertifikat xətalarını keçmək üçün
    };

    const proxyRequest = protocol.get(url, options, (proxyRes) => {
        // 3. Cavab başlıqlarını Televizoya uyğun tənzimləyirik
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'video/mp2t');
        
        // Video axınının davamlılığı üçün lazımi başlıqlar
        if (proxyRes.headers['content-length']) {
            res.setHeader('Content-Length', proxyRes.headers['content-length']);
        }
        if (proxyRes.headers['content-range']) {
            res.setHeader('Content-Range', proxyRes.headers['content-range']);
        }
        if (proxyRes.headers['transfer-encoding']) {
            res.setHeader('Transfer-Encoding', proxyRes.headers['transfer-encoding']);
        }

        // Status kodunu ötürürük (məsələn 206 Partial Content)
        res.writeHead(proxyRes.statusCode);

        // 4. Stream-i (datanı) birbaşa Televizoya ötürürük
        proxyRes.pipe(res);
    });

    proxyRequest.on('error', (e) => {
        console.error('Xəta:', e.message);
        if (!res.headersSent) {
            res.status(500).send('Stream xətası: ' + e.message);
        }
    });

    // 5. Əgər istifadəçi (Televizo) yayımı bağlayarsa, server yükünü dayandır
    req.on('close', () => {
        proxyRequest.destroy();
    });
}
