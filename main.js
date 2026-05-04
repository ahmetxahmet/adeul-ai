/* ==============================================================
// MAIN.JS — ADEULL AI CORE ENGINE
// Dict → lang.js'de tanımlı (window.dict)
// toggleLangMenu, selectLang → lang.js'de tanımlı
// ============================================================== */

/* ==============================================================
// GLOBAL STATE VARIABLES
// ============================================================== */
window.uploadedBase64 = {};
window.currentBoardStyle = 1;
window.currentRatio = '16:9';
window.selectedQuality = '1K'; // default
window.originalRenderBase64 = null;
window.originalRenderPrompt = '';
window.revisionHistory = [];
window.clickSound = document.getElementById('hoverSound');
window.CORE_ENGINE_V2 = atob("aHR0cHM6Ly9hZGV1bC1pYS5hcHAubjhuLmNsb3VkL3dlYmhvb2svYWRldWwtYWktdjI=");
window.CORE_UPSCALE = atob("aHR0cHM6Ly9hZGV1bC1pYS5hcHAubjhuLmNsb3VkL3dlYmhvb2svdXBzY2FsZQ==");

// ==============================================================
// GÜVENLİK: ANTI-TAMPERING (MANİPÜLASYON TESPİTİ)
// ==============================================================
var _originalSimulateFunc = null;

function initializeSecurityChecks() {
    if (typeof simulateAPIConnection !== 'undefined') {
        _originalSimulateFunc = simulateAPIConnection.toString();
        
        setInterval(function() {
            if (_originalSimulateFunc && simulateAPIConnection.toString() !== _originalSimulateFunc) {
                console.error("!!! SYSTEM TAMPERING DETECTED !!!");
                // Orijinal fonksiyonu geri yükle ve saldırıyı logla
                simulateAPIConnection = new Function('return ' + _originalSimulateFunc).apply(this);
                
                // Supabase'e özel bir log gönder (bugtracker.js'deki fonksiyonu kullanabiliriz)
                if (window.onerror && typeof window.onerror === 'function') {
                    window.onerror('TAMPERING_DETECTED', 'security_check.js', 1, 1, new Error('simulateAPIConnection fonksiyonu değiştirildi.'));
                }
            }
        }, 5000); // Her 5 saniyede bir kontrol et
    }
}

function playSound() { 
    if(window.clickSound) { 
        window.clickSound.currentTime = 0; 
        window.clickSound.play().catch(e => {}); 
    } 
}

/* ==============================================================
// UI VE "LÜTFEN BEKLEYİN" YÜKLEME EKRANI FONKSİYONLARI
// ============================================================== */

function toggleUpscaleLoader(show) {
    let loader = document.getElementById('adeulUpscaleLoader');
    const container = document.getElementById('renderImgContainer');
    
    if (!loader && container) {
        loader = document.createElement('div');
        loader.id = 'adeulUpscaleLoader';
        loader.className = 'absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-50 backdrop-blur-md transition-opacity duration-300';
        loader.innerHTML = `
            <svg class="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div class="text-lg font-bold tracking-widest uppercase">8K RENDER IN PROGRESS</div>
            <div class="text-sm font-light text-gray-300 mt-2">Please wait...</div>
        `;
        container.appendChild(loader);
    }
    
    if (loader) {
        if (show) {
            loader.style.display = 'flex';
            setTimeout(() => loader.style.opacity = '1', 10);
        } else {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);
        }
    }
}

// toggleLangMenu ve selectLang → lang.js'de tanımlı, burada tekrar yok

window.setRatio = function(ratio, btn) {
    window.currentRatio = ratio;
    playSound();
    document.querySelectorAll('.ratio-btn').forEach(el => {
        el.classList.remove('active', 'bg-white/20', 'text-white');
        el.classList.add('bg-white/5', 'text-white/50');
    });
    btn.classList.remove('bg-white/5', 'text-white/50');
    btn.classList.add('active', 'bg-white/20', 'text-white');
};

document.addEventListener('DOMContentLoaded', () => {
    window.selectLang('EN', '🇺🇸');
    initializeSecurityChecks(); // Güvenlik kontrollerini başlat
});

function handleLogin(e) {
    e.preventDefault();
    playSound();
    document.getElementById('loginScreen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContent').classList.add('active');
    }, 800);
}

function toggleUserMenu() {
    playSound();
    document.getElementById('userSidePanel').classList.toggle('open');
}

function previewImage(input, boxId) {
    playSound();
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const rawDataUrl = e.target.result;
            const rawBase64 = rawDataUrl.split(',')[1];
            window.uploadedBase64[boxId] = rawBase64;

            const box = document.getElementById(boxId);
            Array.from(box.children).forEach(child => child.style.display = 'none');
            
            const previewDiv = document.createElement('div');
            previewDiv.className = 'preview-container absolute inset-0 w-full h-full';
            previewDiv.innerHTML = `
            <img src="${rawDataUrl}" class="absolute inset-0 w-full h-full object-contain opacity-80 rounded-xl">
            <button onclick="removeImage(event, '${boxId}')" class="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-red-500 z-50 shadow-lg border border-white/20">✕</button>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span class="bg-black/70 px-4 py-2 rounded-lg text-[0.6rem] font-bold tracking-widest text-white shadow-lg uppercase">LOADED</span>
            </div>`;
            box.appendChild(previewDiv);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removeImage(event, boxId) {
    event.stopPropagation(); 
    event.preventDefault();
    playSound();
    delete window.uploadedBase64[boxId];
    const box = document.getElementById(boxId);
    const preview = box.querySelector('.preview-container');
    if(preview) preview.remove();
    Array.from(box.children).forEach(child => child.style.display = '');
    const fileInput = document.getElementById(boxId.replace('box', 'file'));
    if(fileInput) {
        fileInput.value = ""; 
        fileInput.type = "text"; 
        fileInput.type = "file"; 
    }
}

function activateFreeTrial() {
    playSound();
    const currentLang = document.getElementById('activeCode').innerText;
    let message = "Welcome! You have 1 Free Trial Credit. Proceeding to Dashboard...";
    if(currentLang === 'TR') message = "Hoş geldiniz! 1 Ücretsiz Deneme Krediniz tanımlandı. Panele yönlendiriliyorsunuz...";
    alert(message);
    document.getElementById('loginScreen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContent').classList.add('active');
        enterDashboard('DESIGN');
    }, 500);
}

function selectBoardType(typeId) {
    playSound();
    window.currentBoardStyle = typeId;
    [1, 2, 3].forEach(id => {
        const btn = document.getElementById(`btnBord${id}`);
        if(btn) {
            if (id === typeId) {
                btn.className = "flex-1 bg-white border border-black/20 text-black py-3 rounded-xl text-[0.65rem] font-bold tracking-widest uppercase transition shadow-md";
                const span = btn.querySelectorAll('span')[1]; 
                if(span) span.classList.remove('opacity-70');
            } else {
                btn.className = "flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3 rounded-xl text-[0.65rem] font-bold tracking-widest uppercase transition";
                const span = btn.querySelectorAll('span')[1];
                if(span) span.classList.add('opacity-70');
            }
        }
    });
}

function exitDashboard() {
    playSound();
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('landing').classList.remove('hidden');
    closeRender();
    if (typeof closePresentation === 'function') closePresentation();
}

async function compressImageBase64(base64, maxPx = 1920, quality = 0.82) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            let w = img.width, h = img.height;
            if (w <= maxPx && h <= maxPx) { resolve(base64); return; }
            if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
            else { w = Math.round(w * maxPx / h); h = maxPx; }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
        };
        img.src = 'data:image/jpeg;base64,' + base64;
    });
}

function b64toBlob(b64Data, contentType='', sliceSize=512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: contentType});
}

async function ADEULL_UPSCALE(imageUrl) {
    if (!window.currentUserId || window.currentUserId === 'guest') {
        alert('Please login to use 8K rendering.');
        return;
    }
    const _upscaleCreditText = (document.getElementById('topCreditDisplay') || {}).innerText || '0';
    const _upscaleCredits = parseInt(_upscaleCreditText.replace(/[^0-9]/g, '')) || 0;
    if (_upscaleCredits < 10) {
        alert('Insufficient credits for 8K render.');
        return;
    }

    try {
        // Görseli blob olarak al
        let blob;
        if (imageUrl.startsWith('blob:')) {
            const res = await fetch(imageUrl);
            blob = await res.blob();
        } else if (imageUrl.startsWith('data:')) {
            const res = await fetch(imageUrl);
            blob = await res.blob();
        } else {
            const res = await fetch(imageUrl);
            blob = await res.blob();
        }

        // JPEG olarak sıkıştır
        const jpegBlob = await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
                const c = document.createElement('canvas');
                const maxDim = 3072;
                let w = img.naturalWidth;
                let h = img.naturalHeight;
                if (w > maxDim || h > maxDim) {
                    const scale = Math.min(maxDim / w, maxDim / h);
                    w = Math.round(w * scale);
                    h = Math.round(h * scale);
                }
                c.width = w;
                c.height = h;
                c.getContext('2d').drawImage(img, 0, 0, w, h);
                c.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
            };
            img.onerror = function() { resolve(blob); };
            img.src = URL.createObjectURL(blob);
        });

        // Supabase Storage'a yükle
        const fileName = 'upscale_' + window.currentUserId + '_' + Date.now() + '.jpg';
        const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
            .from('renders')
            .upload(fileName, jpegBlob, { contentType: 'image/jpeg', upsert: true });

        if (uploadError) throw new Error('Upload failed: ' + uploadError.message);

        // Public URL al
        const { data: urlData } = window.supabaseClient.storage
            .from('renders')
            .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // N8N webhook'a sadece URL gönder
        const sessionData = await window.supabaseClient.auth.getSession();
        const authToken = sessionData?.data?.session?.access_token || '';

        const response = await fetch(window.CORE_UPSCALE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: publicUrl, user_token: authToken })
        });

        if (!response.ok) throw new Error("Upscale error: " + response.status);

        const data = await response.json();
        return data.output_url || data.output || data;
    } catch (error) {
        console.error("8K Upscale error:", error);
        throw error;
    }
}

async function mergeItemsCanvas(items) {
    if (items.length === 0) return '';
    if (items.length === 1) return (items[0].base64 || '').replace(/^data:image\/[a-z]+;base64,/, '');

    const loadImg = (src) => new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
    });

    const imgs = (await Promise.all(items.map(i => loadImg(i.base64)))).filter(Boolean);
    if (imgs.length === 0) return '';
    if (imgs.length === 1) return (items[0].base64 || '').replace(/^data:image\/[a-z]+;base64,/, '');

    const cols = Math.ceil(Math.sqrt(imgs.length));
    const rows = Math.ceil(imgs.length / cols);
    const cellW = 512, cellH = 512;

    const canvas = document.createElement('canvas');
    canvas.width = cellW * cols;
    canvas.height = cellH * rows;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    imgs.forEach((img, i) => {
        const x = (i % cols) * cellW;
        const y = Math.floor(i / cols) * cellH;
        const scale = Math.min(cellW / img.width, cellH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, x + (cellW - w) / 2, y + (cellH - h) / 2, w, h);
    });

    return canvas.toDataURL('image/jpeg', 0.9).replace(/^data:image\/[a-z]+;base64,/, '');
}

async function simulateAPIConnection(btnId, is8K = false) {
    console.log('🔍 RENDER START:', {
        selectedQuality: window.selectedQuality,
        qualityConfig: window._currentQualityConfig,
        is8K: arguments[1]
    });
    playSound();
    if (!window.currentUserId || window.currentUserId === 'guest') {
        alert('Please login or sign up to use ADEULL AI.');
        return;
    }
    const creditText = (document.getElementById('topCreditDisplay') || {}).innerText || '0';
    const currentCredits = parseInt(creditText.replace(/[^0-9]/g, '')) || 0;
    const requiredCredits = window._currentQualityConfig?.creditCost || (is8K ? 30 : 12);
    if (currentCredits < requiredCredits) {
        alert('Insufficient credits. You need ' + requiredCredits + ' credits for this render.\n\nPlease redeem a coupon or upgrade your plan from the BILLING menu.');
        return;
    }
    const btn = document.getElementById(btnId);
    if (!btn || btn.disabled) return;
    btn.disabled = true;

    const currentMenu = document.getElementById('dashboardTitle').getAttribute('data-raw-title');
    const hasScene = window.uploadedBase64 && window.uploadedBase64['boxScene'];
    const filledItems = (window._itemBoxes || []).filter(b => b && b.base64);

    const _langCode = (document.getElementById('activeCode') || {}).innerText || 'EN';
    const _warnings = {
        'EN': {
            missingItem: 'This menu requires both a SCENE and an ITEM image. If you only have one image, please use the DESIGN menu instead — it works with single images.',
            missingScene: 'This menu requires a SCENE image first. Please upload a scene, or use the DESIGN menu if you only have a single image.'
        },
        'TR': {
            missingItem: 'Bu menü için hem SAHNE hem de ÜRÜN görseli gerekli. Tek görseliniz varsa lütfen DESIGN menüsünü kullanın — tek görselle çalışır.',
            missingScene: 'Bu menü için önce bir SAHNE görseli gerekli. Lütfen sahne yükleyin veya tek görseliniz varsa DESIGN menüsünü kullanın.'
        },
        'ES': {
            missingItem: 'Este menú requiere una imagen de ESCENA y una de OBJETO. Si solo tiene una imagen, use el menú DESIGN — funciona con una sola imagen.',
            missingScene: 'Este menú requiere una imagen de ESCENA primero. Suba una escena o use el menú DESIGN si solo tiene una imagen.'
        },
        'DE': {
            missingItem: 'Dieses Menü benötigt sowohl ein SZENEN- als auch ein OBJEKT-Bild. Wenn Sie nur ein Bild haben, verwenden Sie bitte das DESIGN-Menü.',
            missingScene: 'Dieses Menü benötigt zuerst ein SZENEN-Bild. Bitte laden Sie eine Szene hoch oder verwenden Sie das DESIGN-Menü.'
        },
        'FR': {
            missingItem: 'Ce menu nécessite une image de SCÈNE et une image d\'OBJET. Si vous n\'avez qu\'une seule image, utilisez le menu DESIGN.',
            missingScene: 'Ce menu nécessite d\'abord une image de SCÈNE. Téléchargez une scène ou utilisez le menu DESIGN.'
        },
        'PT': {
            missingItem: 'Este menu requer uma imagem de CENA e uma de ITEM. Se você tem apenas uma imagem, use o menu DESIGN.',
            missingScene: 'Este menu requer uma imagem de CENA primeiro. Envie uma cena ou use o menu DESIGN.'
        },
        'ID': {
            missingItem: 'Menu ini membutuhkan gambar SCENE dan ITEM. Jika hanya punya satu gambar, gunakan menu DESIGN.',
            missingScene: 'Menu ini membutuhkan gambar SCENE terlebih dahulu. Unggah scene atau gunakan menu DESIGN.'
        },
        'RU': {
            missingItem: 'Это меню требует изображения СЦЕНЫ и ПРЕДМЕТА. Если у вас только одно изображение, используйте меню DESIGN.',
            missingScene: 'Это меню сначала требует изображение СЦЕНЫ. Загрузите сцену или используйте меню DESIGN.'
        },
        'AR': {
            missingItem: 'تتطلب هذه القائمة صورة المشهد والعنصر معًا. إذا كان لديك صورة واحدة فقط، استخدم قائمة DESIGN.',
            missingScene: 'تتطلب هذه القائمة صورة مشهد أولاً. يرجى تحميل مشهد أو استخدام قائمة DESIGN.'
        },
        'IT': {
            missingItem: 'Questo menu richiede un\'immagine di SCENA e una di OGGETTO. Se hai solo un\'immagine, usa il menu DESIGN.',
            missingScene: 'Questo menu richiede prima un\'immagine di SCENA. Carica una scena o usa il menu DESIGN.'
        }
    };
    const _L = _warnings[_langCode] || _warnings['EN'];

    if ((currentMenu === 'INTERIOR' || currentMenu === 'EXTERIOR' || currentMenu === 'ARCHITECTURE') && hasScene && filledItems.length === 0) {
        alert(_L.missingItem);
        btn.disabled = false;
        return;
    }

    if ((currentMenu === 'INTERIOR' || currentMenu === 'EXTERIOR' || currentMenu === 'ARCHITECTURE') && !hasScene && filledItems.length > 0) {
        alert(_L.missingScene);
        btn.disabled = false;
        return;
    }

    const originalText = btn.innerHTML;
    const promptInput = document.getElementById('promptArea');
    const userPrompt = promptInput && promptInput.value.trim() !== "" ? promptInput.value : "Modern architectural design";
    let cleanPrompt = userPrompt.replace(/\"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ');
    cleanPrompt = cleanPrompt.replace(/\{\{/g, '').replace(/\}\}/g, '').replace(/\{/g, '').replace(/\}/g, '');

    const activeLangCodeElement = document.getElementById('activeCode');
    const activeLangCode = activeLangCodeElement ? activeLangCodeElement.innerText : 'EN';

    btn.innerHTML = is8K ? '8K RENDER IN PROGRESS...' : 'ADEULL AI GENERATING...';
    btn.classList.add('bg-blue-600', 'text-white', 'animate-pulse');
    showVRayLoader(true);

    if (window.uploadedBase64['boxScene']) {
        window.uploadedBase64['boxScene'] = await compressImageBase64(window.uploadedBase64['boxScene']);
    }
    if (window.uploadedBase64['boxItem']) {
        window.uploadedBase64['boxItem'] = await compressImageBase64(window.uploadedBase64['boxItem']);
    }
    if (window.uploadedBase64['boxDesign']) {
        window.uploadedBase64['boxDesign'] = await compressImageBase64(window.uploadedBase64['boxDesign']);
    }

    let refImage = window.uploadedBase64['boxRef'] || window.uploadedBase64['boxScene'] || window.uploadedBase64['boxItem'] || window.uploadedBase64['boxDesign'] || Object.values(window.uploadedBase64)[0] || "";
    if (refImage) { window.uploadedBase64['boxRef'] = refImage; }

    let theSketchImage = "";
    if (Object.keys(window.uploadedBase64).length > 0) {
        theSketchImage = Object.values(window.uploadedBase64)[0];
    }

    const currentMenuTitle = document.getElementById('dashboardTitle').getAttribute('data-raw-title');
    
    let isSketchMode = "HAYIR";
    if ((currentMenuTitle === 'DESIGN' || currentMenuTitle === 'PLAN') && theSketchImage !== "") {
        isSketchMode = "EVET";
    }

    // Merge multiple items into a single grid image for N8N
    const mergedItem = await mergeItemsCanvas(filledItems);
    if (mergedItem) { window.uploadedBase64['boxItem'] = mergedItem; }

    // Add secure auth token and user_id to payload for Core Engine validation
    const sessionData = window.supabaseClient ? await window.supabaseClient.auth.getSession() : null;
    const authToken = sessionData?.data?.session?.access_token || "";

    const payload = {
        action: 'generate',
        prompt: cleanPrompt,
        isSketch: isSketchMode,
        sketchData: theSketchImage,
        images: window.uploadedBase64,
        language: activeLangCode,
        aspectRatio: window.currentRatio,
        imageSize: "4K",
        output_mime_type: "image/png",
        resolution: window._currentQualityConfig?.resolution || (is8K ? '8K_upscale' : '4096x4096'),
        creditCost: window._currentQualityConfig?.creditCost || (is8K ? 30 : 12),
        user_id: window.currentUserId || "guest",
        user_token: authToken
    };

    if (window.isRevisionMode) {
        window.revisionHistory.push(cleanPrompt);
        payload.prompt = window.originalRenderPrompt + ' [APPLY ALL REVISIONS IN ORDER: ' + window.revisionHistory.join(' AND THEN ') + ']';
        payload.images = { currentRender: window.originalRenderBase64 || '' };
    }

    try {
        const response = await fetch(window.CORE_ENGINE_V2, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        const rawText = decoder.decode(arrayBuffer);
        let data;
        try {
            data = JSON.parse(rawText);
        } catch(parseError) {
            throw new Error('Invalid response - please try again');
        }
        
        let rawOutput = "";
        let result = Array.isArray(data) ? data[0] : data;

        if (result.output_url) {
            rawOutput = result.output_url;
        } else if (result.output && typeof result.output === 'string') {
            rawOutput = result.output;
        } else if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0].inlineData) {
            rawOutput = result.candidates[0].content.parts[0].inlineData.data;
        } else if (result.url) {
            rawOutput = result.url;
        }

        if (rawOutput) {
            const imgElement = document.querySelector('#renderImgContainer img');
            if(imgElement) {
                let finalImage = "";
                
                if (rawOutput.startsWith('http')) {
                    imgElement.crossOrigin = "Anonymous";
                    imgElement.src = rawOutput;
                    finalImage = rawOutput;
                    showVRayLoader(false);
                    showRenderScreen();
                } else {
                    let cleanBase64 = String(rawOutput).replace(/^data:image\/[a-z]+;base64,/, '').replace(/\s/g, '');

                    const imageBlob = b64toBlob(cleanBase64, 'image/png');
                    finalImage = URL.createObjectURL(imageBlob);

                    imgElement.src = finalImage;
                    showVRayLoader(false);
                    showRenderScreen();
                }

                if (!window.isRevisionMode) {
                    window.originalRenderBase64 = finalImage;
                    window.originalRenderPrompt = cleanPrompt;
                    window.revisionHistory = [];
                }

                if (is8K) {
                    toggleUpscaleLoader(true);
                    btn.innerHTML = '8K RENDER ALINIYOR...';
                    try {
                        const upscaledUrl = await ADEULL_UPSCALE(finalImage);
                        if(upscaledUrl) {
                            imgElement.crossOrigin = "Anonymous";
                            imgElement.src = upscaledUrl;
                            const hint8k = document.getElementById('saveHint8K');
                            if(hint8k) hint8k.style.display = 'block';
                        }
                    } catch (upscaleError) {
                        console.log("8K Upscale failed, keeping original render.", upscaleError);
                    } finally {
                        toggleUpscaleLoader(false);
                    }
                }

                // Render geçmişine kaydet
                if(window.currentUserId && window.supabaseClient) {
                    try {
                        const _menuTitle = document.getElementById('dashboardTitle').getAttribute('data-raw-title') || 'UNKNOWN';
                        const _promptText = (document.getElementById('promptArea') || {}).value || '';
                        const _ratio = window.selectedRatio || '16:9';
                        await window.supabaseClient.from('renders').insert([{
                            user_id: window.currentUserId,
                            menu_type: _menuTitle,
                            is_8k: is8K,
                            prompt: _promptText.substring(0, 500),
                            aspect_ratio: _ratio,
                            credits_used: window._currentQualityConfig?.creditCost || (is8K ? 30 : 12)
                        }]);
                    } catch(e) {
                        console.warn('Render history save failed:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
        alert('Render failed. Please try again.');
        closeRender();
    } finally {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-blue-600', 'text-white', 'animate-pulse');
        btn.disabled = false;
        toggleUpscaleLoader(false);
        // Render sonrası (başarılı veya başarısız), UI'daki krediyi Supabase'den güncel çek
        if(window.currentUserId && window.supabaseClient) {
            setTimeout(async () => {
                try {
                    const { data } = await window.supabaseClient
                        .from('users')
                        .select('credits')
                        .eq('id', window.currentUserId)
                        .single();
                    if(data && typeof data.credits === 'number') {
                        const topEl = document.getElementById('topCreditDisplay');
                        const panelEl = document.getElementById('panelCreditDisplay');
                        if(topEl) topEl.innerText = data.credits.toLocaleString();
                        if(panelEl) panelEl.innerText = data.credits.toLocaleString();
                    }
                } catch(e) { console.warn('Post-render credit sync failed:', e); }
            }, 2000); // N8N kredi düşmesinden sonra yeterli gecikme
        }
    }
}

async function saveRender(mode = 'renderImgContainer') {
    playSound();
    const renderImg = document.getElementById('renderImage');
    if (renderImg && renderImg.src && renderImg.src.startsWith('http') && !renderImg.src.includes('adeull.com')) {
        // 8K render - cross-origin, direkt indir
        const a = document.createElement('a');
        a.href = renderImg.src;
        a.download = 'ADEULL_8K_' + Date.now() + '.png';
        a.target = '_blank';
        a.click();
        return;
    }
    if (mode === 'renderImgContainer') {
        const imgElement = document.querySelector('#renderImgContainer img');
        if (!imgElement || !imgElement.src || imgElement.src.length < 10) { alert("No image to save!"); return; }

        try {
            const response = await fetch(imgElement.src);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `ADEULL_AI_RENDER_${new Date().getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        } catch (err) {
            console.error("Download error, trying alternative:", err);
            const link = document.createElement('a');
            link.href = imgElement.src;
            link.download = `ADEULL_AI_RENDER_${new Date().getTime()}.png`;
            link.target = "_blank"; 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

document.addEventListener('click', function(e) {
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.menu-item')) {
        playSound();
    }
});

function showRenderScreen() {
    const hint8k = document.getElementById('saveHint8K');
    if(hint8k) hint8k.style.display = 'none';
    const overlay = document.getElementById('renderOverlay');
    if(overlay) { overlay.classList.remove('hidden'); overlay.classList.add('flex'); setTimeout(() => overlay.style.opacity = '1', 50); }
    if(typeof resetAdjust === 'function') resetAdjust();
}

function closeRender() {
    const hint8k = document.getElementById('saveHint8K');
    if(hint8k) hint8k.style.display = 'none';
    const overlay = document.getElementById('renderOverlay');
    if(overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.classList.add('hidden'), 500);
        const imgElement = document.querySelector('#renderImgContainer img');
        if (imgElement) setTimeout(() => { imgElement.src = ""; }, 500);
    }
}

// showPresentationScreen ve closePresentation → sunum.js tarafından override ediliyor

function toggleFullscreen() {
    document.getElementById('renderImgContainer').classList.toggle('fullscreen');
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
        const renderOverlay = document.getElementById('renderOverlay');
        const sunumOverlay = document.getElementById('sunumOverlay');
        const userPanel = document.getElementById('userSidePanel');
        const langMenu = document.getElementById('langDropdown');
        const dashboard = document.getElementById('dashboard');
        
        if (renderOverlay && !renderOverlay.classList.contains('hidden')) { closeRender(); } 
        else if (sunumOverlay && !sunumOverlay.classList.contains('hidden')) { if (typeof closeSunumOverlay === 'function') closeSunumOverlay(); } 
        else if (langMenu && !langMenu.classList.contains('hidden')) { langMenu.classList.add('hidden'); langMenu.classList.remove('flex'); } 
        else if (userPanel && userPanel.classList.contains('open')) { userPanel.classList.remove('open'); } 
        else if (dashboard && dashboard.classList.contains('active')) { exitDashboard(); }
    }
});

window.setQuality = function(quality, btn) {
  window.selectedQuality = quality;
  document.querySelectorAll('.quality-btn').forEach(b => {
    b.classList.remove('bg-white', 'text-black');
    b.classList.add('bg-white/5', 'text-white/60');
  });
  if(btn) {
    btn.classList.remove('bg-white/5', 'text-white/60');
    btn.classList.add('bg-white', 'text-black');
  }
};

window.simulateAPIConnectionUnified = async function() {
    // Önce güncel krediyi çek
    if(window.currentUserId && window.supabaseClient) {
        try {
            const { data } = await window.supabaseClient
                .from('users')
                .select('credits')
                .eq('id', window.currentUserId)
                .single();
            if(data && typeof data.credits === 'number') {
                const topEl = document.getElementById('topCreditDisplay');
                const panelEl = document.getElementById('panelCreditDisplay');
                if(topEl) topEl.innerText = data.credits.toLocaleString();
                if(panelEl) panelEl.innerText = data.credits.toLocaleString();
            }
        } catch(e) { console.warn('Credit sync failed:', e); }
    }

    const quality = window.selectedQuality || '4K';
    const qualityMap = {
        '1K': { resolution: '1024x1024', creditCost: 1 },
        '4K': { resolution: '4096x4096', creditCost: 12 },
        '8K': { resolution: '8K_upscale', creditCost: 30 }
    };
    const config = qualityMap[quality] || qualityMap['4K'];
    const is8K = (quality === '8K');
    window._currentQualityConfig = config;

    if(typeof simulateAPIConnection === 'function') {
        simulateAPIConnection('generateBtnUnified', is8K);
    }
};

// ==============================================================
// DYNAMIC ITEM BOX MANAGEMENT
// ==============================================================
window._itemBoxes = [];
window._maxItems = 6;

function initItemBoxes() {
    const container = document.getElementById('itemContainer');
    if(!container) return;
    container.innerHTML = '';
    window._itemBoxes = [];
    addEmptyItemBox();
}

function addEmptyItemBox() {
    if(window._itemBoxes.length >= window._maxItems) return;
    const container = document.getElementById('itemContainer');
    if(!container) return;

    const idx = window._itemBoxes.length;
    const boxId = 'boxItem_' + idx;
    const fileId = 'fileItem_' + idx;

    const wrapper = document.createElement('div');
    wrapper.id = boxId;
    wrapper.className = 'h-24 lg:h-28 border border-white/30 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition overflow-hidden relative';
    wrapper.innerHTML = `<input type="file" id="${fileId}" hidden accept="image/*"><span class="text-xl mb-1">+</span><span class="text-[0.55rem] tracking-widest uppercase font-bold text-center px-1" data-i18n="addItem">ADD ITEM</span>`;
    wrapper.onclick = function() { document.getElementById(fileId).click(); };
    container.appendChild(wrapper);

    document.getElementById(fileId).addEventListener('change', function(e) {
        handleItemUpload(e, idx);
    });

    window._itemBoxes.push({ id: boxId, base64: null, index: idx });
}

function handleItemUpload(event, idx) {
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        window._itemBoxes[idx].base64 = base64;

        const box = document.getElementById('boxItem_' + idx);
        if(box) {
            box.innerHTML = `<img src="${base64}" class="absolute inset-0 w-full h-full object-cover rounded-xl"><button onclick="event.stopPropagation();removeItemBox(${idx})" class="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 rounded-full text-[0.6rem] z-10">✕</button>`;
            box.onclick = null;
        }

        const filledCount = window._itemBoxes.filter(b => b.base64).length;
        if(filledCount < window._maxItems && filledCount === window._itemBoxes.length) {
            addEmptyItemBox();
        }
    };
    reader.readAsDataURL(file);
}

function removeItemBox(idx) {
    window._itemBoxes[idx].base64 = null;
    const box = document.getElementById('boxItem_' + idx);
    if(box) {
        const fileId = 'fileItem_' + idx;
        box.innerHTML = `<input type="file" id="${fileId}" hidden accept="image/*"><span class="text-xl mb-1">+</span><span class="text-[0.55rem] tracking-widest uppercase font-bold text-center px-1" data-i18n="addItem">ADD ITEM</span>`;
        box.onclick = function() { document.getElementById(fileId).click(); };
        document.getElementById(fileId).addEventListener('change', function(e) {
            handleItemUpload(e, idx);
        });
    }
}

function applyAdjust() {
    const exp = parseInt(document.getElementById('adjExposure').value);
    const con = parseInt(document.getElementById('adjContrast').value);
    const high = parseInt(document.getElementById('adjHighlights').value);
    const shad = parseInt(document.getElementById('adjShadows').value);
    const sat = parseInt(document.getElementById('adjSaturation').value);
    const warm = parseInt(document.getElementById('adjWarmth').value);
    const tint = parseInt(document.getElementById('adjTint').value);
    const sharp = parseInt(document.getElementById('adjSharpness').value);

    const brightness = 1 + (exp / 200) + (shad / 400) - (high / 400);
    const contrastVal = 1 + (con / 150) + (high / 500) + (shad / 500);
    const saturation = 1 + (sat / 100);
    const hueShift = (warm * 0.15) + (tint * 0.2);
    const sharpBoost = 1 + (sharp / 300);

    const img = document.getElementById('renderImage');
    if (img) {
        img.style.filter = `brightness(${brightness}) contrast(${contrastVal * sharpBoost}) saturate(${saturation}) hue-rotate(${hueShift}deg)`;
    }
}

function resetAdjust() {
    ['adjExposure','adjContrast','adjHighlights','adjShadows','adjSaturation','adjWarmth','adjTint','adjSharpness'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = 0;
    });
    applyAdjust();
}

function autoAdjust() {
    document.getElementById('adjExposure').value = 5;
    document.getElementById('adjContrast').value = 10;
    document.getElementById('adjHighlights').value = -5;
    document.getElementById('adjShadows').value = 8;
    document.getElementById('adjSaturation').value = 8;
    document.getElementById('adjWarmth').value = 3;
    document.getElementById('adjTint').value = 0;
    document.getElementById('adjSharpness').value = 15;
    applyAdjust();
}

async function saveRenderWithAdjust() {
    const img = document.getElementById('renderImage');
    if (!img || !img.src) return;

    const exp = parseInt(document.getElementById('adjExposure').value);
    const con = parseInt(document.getElementById('adjContrast').value);
    const high = parseInt(document.getElementById('adjHighlights').value);
    const shad = parseInt(document.getElementById('adjShadows').value);
    const sat = parseInt(document.getElementById('adjSaturation').value);
    const warm = parseInt(document.getElementById('adjWarmth').value);
    const tint = parseInt(document.getElementById('adjTint').value);
    const sharp = parseInt(document.getElementById('adjSharpness').value);

    const brightness = 1 + (exp / 200) + (shad / 400) - (high / 400);
    const contrastVal = 1 + (con / 150) + (high / 500) + (shad / 500);
    const saturation = 1 + (sat / 100);
    const hueShift = (warm * 0.15) + (tint * 0.2);
    const sharpBoost = 1 + (sharp / 300);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.onload = function() {
        canvas.width = tempImg.naturalWidth;
        canvas.height = tempImg.naturalHeight;

        ctx.filter = `brightness(${brightness}) contrast(${contrastVal * sharpBoost}) saturate(${saturation}) hue-rotate(${hueShift}deg)`;
        ctx.drawImage(tempImg, 0, 0);

        ctx.filter = 'none';
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#ffffff';
        const fontSize = Math.max(24, Math.floor(canvas.width / 55));
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textBaseline = 'bottom';
        const text = 'ADEULL';
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, canvas.width - textWidth - 30, canvas.height - 25);
        ctx.globalAlpha = 1;

        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ADEULL_${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    };
    tempImg.src = img.src;
}

// ==============================================================
// DXF EXPORT
// ==============================================================
async function exportToDXF() {
  const img = document.getElementById('renderImage');
  if(!img || !img.src) { alert('No render to export'); return; }

  if(!window.currentUserId || window.currentUserId === 'guest') {
    alert('Please login to export files.'); return;
  }

  const creditCost = 20;
  const creditText = (document.getElementById('topCreditDisplay') || {}).innerText || '0';
  const currentCredits = parseInt(creditText.replace(/[^0-9]/g, '')) || 0;
  if(currentCredits < creditCost) {
    alert('DXF export requires ' + creditCost + ' credits. You have ' + currentCredits + '.'); return;
  }
  if(!confirm('DXF export will use 20 credits. AI will generate a technical drawing from your render. Continue?')) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const tempImg = new Image();
  tempImg.crossOrigin = 'anonymous';
  tempImg.onload = async function() {
    const maxW = 1024;
    const scale = Math.min(maxW / tempImg.naturalWidth, 1);
    canvas.width = Math.round(tempImg.naturalWidth * scale);
    canvas.height = Math.round(tempImg.naturalHeight * scale);
    ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const w = canvas.width, h = canvas.height;
    const d = imageData.data;

    const gray = new Float32Array(w * h);
    for(let i = 0; i < w * h; i++) {
      gray[i] = d[i*4] * 0.299 + d[i*4+1] * 0.587 + d[i*4+2] * 0.114;
    }

    const threshold = 25;
    const edges = [];
    for(let y = 1; y < h - 1; y++) {
      for(let x = 1; x < w - 1; x++) {
        const gx = -gray[(y-1)*w+(x-1)] - 2*gray[y*w+(x-1)] - gray[(y+1)*w+(x-1)]
                  + gray[(y-1)*w+(x+1)] + 2*gray[y*w+(x+1)] + gray[(y+1)*w+(x+1)];
        const gy = -gray[(y-1)*w+(x-1)] - 2*gray[(y-1)*w+x] - gray[(y-1)*w+(x+1)]
                  + gray[(y+1)*w+(x-1)] + 2*gray[(y+1)*w+x] + gray[(y+1)*w+(x+1)];
        if(Math.sqrt(gx*gx + gy*gy) > threshold) {
          edges.push({x: x, y: y, angle: Math.atan2(gy, gx)});
        }
      }
    }

    const visited = new Set();
    const polylines = [];
    const edgeMap = {};
    edges.forEach(e => { edgeMap[e.y + '_' + e.x] = e; });

    function findNeighbor(px, py) {
      for(let dy = -2; dy <= 2; dy++) {
        for(let dx = -2; dx <= 2; dx++) {
          if(dx === 0 && dy === 0) continue;
          const key = (py+dy) + '_' + (px+dx);
          if(!visited.has(key) && edgeMap[key]) return edgeMap[key];
        }
      }
      return null;
    }

    for(const e of edges) {
      const key = e.y + '_' + e.x;
      if(visited.has(key)) continue;
      visited.add(key);
      const line = [{x: e.x, y: h - e.y}];
      let current = e;
      for(let i = 0; i < 500; i++) {
        const next = findNeighbor(current.x, current.y);
        if(!next) break;
        visited.add(next.y + '_' + next.x);
        line.push({x: next.x, y: h - next.y});
        current = next;
      }
      if(line.length >= 5) polylines.push(line);
    }

    let dxf = '999\nDXF created by ADEULL AI\n';
    dxf += '0\nSECTION\n2\nHEADER\n';
    dxf += '9\n$ACADVER\n1\nAC1014\n';
    dxf += '0\nENDSEC\n';
    dxf += '0\nSECTION\n2\nTABLES\n';
    dxf += '0\nTABLE\n2\nLAYER\n70\n1\n';
    dxf += '0\nLAYER\n2\nADEULL\n70\n0\n62\n7\n6\nCONTINUOUS\n';
    dxf += '0\nENDTAB\n';
    dxf += '0\nENDSEC\n';
    dxf += '0\nSECTION\n2\nENTITIES\n';

    for(const pl of polylines) {
      if(pl.length < 2) continue;
      dxf += '0\nPOLYLINE\n8\nADEULL\n66\n8\n';
      for(const pt of pl) {
        dxf += '0\nVERTEX\n8\nADEULL\n10\n' + pt.x.toFixed(2) + '\n20\n' + pt.y.toFixed(2) + '\n30\n0.0\n';
      }
      dxf += '0\nSEQEND\n8\nADEULL\n';
    }

    dxf += '0\nENDSEC\n0\nEOF\n';

    if(window.deductCredit) await window.deductCredit('DXF_EXPORT', creditCost);

    const blob = new Blob([dxf], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ADEULL_' + Date.now() + '.dxf';
    a.click();
    URL.revokeObjectURL(url);
  };
  tempImg.src = img.src;
}

// ==============================================================
// 3D OBJ EXPORT
// ==============================================================
async function exportToGLB() {
  const img = document.getElementById('renderImage');
  if(!img || !img.src) { alert('No render to export'); return; }

  if(!window.currentUserId || window.currentUserId === 'guest') {
    alert('Please login to export files.');
    return;
  }

  const creditCost = 30;
  const creditText = (document.getElementById('topCreditDisplay') || {}).innerText || '0';
  const currentCredits = parseInt(creditText.replace(/[^0-9]/g, '')) || 0;
  if(currentCredits < creditCost) {
    alert('3D export requires ' + creditCost + ' credits. You have ' + currentCredits + '.');
    return;
  }

  if(!confirm('3D Model export will use 30 credits. Continue?')) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const tempImg = new Image();
  tempImg.crossOrigin = 'anonymous';
  tempImg.onload = async function() {
    const w = Math.min(tempImg.naturalWidth, 512);
    const h = Math.min(tempImg.naturalHeight, 512);
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(tempImg, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;

    let obj = '# ADEULL AI 3D Export\n# Generated from render\n\n';
    const step = 4;
    const vertexMap = {};
    let vIdx = 1;

    for(let y = 0; y < h; y += step) {
      for(let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        const depth = (d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114) / 255.0;
        const px = (x / w - 0.5) * 10;
        const py = depth * 2;
        const pz = (y / h - 0.5) * -10;
        obj += 'v ' + px.toFixed(3) + ' ' + py.toFixed(3) + ' ' + pz.toFixed(3) + '\n';
        obj += 'vt ' + (x / w).toFixed(4) + ' ' + (1 - y / h).toFixed(4) + '\n';
        vertexMap[y + '_' + x] = vIdx;
        vIdx++;
      }
    }

    for(let y = 0; y < h - step; y += step) {
      for(let x = 0; x < w - step; x += step) {
        const a = vertexMap[y + '_' + x];
        const b = vertexMap[y + '_' + (x + step)];
        const c = vertexMap[(y + step) + '_' + (x + step)];
        const dd = vertexMap[(y + step) + '_' + x];
        if(a && b && c && dd) {
          obj += 'f ' + a + '/' + a + ' ' + b + '/' + b + ' ' + c + '/' + c + '\n';
          obj += 'f ' + a + '/' + a + ' ' + c + '/' + c + ' ' + dd + '/' + dd + '\n';
        }
      }
    }

    if(window.deductCredit) await window.deductCredit('3D_EXPORT', creditCost);

    const blob = new Blob([obj], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ADEULL_3D_' + Date.now() + '.obj'; // Ensures .obj extension
    a.click();
    URL.revokeObjectURL(url);

    alert('3D Model exported as OBJ. Open in Blender, 3ds Max, SketchUp or any 3D software.');
  };
  tempImg.src = img.src;
}

const quickPromptData = {
    'INTERIOR': [
        'place items into the room naturally, match perspective lighting and scale perfectly, one dominant material leads the scene',
        'place items into a darker interior with balanced shadow and readable mid-tones, materials tactile and singular, lighting creates depth without hiding detail, no repeated props, no filler objects',
        'place items into an interior with lacquered or metallic finishes, surfaces smooth and continuous, reflections controlled not mirror-like, lighting creates gradients across surfaces, maximum 5 elements in scene',
        'place items with Mediterranean warmth: lime wash walls, tactile linen and natural stone, warm amber layered lighting, one broad-leaf plant as focal accent',
        'place items with craft-focused detail: visible stitching on leather, hand-troweled plaster walls, uneven ceramic glaze, one accent color only, architecture is hero'
    ],
    'EXTERIOR': [
        'place the uploaded object into the outdoor scene, match terrain lighting and perspective naturally',
        'place object into exterior with controlled contrast, one main material and one supporting element only, focus on form scale and terrain integration, realistic outdoor light',
        'place structure with Mediterranean landscape, coastal stone, woven craft details, flush pathway lights, warm golden hour, no decorative clutter',
        'integrate structure with hyper-realistic botanical landscape: individual grass blade variation, volumetric tree canopy, natural ground cover, realistic soil texture'
    ],
    'ARCHITECTURE': [
        'use given empty land as base, keep terrain unchanged, place residential buildings with correct scale spacing and layout, add simple roads and landscape, match lighting and perspective',
        'compose architecture with clear structural logic, material transitions minimal, edges sharp, no decorative additions, light reveals geometry, realistic scale',
        'place structure using cantilever logic, strong horizontal extension, underside material defined, structure feels engineered and balanced, lighting highlights overhang shadow',
        'use given terrain, create architecture based on one structural idea only: repetition or extension or carving, form readable instantly, material consistent, no decorative noise',
        'place structure focusing on construction logic, every element necessary, materials honest, proportions balanced, architecture must feel buildable and real',
        'place structure with clear roof identity, roof geometry dominates, facade simple, one material consistent, lighting emphasizes roof form and shadow lines',
        'place building with repeated structural rhythm, vertical or angled elements create pattern, lighting directional to enhance depth, no decorative landscape'
    ],
    'DESIGN': [
        'high-end interior, strong concept, cinematic lighting, one dominant material leads, rich contrast with one supporting material only, balanced composition, maximum 6 elements',
        'stone-led interior using one stone family as primary surface, furniture secondary, small brushed metal or wood accent only, directional lighting reveals veining and pores, calm composition',
        'lacquered interior with matte or satin surfaces, edges crisp, reflections controlled, palette restrained, furniture minimal, lighting creates smooth gradients, focus on surface perfection',
        'living space with large curved sectional sofa in deep velvet, generously padded cushions, sculptural brass floor lamp with blown glass shade, travertine coffee table, one accent color only, warm cinematic atmosphere',
        'dining space with sculptural table base in dark marble, steel frame chairs with leather, hand-carved sideboard with visible joinery, oversized pendant in smoky glass, lime wash walls',
        'bedroom with low platform bed, heavy bouclé headboard showing individual fiber loops, brushed gold hardware, one statement lighting piece, deep velvet throw, layered wool rugs on concrete floor',
        'home office with blackened steel desk frame, saddle leather desktop with visible stitching, cast brass task lamp, burl wood floating shelf, terrazzo floor, craft feeling throughout',
        'outdoor terrace with overstuffed cushions in teak frame, woven rope accent chair, coastal stone side table, flush pathway spotlights, one broad-leaf plant, warm golden hour'
    ],
    'PLAN': [
        'convert this floor plan into photorealistic 3D visualization, modern interior, one dominant material per room',
        'render this plan as luxury apartment, warm layered lighting, designer furniture with visible craft details, realistic material textures',
        'transform this blueprint into realistic interior, contemporary design with rich material contrast, maximum 6 elements per room, cinematic lighting'
    ],
    'PRESENTATION': [
        'create material mood board with fabric swatches showing real texture, wood samples with visible grain, stone with veining, color palette',
        'design presentation board showing furniture selections with craft details, dimensions, material callouts, one dominant material theme',
        'create architectural concept board combining tactile textures, honest finishes, layered lighting concept, spatial layout'
    ]
};

function loadQuickPrompts(menuName) {
    const container = document.getElementById('quickPrompts');
    if (!container) return;
    container.innerHTML = '';
    const prompts = quickPromptData[menuName] || [];
    prompts.forEach((p) => {
        const btn = document.createElement('button');
        btn.className = 'bg-white/5 border border-white/10 text-white/60 text-[0.45rem] tracking-widest uppercase px-2 py-1 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer';
        btn.innerText = p.length > 40 ? p.substring(0, 40) + '...' : p;
        btn.title = p;
        btn.onclick = function() {
            const isPresentation = (document.getElementById('dashboardTitle')?.getAttribute('data-raw-title') === 'PRESENTATION');
            const targetId = isPresentation ? 'sunumPromptArea' : 'promptArea';
            const promptArea = document.getElementById(targetId);
            if (promptArea) {
                promptArea.value = p;
                promptArea.dispatchEvent(new Event('input', { bubbles: true }));
                promptArea.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };
        container.appendChild(btn);
    });
}

const styleOptions = {
    'INTERIOR': {
        styles: ['Modern', 'Minimalist', 'Scandinavian', 'Japandi', 'Classic', 'Neoclassical', 'Art Deco', 'Rustic', 'Mediterranean', 'Wabi-Sabi', 'Industrial', 'Loft', 'Brutalist', 'Luxury', 'Glam', 'Maximalist', 'Bohemian', 'Eclectic', 'Vintage'],
        spaces: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining Room', 'Home Office', 'Hallway', 'Kids Room', 'Walk-in Closet', 'Library']
    },
    'EXTERIOR': {
        styles: ['English Garden', 'Japanese Garden', 'Tropical', 'Modern Landscape', 'Minimal Garden', 'Mediterranean', 'Desert', 'Coastal'],
        spaces: ['Courtyard', 'Rooftop', 'Terrace', 'Pool Area', 'Front Yard', 'Backyard', 'Balcony', 'Patio']
    },
    'ARCHITECTURE': {
        styles: ['Modern', 'Contemporary', 'Minimal', 'Classical', 'Neoclassical', 'Ottoman', 'Mediterranean', 'Japanese', 'Scandinavian', 'Brutalist', 'Industrial', 'High-Tech', 'Parametric'],
        spaces: ['Villa', 'Apartment Building', 'Office Building', 'Cafe', 'Restaurant', 'Hotel', 'Museum', 'Residential Complex', 'Shopping Center', 'School']
    },
    'DESIGN': {
        styles: ['Modern', 'Minimalist', 'Scandinavian', 'Industrial', 'Luxury', 'Mid-Century', 'Art Deco', 'Japanese', 'Rustic', 'Contemporary'],
        spaces: ['Sofa', 'Armchair', 'Coffee Table', 'Dining Table', 'Dining Chair', 'Bed', 'Desk', 'Bookshelf', 'Floor Lamp', 'Console Table', 'Side Table', 'Cabinet']
    },
    'PLAN': {
        styles: ['Modern', 'Minimalist', 'Scandinavian', 'Luxury', 'Classic', 'Industrial', 'Mediterranean'],
        spaces: ['Apartment', 'Villa', 'Studio', 'Penthouse', 'Office', 'Loft', 'Duplex']
    },
    'PRESENTATION': {
        styles: ['Modern', 'Minimalist', 'Luxury', 'Natural', 'Industrial', 'Warm', 'Cool', 'Monochrome'],
        spaces: ['Material Board', 'Mood Board', 'Color Palette', 'Furniture Selection', 'Concept Board', 'Finish Schedule']
    }
};

function loadStyleDropdowns(menuName) {
    const styleDD = document.getElementById('styleDropdown');
    const spaceDD = document.getElementById('spaceDropdown');
    if (!styleDD || !spaceDD) return;

    const data = styleOptions[menuName] || { styles: [], spaces: [] };

    styleDD.innerHTML = '<option value="" class="bg-black">STYLE</option>';
    data.styles.forEach(s => {
        styleDD.innerHTML += '<option value="' + s + '" class="bg-black">' + s.toUpperCase() + '</option>';
    });

    spaceDD.innerHTML = '<option value="" class="bg-black">SPACE TYPE</option>';
    data.spaces.forEach(s => {
        spaceDD.innerHTML += '<option value="' + s + '" class="bg-black">' + s.toUpperCase() + '</option>';
    });
}

function buildAutoPrompt() {
    const style = document.getElementById('styleDropdown')?.value || '';
    const space = document.getElementById('spaceDropdown')?.value || '';
    if (!style && !space) return;

    const menu = document.getElementById('dashboardTitle')?.getAttribute('data-raw-title') || '';
    let prompt = '';

    if (menu === 'INTERIOR' || menu === 'EXTERIOR') {
        if (style && space) prompt = 'STRICT STYLE: ' + style + '. Place uploaded items into a ' + style.toLowerCase() + ' ' + space.toLowerCase() + ', all elements must match ' + style.toLowerCase() + ' design language, match perspective lighting and scale perfectly, realistic integration';
        else if (style) prompt = style.toLowerCase() + ' style, match lighting and perspective, realistic placement';
        else if (space) prompt = 'place items in ' + space.toLowerCase() + ', natural positioning, match scene lighting';
    } else if (menu === 'ARCHITECTURE') {
        if (style && space) prompt = 'use given land as base, keep terrain unchanged, place ' + style.toLowerCase() + ' ' + space.toLowerCase() + ' with correct scale spacing and layout, add landscape, match lighting and perspective';
        else if (style) prompt = style.toLowerCase() + ' architecture, match terrain and lighting naturally';
        else if (space) prompt = 'place ' + space.toLowerCase() + ' on the site, correct scale, match environment';
    } else if (menu === 'DESIGN') {
        if (style && space) prompt = 'STRICT STYLE: ' + style + '. Design a ' + space.toLowerCase() + ' in pure ' + style.toLowerCase() + ' style. Use ONLY materials and forms authentic to ' + style.toLowerCase() + ' design language. Premium materials, professional studio lighting, photorealistic, high-end design, cinematic composition';
        else if (style) prompt = style.toLowerCase() + ' furniture design, premium materials, studio lighting';
        else if (space) prompt = 'design a ' + space.toLowerCase() + ', high-end materials, professional photography';
    } else if (menu === 'PLAN') {
        if (style && space) prompt = 'convert this plan into photorealistic ' + style.toLowerCase() + ' ' + space.toLowerCase() + ', designer furniture, realistic lighting';
        else if (style) prompt = 'render this plan as ' + style.toLowerCase() + ' interior, warm lighting, realistic';
        else if (space) prompt = 'transform this blueprint into realistic ' + space.toLowerCase() + ' visualization';
    } else if (menu === 'PRESENTATION') {
        if (style && space) prompt = 'create ' + style.toLowerCase() + ' ' + space.toLowerCase() + ' with textures, materials, finishes and color references';
        else if (style) prompt = 'create ' + style.toLowerCase() + ' presentation board with material samples';
        else if (space) prompt = 'design ' + space.toLowerCase() + ' with detailed material callouts';
    }

    const isPresentation = (document.getElementById('dashboardTitle')?.getAttribute('data-raw-title') === 'PRESENTATION');
    const targetId = isPresentation ? 'sunumPromptArea' : 'promptArea';
    const promptArea = document.getElementById(targetId);
    if (promptArea && prompt) {
        promptArea.value = prompt;
        promptArea.dispatchEvent(new Event('input', { bubbles: true }));
        promptArea.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

async function forgotPassword() {
    const email = document.getElementById('loginEmail').value;
    if (!email) { alert('Please enter your email address first.'); return; }
    if (!window.supabaseClient) return;
    const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: 'https://adeull.com' });
    if (error) { alert('Error: ' + error.message); }
    else { alert('Password reset email sent. Check your inbox.'); }
}

function showVRayLoader(show) {
    const loader = document.getElementById('vrayLoader');
    if (!loader) return;
    loader.style.display = show ? 'flex' : 'none';
    if (show) startVRayAnimation();
}

function startVRayAnimation() {
    const canvas = document.getElementById('vrayCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;
    const bw = 40, bh = 40;
    const cols = Math.floor(canvas.width / bw);
    const rows = Math.floor(canvas.height / bh);
    let buckets = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            buckets.push({ x: c * bw, y: r * bh, done: false });
        }
    }
    let shuffled = [...buckets].sort(() => Math.random() - 0.5);
    let activeCount = 8;
    let activeIdx = 0;
    let doneCount = 0;
    const progress = document.getElementById('vrayProgress');

    const interval = setInterval(() => {
        if (!document.getElementById('vrayLoader') || document.getElementById('vrayLoader').style.display === 'none') {
            clearInterval(interval);
            return;
        }
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < shuffled.length; i++) {
            const b = shuffled[i];
            if (b.done) {
                const gray = 25 + Math.random() * 35;
                ctx.fillStyle = 'rgb(' + gray + ',' + gray + ',' + gray + ')';
                ctx.fillRect(b.x, b.y, bw - 1, bh - 1);
            }
        }

        for (let a = 0; a < activeCount; a++) {
            const idx = activeIdx + a;
            if (idx < shuffled.length && !shuffled[idx].done) {
                ctx.strokeStyle = '#d4a853';
                ctx.lineWidth = 1;
                ctx.strokeRect(shuffled[idx].x, shuffled[idx].y, bw - 1, bh - 1);
                ctx.fillStyle = 'rgba(212,168,83,0.15)';
                ctx.fillRect(shuffled[idx].x, shuffled[idx].y, bw - 1, bh - 1);
            }
        }

        doneCount++;
        if (doneCount % 3 === 0 && activeIdx < shuffled.length) {
            shuffled[activeIdx].done = true;
            activeIdx++;
        }

        if (progress) progress.style.width = Math.round((activeIdx / shuffled.length) * 100) + '%';

        if (activeIdx >= shuffled.length) {
            activeIdx = 0;
            doneCount = 0;
            shuffled = [...buckets].sort(() => Math.random() - 0.5);
            buckets.forEach(b => b.done = false);
        }
    }, 30);
}

async function quickRevision(command) {
    if (!command) return;
    if (!window.currentUserId || window.currentUserId === 'guest') {
        alert('Please login to use revisions.');
        return;
    }

    // NEW ANGLE komutu - sıfırdan render al, revizyon değil
    if (command.includes('different camera angle') || command.includes('opposite corner')) {
        const newPrompt = (window.originalRenderPrompt || 'modern interior') + ', shot from a completely different camera angle and viewpoint';
        const promptArea = document.getElementById('promptArea');
        if (promptArea) {
            promptArea.value = newPrompt;
            promptArea.dispatchEvent(new Event('input', { bubbles: true }));
            promptArea.dispatchEvent(new Event('change', { bubbles: true }));
        }
        window.isRevisionMode = false;
        window.originalRenderBase64 = null;
        window.revisionHistory = [];
        const angleCreditCost = window._currentQualityConfig?.creditCost || 12;
        const angleCreditText = (document.getElementById('topCreditDisplay') || {}).innerText || '0';
        const angleCredits = parseInt(angleCreditText.replace(/[^0-9]/g, '')) || 0;
        if (angleCredits < angleCreditCost) { alert('Insufficient credits.'); return; }
        if (!confirm('This will use ' + angleCreditCost + ' credits. Continue?')) return;
        const genBtn = document.getElementById('generateBtnUnified');
        if (genBtn) genBtn.click();
        return;
    }

    const creditCost = window._currentQualityConfig?.creditCost || 12;
    const creditText = (document.getElementById('topCreditDisplay') || {}).innerText || '0';
    const currentCredits = parseInt(creditText.replace(/[^0-9]/g, '')) || 0;
    if (currentCredits < creditCost) {
        alert('Insufficient credits for revision. You need ' + creditCost + ' credits.');
        return;
    }
    if (!confirm('Revision will use ' + creditCost + ' credits. Continue?')) return;

    const renderImg = document.getElementById('renderImage') || document.querySelector('#renderImgContainer img');
    if (!renderImg || !renderImg.src) { alert('No render to revise'); return; }

    window.revisionHistory = window.revisionHistory || [];
    window.revisionHistory.push(command);

    const imgSrc = window.originalRenderBase64 || renderImg.src;
    let base64Data = imgSrc;
    if (imgSrc.startsWith('blob:')) {
        const resp = await fetch(imgSrc);
        const blob = await resp.blob();
        base64Data = await new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result); fr.readAsDataURL(blob); });
    }
    base64Data = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

    const fullPrompt = (window.originalRenderPrompt || '') + ' [APPLY ALL REVISIONS IN ORDER: ' + window.revisionHistory.join(' AND THEN ') + ']';

    const btn = document.getElementById('generateBtnUnified');
    if (btn) { btn.disabled = true; btn.innerHTML = 'REVISING...'; btn.classList.add('animate-pulse'); }

    showVRayLoader(true);

    const sessionData = window.supabaseClient ? await window.supabaseClient.auth.getSession() : null;
    const authToken = sessionData?.data?.session?.access_token || '';

    try {
        if (window.deductCredit) {
            const ok = await window.deductCredit('REVISION', creditCost);
            if (!ok) { if (btn) btn.disabled = false; showVRayLoader(false); return; }
        }

        const response = await fetch(window.CORE_ENGINE_V2, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate',
                prompt: fullPrompt,
                isRevision: true,
                images: { currentRender: base64Data },
                language: (document.getElementById('activeCode') || {}).innerText || 'EN',
                aspectRatio: window.currentRatio || '16:9',
                resolution: window._currentQualityConfig?.resolution || '4096x4096',
                creditCost: creditCost,
                user_id: window.currentUserId,
                user_token: authToken
            })
        });

        if (!response.ok) throw new Error('Server Error: ' + response.status);
        const data = await response.json();
        let result = Array.isArray(data) ? data[0] : data;
        let rawOutput = result.output_url || result.output || '';
        if (result.candidates && result.candidates[0]?.content?.parts[0]?.inlineData) {
            rawOutput = result.candidates[0].content.parts[0].inlineData.data;
        }

        if (rawOutput && renderImg) {
            if (rawOutput.startsWith('http')) {
                renderImg.crossOrigin = 'Anonymous';
                renderImg.src = rawOutput;
            } else {
                let clean = rawOutput.replace(/^data:image\/[a-z]+;base64,/, '').replace(/\s/g, '');
                const blob = b64toBlob(clean, 'image/png');
                renderImg.src = URL.createObjectURL(blob);
            }
        }
        const customInput = document.getElementById('customRevisionInput');
        if (customInput) customInput.value = '';
    } catch (error) {
        console.error('Revision error:', error);
        if (window.supabaseClient && window.currentUserId) {
            try {
                await window.supabaseClient.rpc('refund_credit', { p_user_id: window.currentUserId, p_amount: creditCost });
                const { data: rd } = await window.supabaseClient.from('users').select('credits').eq('id', window.currentUserId).single();
                if (rd) {
                    var t = document.getElementById('topCreditDisplay');
                    var p = document.getElementById('panelCreditDisplay');
                    if (t) t.innerText = rd.credits.toLocaleString();
                    if (p) p.innerText = rd.credits.toLocaleString();
                }
            } catch(re) {}
        }
        alert('Revision failed. Credits refunded.');
    } finally {
        showVRayLoader(false);
        if (btn) { btn.disabled = false; btn.innerHTML = 'GENERATE'; btn.classList.remove('animate-pulse'); }
    }
}


async function quickDetailFromOriginal() {
    if (!window.currentUserId || window.currentUserId === 'guest') {
        alert('Please login.');
        return;
    }
    var originalImg = window.originalRenderBase64;
    if (!originalImg) {
        var renderImg = document.getElementById('renderImage') || document.querySelector('#renderImgContainer img');
        if (renderImg) originalImg = renderImg.src;
    }
    if (!originalImg) { alert('No render to analyze'); return; }
    quickRevision('create a detail showcase of this scene: split the image into 4 equal quadrants, each quadrant showing an extreme close-up macro photograph of a different material or texture visible in the scene, top-left shows the main furniture material in extreme detail, top-right shows the floor or wall material texture, bottom-left shows a fabric or upholstery close-up, bottom-right shows a metal or accessory detail, each quadrant must be a hyper-realistic macro photograph showing individual fibers grains veins or surface imperfections, professional product photography lighting');
}
