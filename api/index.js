export default async function handler(req, res) {
    const { url } = req.query;

    // CORS tənzimləmələri (Bütün brauzerlərin açması üçün)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!url) {
        return res.status(400).send('Xəta: URL parametri tapılmadı. İstifadə: ?url=LINK');
    }

    try {
        const response = await fetch(url, {
            headers: {
                // Ən çox tələb olunan User-Agent-lər bura yazılır
                'User-Agent': 'VLC/3.0.11 LibVLC/3.0.11',
                'Referer': url,
                'Origin': new URL(url).origin
            }
        });

        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType || 'application/vnd.apple.mpegurl');

        // Yayımı buffer olaraq ötürürük
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        res.status(500).send('Proxy Xətası: ' + error.message);
    }
}
