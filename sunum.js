// ==============================================================
// SUNUM.JS — ADEULL AI PRESENTATION MODULE (V2 — SIFIRDAN)
// ==============================================================
// Bağımsız çalışır. Tek görsel + prompt → N8N analyze → Board render
// Tüm 10 dil destekli. Firebase yok, sadece N8N webhook.
// ==============================================================

(function() {
    'use strict';

    // ─── SUNUM DİL SÖZLÜĞÜ ───
    const sunumDict = {
        'EN': { title: 'MATERIAL & FINISH BOARD', project: 'PROJECT', materials: 'MATERIALS & TEXTURES', colorPalette: 'COLOR PALETTE (RAL)', analyze: 'ANALYZE PRESENTATION', analyzing: 'ANALYZING...', uploadProduct: 'UPLOAD PRODUCT / PROJECT IMAGE', promptPh: 'Describe what to analyze (e.g., "Analyze materials and finishes")...', download: 'DOWNLOAD BOARD', noImage: 'Please upload an image first.', error: 'Analysis failed. Please check your connection and try again.', material: 'MATERIAL' },
        'TR': { title: 'MALZEME & KAPLAMA PAFTASI', project: 'PROJE', materials: 'MALZEMELER & DOKULAR', colorPalette: 'RENK KARTELASİ (RAL)', analyze: 'SUNUM ANALİZ ET', analyzing: 'ANALİZ EDİLİYOR...', uploadProduct: 'ÜRÜN / PROJE GÖRSELİ YÜKLE', promptPh: 'Ne analiz edilsin tarif edin (Örn: "Malzemeleri ve dokuları analiz et")...', download: 'PAFTAYI İNDİR', noImage: 'Lütfen önce bir görsel yükleyin.', error: 'Analiz başarısız. Lütfen bağlantınızı kontrol edip tekrar deneyin.', material: 'MALZEME' },
        'ES': { title: 'TABLERO DE MATERIALES', project: 'PROYECTO', materials: 'MATERIALES Y TEXTURAS', colorPalette: 'PALETA DE COLORES (RAL)', analyze: 'ANALIZAR PRESENTACIÓN', analyzing: 'ANALIZANDO...', uploadProduct: 'SUBIR IMAGEN DE PRODUCTO', promptPh: 'Describe qué analizar...', download: 'DESCARGAR TABLERO', noImage: 'Suba una imagen primero.', error: 'Análisis fallido.', material: 'MATERIAL' },
        'DE': { title: 'MATERIAL & FINISH BOARD', project: 'PROJEKT', materials: 'MATERIALIEN & TEXTUREN', colorPalette: 'FARBPALETTE (RAL)', analyze: 'PRÄSENTATION ANALYSIEREN', analyzing: 'ANALYSE LÄUFT...', uploadProduct: 'PRODUKTBILD HOCHLADEN', promptPh: 'Beschreiben Sie die Analyse...', download: 'BOARD HERUNTERLADEN', noImage: 'Bitte laden Sie zuerst ein Bild hoch.', error: 'Analyse fehlgeschlagen.', material: 'MATERIAL' },
        'FR': { title: 'PLANCHE DE MATÉRIAUX', project: 'PROJET', materials: 'MATÉRIAUX & TEXTURES', colorPalette: 'PALETTE COULEURS (RAL)', analyze: 'ANALYSER PRÉSENTATION', analyzing: 'ANALYSE EN COURS...', uploadProduct: 'CHARGER IMAGE PRODUIT', promptPh: 'Décrivez l\'analyse souhaitée...', download: 'TÉLÉCHARGER PLANCHE', noImage: 'Veuillez charger une image.', error: 'Analyse échouée.', material: 'MATÉRIEL' },
        'PT': { title: 'PLACA DE MATERIAIS', project: 'PROJETO', materials: 'MATERIAIS & TEXTURAS', colorPalette: 'PALETA DE CORES (RAL)', analyze: 'ANALISAR APRESENTAÇÃO', analyzing: 'ANALISANDO...', uploadProduct: 'CARREGAR IMAGEM DO PRODUTO', promptPh: 'Descreva o que analisar...', download: 'BAIXAR PLACA', noImage: 'Carregue uma imagem primeiro.', error: 'Análise falhou.', material: 'MATERIAL' },
        'ID': { title: 'PAPAN MATERIAL & FINISHING', project: 'PROYEK', materials: 'MATERIAL & TEKSTUR', colorPalette: 'PALET WARNA (RAL)', analyze: 'ANALISIS PRESENTASI', analyzing: 'MENGANALISIS...', uploadProduct: 'UNGGAH GAMBAR PRODUK', promptPh: 'Jelaskan apa yang akan dianalisis...', download: 'UNDUH PAPAN', noImage: 'Unggah gambar terlebih dahulu.', error: 'Analisis gagal.', material: 'MATERIAL' },
        'HI': { title: 'सामग्री और फिनिश बोर्ड', project: 'परियोजना', materials: 'सामग्री और बनावट', colorPalette: 'रंग पैलेट (RAL)', analyze: 'प्रस्तुति का विश्लेषण', analyzing: 'विश्लेषण हो रहा है...', uploadProduct: 'उत्पाद छवि अपलोड करें', promptPh: 'विश्लेषण का वर्णन करें...', download: 'बोर्ड डाउनलोड करें', noImage: 'कृपया पहले छवि अपलोड करें।', error: 'विश्लेषण विफल।', material: 'सामग्री' },
        'AR': { title: 'لوحة المواد والتشطيبات', project: 'مشروع', materials: 'المواد والقوام', colorPalette: 'لوحة الألوان (RAL)', analyze: 'تحليل العرض', analyzing: '...جاري التحليل', uploadProduct: 'تحميل صورة المنتج', promptPh: '...صف ما يجب تحليله', download: 'تحميل اللوحة', noImage: 'يرجى تحميل صورة أولاً.', error: 'فشل التحليل.', material: 'مادة' },
        'IT': { title: 'TAVOLA MATERIALI E FINITURE', project: 'PROGETTO', materials: 'MATERIALI E TEXTURE', colorPalette: 'PALETTE COLORI (RAL)', analyze: 'ANALIZZA PRESENTAZIONE', analyzing: 'ANALISI IN CORSO...', uploadProduct: 'CARICA IMMAGINE PRODOTTO', promptPh: 'Descrivi cosa analizzare...', download: 'SCARICA TAVOLA', noImage: 'Carica prima un\'immagine.', error: 'Analisi fallita.', material: 'MATERIALE' }
    };

    function getSunumLang() {
        const code = document.getElementById('activeCode');
        const lang = code ? code.innerText.trim() : 'EN';
        return sunumDict[lang] || sunumDict['EN'];
    }

    // ─── N8N WEBHOOK URL ───
    const SUNUM_WEBHOOK = "https://adeul-ia.app.n8n.cloud/webhook/analyze-presentation";

    // ─── SUNUM GÖRSEL STATE ───
    window._sunumImageBase64 = null;

    // ─── GÖRSEL YÜKLEME ───
    window.sunumUploadImage = function() {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(e => {}); }
        document.getElementById('fileSunumImage').click();
    };

    window.sunumPreviewImage = function(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                window._sunumImageBase64 = dataUrl.split(',')[1];
                const box = document.getElementById('boxSunumImage');
                const old = box.querySelector('.sunum-preview');
                if (old) old.remove();
                Array.from(box.children).forEach(c => { if (!c.classList.contains('sunum-preview')) c.style.display = 'none'; });
                const prev = document.createElement('div');
                prev.className = 'sunum-preview absolute inset-0 w-full h-full';
                prev.innerHTML = `
                    <img src="${dataUrl}" class="absolute inset-0 w-full h-full object-contain opacity-90 rounded-2xl">
                    <button onclick="event.stopPropagation(); sunumRemoveImage()" class="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-red-500 z-50 shadow-lg border border-white/20">✕</button>
                    <div class="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
                        <span class="bg-black/70 px-4 py-1.5 rounded-lg text-[0.55rem] font-bold tracking-widest text-green-300 shadow-lg uppercase">LOADED ✓</span>
                    </div>`;
                box.appendChild(prev);
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    window.sunumRemoveImage = function() {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(e => {}); }
        window._sunumImageBase64 = null;
        const box = document.getElementById('boxSunumImage');
        const prev = box.querySelector('.sunum-preview');
        if (prev) prev.remove();
        Array.from(box.children).forEach(c => c.style.display = '');
        const fi = document.getElementById('fileSunumImage');
        if (fi) { fi.value = ''; fi.type = 'text'; fi.type = 'file'; }
    };

    // ─── ANA ANALİZ FONKSİYONU ───
    window.startSunumAnalysis = async function() {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(e => {}); }

        const lang = getSunumLang();
        const langCode = (document.getElementById('activeCode') || {}).innerText || 'EN';

        if (!window._sunumImageBase64) {
            alert(lang.noImage);
            return;
        }

        if (window.deductCredit) {
            const ok = await window.deductCredit('PRESENTATION', 1);
            if (!ok) return;
        }

        const btn = document.getElementById('btnSunumAnalyze');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<svg class="animate-spin h-4 w-4 inline-block mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ${lang.analyzing}`;
        btn.classList.add('bg-blue-600', 'animate-pulse');

        const userPrompt = (document.getElementById('sunumPromptArea') || {}).value || '';

        const promptText = `You are a Senior Interior Designer and Material Expert. Analyze this image deeply. 
Return ONLY valid JSON, NO markdown, NO backticks. 
Translate 'projectName', 'title', and 'desc' to language: ${langCode}.

JSON structure:
{
  "projectName": "Sophisticated concept name for this product/project",
  "colors": [
    {"hex": "#HEX1", "ral": "RAL XXXX", "name": "Color Name"},
    {"hex": "#HEX2", "ral": "RAL XXXX", "name": "Color Name"},
    {"hex": "#HEX3", "ral": "RAL XXXX", "name": "Color Name"},
    {"hex": "#HEX4", "ral": "RAL XXXX", "name": "Color Name"}
  ],
  "materials": [
    {"title": "Material Name", "desc": "Sensory description of material", "hex": "#HEX"},
    {"title": "Material Name", "desc": "Description", "hex": "#HEX"},
    {"title": "Material Name", "desc": "Description", "hex": "#HEX"}
  ]
}

Extract 3-5 materials with accurate hex from pixels, and 4 dominant colors with real RAL codes.
${userPrompt ? 'Additional instruction: ' + userPrompt : ''}`;

        try {
            const response = await fetch(SUNUM_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'analyze_presentation',
                    prompt: promptText,
                    image: window._sunumImageBase64,
                    language: langCode
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            let analysis = {};
            try {
                let raw = data.output || data.text || JSON.stringify(data);
                if (typeof raw === 'string') {
                    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
                    analysis = JSON.parse(raw);
                } else {
                    analysis = raw;
                }
            } catch (e) {
                console.error('JSON Parse Error:', e);
                analysis = { projectName: 'ANALYSIS', materials: [], colors: [] };
            }

            renderSunumBoard(analysis, langCode);

        } catch (error) {
            console.error('Sunum Analysis Error:', error);
            alert(lang.error);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.classList.remove('bg-blue-600', 'animate-pulse');
        }
    };

    // ─── PAFTA RENDER FONKSİYONU ───
    function renderSunumBoard(analysis, langCode) {
        const lang = getSunumLang();
        const projectName = (analysis.projectName || 'CONCEPT BOARD').toUpperCase();
        const materials = analysis.materials || [];
        const colors = analysis.colors || [];
        const imageSrc = 'data:image/jpeg;base64,' + window._sunumImageBase64;

        // Malzeme satırları
        let materialsHTML = '';
        materials.forEach((m, i) => {
            const hex = m.hex || m.hexColor || '#CCC';
            materialsHTML += `
            <div class="flex items-center gap-4 mb-5">
                <div class="w-14 h-14 rounded-full shadow-md border-2 border-gray-200 flex-shrink-0" style="background-color: ${hex}"></div>
                <div class="flex-1">
                    <div contenteditable="true" class="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gray-800 outline-none hover:bg-gray-100 px-1 rounded cursor-text">${m.title || lang.material + ' ' + (i + 1)}</div>
                    <div contenteditable="true" class="text-[0.55rem] tracking-wider text-gray-500 uppercase mt-0.5 outline-none hover:bg-gray-100 px-1 rounded cursor-text leading-relaxed">${m.desc || ''}</div>
                </div>
            </div>`;
        });

        // Renk kartelası
        let colorsHTML = '';
        colors.forEach((c) => {
            const hex = typeof c === 'string' ? c : (c.hex || '#CCC');
            const ral = typeof c === 'string' ? '' : (c.ral || '');
            const name = typeof c === 'string' ? '' : (c.name || '');
            colorsHTML += `
            <div class="flex-1 flex flex-col items-center gap-1.5 min-w-[80px]">
                <div class="w-full h-16 rounded shadow-inner border border-gray-200" style="background-color: ${hex}"></div>
                <span contenteditable="true" class="text-[0.5rem] tracking-widest text-gray-600 font-bold outline-none hover:bg-gray-100 px-1 rounded cursor-text">${hex}</span>
                ${ral ? `<span contenteditable="true" class="text-[0.45rem] tracking-wider text-gray-400 font-medium outline-none hover:bg-gray-100 px-1 rounded cursor-text">${ral}</span>` : ''}
                ${name ? `<span contenteditable="true" class="text-[0.4rem] tracking-wider text-gray-400 outline-none hover:bg-gray-100 px-1 rounded cursor-text">${name}</span>` : ''}
            </div>`;
        });

        // Board HTML
        const boardContainer = document.getElementById('sunumBoardContainer');
        boardContainer.innerHTML = `
        <div id="sunumBoardPrint" class="bg-white w-[1100px] min-h-[780px] p-12 shadow-2xl rounded-sm relative" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a;">
            
            <!-- HEADER -->
            <div class="flex justify-between items-end border-b-2 border-gray-200 pb-4 mb-8">
                <div>
                    <h1 contenteditable="true" class="text-2xl font-light tracking-[0.25em] uppercase text-gray-800 outline-none hover:bg-gray-50 rounded px-2 -ml-2 cursor-text">${lang.title}</h1>
                    <p contenteditable="true" class="text-[0.65rem] tracking-[0.3em] text-gray-400 uppercase mt-2 font-bold outline-none hover:bg-gray-50 rounded px-2 -ml-2 cursor-text">${lang.project}: ${projectName}</p>
                </div>
                <div class="text-[0.55rem] font-bold tracking-[0.4em] text-gray-300 uppercase">ADEULL AI STUDIO</div>
            </div>

            <!-- MAIN -->
            <div class="flex gap-10">
                
                <!-- SOL: ÜRÜN -->
                <div class="w-[55%] flex flex-col justify-center">
                    <div class="bg-gray-50 p-4 border border-gray-100 rounded shadow-sm">
                        <img src="${imageSrc}" class="w-full h-auto object-contain max-h-[420px] mx-auto" style="mix-blend-mode: multiply;">
                    </div>
                </div>

                <!-- SAĞ: MALZEMELER -->
                <div class="w-[45%] flex flex-col justify-between pl-6 border-l border-gray-100">
                    <div>
                        <h3 contenteditable="true" class="text-[0.6rem] tracking-[0.3em] text-gray-400 font-bold uppercase mb-5 border-b border-gray-100 pb-2 outline-none hover:bg-gray-50 cursor-text px-1">${lang.materials}</h3>
                        ${materialsHTML}
                    </div>

                    <!-- RENK KARTELASİ -->
                    <div class="mt-6 pt-5 border-t border-gray-100">
                        <h3 contenteditable="true" class="text-[0.6rem] tracking-[0.3em] text-gray-400 font-bold uppercase mb-4 outline-none hover:bg-gray-50 cursor-text px-1">${lang.colorPalette}</h3>
                        <div class="flex gap-3">
                            ${colorsHTML}
                        </div>
                    </div>
                </div>
            </div>

            <!-- FOOTER -->
            <div class="absolute bottom-4 left-12 right-12 flex justify-between items-end opacity-30">
                <span class="text-[0.4rem] tracking-[0.3em] uppercase">ADEULL AI — ARCHITECTURAL CORE INTELLIGENCE</span>
                <span class="text-[0.4rem] tracking-[0.2em]">${new Date().toLocaleDateString()}</span>
            </div>
        </div>`;

        showSunumOverlay();
    }

    // ─── OVERLAY KONTROL ───
    function showSunumOverlay() {
        const overlay = document.getElementById('sunumOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
            setTimeout(() => overlay.style.opacity = '1', 30);
        }
    }

    window.closeSunumOverlay = function() {
        const overlay = document.getElementById('sunumOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex');
            }, 400);
        }
    };

    // ─── İNDİRME ───
    window.downloadSunumBoard = function() {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(e => {}); }
        const board = document.getElementById('sunumBoardPrint');
        if (!board) return;

        const origTransform = board.style.transform;
        board.style.transform = 'none';
        board.style.transformOrigin = 'top left';

        const doDownload = () => {
            html2canvas(board, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                scrollY: 0
            }).then(canvas => {
                board.style.transform = origTransform;
                const link = document.createElement('a');
                link.download = `ADEULL_BOARD_${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
            });
        };

        if (typeof html2canvas === 'undefined') {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            s.onload = doDownload;
            document.head.appendChild(s);
        } else {
            doDownload();
        }
    };

    // ─── ESKİ FONKSİYON UYUMLULUĞU ───
    window.analyzePresentation = window.startSunumAnalysis;
    window.generateTextureRender = function() { window.startSunumAnalysis(); };
    window.handlePresentationBoxClick = function() {
        if (window._sunumImageBase64) {
            window.startSunumAnalysis();
        } else {
            document.getElementById('fileSunumImage').click();
        }
    };
    window.closePresentation = window.closeSunumOverlay;
    window.showPresentationScreen = showSunumOverlay;

})();