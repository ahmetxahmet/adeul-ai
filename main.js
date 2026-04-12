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
window.selectedQuality = '4K'; // default 
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
        alert('Please login or sign up to use ADEULL AI.');
        return;
    }
    const _upscaleCreditText = (document.getElementById('topCreditDisplay') || {}).innerText || '0';
    const _upscaleCredits = parseInt(_upscaleCreditText.replace(/[^0-9]/g, '')) || 0;
    if (_upscaleCredits < 10) {
        alert('Insufficient credits. You need 10 credits for 8K render.\n\nPlease redeem a coupon or upgrade your plan from the BILLING menu.');
        return;
    }
    try {
        let finalImage = imageUrl;
        if (imageUrl.startsWith('blob:')) {
            const blobResponse = await fetch(imageUrl);
            const blob = await blobResponse.blob();
            finalImage = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        }

        const sessionData = window.supabaseClient ? await window.supabaseClient.auth.getSession() : null;
        const authToken = sessionData?.data?.session?.access_token || '';
        const response = await fetch(window.CORE_UPSCALE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: finalImage, user_token: authToken })
        });
        
        if (!response.ok) throw new Error("Core Engine is not responding!");
        
        const data = await response.json();
        return data.output_url || data.output || data;
    } catch (error) {
        console.error("Upscale hatası:", error);
        throw error;
    }
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
    const cleanPrompt = userPrompt.replace(/\"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ');

    const activeLangCodeElement = document.getElementById('activeCode');
    const activeLangCode = activeLangCodeElement ? activeLangCodeElement.innerText : 'EN';

    if(window.deductCredit) {
        const ok = await window.deductCredit(is8K ? '8K_RENDER' : 'NORMAL_RENDER', window._currentQualityConfig?.creditCost || (is8K ? 30 : 12));
        if(!ok) { btn.disabled = false; return; }
    }
    btn.innerHTML = is8K ? '8K RENDER IN PROGRESS...' : 'ADEULL AI GENERATING...';
    btn.classList.add('bg-blue-600', 'text-white', 'animate-pulse');

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

    // Add secure auth token and user_id to payload for Core Engine validation
    const sessionData = window.supabaseClient ? await window.supabaseClient.auth.getSession() : null;
    const authToken = sessionData?.data?.session?.access_token || "";

    const payload = {
        action: 'generate',
        prompt: cleanPrompt,
        isSketch: isSketchMode,
        sketchData: theSketchImage,
        images: window.uploadedBase64,
        items: filledItems.map(b => b.base64),
        language: activeLangCode,
        aspectRatio: window.currentRatio,
        imageSize: "4K",
        output_mime_type: "image/png",
        resolution: window._currentQualityConfig?.resolution || (is8K ? '8K_upscale' : '4096x4096'),
        creditCost: window._currentQualityConfig?.creditCost || (is8K ? 30 : 12),
        user_id: window.currentUserId || "guest",
        user_token: authToken
    };

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
                    showRenderScreen();
                } else {
                    let cleanBase64 = String(rawOutput).replace(/^data:image\/[a-z]+;base64,/, '').replace(/\s/g, '');
                    
                    const imageBlob = b64toBlob(cleanBase64, 'image/png'); 
                    finalImage = URL.createObjectURL(imageBlob);
                    
                    imgElement.src = finalImage;
                    showRenderScreen();
                }

                if (is8K) {
                    toggleUpscaleLoader(true);
                    btn.innerHTML = '8K RENDER ALINIYOR...';
                    try {
                        const upscaledUrl = await ADEULL_UPSCALE(finalImage);
                        if(upscaledUrl) {
                            imgElement.crossOrigin = "Anonymous";
                            imgElement.src = upscaledUrl;
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
        alert("⚙️ ADEULL AI is currently updating. Please try again in a few minutes.");
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
    const overlay = document.getElementById('renderOverlay');
    if(overlay) { overlay.classList.remove('hidden'); overlay.classList.add('flex'); setTimeout(() => overlay.style.opacity = '1', 50); }
    if(typeof resetAdjust === 'function') resetAdjust();
}

function closeRender() {
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
        b.className = b.className.replace('bg-white/20 text-white', 'bg-white/5 text-white/60');
        if(!b.className.includes('bg-white/5')) b.className += ' bg-white/5 text-white/60';
    });
    if(btn) {
        btn.className = btn.className.replace('bg-white/5 text-white/60', 'bg-white/20 text-white');
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