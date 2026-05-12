const SUPABASE_ANON = 'sb_publishable_4WYCqs4gxci5eQoOeysLWQ_5cqkdWaA';
const FAL_KEY = '1a1d33bb-6d88-48e0-9fcd-a8689814b54a:9c5fa77a856618fb8f126a41ecb89ce5';
const SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://adeull.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false });
  try {
    const { user_token, image } = req.body;
    const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + user_token }
    });
    const userData = await userRes.json();
    if (!userData.id) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const r = await fetch('https://fal.run/fal-ai/aura-sr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Key ' + FAL_KEY },
      body: JSON.stringify({ image_url: image, scale: 2 })
    });
    const d = await r.json();
    return res.status(200).json({ output_url: d.image?.url || '' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
