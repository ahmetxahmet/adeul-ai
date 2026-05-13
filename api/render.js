export const runtime = "nodejs";
export const maxDuration = 300;

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';
const SUPABASE_ANON = 'sb_publishable_4WYCqs4gxci5eQoOeysLWQ_5cqkdWaA';

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

    const deductAmount = action === 'prompt_builder' ? 4 : action === 'chat' ? 1 : creditCost;
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

function getSize(ratio, resolution) {
  if (resolution === '1024x1024') {
    if (ratio === '9:16') return '1024x1536';
    if (ratio === '16:9') return '1536x1024';
    return '1024x1024';
  }
  if (ratio === '9:16') return '1024x1536';
  if (ratio === '16:9') return '1536x1024';
  return '1024x1024';
}

async function enrichPrompt(rawPrompt) {
  const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
  const sysMsg = `You are an elite architectural visualization prompt engineer for ADEULL platform. The user gives you a concept in any language. You expand it into a highly detailed, world-class render prompt in English.

CRITICAL: Output ONLY the final prompt text. No greetings, no explanations, no quotes, no markdown.

EVERY PROMPT MUST INCLUDE:
Raw photo quality, maximum sharpness, full-frame DSLR, 50mm f/8, ISO 100, global illumination, ray tracing, volumetric lighting, professional architectural photography.

MATERIAL RULES:
- Do NOT default to wood, travertine, or boucle. These are BANNED unless user explicitly requests them.
- Pick ONE dominant material per scene from: polished concrete, honed limestone, Nero Marquina marble, Calacatta marble, onyx, quartzite, slate, terrazzo, brushed brass, blackened steel, patina copper, polished chrome, back-painted glass, raw plaster.
- Maximum TWO contrasting materials per furniture piece.

FURNITURE VARIETY - BANNED DEFAULTS:
- NEVER use boucle egg chair unless requested
- NEVER use travertine coffee table unless requested
- NEVER use curved sectional sofa unless requested
- NEVER use sunken living room or conversation pit EVER
- NEVER place furniture in a floor pit or depression
- Instead use: angular low-profile sofas, flat-arm club chairs, slab stone benches, cantilever desks, geometric shelving, platform daybeds, monolithic console tables

FABRIC TEXTURE:
- Boucle if requested: heavy woven shearling with visible individual fiber loops, dimensional depth, NOT flat plaster
- Velvet: light-catching pile with directional sheen
- Leather: visible grain, slight creasing, natural patina
- Mohair, wool tweed, heavy linen, raw silk, saddle leather, suede, cotton canvas - USE THESE MORE
- NEVER render any fabric as smooth flat surface or decorative plaster

COMPOSITION:
- Maximum 5-7 major elements. No clutter. No filler.
- ONE accent color only (butter yellow, cobalt blue, rust, burgundy, emerald, burnt sienna)
- ONE large art piece OR one broad-leaf plant. Never both.
- Architecture is hero, decoration is supporting cast.
- All furniture must sit on the floor naturally. NEVER sunken, NEVER in a pit.

DECORATIVE OBJECTS - BANNED DEFAULTS:
- NO olive branches, NO pampas grass, NO abstract beige paintings, NO monstera in gray pots
- Instead use: sculptural metal art, framed photography, glass sculptures, stacked books, geometric candle holders, brass bowls, hand-carved stone, bonsai, woven textile wall hangings

LIGHTING:
- NEVER single uniform light. Layer: directional key, warm ambient fill, accent spot.
- Colored glass (amber, smoke, cobalt) creates color pools on surfaces.

2026 DESIGN TRENDS (pick 2-3 per render, NOT all):
- Deep rich tones: burgundy, forest green, navy, chocolate brown
- Cast brass sculptural lighting with blown glass shades
- Coral-inspired organic Murano glass in smoky tones
- Woven leather strip sculptures
- Trompe l'oeil ceramic vases, collaged marble trays
- Gold satin-lacquered cabinets with mechanical reveals
- Hand-carved interlocking joinery
- Cathedral glass panels as table surfaces
- Custom woven tapestries as wall art
- Shag textured carpets in deep tones
- Tubular steel frame furniture
- Oval shaped sideboards and organic tables
- Hidden storage behind decorative panels
- Lacquered matte and satin surfaces
- Bas-relief sculptural room dividers
- Mediterranean lime wash walls with warm tones
- Board-formed concrete with visible formwork texture
- Large format continuous stone surfaces
- Flush surface brass spotlights
- Overstuffed cushions in simple wood frames

CRAFTSMANSHIP:
- Visible saddle stitching on leather, dovetail joints on wood, welded seams on metal
- Hand-troweled plaster texture, uneven ceramic glaze
- Slight imperfections desirable. Perfection feels fake.
- Every design must be physically manufacturable.

DIVERSITY: NEVER repeat same style, material palette, or decorative objects. Each prompt uniquely different. Add a random seed word at end.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: rawPrompt }],
      system: sysMsg,
      temperature: 0.4
    })
  });
  const d = await r.json();
  return d.content?.[0]?.text || rawPrompt;
}

async function gptImage(prompt, size) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: prompt, size: size || '1024x1024', quality: 'medium' })
  });
  return r.json();
}

async function gptImageWithRef(prompt, imageB64, size) {
  const messages = [{ role: 'user', content: [
    { type: 'text', text: prompt },
    { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + imageB64 } }
  ]}];
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o', messages: messages, max_tokens: 1500 })
  });
  const analysis = await r.json();
  const desc = analysis.choices?.[0]?.message?.content || prompt;
  return gptImage(desc, size);
}

function sendImage(res, d) {
  if (d.error) return res.status(500).json({ success: false, message: d.error.message });
  if (!d.data?.[0]?.b64_json) return res.status(500).json({ success: false, message: 'No image' });
  return res.status(200).json({ candidates: [{ content: { parts: [{ inlineData: { data: d.data[0].b64_json, mimeType: 'image/png' } }] } }] });
}

async function handleRender(body, res) {
  const enriched = await enrichPrompt(body.prompt || 'modern interior');
  const size = getSize(body.aspectRatio, body.resolution);
  const d = await gptImage(enriched, size);
  return sendImage(res, d);
}

async function handlePlacement(body, res) {
  const scene = body.images.boxScene;
  const item = body.images.boxItem;
  const prompt = 'Seamlessly integrate the object from the second reference image into the scene shown in the first reference image. Match perspective, lighting direction, color temperature, scale relative to room dimensions, contact shadows, ambient occlusion. Do NOT change room architecture walls ceiling windows. Do NOT add extra objects. ' + (body.prompt || 'place naturally');
  const size = getSize(body.aspectRatio, body.resolution);

  const formData = new FormData();
  if (scene && scene.length > 100) {
    const sceneBuf = Buffer.from(scene, 'base64');
    formData.append('image[]', new Blob([sceneBuf], {type: 'image/png'}), 'scene.png');
  }
  if (item && item.length > 100) {
    const itemBuf = Buffer.from(item, 'base64');
    formData.append('image[]', new Blob([itemBuf], {type: 'image/png'}), 'item.png');
  }
  formData.append('model', 'gpt-image-2');
  formData.append('prompt', prompt);
  formData.append('size', size);
  formData.append('quality', 'medium');

  const r = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY },
    body: formData
  });
  const d = await r.json();
  console.log('Placement response:', JSON.stringify(d).substring(0, 200));
  return sendImage(res, d);
}

async function handleRevision(body, res) {
  const currentRender = body.images.currentRender;
  const prompt = 'Edit this architectural render. Make ONLY this change: ' + (body.prompt || 'edit') + '. Keep EVERYTHING else identical - composition, lighting, camera angle, materials, all other objects, background, shadows, reflections.';
  const size = getSize(body.aspectRatio, body.resolution);

  const formData = new FormData();
  if (currentRender && currentRender.length > 100) {
    const buf = Buffer.from(currentRender, 'base64');
    formData.append('image[]', new Blob([buf], {type: 'image/png'}), 'render.png');
  }
  formData.append('model', 'gpt-image-2');
  formData.append('prompt', prompt);
  formData.append('size', size);
  formData.append('quality', 'medium');

  const r = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY },
    body: formData
  });
  const d = await r.json();
  console.log('Revision response:', JSON.stringify(d).substring(0, 200));
  return sendImage(res, d);
}

async function handleSketch(body, res) {
  const sketch = body.sketchData;
  const prompt = 'Transform this rough architectural sketch into a highly detailed photorealistic render. Preserve the exact geometry and layout of the sketch. Add realistic materials, textures, lighting. ' + (body.prompt || '');
  const size = getSize(body.aspectRatio, body.resolution);

  const formData = new FormData();
  if (sketch && sketch.length > 100) {
    const buf = Buffer.from(sketch, 'base64');
    formData.append('image[]', new Blob([buf], {type: 'image/png'}), 'sketch.png');
  }
  formData.append('model', 'gpt-image-2');
  formData.append('prompt', prompt);
  formData.append('size', size);
  formData.append('quality', 'medium');

  const r = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY },
    body: formData
  });
  const d = await r.json();
  console.log('Sketch response:', JSON.stringify(d).substring(0, 200));
  return sendImage(res, d);
}

async function handlePromptBuilder(body, res) {
  const images = body.images || {};
  const ref = images.boxRef || images.boxScene || images.boxDesign || '';
  let messages = [];
  if (ref && ref.length > 100) {
    messages = [{ role: 'user', content: [
      { type: 'text', text: 'SCAN THIS IMAGE PIXEL BY PIXEL. ' + (body.prompt || 'Write the exact prompt to recreate this scene') + '. Start with lowercase letter. NEVER reference the image file. Describe ONLY what you see. Every material must be specific like natural white oak with matte lacquer. Describe lighting direction color temperature shadows. End with: 8K ultra-high resolution, DSLR 50mm f/8 ISO 100, ray tracing, volumetric light, extreme photorealism.' },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + ref } }
    ]}];
  } else {
    messages = [{ role: 'user', content: body.prompt || 'Write a detailed architectural visualization prompt' }];
  }
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: messages, temperature: 0.4, max_tokens: 4096 })
  });
  const d = await r.json();
  return res.status(200).json({ candidates: [{ content: { parts: [{ text: d.choices?.[0]?.message?.content || '' }] } }] });
}

async function handleChat(body, res) {
  const sysPrompt = 'You are ADEULL AI, a powerful architectural visualization platform assistant. You ARE a render engine. Rules: 1. Be concise, professional. 2. You generate renders, presentations, material boards. 3. Features: INTERIOR, EXTERIOR, ARCHITECTURE, DESIGN, PLAN RESIZE, PRESENTATION, 8K upscale, Prompt Builder. 4. Plans: Starter $9/mo (20 credits), Pro $19/mo (60 credits), Studio $39/mo (150 credits), Agency $79/mo (350 credits). 5. If error reported: suggest refresh page, clear cache, try different image format. 6. Report bugs via button at bottom right. Language: ' + (body.language || 'EN');
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
  let texPrompt = 'Create a professional material analysis board with magnified circular lens callouts showing extreme close-up textures. Clean white background. 3-5 material callouts with thin arrows.';
  if (ref && ref.length > 100) {
    const analysisR = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: [
        { type: 'text', text: 'Analyze this image. List all visible materials with specific names (e.g. Carrara marble, brushed brass, bouclé wool). Describe each texture in detail.' },
        { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + ref } }
      ]}], temperature: 0.3, max_tokens: 1000 })
    });
    const analysisD = await analysisR.json();
    texPrompt += ' Materials found: ' + (analysisD.choices?.[0]?.message?.content || '');
  }
  const texD = await gptImage(texPrompt, '1024x1024');
  if (texD.error) return res.status(500).json({ success: false, message: texD.error.message });

  const anaR = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'Return ONLY valid JSON, no markdown. Structure: {"projectName":"name","colors":[{"hex":"#HEX","ral":"RAL XXXX","name":"Color Name"}],"materials":[{"title":"Material","desc":"Description","hex":"#HEX"}]}. Translate to: ' + (body.language || 'EN') + '. Analyze architectural materials.' }], temperature: 0.3, max_tokens: 2000 })
  });
  const anaD = await anaR.json();
  let analysis = {};
  try { analysis = JSON.parse((anaD.choices?.[0]?.message?.content || '{}').replace(/```json/g, '').replace(/```/g, '').trim()); } catch (e) { analysis = { projectName: 'ANALYSIS', materials: [], colors: [] }; }
  return res.status(200).json({ textureImage: texD.data?.[0]?.b64_json || '', analysis });
}
