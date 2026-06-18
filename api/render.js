export const runtime = "nodejs";
export const maxDuration = 300;

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';
const SUPABASE_ANON = 'sb_publishable_4WYCqs4gxci5eQoOeysLWQ_5cqkdWaA';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    }
  }
};

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

function getGeminiSize(ratio, resolution) {
  if (resolution === '4096x4096' || resolution === '4K') return '4K';
  return '1K';
}

async function geminiImage(promptText, imageB64List, ratio, resolution, temp) {
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
        temperature: temp || 0.35,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseModalities: ['IMAGE', 'TEXT'],
        imageConfig: { imageSize: getGeminiSize(ratio, resolution), aspectRatio: ratio || '16:9' }
      }
    })
  });
  return r.json();
}

async function geminiText(promptText, imageB64List) {
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
      generationConfig: { temperature: 0.4, topK: 24, topP: 0.85, maxOutputTokens: 4096 }
    })
  });
  return r.json();
}

function sendImage(res, d) {
  if (d.error) return res.status(500).json({ success: false, message: d.error.message || JSON.stringify(d.error) });
  if (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) {
    for (const part of d.candidates[0].content.parts) {
      if (part.inlineData) {
        return res.status(200).json({ candidates: [{ content: { parts: [{ inlineData: { data: part.inlineData.data, mimeType: 'image/png' } }] } }] });
      }
    }
  }
  return res.status(500).json({ success: false, message: 'No image generated' });
}

function getText(d) {
  if (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) {
    for (const part of d.candidates[0].content.parts) {
      if (part.text) return part.text;
    }
  }
  return '';
}

async function enrichPrompt(rawPrompt) {
  const sysMsg = "You are an elite architectural and interior design visualization prompt engineer. The user will give you a basic concept or a short phrase in any language. Your job is to expand this into a highly detailed, world-class render prompt in English.\n\nYou MUST include:\n- Photorealistic details, raw photo quality, maximum sharpness, professional photography grade.\n- Advanced lighting (global illumination, ray tracing, volumetric lighting, natural soft sunlight or cinematic atmospheric lighting).\n- Architectural composition (rule of thirds, hyper-detailed background, studio-quality composition).\n- Camera parameters: full-frame DSLR, 50mm lens, ISO 100, f/8, neutral white balance 5500K, RAW photo, eye-level perspective, architectural photography style.\n\nMATERIAL RULES:\n- Do NOT default to wood. Use marble, metal, glass, concrete, stone FIRST.\n- Pick ONE dominant material per scene. Others support it.\n- Maximum TWO contrasting materials per furniture piece.\n- Every surface must show its truth: wood grain, stone veining, fabric texture, leather grain, metal brushing.\n\nCOMPOSITION:\n- Maximum 5-7 major elements per scene. No clutter. No filler.\n- ONE accent color maximum per scene. Rest neutral.\n- Architecture is hero, decoration is supporting cast.\n\nDIVERSITY RULE: Never generate the same style, material palette, or decorative objects twice. Each prompt must be uniquely different. Vary building types, regions, seasons, lighting conditions. Add a unique random seed word at the end.\n\n2026 DESIGN TRENDS (pick 2-3 per render, NOT all):\n- Deep rich tones (burgundy, forest green, navy, chocolate)\n- Tactile surfaces and layered fabric contrasts\n- Mediterranean and nautical elements\n- Artisanal hand-carved details\n- Sculptural statement lighting in single material\n- Lacquered matte and satin surfaces\n- Large format continuous stone surfaces\n- Colored glass (amber, smoke, cobalt)\n- Board-formed concrete, lime wash plaster\n- Overstuffed cushions in simple frames\n\nOutput ONLY the final English prompt. No greetings, no explanations, no quotes. Just the raw prompt text.";
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: sysMsg }, { role: 'user', content: rawPrompt }], temperature: 0.4, max_tokens: 1000 })
  });
  const d = await r.json();
  return d.choices?.[0]?.message?.content || rawPrompt;
}

async function handleRender(body, res) {
  const userPrompt = (body.prompt || 'modern interior').replace(/\{\{/g, '').replace(/\}\}/g, '');
  let finalPrompt;
  if (userPrompt.length > 100) {
    finalPrompt = userPrompt;
  } else {
    finalPrompt = await enrichPrompt(userPrompt);
  }
  const geminiRules = ' [SYSTEM CRITICAL COMMAND: HYPER-FIDELITY, ABSOLUTE SHARPNESS, AND TOTAL TEXTURE DETAIL PRESERVATION. Whatever subject and material are rendered, analyze and deeply preserve its specific complex surface textures, real-world physical displacement, and intricate surface geometry. DO NOT smooth or flatten surfaces. ELIMINATE all artificial noise, film grain, or dotted artifacts. Achieve absolute maximum fidelity, extreme photorealism, professional architectural photography grade focus, deep color depth, dynamic lighting, and flawless material accuracy.] [MATERIAL DIVERSITY DIRECTIVE: Do NOT default to wood. Consider the FULL SPECTRUM of premium materials based on style context. Match material to design style.] [COMPOSITION CONTROL: Do NOT add objects the user did not request. Do NOT multiply furniture. Follow the user prompt EXACTLY. Do NOT over-decorate. Maximum 5-7 major elements unless user specifies more.]';
  const d = await geminiImage(finalPrompt + geminiRules, null, body.aspectRatio, body.resolution, 0.35);
  return sendImage(res, d);
}

async function handlePlacement(body, res) {
  const prompt = 'Place the object from the second image into the scene from the first image. Match perspective, lighting, and scale. ' + (body.prompt || 'Place naturally.') + ' Do not change anything else in the scene.';
  const d = await geminiImage(prompt, [body.images.boxScene, body.images.boxItem], body.aspectRatio, body.resolution, 0.4);
  return sendImage(res, d);
}

async function handleRevision(body, res) {
  const userInstruction = body.prompt || 'edit';
  let prompt = 'Edit this image. ' + userInstruction + '. Change nothing else.';

  const imageList = [body.images.currentRender];
  if (body.images && body.images.boxItem && body.images.boxItem.length > 100) {
    prompt = 'Edit this image. Add the object from the second image. ' + userInstruction + '. Change nothing else.';
    imageList.push(body.images.boxItem);
  }

  const d = await geminiImage(prompt, imageList, body.aspectRatio, body.resolution, 0.15);
  return sendImage(res, d);
}

async function handleSketch(body, res) {
  const prompt = 'Turn this sketch into a photorealistic architectural render. Keep the exact layout and proportions. ' + (body.prompt || '');
  const d = await geminiImage(prompt, [body.sketchData], body.aspectRatio, body.resolution, 0.15);
  return sendImage(res, d);
}

async function handlePromptBuilder(body, res) {
  const images = body.images || {};
  const ref = images.boxRef || images.boxScene || images.boxDesign || '';
  if (ref && ref.length > 100) {
    const promptText = 'SCAN THIS IMAGE PIXEL BY PIXEL. ' + (body.prompt || 'Write the exact prompt to recreate this scene') + '. ABSOLUTE RULES: 1. Start the prompt with a lowercase letter. NEVER start with A, An, The. Start like: spacious open-plan living room or modern minimalist kitchen. 2. NEVER write image_0, the attached image, the uploaded photo, or any file reference. Describe as if from memory. 3. Describe ONLY what you SEE in the image. Do NOT add, invent, or imagine anything not visible. 4. If user says remove furniture or ignore objects, do NOT include them in the prompt. Pretend they do not exist. 5. If user says interpret or suggest, then you may add creative ideas. Otherwise NEVER interpret. 6. Every material must be specific: not wood but natural white oak with matte lacquer and visible grain. Not wall but smooth matte plaster in warm ivory RAL 1013. 7. Describe exact lighting: source direction, color temperature in Kelvin, shadow softness, reflection behavior. 8. Describe spatial depth: foreground, midground, background layers. 9. Describe every furniture piece with exact material, finish, color, and form. 10. Count and describe decorative objects precisely. 11. End with: 8K ultra-high resolution 7680x4320, full-frame DSLR, 50mm f/8, ISO 100, RAW, global illumination, ray tracing, volumetric light, extreme photorealism, maximum sharpness, zero noise, professional architectural photography.';
    const d = await geminiText(promptText, [ref]);
    const text = getText(d);
    if (text) return res.status(200).json({ candidates: [{ content: { parts: [{ text: text }] } }] });
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
  const sysPrompt = 'You are ADEULL AI, a powerful architectural visualization platform assistant. You ARE a render engine. Never say you are not. Be concise, direct, professional. No long paragraphs. Features: INTERIOR, EXTERIOR, ARCHITECTURE, DESIGN, PLAN RESIZE, PRESENTATION, 8K upscale, Prompt Builder. Plans: Starter $9/mo (20 credits), Pro $19/mo (60 credits), Studio $39/mo (150 credits), Agency $79/mo (350 credits). If error: suggest refresh, clear cache, different image format, reduce image size. Report bugs via button at bottom right. ALWAYS respond in language: ' + (body.language || 'EN');
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
  const texPrompt = 'You are a world-class product visualization specialist. Analyze the product in the attached image and create a MATERIAL ANALYSIS RENDER. CRITICAL INSTRUCTIONS: 1. Keep the original product EXACTLY as it is in the CENTER of the image, do NOT crop, cut out, or modify the product photo. 2. Around the product, create MAGNIFIED CIRCULAR LENS CALLOUTS showing extreme close-up textures of each visible material (like a magnifying glass effect). 3. Draw thin elegant ARROWS from each material area on the product to its corresponding magnified texture circle. 4. Each magnified circle should show the material surface texture in hyper-detail (wood grain, leather pores, stone veins, fabric weave, metal brushing). 5. Use a clean white/light gray background. 6. Place 3-5 material callouts around the product. 7. CRITICAL: Do NOT alter the original colors of the product. 8. Do NOT add any text labels. Only add the magnified texture callouts with arrows.';
  const texD = await geminiImage(texPrompt, ref.length > 100 ? [ref] : null, '1:1', '1K', 0.4);
  if (texD.error) return res.status(500).json({ success: false, message: texD.error.message || JSON.stringify(texD.error) });
  let textureBase64 = '';
  if (texD.candidates && texD.candidates[0] && texD.candidates[0].content && texD.candidates[0].content.parts) {
    for (const part of texD.candidates[0].content.parts) {
      if (part.inlineData) textureBase64 = part.inlineData.data;
    }
  }
  const analysisPrompt = 'You are a Senior Interior Designer and Material Expert. Analyze the attached image with extreme precision. RETURN ONLY VALID JSON. NO MARKDOWN. NO BACKTICKS. Translate projectName, title, and desc to language: ' + (body.language || 'EN') + '. JSON structure: {"projectName":"Sophisticated concept name","colors":[{"hex":"#HEX","ral":"RAL XXXX","name":"Color Name"}],"materials":[{"title":"Material Name","desc":"Sensory and technical description","hex":"#HEX"}]}. CRITICAL RULES: 1. Extract 3-5 REAL materials visible in the image. 2. Each material hex MUST be sampled from actual pixels. 3. Colors MUST have REAL RAL codes from official RAL Classic chart. 4. RAL format: RAL XXXX (4 digit number).';
  const anaD = await geminiText(analysisPrompt, ref.length > 100 ? [ref] : null);
  let analysisText = getText(anaD);
  let analysis = {};
  try { analysis = JSON.parse(analysisText.replace(/```json/g, '').replace(/```/g, '').trim()); } catch (e) { analysis = { projectName: 'ANALYSIS', materials: [], colors: [] }; }
  return res.status(200).json({ textureImage: textureBase64, analysis });
}
