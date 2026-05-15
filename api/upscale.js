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

    // Upload base64 to fal.ai storage
    const buf = Buffer.from(image, 'base64');
    const falUpload = await fetch('https://rest.fal.run/storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Key ' + FAL_KEY,
        'Content-Type': 'image/jpeg'
      },
      body: buf
    });

    let imageUrl;
    if (falUpload.ok) {
      const falUploadData = await falUpload.json();
      console.log('Fal upload result:', JSON.stringify(falUploadData).substring(0, 300));
      imageUrl = falUploadData.url || falUploadData.file_url;
    }

    if (!imageUrl) {
      imageUrl = 'data:image/jpeg;base64,' + image;
    }

    const r = await fetch('https://fal.run/fal-ai/aura-sr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Key ' + FAL_KEY },
      body: JSON.stringify({ image_url: imageUrl, scale: 2 })
    });
    const d = await r.json();
    console.log('Fal aura-sr full response:', JSON.stringify(d).substring(0, 500));

    // Parse all possible response formats
    const outputUrl = d?.image?.url || d?.images?.[0]?.url || d?.output?.url || d?.url || '';
    return res.status(200).json({ output_url: outputUrl });

  } catch (error) {
    console.error('Upscale error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
