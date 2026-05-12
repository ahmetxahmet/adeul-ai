const OPENAI_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://adeull.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const body = req.body;
    const userToken = body.user_token;
    const action = body.action || 'generate';
    const prompt = (body.prompt || '').replace(/\{\{/g, '').replace(/\}\}/g, '');
    const creditCost = body.creditCost || (body.is8K ? 30 : 2);
    const isRevision = body.isRevision || false;
    const isSketch = body.isSketch === 'EVET';
    const images = body.images || {};

    const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + userToken }
    });
    const userData = await userRes.json();
    if (!userData.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const rlRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/check_rate_limit', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + userToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_user_id: userData.id, p_window_seconds: 60, p_max_requests: 5 })
    });
    const rlData = await rlRes.json();
    if (String(rlData.allowed) !== 'true') return res.status(429).json({ success: false, message: 'Too many requests' });

    const deductAmount = action === 'prompt_builder' ? 4 : action === 'chat' ? 1 : creditCost;
    const creditRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/secure_deduct_credit', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + userToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_amount: deductAmount, p_action: action })
    });
    const creditData = await creditRes.json();
    if (String(creditData.success) !== 'true') return res.status(402).json({ success: false, message: 'Insufficient credits' });

    if (action === 'chat') return await handleChat(body, res);
    if (action === 'prompt_builder') return await handlePromptBuilder(body, res);
    if (action === 'presentation') return await handlePresentation(body, res);
    if (isRevision && images.currentRender) return await handleRevision(body, res);
    if (isSketch && body.sketchData) return await handleSketch(body, res);
    if (images.boxScene && images.boxItem) return await handlePlacement(body, res);
    return await handleRender(body, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
}

async function enrichPrompt(rawPrompt) {
  const sysMsg = "You are an elite architectural visualization prompt engineer. Expand the user concept into a detailed 8K render prompt in English. Include: 8K 7680x4320, raw photo, DSLR 50mm f/8 ISO 100, ray tracing, volumetric lighting. Pick ONE dominant material. Maximum TWO contrasting materials per furniture. Show craftsmanship details. Boucle must show fiber loops NOT plaster. Maximum 5-7 elements per scene. ONE accent color. NEVER repeat same style twice. Add random seed word. Output ONLY the prompt text.";
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: sysMsg }, { role: 'user', content: rawPrompt }], temperature: 0.4, max_tokens: 1000 })
  });
  const d = await r.json();
  return d.choices?.[0]?.message?.content || rawPrompt;
}

async function handleRender(body, res) {
  const enriched = await enrichPrompt(body.prompt || 'modern interior');
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: enriched, size: body.resolution === '1024x1024' ? '1024x1024' : '1536x1024', quality: 'medium' })
  });
  const d = await r.json();
  if (d.data?.[0]) return res.status(200).json({ candidates: [{ content: { parts: [{ inlineData: { data: d.data[0].b64_json, mimeType: 'image/png' } }] } }] });
  return res.status(500).json({ success: false, message: 'Render failed' });
}

async function handlePlacement(body, res) {
  const enriched = await enrichPrompt('Seamlessly integrate object into scene. Match perspective lighting scale shadows. ' + (body.prompt || 'place naturally'));
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: enriched, size: '1536x1024', quality: 'medium' })
  });
  const d = await r.json();
  if (d.data?.[0]) return res.status(200).json({ candidates: [{ content: { parts: [{ inlineData: { data: d.data[0].b64_json, mimeType: 'image/png' } }] } }] });
  return res.status(500).json({ success: false, message: 'Placement failed' });
}

async function handleRevision(body, res) {
  const enriched = 'Edit this architectural render: ' + (body.prompt || 'edit') + '. Keep everything else identical. Photorealistic result.';
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: enriched, size: '1536x1024', quality: 'medium' })
  });
  const d = await r.json();
  if (d.data?.[0]) return res.status(200).json({ candidates: [{ content: { parts: [{ inlineData: { data: d.data[0].b64_json, mimeType: 'image/png' } }] } }] });
  return res.status(500).json({ success: false, message: 'Revision failed' });
}

async function handleSketch(body, res) {
  const enriched = await enrichPrompt('Turn this rough sketch into photorealistic architectural render. ' + (body.prompt || ''));
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: enriched, size: '1536x1024', quality: 'medium' })
  });
  const d = await r.json();
  if (d.data?.[0]) return res.status(200).json({ candidates: [{ content: { parts: [{ inlineData: { data: d.data[0].b64_json, mimeType: 'image/png' } }] } }] });
  return res.status(500).json({ success: false, message: 'Sketch failed' });
}

async function handlePromptBuilder(body, res) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'Write the exact prompt to recreate this scene. ' + (body.prompt || '') }], temperature: 0.4, max_tokens: 4096 })
  });
  const d = await r.json();
  return res.status(200).json({ candidates: [{ content: { parts: [{ text: d.choices?.[0]?.message?.content || '' }] } }] });
}

async function handleChat(body, res) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'You are ADEULL AI, architectural visualization assistant. Be concise. Respond in: ' + (body.language || 'EN') }, { role: 'user', content: body.prompt || '' }], temperature: 0.5, max_tokens: 1024 })
  });
  const d = await r.json();
  return res.status(200).json({ candidates: [{ content: { parts: [{ text: d.choices?.[0]?.message?.content || '' }] } }] });
}

async function handlePresentation(body, res) {
  const texR = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: 'Material analysis board with magnified circular lens callouts showing textures. Clean white background. Professional architectural material board.', size: '1536x1024', quality: 'medium' })
  });
  const texD = await texR.json();
  const anaR = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'Analyze materials. Return ONLY JSON: {projectName, colors:[{hex,ral,name}], materials:[{title,desc,hex}]}. Translate to: ' + (body.language || 'EN') }], temperature: 0.3, max_tokens: 2000 })
  });
  const anaD = await anaR.json();
  let analysis = {};
  try { analysis = JSON.parse((anaD.choices?.[0]?.message?.content || '{}').replace(/```json/g,'').replace(/```/g,'').trim()); } catch(e) { analysis = { projectName: 'ANALYSIS', materials: [], colors: [] }; }
  return res.status(200).json({ textureImage: texD.data?.[0]?.b64_json || '', analysis });
}
