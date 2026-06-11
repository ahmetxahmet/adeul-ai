export const runtime = "nodejs";
export const maxDuration = 300;

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';
const SUPABASE_ANON = 'sb_publishable_4WYCqs4gxci5eQoOeysLWQ_5cqkdWaA';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=';
const GEMINI_CHEAP_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=';

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

    const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + userToken }
    });
    const userData = await userRes.json();
    if (!userData.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const rlRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/check_rate_limit', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + userToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_user_id: userData.id, p_window_seconds: 60, p_max_requests: 5 })
    });
    const rlData = await rlRes.json();
    if (String(rlData.allowed) !== 'true') return res.status(429).json({ success: false, message: 'Too many requests' });

    const deductAmount = action === 'prompt_builder' ? 2 : action === 'chat' ? 0 : action === 'presentation' ? 2 : creditCost;
    const creditRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/secure_deduct_credit', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + userToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_amount: deductAmount, p_action: action })
    });
    const creditData = await creditRes.json();
    if (String(creditData.success) !== 'true') return res.status(402).json({ success: false, message: 'Insufficient credits' });

    if (action === 'chat') return handleChat(body, res);
    if (action === 'prompt_builder') return handlePromptBuilder(body, res);
    if (action === 'presentation') return handlePresentation(body, res);
    if (isRevision && images.currentRender) return handleRevision(body, res);
    if (isSketch && body.sketchData) return handleSketch(body, res);
    if (images.boxScene && images.boxItem) return handlePlacement(body, res);
    return handleRender(body, res);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

function getGeminiSize(ratio, resolution) {
  if (resolution === '4096x4096' || resolution === '4K') return '4K';
  if (resolution === '2048x2048' || resolution === '2K') return '2K';
  return '1K';
}

function getGptSize(ratio) {
  if (ratio === '9:16') return '1024x1536';
  if (ratio === '16:9') return '1536x1024';
  return '1024x1024';
}

async function geminiGenerate(promptText, imageB64List, ratio, resolution) {
  const parts = [{ text: promptText }];
  if (imageB64List) {
    for (const img of imageB64List) {
      if (img && img.length > 100) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: img } });
      }
    }
  }
  const r = await fetch(GEMINI_URL + GEMINI_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: parts }],
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseModalities: ['IMAGE', 'TEXT'],
        imageConfig: {
          imageSize: getGeminiSize(ratio, resolution),
          aspectRatio: ratio || '16:9'
        }
      }
    })
  });
  return r.json();
}

function sendGeminiImage(res, d) {
  if (d.error) return res.status(500).json({ success: false, message: d.error.message || JSON.stringify(d.error) });
  if (d.candidates && d.candidates[0]?.content?.parts) {
    for (const part of d.candidates[0].content.parts) {
      if (part.inlineData) {
        return res.status(200).json({ candidates: [{ content: { parts: [{ inlineData: { data: part.inlineData.data, mimeType: 'image/png' } }] } }] });
      }
    }
  }
  return res.status(500).json({ success: false, message: 'No image generated' });
}

async function enrichPrompt(rawPrompt) {
  const sysMsg = `You are ADEULL prompt engineer. Expand user concept into a photorealistic architectural render prompt in English.

STRICT RULES:
- Describe like a real magazine photo you remember. Natural, specific, believable.
- ONE dominant material per scene. Name it precisely: not marble but honed Pietra Grey limestone, not wood but fumed European oak with open grain.
- Maximum 5 objects total. Every object earns its place. No filler.
- ONE accent color only. Rest neutral.
- Architecture first, decoration second.

TEXTURES: Do NOT describe fabric or material textures in detail. Just name the material simply: velvet, linen, leather, wool. Let the render engine handle the texture naturally.

MATERIAL VARIETY — ROTATE THESE:
Surfaces: polished concrete, board-formed concrete, lime plaster, micro-cement, honed limestone, Nero Marquina marble, green Guatemala marble, onyx, quartzite, terrazzo, slate
Metals: blackened steel, patina copper, satin brass, raw bronze, anodized aluminum, brushed nickel
Wood: fumed oak, bleached ash, smoked walnut, raw cedar, ebonized maple
Glass: fluted glass, smoked glass, amber cathedral glass, back-painted glass, reeded glass

NEVER DEFAULT TO: travertine table, egg chair, curved sectional, sunken pit, pampas grass, olive branches, monstera in gray pot, abstract beige painting

LIGHTING: Three layers always — directional key light with shadows, warm ambient fill, one accent spot on a material detail.

2026 DESIGN REFERENCE (pick 2 max):
- Deep burgundy, forest green, navy, chocolate tones
- Sculptural single-material lighting
- Hand-carved joinery details
- Overstuffed cushions in simple frames
- Lacquered matte and satin surfaces
- Mediterranean lime wash walls

Output ONLY the prompt text. Nothing else.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: rawPrompt }], system: sysMsg, temperature: 0.4 })
  });
  const d = await r.json();
  return d.content?.[0]?.text || rawPrompt;
}

async function handleRender(body, res) {
  const userPrompt = body.prompt || 'modern interior';
  let finalPrompt;

  if (userPrompt.length > 100) {
    finalPrompt = userPrompt + ' Ultra photorealistic, maximum sharpness, professional architectural photography.';
  } else {
    finalPrompt = await enrichPrompt(userPrompt);
  }

  console.log('RENDER - prompt length:', userPrompt.length, 'enriched:', userPrompt.length <= 100);
  const d = await geminiGenerate(finalPrompt, null, body.aspectRatio, body.resolution);
  return sendGeminiImage(res, d);
}

async function handlePlacement(body, res) {
  const promptText = 'Seamlessly integrate the object from the second image into the scene shown in the first image. Follow these rules: 1. Match exact camera angle vanishing points and perspective. 2. Match light direction intensity color temperature and shadow patterns. 3. Scale object correctly relative to room dimensions. 4. Object must sit naturally on floor with contact shadows and reflections. 5. Do NOT change room architecture walls ceiling windows doors. 6. Do NOT add extra objects. User instruction: ' + (body.prompt || 'place naturally') + ' OUTPUT: Ultra-photorealistic integration, invisible edit.';
  const images = [body.images.boxScene, body.images.boxItem];
  const d = await geminiGenerate(promptText, images, body.aspectRatio, body.resolution);
  return sendGeminiImage(res, d);
}

async function handleRevision(body, res) {
  const promptText = 'You are a precision image editor. Make ONLY this change: ' + (body.prompt || 'edit') + '. Preserve EVERYTHING else exactly: composition, lighting, camera angle, materials, all other objects, background, shadows. Do NOT regenerate entire scene. Do NOT change camera angle unless requested. Return edited image with flawless blending.';
  const d = await geminiGenerate(promptText, [body.images.currentRender], body.aspectRatio, body.resolution);
  return sendGeminiImage(res, d);
}

async function handleSketch(body, res) {
  const promptText = 'Turn this rough sketch into a highly detailed photorealistic architectural render. Ultra-high quality, maximum sharpness, professional photography grade. Strictly preserve the original geometry and layout. Instruction: ' + (body.prompt || 'photorealistic render');
  const d = await geminiGenerate(promptText, [body.sketchData], body.aspectRatio, body.resolution);
  return sendGeminiImage(res, d);
}

async function handlePromptBuilder(body, res) {
  const images = body.images || {};
  const ref = images.boxRef || images.boxScene || images.boxDesign || '';
  let promptText = 'SCAN THIS IMAGE PIXEL BY PIXEL. ' + (body.prompt || 'Write the exact prompt to recreate this scene') + '. RULES: 1. Start lowercase. 2. NEVER reference the image. 3. Describe ONLY what you see. 4. Every material specific: not wood but natural white oak with matte lacquer. 5. Describe lighting direction and color temperature. 6. End with: professional architectural photography, DSLR 50mm f/8 ISO 100, ray tracing, extreme photorealism.';
  if (ref && ref.length > 100) {
    const d = await geminiGenerate(promptText, [ref], '16:9', '1K');
    if (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) {
      for (const part of d.candidates[0].content.parts) {
        if (part.text) return res.status(200).json({ candidates: [{ content: { parts: [{ text: part.text }] } }] });
      }
    }
    return res.status(200).json({ candidates: [{ content: { parts: [{ text: 'Could not analyze image' }] } }] });
  }
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: body.prompt || 'Write a detailed architectural visualization prompt' }], temperature: 0.4, max_tokens: 4096 })
  });
  const d = await r.json();
  return res.status(200).json({ candidates: [{ content: { parts: [{ text: d.choices?.[0]?.message?.content || '' }] } }] });
}

async function handleChat(body, res) {
  const sysPrompt = 'You are ADEULL AI, a powerful architectural visualization platform assistant. You ARE a render engine. Be concise, professional. Features: INTERIOR, EXTERIOR, ARCHITECTURE, DESIGN, PLAN RESIZE, PRESENTATION, 8K upscale, Prompt Builder. Plans: Starter $9/mo (20 credits), Pro $19/mo (60 credits), Studio $39/mo (150 credits), Agency $79/mo (350 credits). If error: suggest refresh, clear cache, different image format. Report bugs via button at bottom right. Language: ' + (body.language || 'EN');
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: body.prompt || '' }], temperature: 0.5, max_tokens: 1024 })
  });
  const d = await r.json();
  return res.status(200).json({ candidates: [{ content: { parts: [{ text: d.choices?.[0]?.message?.content || '' }] } }] });
}

async function handlePresentation(body, res) {
  const ref = body.images?.boxRef || '';

  let texPrompt = 'Material analysis board: keep product in center, add magnified circular lens callouts showing close-up textures of each material. Thin arrows from product to callouts. Clean white background. 3-5 callouts.';
  const texR = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: texPrompt, size: '1024x1024', quality: 'low' })
  });
  const texD = await texR.json();
  let textureBase64 = texD.data?.[0]?.b64_json || '';

  const anaR = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'You are a Senior Interior Designer. Analyze architectural materials. RETURN ONLY VALID JSON. NO MARKDOWN. Translate to: ' + (body.language || 'EN') + '. Structure: {"projectName":"name","colors":[{"hex":"#HEX","ral":"RAL XXXX","name":"Name"}],"materials":[{"title":"Material","desc":"Description","hex":"#HEX"}]}. Extract 3-5 real materials with real RAL codes.' }], temperature: 0.3, max_tokens: 2000 })
  });
  const anaD = await anaR.json();
  let analysis = {};
  try { analysis = JSON.parse((anaD.choices?.[0]?.message?.content || '{}').replace(/```json/g, '').replace(/```/g, '').trim()); } catch (e) { analysis = { projectName: 'ANALYSIS', materials: [], colors: [] }; }
  return res.status(200).json({ textureImage: textureBase64, analysis });
}
