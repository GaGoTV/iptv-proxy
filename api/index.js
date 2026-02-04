import https from 'https';
import http from 'http';

// Sizin təqdim etdiyiniz User Agent siyahısı
const userAgents = [
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.7874.1190 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.7641.1982 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.5741.1838 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.4561.1139 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2926.1511 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.3249.1975 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.8322.1301 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.4985.1853 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.6876.1583 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.9608.1984 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.7281.1957 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.9176.1124 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.5326.1199 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.5977.1563 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.6418.1021 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.9543.1321 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.7475.1424 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.5685.1128 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.6100.1872 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.7966.1899 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.4892.1546 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.1327.1540 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.6217.1237 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.3282.1470 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2347.1648 Mobile Safari/537.36"
];

export default async function handler(req, res) {
    const { url } = req.query;

    // CORS Ayarları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!url) return res.status(400).send('URL yoxdur.');

    // Siyahıdan təsadüfi bir User-Agent seçirik
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, {
        headers: {
            'User-Agent': randomUserAgent,
            'Icy-MetaData': '1',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        },
        rejectUnauthorized: false 
    }, (proxyRes) => {
        // Gələn cavabın tipini təyin edirik
        const contentType = proxyRes.headers['content-type'] || 'application/vnd.apple.mpegurl';
        res.setHeader('Content-Type', contentType);
        
        // Streami yönləndiririk
        proxyRes.pipe(res);
    }).on('error', (e) => {
        console.error('Proxy Error:', e.message);
        res.status(500).send('Xəta: ' + e.message);
    });
}
