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
window.clickSound = document.getElementById('hoverSound');
window.CLOUDFLARE_URL = "https://adeul-ia.app.n8n.cloud/webhook/adeul-ai-v2";

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
            <div class="text-lg font-bold tracking-widest uppercase">8K RENDER ALINIYOR</div>
            <div class="text-sm font-light text-gray-300 mt-2">Lütfen bekleyiniz...</div>
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

        const n8nUpscaleURL = "https://adeul-ia.app.n8n.cloud/webhook/upscale"; 
        const response = await fetch(n8nUpscaleURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: finalImage })
        });
        
        if (!response.ok) throw new Error("N8N Webhook yanıt vermedi!");
        
        const data = await response.json();
        return data.output_url || data.output || data;
    } catch (error) {
        console.error("Upscale hatası:", error);
        throw error;
    }
}

async function simulateAPIConnection(btnId, is8K = false) {
    playSound();
    const btn = document.getElementById(btnId);
    if (!btn || btn.disabled) return;
    btn.disabled = true;

    const originalText = btn.innerHTML;
    const promptInput = document.getElementById('promptArea');
    const userPrompt = promptInput && promptInput.value.trim() !== "" ? promptInput.value : "Modern architectural design";
    
    const activeLangCodeElement = document.getElementById('activeCode');
    const activeLangCode = activeLangCodeElement ? activeLangCodeElement.innerText : 'EN';

    if(window.deductCredit) {
        const ok = await window.deductCredit(is8K ? '8K_RENDER' : 'NORMAL_RENDER', is8K ? 4 : 1);
        if(!ok) { btn.disabled = false; return; }
    }
    btn.innerHTML = is8K ? '8K RENDER ALINIYOR...' : 'ADEULL AI GENERATING...';
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

    const payload = {
        action: 'generate',  
        prompt: userPrompt,
        isSketch: isSketchMode,
        sketchData: theSketchImage,
        images: window.uploadedBase64,
        language: activeLangCode,
        aspectRatio: window.currentRatio,
        imageSize: "4K",
        output_mime_type: "image/png"
    };

    try {
        const response = await fetch(window.CLOUDFLARE_URL, {
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
            throw new Error('Yanit bozuk - tekrar deneyin');
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
                        console.log("8K Upscale yapılamadı, orijinal render ekranda kaldı.", upscaleError);
                    } finally {
                        toggleUpscaleLoader(false); 
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
        alert("⚙️ ADEULL AI şu an güncelleniyor. Lütfen birkaç dakika sonra tekrar deneyin.");
        closeRender();
    } finally {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-blue-600', 'text-white', 'animate-pulse');
        btn.disabled = false;
        toggleUpscaleLoader(false); 
    }
}

async function saveRender(mode = 'renderImgContainer') {
    playSound();
    if (mode === 'renderImgContainer') {
        const imgElement = document.querySelector('#renderImgContainer img');
        if (!imgElement || !imgElement.src || imgElement.src.length < 10) { alert("Kaydedilecek bir görsel yok!"); return; }

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
            console.error("İndirme hatası, alternatif deneniyor:", err);
            const link = document.createElement('a');
            link.href = imgElement.src;
            link.download = `ADEULL_AI_RENDER_${new Date().getTime()}.png`;
            link.target = "_blank"; 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } 
    else if (mode === 'presentationOverlay') {
        const activeBoard = document.getElementById(`boardTemplate${window.currentBoardStyle}`);
        if(!activeBoard) return;

        const originalWidth = activeBoard.style.width;
        const originalHeight = activeBoard.style.height;
        const originalMaxWidth = activeBoard.style.maxWidth;
        const originalTransform = activeBoard.style.transform;
        
        activeBoard.classList.remove('transform', 'scale-[0.6]', 'lg:scale-100');
        const targetHeight = activeBoard.scrollHeight > 850 ? activeBoard.scrollHeight : 850;

        activeBoard.style.width = "1200px";
        activeBoard.style.height = targetHeight + "px"; 
        activeBoard.style.maxWidth = "none";
        activeBoard.style.transform = "none";
        
        const executeDownload = () => {
            html2canvas(activeBoard, { scale: 4, useCORS: true, scrollY: 0, backgroundColor: '#fdfdfd' }).then(canvas => {
                activeBoard.style.width = originalWidth;
                activeBoard.style.height = originalHeight;
                activeBoard.style.maxWidth = originalMaxWidth;
                activeBoard.style.transform = originalTransform;
                activeBoard.classList.add('transform', 'scale-[0.6]', 'lg:scale-100');
                
                const link = document.createElement('a');
                link.download = `ADEULL_AI_Board_${window.currentBoardStyle}_HQ_${new Date().getTime()}.png`;
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
            });
        };

        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            script.onload = executeDownload;
            document.head.appendChild(script);
        } else {
            executeDownload();
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

function showPresentationScreen() {
    const overlay = document.getElementById('presentationOverlay');
    if(overlay) { overlay.classList.remove('hidden'); overlay.classList.add('flex'); setTimeout(() => overlay.style.opacity = '1', 50); }
}

function closePresentation() {
    const overlay = document.getElementById('presentationOverlay');
    if(overlay) { overlay.style.opacity = '0'; setTimeout(() => overlay.classList.add('hidden'), 500); }
}

function toggleFullscreen() {
    document.getElementById('renderImgContainer').classList.toggle('fullscreen');
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
        const renderOverlay = document.getElementById('renderOverlay');
        const presentationOverlay = document.getElementById('presentationOverlay');
        const userPanel = document.getElementById('userSidePanel');
        const langMenu = document.getElementById('langDropdown');
        const dashboard = document.getElementById('dashboard');
        
        if (renderOverlay && !renderOverlay.classList.contains('hidden')) { closeRender(); } 
        else if (presentationOverlay && !presentationOverlay.classList.contains('hidden')) { if (typeof closePresentation === 'function') closePresentation(); } 
        else if (langMenu && !langMenu.classList.contains('hidden')) { langMenu.classList.add('hidden'); langMenu.classList.remove('flex'); } 
        else if (userPanel && userPanel.classList.contains('open')) { userPanel.classList.remove('open'); } 
        else if (dashboard && dashboard.classList.contains('active')) { exitDashboard(); }
    }
});