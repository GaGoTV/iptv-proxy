import https from 'https';
import http from 'http';

export default async function handler(req, res) {
    const { url } = req.query;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!url) return res.status(400).send('URL lazımdır.');

    // Hansı kitabxanadan istifadə edəcəyimizi seçirik (http və ya https)
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, {
        headers: {
            'User-Agent': 'VLC/3.0.11 LibVLC/3.0.11',
            'Accept': '*/*',
            'Icy-MetaData': '1'
        },
        rejectUnauthorized: false // Sertifikat xətalarını keçmək üçün
    }, (proxyRes) => {
        // Orijinal başlıqları (headers) pleyerə ötürürük
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/vnd.apple.mpegurl');
        
        // Yayımı birbaşa pleyerə "axıdırıq" (Stream)
        proxyRes.pipe(res);
    }).on('error', (e) => {
        res.status(500).send('Proxy Bağlantı Xətası: ' + e.message);
    });
}
