export const runtime = "nodejs";
export const maxDuration = 300;

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';
const SUPABASE_ANON = 'sb_publishable_4WYCqs4gxci5eQoOeysLWQ_5cqkdWaA';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://adeull.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false });

  try {
    const body = req.body;
    const userToken = body.user_token;
    const action = body.action || 'generate';
    const prompt = (body.prompt || '').replace(/\{\{/g, '').replace(/\}\}/g, '');
    const creditCost = body.creditCost || 2;
    const isRevision = body.isRevision || false;
    const isSketch = body.isSketch === 'EVET';
    const images = body.images || {};

    // Auth
    const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + userToken }
    });
    const userData = await userRes.json();
    if (!userData.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Rate limit
    const rlRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/check_rate_limit', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + userToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_user_id: userData.id, p_window_seconds: 60, p_max_requests: 5 })
    });
    const rlData = await rlRes.json();
    if (String(rlData.allowed) !== 'true') return res.status(429).json({ success: false, message: 'Too many requests' });

    // Deduct credit
    const deductAmount = action === 'prompt_builder' ? 4 : action === 'chat' ? 1 : creditCost;
    const creditRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/secure_deduct_credit', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + userToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_amount: deductAmount, p_action: action })
    });
    const creditData = await creditRes.json();
    if (String(creditData.success) !== 'true') return res.status(402).json({ success: false, message: 'Insufficient credits' });

    // Route
    if (action === 'chat') return handleChat(body, res);
    if (action === 'prompt_builder') return handlePromptBuilder(body, res);
    if (action === 'presentation') return handlePresentation(body, res);
    if (isRevision) return handleRevision(body, res);
    if (isSketch) return handleSketch(body, res);
    if (images.boxScene && images.boxItem) return handlePlacement(body, res);
    return handleRender(body, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

function getSize(ratio) {
  if (ratio === '9:16') return '1024x1536';
  if (ratio === '16:9') return '1536x1024';
  return '1024x1024';
}

async function generateImage(prompt, size) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: prompt, size: size || '1024x1024', quality: 'medium' })
  });
  return await r.json();
}

async function uploadToSupabase(b64) {
  try {
    const fileName = 'r_' + Date.now() + '.png';
    const buf = Buffer.from(b64, 'base64');
    const r = await fetch(SUPABASE_URL + '/storage/v1/object/renders/' + fileName, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'image/png' },
      body: buf
    });
    if (r.ok) return SUPABASE_URL + '/storage/v1/object/public/renders/' + fileName;
  } catch (e) { console.error('Upload error:', e); }
  return null;
}

function sendImage(res, d) {
  if (d.error) return res.status(500).json({ success: false, message: d.error.message });
  if (!d.data?.[0]?.b64_json) return res.status(500).json({ success: false, message: 'No image generated' });
  const b64 = d.data[0].b64_json;
  return res.status(200).json({ candidates: [{ content: { parts: [{ inlineData: { data: b64, mimeType: 'image/png' } }] } }] });
}

async function handleRender(body, res) {
  const rules = '8K ultra-high resolution, raw photo, DSLR 50mm f/8 ISO 100, ray tracing, volumetric lighting, architectural photography. ONE dominant material. Max 5-7 elements. Craftsmanship details visible. ';
  const d = await generateImage(rules + (body.prompt || 'modern interior'), getSize(body.aspectRatio));
  return sendImage(res, d);
}

async function handlePlacement(body, res) {
  const d = await generateImage('Seamlessly integrate object into architectural scene. Match perspective lighting scale shadows perfectly. ' + (body.prompt || ''), getSize(body.aspectRatio));
  return sendImage(res, d);
}

async function handleRevision(body, res) {
  const d = await generateImage('Edit architectural render: ' + (body.prompt || '') + '. Keep everything else identical. Photorealistic.', getSize(body.aspectRatio));
  return sendImage(res, d);
}

async function handleSketch(body, res) {
  const d = await generateImage('Transform rough sketch into photorealistic architectural render, preserve geometry. ' + (body.prompt || ''), getSize(body.aspectRatio));
  return sendImage(res, d);
}

async function handlePromptBuilder(body, res) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'Write exact prompt to recreate this scene. ' + (body.prompt || '') }], temperature: 0.4, max_tokens: 4096 })
  });
  const d = await r.json();
  return res.status(200).json({ candidates: [{ content: { parts: [{ text: d.choices?.[0]?.message?.content || '' }] } }] });
}

async function handleChat(body, res) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'You are ADEULL AI, architectural visualization assistant. Concise. Language: ' + (body.language || 'EN') }, { role: 'user', content: body.prompt || '' }], temperature: 0.5, max_tokens: 1024 })
  });
  const d = await r.json();
  return res.status(200).json({ candidates: [{ content: { parts: [{ text: d.choices?.[0]?.message?.content || '' }] } }] });
}

async function handlePresentation(body, res) {
  const texD = await generateImage('Material analysis board with magnified circular lens callouts showing textures. Clean white background. Professional material board.', '1024x1024');
  if (texD.error) return res.status(500).json({ success: false, message: texD.error.message });
  const anaR = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'Analyze materials. Return ONLY JSON: {projectName, colors:[{hex,ral,name}], materials:[{title,desc,hex}]}. Language: ' + (body.language || 'EN') }], temperature: 0.3, max_tokens: 2000 })
  });
  const anaD = await anaR.json();
  let analysis = {};
  try { analysis = JSON.parse((anaD.choices?.[0]?.message?.content || '{}').replace(/```json/g, '').replace(/```/g, '').trim()); } catch (e) { analysis = { projectName: 'ANALYSIS', materials: [], colors: [] }; }
  return res.status(200).json({ textureImage: texD.data?.[0]?.b64_json || '', analysis });
}
