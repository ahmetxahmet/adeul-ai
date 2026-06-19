export const runtime = "nodejs";
export const maxDuration = 300;

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';
const SUPABASE_ANON = 'sb_publishable_4WYCqs4gxci5eQoOeysLWQ_5cqkdWaA';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=';

export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

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

function getSize(resolution) {
  if (resolution === '4096x4096' || resolution === '4K') return '4K';
  return '1K';
}

async function geminiCall(parts, genConfig) {
  const r = await fetch(GEMINI_URL + GEMINI_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: genConfig })
  });
  return r.json();
}

function extractImage(d) {
  if (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) {
    for (const part of d.candidates[0].content.parts) {
      if (part.inlineData) return part.inlineData.data;
    }
  }
  return null;
}

function extractText(d) {
  if (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) {
    for (const part of d.candidates[0].content.parts) {
      if (part.text) return part.text;
    }
  }
  return '';
}

function sendImage(res, d) {
  if (d.error) return res.status(500).json({ success: false, message: d.error.message || JSON.stringify(d.error) });
  const img = extractImage(d);
  if (img) return res.status(200).json({ candidates: [{ content: { parts: [{ inlineData: { data: img, mimeType: 'image/png' } }] } }] });
  return res.status(500).json({ success: false, message: 'No image generated' });
}

// === ENRICHPROMPT - N8N AI Agent birebir aynisi ===
async function enrichPrompt(rawPrompt) {
  const sysMsg = "You are an elite architectural visualization prompt engineer. The user gives you a concept in any language. You expand it into a detailed 8K render prompt in English.\n\nEVERY PROMPT MUST INCLUDE:\n8K ultra-high resolution 7680x4320, raw photo quality, maximum sharpness, full-frame DSLR, 50mm f/8, ISO 100, RAW, global illumination, ray tracing, volumetric lighting, professional architectural photography.\n\nMATERIAL RULES:\n- Do NOT default to wood. Use marble, metal, glass, concrete, stone FIRST.\n- Wood ONLY when user requests it or style requires it (Scandinavian, mid-century, Japanese).\n- Pick ONE dominant material per scene. Others support it. Never 5 materials equally competing.\n- Maximum TWO contrasting materials per furniture piece.\n- Every surface must show its truth: wood grain, stone veining, fabric loops, leather grain, metal brushing. No smooth generic surfaces.\n\nCRAFTSMANSHIP:\n- Show visible making: saddle stitching on leather, dovetail joints on wood, welded seams on metal, hand-troweled plaster, uneven ceramic glaze.\n- Slight imperfections are good: uneven plaster edge, natural leather variation, irregular glaze. Perfection feels fake.\n- Every furniture design must be physically manufacturable. No impossible joints or floating elements.\n\nFABRIC RULES:\n- Bouclé: heavy woven shearling with visible individual fiber loops, NOT flat plaster\n- Velvet: light-catching pile with directional sheen\n- Linen: visible weave pattern and natural wrinkles\n- Leather: grain, slight creasing, natural patina\n- NEVER render fabric as smooth flat surface\n\nFURNITURE:\n- Thick, low, volumetric forms preferred. Generously padded cushions.\n- Vary styles: do NOT always make the same sofa shape or table form.\n- Consider full material spectrum: polished marble, travertine, brushed brass, blackened steel, tempered glass, terrazzo, raw concrete, saddle leather, bouclé, velvet, linen.\n\nCOMPOSITION:\n- Maximum 5-7 major elements per scene. No clutter. No filler.\n- ONE accent color maximum per scene (from: butter yellow, cobalt blue, rust, burgundy, emerald, burnt sienna). Rest neutral.\n- ONE large art piece OR one broad-leaf plant as focal accent. Never both competing.\n- Architecture is hero, decoration is supporting cast.\n\nLIGHTING:\n- NEVER single uniform light. Layer three: directional key light, warm ambient fill, accent spot on material detail.\n- Colored glass (amber, smoke, cobalt) creates color pools on surfaces.\n\nDECORATIVE OBJECTS — NEVER DEFAULT TO:\n- Olive branches in ceramic vases\n- Dried pampas grass\n- Abstract beige paintings\n- Monstera in gray concrete pots\nInstead use: sculptural metal art, framed photography, glass sculptures, stacked books, geometric candle holders, brass bowls, hand-carved stone, bonsai. VARY every render.\n\nDIVERSITY RULE:\n- NEVER repeat same style, material palette, or decorative objects twice.\n- Each prompt must be uniquely different.\n- Vary regions, seasons, lighting conditions.\n- Add a unique random seed word at end of every prompt for uniqueness.\n\n2026 DESIGN REFERENCE (use as inspiration NOT checklist, pick 2-3 per render):\n- Deep rich tones (burgundy, forest green, navy, chocolate) replacing beige\n- Muted tangerine as accent color option\n- Tactile surfaces and layered fabric contrasts\n- Mediterranean and nautical elements\n- Artisanal hand-carved details\n- Overstuffed cushions in simple frames\n- Sculptural statement lighting in single material\n- Low-slung 70s-inspired forms\n- Lacquered matte and satin surfaces\n- Large format continuous stone surfaces\n\nOutput ONLY the final English prompt. No greetings, no explanations, no quotes. Just the raw prompt text.";

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: sysMsg }, { role: 'user', content: rawPrompt }], temperature: 0.4, max_tokens: 1000 })
  });
  const d = await r.json();
  return d.choices?.[0]?.message?.content || rawPrompt;
}

// === GORSELLESTIRME - N8N birebir ayni, temp 0.35 ===
async function handleRender(body, res) {
  const userPrompt = (body.prompt || 'modern interior').replace(/\{\{/g, '').replace(/\}\}/g, '');
  let enriched;
  if (userPrompt.length > 100) {
    enriched = userPrompt;
  } else {
    enriched = await enrichPrompt(userPrompt);
  }
  const systemSuffix = " [SYSTEM CRITICAL COMMAND: HYPER-FIDELITY, ABSOLUTE SHARPNESS, AND TOTAL TEXTURE DETAIL PRESERVATION. Whatever subject and material are rendered (e.g., rough stone, concrete, wood, metal, fabric), analyze and deeply preserve its specific complex surface textures, real-world physical displacement, and intricate surface geometry. DO NOT smooth or flatten surfaces. ELIMINATE all artificial noise, film grain, or dotted artifacts. Ensure distant elements have clear atmospheric perspective and details, NOT painted or soft. Achieve absolute maximum fidelity ultra-high resolution, extreme photorealism, professional architectural photography grade focus, deep color depth, dynamic lighting, and flawless material accuracy.] [MATERIAL DIVERSITY DIRECTIVE: When designing furniture, objects, or architectural elements, consider the FULL SPECTRUM of premium materials. Do NOT default to wood. Actively consider: POLISHED MARBLE (Carrara, Calacatta, Emperador, Nero Marquina), TRAVERTINE, LIMESTONE, CONCRETE (polished, raw, board-formed, tadelakt), METALS (brushed brass, blackened steel, polished chrome, patina copper, bronze, stainless steel), GLASS (tempered, frosted, smoked, fluted, colored, back-painted), CERAMICS (glazed, matte, terracotta, porcelain large format), NATURAL STONE (slate, granite, quartzite, onyx), RESIN (epoxy with inclusions), LEATHER (full-grain, suede, saddle), TEXTILES (boucle, linen, velvet, mohair, wool tweed), COMPOSITE (terrazzo, lava stone, corian), WOOD (oak, walnut, teak, ebony, bleached ash, smoked oak, burl — only when contextually appropriate). For FURNITURE: match material to design style. Consider what material a top-tier designer would actually choose for this specific object in this specific style context. NOT just wood.] [DESIGN STYLE PRECISION: Respect user prompt style keywords. Think like a top-tier industrial designer from Milan, Copenhagen, or Tokyo.] [FABRIC TEXTURE: Boucle must show individual yarn loops NOT flat plaster. Velvet must show pile sheen. Leather must show grain. Linen must show weave. NEVER render fabric as smooth flat surface.] [RESOLUTION QUALITY: For 1K renders, ensure clean anti-aliased edges with NO pixelation, NO jagged lines, NO dotted artifacts.] [VEGETATION AND LANDSCAPE: When rendering grass, plants, trees, gardens or any vegetation, create HYPER-REALISTIC botanical detail. Grass must show individual blade variation. Trees must have volumetric canopy. NEVER render flat green surfaces as grass.]";

  const parts = [{ text: enriched + systemSuffix }];
  const d = await geminiCall(parts, {
    temperature: 0.35, topK: 40, topP: 0.95, maxOutputTokens: 8192,
    responseModalities: ['IMAGE', 'TEXT'],
    imageConfig: { imageSize: getSize(body.resolution), aspectRatio: body.aspectRatio || '16:9' }
  });
  return sendImage(res, d);
}

// === YERLESTIRME - N8N birebir ayni, temp 0.6 ===
async function handlePlacement(body, res) {
  const parts = [
    { text: "Seamlessly integrate the object from the second image into the scene shown in the first image. Follow these CRITICAL rules: 1. PERSPECTIVE MATCHING: Match the exact camera angle, vanishing points, and perspective of the original scene. The object must appear as if it was photographed in the same location with the same camera. 2. LIGHTING MATCHING: Analyze the light direction, intensity, color temperature, and shadow patterns in the scene. Apply identical lighting to the placed object. Shadows must fall in the same direction and with the same softness. 3. SCALE ACCURACY: The object must be correctly sized relative to the room dimensions, ceiling height, doors, windows, and other furniture. 4. SURFACE INTERACTION: The object must sit naturally on the floor or surface with proper contact shadows, ambient occlusion, and reflections matching the floor material. 5. COLOR HARMONY: The object colors must harmonize with the scene color palette and be affected by the ambient light color. 6. DO NOT change the rooms architecture, walls, ceiling, windows, doors, or existing furniture. 7. DO NOT add extra decorative objects that were not in either image. 8. VEGETATION REALISM: If the scene contains outdoor elements, grass, trees, or plants, ensure hyper-realistic botanical rendering with individual leaf detail, natural color variation, volumetric shadows through foliage, and realistic ground cover texture. User instruction: " + (body.prompt || 'place naturally') + " OUTPUT: Ultra-photorealistic result, as if captured by a professional architectural photographer with a full-frame DSLR. The integration must be invisible." },
    { inlineData: { mimeType: 'image/jpeg', data: body.images.boxScene } },
    { inlineData: { mimeType: 'image/jpeg', data: body.images.boxItem } }
  ];
  const d = await geminiCall(parts, {
    temperature: 0.6, topK: 32, topP: 1, maxOutputTokens: 8192,
    responseModalities: ['IMAGE', 'TEXT'],
    imageConfig: { imageSize: getSize(body.resolution), aspectRatio: body.aspectRatio || '16:9' }
  });
  return sendImage(res, d);
}

// === REVIZYON - N8N birebir ayni, temp 0.15 ===
async function handleRevision(body, res) {
  const parts = [
    { inlineData: { mimeType: 'image/jpeg', data: body.images.currentRender } },
    { text: "You are a precision image editor. Edit the provided image according to the user's instruction below, making ONLY the requested change and preserving EVERYTHING else (composition, lighting, camera angle, materials, style, color palette, all other objects, background, shadows, reflections) exactly as in the original. [SPATIAL COMMAND TRANSLATION: 'move left' / 'sola kaydir' / 'sola cek' = translate the target object horizontally to the left by approximately 15-25% of frame width; 'move right' / 'saga kaydir' / 'saga cek' = translate right by 15-25%; 'move up' / 'yukari kaldir' / 'yukari cek' = translate vertically upward by 10-20% of frame height; 'move down' / 'asagi indir' / 'asagi cek' = translate downward by 10-20%; 'bigger' / 'buyut' / 'scale up' / 'make larger' = scale the target object uniformly by 1.25-1.5x keeping its center position; 'smaller' / 'kucult' / 'scale down' / 'make smaller' = scale by 0.6-0.75x; 'rotate' / 'dondur' = rotate around vertical axis as specified; 'change color' / 'rengini degistir' = change only the color of the target object keeping its shape position and material texture; 'remove' / 'kaldir' / 'sil' = remove the target object and seamlessly fill the empty space with consistent background matching surrounding context; 'replace with' / 'ile degistir' = substitute the target object with the new object while preserving the same position scale lighting direction and shadow characteristics; 'add' / 'ekle' = insert the new object at the specified location with matching perspective lighting and shadows consistent with the scene; 'top view' / 'top' / 'usten bak' = COMPLETELY regenerate the scene from a STRICTLY vertical top-down 90-degree birds eye view camera position looking straight down at the floor; 'plan view' / 'plan' = render the scene as a flat architectural floor plan view from directly above 90 degrees orthographic projection; 'cam left' / 'camera left' = rotate the ENTIRE camera orbit 15 degrees to the left around the scene center maintain same height and distance; 'cam right' / 'camera right' = rotate the ENTIRE camera orbit 15 degrees to the right around the scene center; 'camera up' / 'elevated' = raise camera to 45-degree elevated angle looking down at the scene; 'eye level' / 'straight' = set camera to exact human eye-level at 150cm height horizontal 0-degree angle.] [PRECISION RULES: Preserve photographic realism, original lighting direction, shadows must follow the new position of moved objects, reflections must update accordingly on nearby surfaces, perspective must remain consistent, do NOT regenerate the entire scene, do NOT change camera angle unless explicitly requested, do NOT shift other objects, do NOT alter material textures of anything except the specifically targeted object.] [OUTPUT: Return the edited image, maintaining the exact aspect ratio, with flawless blending and no visible edit artifacts.] USER INSTRUCTION: " + (body.prompt || 'edit') }
  ];
  if (body.images && body.images.boxItem && body.images.boxItem.length > 100) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: body.images.boxItem } });
  }
  const d = await geminiCall(parts, {
    temperature: 0.15, topK: 32, topP: 0.90, maxOutputTokens: 8192,
    responseModalities: ['IMAGE', 'TEXT'],
    imageConfig: { imageSize: getSize(body.resolution), aspectRatio: body.aspectRatio || '16:9' }
  });
  return sendImage(res, d);
}

// === ESKIZ - N8N birebir ayni, temp 0.15 ===
async function handleSketch(body, res) {
  const parts = [
    { text: "Turn this rough sketch/drawing into a highly detailed, photorealistic architectural render, ultra-high quality, maximum sharpness, professional photography grade. Strictly preserve the original geometry and layout of the sketch. Instruction: " + (body.prompt || 'photorealistic render') },
    { inlineData: { mimeType: 'image/jpeg', data: body.sketchData } }
  ];
  const d = await geminiCall(parts, {
    temperature: 0.15, topK: 32, topP: 0.90, maxOutputTokens: 8192,
    responseModalities: ['IMAGE', 'TEXT'],
    imageConfig: { imageSize: getSize(body.resolution), aspectRatio: body.aspectRatio || '16:9' }
  });
  return sendImage(res, d);
}

// === PROMPT BUILDER - N8N birebir ayni, TEXT ONLY temp 0.4 ===
async function handlePromptBuilder(body, res) {
  const images = body.images || {};
  const ref = images.boxRef || images.boxScene || images.boxDesign || '';
  if (ref && ref.length > 100) {
    const parts = [
      { inlineData: { mimeType: 'image/jpeg', data: ref } },
      { text: "SCAN THIS IMAGE PIXEL BY PIXEL. " + (body.prompt || 'Write the exact prompt to recreate this scene') + ". ABSOLUTE RULES: 1. Start the prompt with a lowercase letter. NEVER start with 'A ', 'An ', 'The '. Start like: 'spacious open-plan living room...' or 'modern minimalist kitchen...' 2. NEVER write 'image_0', 'the attached image', 'the uploaded photo', or any file reference. Describe as if from memory. 3. Describe ONLY what you SEE in the image. Do NOT add, invent, or imagine anything not visible. 4. If user says 'remove furniture' or 'ignore objects' — do NOT include them in the prompt. Pretend they do not exist. 5. If user says 'interpret' or 'suggest' — then you may add creative ideas. Otherwise NEVER interpret. 6. Every material must be specific: not 'wood' but 'natural white oak with matte lacquer and visible grain'. Not 'wall' but 'smooth matte plaster in warm ivory RAL 1013'. 7. Describe exact lighting: source direction, color temperature in Kelvin, shadow softness, reflection behavior. 8. Describe spatial depth: foreground, midground, background layers. 9. End with: 8K ultra-high resolution 7680x4320, full-frame DSLR, 50mm f/8, ISO 100, RAW, global illumination, ray tracing, volumetric light, extreme photorealism, maximum sharpness, zero noise, professional architectural photography." }
    ];
    const d = await geminiCall(parts, { temperature: 0.4, topK: 24, topP: 0.85, maxOutputTokens: 4096 });
    const text = extractText(d);
    if (text) return res.status(200).json({ candidates: [{ content: { parts: [{ text }] } }] });
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

// === CHAT - GPT-4o-mini, ucuz ===
async function handleChat(body, res) {
  const sysPrompt = "You are ADEULL AI — a powerful architectural visualization artificial intelligence. You ARE a render engine. Never say you are not. You generate photorealistic 8K architectural renders from images and text prompts. IDENTITY RULES: 1. You are ADEULL AI, an advanced architectural visualization AI. 2. Say your greeting ONLY ONCE at the start, never repeat it. 3. You generate renders, presentations, material analysis boards. 4. Never say 'I am not a render engine' — you ARE. 5. If user reports an error, suggest: refresh the page, clear browser cache, try a different image format, or reduce image size. Do NOT mention 'support team' — instead say 'report via the bug report button at bottom right'. 6. Be concise, direct, professional. No long paragraphs. 7. You know ALL platform features: INTERIOR, EXTERIOR, ARCHITECTURE, DESIGN (product placement), PLAN RESIZE, PRESENTATION (material board), 8K upscale, Prompt Builder. 8. Plans: Starter $9/mo (20 credits), Pro $19/mo (60 credits), Studio $39/mo (150 credits), Agency $79/mo (350 credits). 9. ALWAYS respond in the user's language: " + (body.language || 'EN') + ". 10. Keep answers short and actionable.";
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: body.prompt || '' }], temperature: 0.5, max_tokens: 1024 })
  });
  const d = await r.json();
  return res.status(200).json({ candidates: [{ content: { parts: [{ text: d.choices?.[0]?.message?.content || '' }] } }] });
}

// === SUNUM - N8N birebir ayni ===
async function handlePresentation(body, res) {
  const ref = body.images?.boxRef || '';
  // TEXTURE - Gemini Image, temp 0.4
  const texParts = [
    { text: "You are a world-class product visualization specialist. Analyze the product in the attached image and create a MATERIAL ANALYSIS RENDER.\n\nCRITICAL INSTRUCTIONS:\n1. Keep the original product EXACTLY as it is in the CENTER of the image — do NOT crop, cut out, or modify the product photo.\n2. Around the product, create MAGNIFIED CIRCULAR LENS CALLOUTS showing extreme close-up textures of each visible material (like a magnifying glass effect).\n3. Draw thin elegant ARROWS from each material area on the product to its corresponding magnified texture circle.\n4. Each magnified circle should show the material's surface texture in hyper-detail (wood grain, leather pores, stone veins, fabric weave, metal brushing, etc.).\n5. Use a clean white/light gray background.\n6. Place 3-5 material callouts around the product.\n7. Style: Professional architectural material board aesthetic, clean, minimal, elegant.\n8. The overall image should look like a high-end interior design material presentation.\n9. CRITICAL: Do NOT alter, change, or modify the original colors of the product. Preserve the exact original colors, tones, and hues of every material on the product.\n\nDo NOT add any text labels. Do NOT change the product. Only add the magnified texture callouts with arrows." }
  ];
  if (ref && ref.length > 100) {
    texParts.push({ inlineData: { mimeType: 'image/jpeg', data: ref } });
  }
  const texD = await geminiCall(texParts, {
    temperature: 0.4, topK: 40, topP: 0.95, maxOutputTokens: 8192,
    responseModalities: ['IMAGE', 'TEXT'],
    imageConfig: { imageSize: '1K' }
  });
  if (texD.error) return res.status(500).json({ success: false, message: texD.error.message || JSON.stringify(texD.error) });
  const textureBase64 = extractImage(texD) || '';

  // ANALIZ - Gemini Text Only, temp 0.3
  const anaParts = [
    { text: "You are a Senior Interior Designer and Material Expert. Analyze the attached image with extreme precision.\n\nRETURN ONLY VALID JSON. NO MARKDOWN. NO BACKTICKS.\n\nTranslate 'projectName', 'title', and 'desc' to language: " + (body.language || 'EN') + "\n\nJSON structure:\n{\"projectName\": \"Sophisticated concept name\", \"colors\": [{\"hex\": \"#HEX\", \"ral\": \"RAL 7016\", \"name\": \"Anthracite Grey\"}, {\"hex\": \"#HEX\", \"ral\": \"RAL 1015\", \"name\": \"Light Ivory\"}, {\"hex\": \"#HEX\", \"ral\": \"RAL 8025\", \"name\": \"Pale Brown\"}, {\"hex\": \"#HEX\", \"ral\": \"RAL 9010\", \"name\": \"Pure White\"}], \"materials\": [{\"title\": \"Material Name\", \"desc\": \"Sensory and technical description\", \"hex\": \"#HEX\"}, {\"title\": \"Material Name\", \"desc\": \"Description\", \"hex\": \"#HEX\"}, {\"title\": \"Material Name\", \"desc\": \"Description\", \"hex\": \"#HEX\"}]}\n\nCRITICAL RULES:\n1. Extract 3-5 REAL materials visible in the image (leather type, wood species, stone name, fabric weave, metal finish)\n2. Each material hex MUST be sampled from actual pixels in the image\n3. Colors MUST have REAL RAL codes - match the closest official RAL Classic color. Do NOT invent RAL codes.\n4. RAL format must be: RAL XXXX (4 digit number from official RAL Classic chart)\n5. Translate titles and descriptions to the specified language" }
  ];
  if (ref && ref.length > 100) {
    anaParts.push({ inlineData: { mimeType: 'image/jpeg', data: ref } });
  }
  const anaD = await geminiCall(anaParts, { temperature: 0.3, topK: 32, topP: 0.95, maxOutputTokens: 8192 });
  const analysisText = extractText(anaD);
  let analysis = {};
  try { analysis = JSON.parse(analysisText.replace(/```json/g, '').replace(/```/g, '').trim()); } catch (e) { analysis = { projectName: 'ANALYSIS', materials: [], colors: [] }; }
  return res.status(200).json({ textureImage: textureBase64, analysis });
}
