import https from 'https';
import http from 'http';

export default async function handler(req, res) {
    const { url } = req.query;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!url) return res.status(400).send('URL yoxdur.');

    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, {
        headers: {
            // Bir çox server bu User-Agent-i tələb edir
            'User-Agent': 'VLC/3.0.11 LibVLC/3.0.11',
            'Icy-MetaData': '1'
        },
        rejectUnauthorized: false 
    }, (proxyRes) => {
        // Kanalın orijinal başlıqlarını ötürürük
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/vnd.apple.mpegurl');
        proxyRes.pipe(res);
    }).on('error', (e) => {
        res.status(500).send('Xəta: ' + e.message);
    });
}
