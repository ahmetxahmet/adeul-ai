export const runtime = "nodejs";
export const maxDuration = 300;

const SUPABASE_ANON = 'sb_publishable_4WYCqs4gxci5eQoOeysLWQ_5cqkdWaA';
const FAL_KEY = process.env.FAL_API_KEY;
const SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';

export default async function handler(req, res) {
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

    // Upload base64 to fal.ai storage, get a public URL
    const buf = Buffer.from(image, 'base64');
    const uploadRes = await fetch('https://rest.fal.run/storage/upload/initiate', {
      method: 'POST',
      headers: { 'Authorization': 'Key ' + FAL_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_type: 'image/jpeg', file_size: buf.length })
    });
    const uploadData = await uploadRes.json();
    console.log('Fal upload initiate:', JSON.stringify(uploadData).substring(0, 200));

    if (!uploadData.upload_url) {
      // Fallback: try sending data URL directly
      const dataUrl = 'data:image/jpeg;base64,' + image;
      const r = await fetch('https://fal.run/fal-ai/aura-sr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Key ' + FAL_KEY },
        body: JSON.stringify({ image_url: dataUrl, scale: 2 })
      });
      const d = await r.json();
      console.log('Fal aura-sr (dataurl):', JSON.stringify(d).substring(0, 200));
      return res.status(200).json({ output_url: d.image?.url || '' });
    }

    // Upload binary to fal storage
    await fetch(uploadData.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: buf
    });

    const falImageUrl = uploadData.file_url;

    const r = await fetch('https://fal.run/fal-ai/aura-sr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Key ' + FAL_KEY },
      body: JSON.stringify({ image_url: falImageUrl, scale: 2 })
    });
    const d = await r.json();
    console.log('Fal aura-sr:', JSON.stringify(d).substring(0, 200));
    return res.status(200).json({ output_url: d.image?.url || '' });

  } catch (error) {
    console.error('Upscale error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
