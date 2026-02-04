import https from 'https';
import http from 'http';
import { URL } from 'url';

const userAgents = [
    "Televizo/1.9.3.2 (Linux; Android 11; SM-G973F)",
    "Mozilla/5.0 (Linux; Android 10; Televizo Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36",
    "VLC/3.0.11 LibVLC/3.0.11"
];

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) return res.status(400).send('URL yoxdur.');

    try {
        const targetUrl = new URL(url);
        const selectedUA = userAgents[Math.floor(Math.random() * userAgents.length)];

        // Protokolu (http/https) və Portu təyin edirik
        const isHttps = targetUrl.protocol === 'https:';
        const agent = isHttps ? https : http;

        const options = {
            hostname: targetUrl.hostname,
            port: targetUrl.port || (isHttps ? 443 : 80),
            path: targetUrl.pathname + targetUrl.search,
            method: 'GET',
            headers: {
                'User-Agent': selectedUA,
                'Accept': '*/*',
                'Icy-MetaData': '1',
                'Connection': 'keep-alive',
                'Range': req.headers.range || 'bytes=0-'
            },
            // KRİTİK: Port və sertifikat xətalarını keçmək üçün
            rejectUnauthorized: false 
        };

        const proxyReq = agent.get(options, (proxyRes) => {
            // Hədəf serverdən gələn bütün başlıqları (headers) təmizləyib ötürürük
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/vnd.apple.mpegurl');
            
            // Əgər yönləndirmə (Redirect) varsa:
            if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
                return res.redirect(`/api/index.js?url=${encodeURIComponent(proxyRes.headers.location)}`);
            }

            res.writeHead(proxyRes.statusCode);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            res.status(500).send('Bağlantı xətası: ' + err.message);
        });

        req.on('close', () => proxyReq.destroy());

    } catch (error) {
        res.status(500).send('URL xətası: ' + error.message);
    }
}
