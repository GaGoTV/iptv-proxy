export default async function handler(req, res) {
    const { url } = req.query;

    // Bütün brauzerlər və tətbiqlər üçün icazələr
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!url) {
        return res.status(400).send('URL parametresi lazımdır.');
    }

    try {
        const response = await fetch(url, {
            headers: {
                // Kanalların ən çox tanıdığı User-Agent
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'Referer': url,
                'Origin': new URL(url).origin
            },
            // Bağlantı müddəti (timeout) tənzimləməsi
            redirect: 'follow'
        });

        if (!response.ok) {
            throw new Error(`Kanal cavab vermir: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType || 'application/vnd.apple.mpegurl');

        const buffer = await response.arrayBuffer();
        return res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("Proxy Xətası:", error.message);
        return res.status(500).send('Proxy Xətası: ' + error.message);
    }
}
