export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });

  const KEYS = [
    'b404fa1f499acd0827dac968ce1c0def',
    'd67b694f211406c24777c6c91d2103df',
    'ce2a608d1b231eb1ae8ca5ac1f7ed246',
  ];

  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'Falta endpoint' });

  for (let i = 0; i < KEYS.length; i++) {
    try {
      const sep = endpoint.includes('?') ? '&' : '?';
      const url = `https://api.the-odds-api.com/v4/${endpoint}${sep}apiKey=${KEYS[i]}`;
      const r = await fetch(url);
      if (r.status === 401 || r.status === 429) continue;
      if (!r.ok) continue;
      const data = await r.json();
      const remaining = r.headers.get('x-requests-remaining');
      return res.status(200).json({ data, keyUsed: i + 1, requestsRemaining: remaining });
    } catch { continue; }
  }

  return res.status(503).json({ error: 'Todas las keys agotadas' });
}
