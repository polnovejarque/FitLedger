export default async function handler(req: any, res: any) {
    // Cabeceras CORS completas para Web y Mobile PWA
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body || {};
        const { client_id, client_secret, code, code_verifier, redirect_uri, grant_type, refresh_token } = body;

        const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
        const params = new URLSearchParams();

        if (grant_type) params.append('grant_type', grant_type);
        if (code) params.append('code', code);
        if (code_verifier) params.append('code_verifier', code_verifier);
        if (redirect_uri) params.append('redirect_uri', redirect_uri);
        if (refresh_token) params.append('refresh_token', refresh_token);

        params.append('client_id', client_id || process.env.VITE_FITBIT_CLIENT_ID || '');
        params.append('client_secret', client_secret || process.env.VITE_FITBIT_CLIENT_SECRET || '');

        const googleRes = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        const data = await googleRes.json();
        return res.status(googleRes.status).json(data);
    } catch (error: any) {
        console.error('Error en serverless function fitbit-token:', error);
        return res.status(500).json({ error: error.message || 'Error interno al intercambiar tokens' });
    }
}
