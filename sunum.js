// ==============================================================
// SUNUM.JS — ADEULL AI PRESENTATION MODULE
// Ana webhook: window.CLOUDFLARE_URL (adeul-ai-v2)
// N8N routing: action === "presentation"
// 2 AŞAMALI SİSTEM: TEXTURE RENDER + ANALİZ
// ==============================================================

(function() {
    'use strict';

    var sunumDict = {
        'EN': { title: 'MATERIAL & FINISH BOARD', project: 'PROJECT', materials: 'MATERIALS & TEXTURES', colorPalette: 'COLOR PALETTE (RAL)', analyzing: 'ANALYZING...', download: 'DOWNLOAD BOARD', noImage: 'Please upload an image first.', error: 'Analysis failed. Please check your connection and try again.', material: 'MATERIAL' },
        'TR': { title: 'MALZEME & KAPLAMA PAFTASI', project: 'PROJE', materials: 'MALZEMELER & DOKULAR', colorPalette: 'RENK KARTELASİ (RAL)', analyzing: 'ANALİZ EDİLİYOR...', download: 'PAFTAYI İNDİR', noImage: 'Lütfen önce bir görsel yükleyin.', error: 'Analiz başarısız. Lütfen bağlantınızı kontrol edip tekrar deneyin.', material: 'MALZEME' },
        'ES': { title: 'TABLERO DE MATERIALES', project: 'PROYECTO', materials: 'MATERIALES Y TEXTURAS', colorPalette: 'PALETA DE COLORES (RAL)', analyzing: 'ANALIZANDO...', download: 'DESCARGAR TABLERO', noImage: 'Suba una imagen primero.', error: 'Análisis fallido.', material: 'MATERIAL' },
        'DE': { title: 'MATERIAL & FINISH BOARD', project: 'PROJEKT', materials: 'MATERIALIEN & TEXTUREN', colorPalette: 'FARBPALETTE (RAL)', analyzing: 'ANALYSE LÄUFT...', download: 'BOARD HERUNTERLADEN', noImage: 'Bitte laden Sie zuerst ein Bild hoch.', error: 'Analyse fehlgeschlagen.', material: 'MATERIAL' },
        'FR': { title: 'PLANCHE DE MATÉRIAUX', project: 'PROJET', materials: 'MATÉRIAUX & TEXTURES', colorPalette: 'PALETTE COULEURS (RAL)', analyzing: 'ANALYSE EN COURS...', download: 'TÉLÉCHARGER PLANCHE', noImage: 'Veuillez charger une image.', error: 'Analyse échouée.', material: 'MATÉRIEL' },
        'PT': { title: 'PLACA DE MATERIAIS', project: 'PROJETO', materials: 'MATERIAIS & TEXTURAS', colorPalette: 'PALETA DE CORES (RAL)', analyzing: 'ANALISANDO...', download: 'BAIXAR PLACA', noImage: 'Carregue uma imagem primeiro.', error: 'Análise falhou.', material: 'MATERIAL' },
        'ID': { title: 'PAPAN MATERIAL & FINISHING', project: 'PROYEK', materials: 'MATERIAL & TEKSTUR', colorPalette: 'PALET WARNA (RAL)', analyzing: 'MENGANALISIS...', download: 'UNDUH PAPAN', noImage: 'Unggah gambar terlebih dahulu.', error: 'Analisis gagal.', material: 'MATERIAL' },
        'HI': { title: 'सामग्री और फिनिश बोर्ड', project: 'परियोजना', materials: 'सामग्री और बनावट', colorPalette: 'रंग पैलेट (RAL)', analyzing: 'विश्लेषण हो रहा है...', download: 'बोर्ड डाउनलोड करें', noImage: 'कृपया पहले छवि अपलोड करें।', error: 'विश्लेषण विफल।', material: 'सामग्री' },
        'AR': { title: 'لوحة المواد والتشطيبات', project: 'مشروع', materials: 'المواد والقوام', colorPalette: 'لوحة الألوان (RAL)', analyzing: '...جاري التحليل', download: 'تحميل اللوحة', noImage: 'يرجى تحميل صورة أولاً.', error: 'فشل التحليل.', material: 'مادة' },
        'IT': { title: 'TAVOLA MATERIALI E FINITURE', project: 'PROGETTO', materials: 'MATERIALI E TEXTURE', colorPalette: 'PALETTE COLORI (RAL)', analyzing: 'ANALISI IN CORSO...', download: 'SCARICA TAVOLA', noImage: 'Carica prima un\'immagine.', error: 'Analisi fallita.', material: 'MATERIALE' }
    };

    function getLang() {
        var el = document.getElementById('activeCode');
        var code = el ? el.innerText.trim() : 'EN';
        return sunumDict[code] || sunumDict['EN'];
    }

    window._sunumImageBase64 = null;

    window.sunumUploadImage = function() {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }
        document.getElementById('fileSunumImage').click();
    };

    window.sunumPreviewImage = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var dataUrl = e.target.result;
                window._sunumImageBase64 = dataUrl.split(',')[1];
                var box = document.getElementById('boxSunumImage');
                var old = box.querySelector('.sunum-preview');
                if (old) old.remove();
                var children = box.children;
                for (var i = 0; i < children.length; i++) {
                    if (!children[i].classList.contains('sunum-preview')) children[i].style.display = 'none';
                }
                var prev = document.createElement('div');
                prev.className = 'sunum-preview absolute inset-0 w-full h-full';
                prev.innerHTML = '<img src="' + dataUrl + '" class="absolute inset-0 w-full h-full object-contain opacity-90 rounded-2xl">' +
                    '<button onclick="event.stopPropagation(); sunumRemoveImage()" class="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-red-500 z-50 shadow-lg border border-white/20">✕</button>' +
                    '<div class="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none"><span class="bg-black/70 px-4 py-1.5 rounded-lg text-[0.55rem] font-bold tracking-widest text-green-300 shadow-lg uppercase">LOADED</span></div>';
                box.appendChild(prev);
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    window.sunumRemoveImage = function() {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }
        window._sunumImageBase64 = null;
        var box = document.getElementById('boxSunumImage');
        var prev = box.querySelector('.sunum-preview');
        if (prev) prev.remove();
        var children = box.children;
        for (var i = 0; i < children.length; i++) children[i].style.display = '';
        var fi = document.getElementById('fileSunumImage');
        if (fi) { fi.value = ''; fi.type = 'text'; fi.type = 'file'; }
    };

    // ============================================================
    // startSunumAnalysis — 2 AŞAMALI SİSTEM DESTEĞİ
    // N8N'den gelen response: { textureImage: "base64...", analysis: {...} }
    // Fallback: eski tek-JSON formatı da desteklenir
    // ============================================================
    window.startSunumAnalysis = async function() {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }

        var lang = getLang();
        var langCode = (document.getElementById('activeCode') || {}).innerText || 'EN';

        if (!window._sunumImageBase64) {
            alert(lang.noImage);
            return;
        }

        if (window.deductCredit) {
            var ok = await window.deductCredit('PRESENTATION', 1);
            if (!ok) return;
        }

        var btn = document.getElementById('btnSunumAnalyze');
        var originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = lang.analyzing;
        btn.classList.add('bg-blue-600', 'animate-pulse');

        var userPrompt = (document.getElementById('sunumPromptArea') || {}).value || '';

        var payload = {
            action: 'presentation',
            prompt: userPrompt || 'Analyze materials, textures, and color palette',
            images: {
                boxRef: window._sunumImageBase64
            },
            language: langCode
        };

        try {
            var response = await fetch(window.CLOUDFLARE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('HTTP ' + response.status);

            var arrayBuffer = await response.arrayBuffer();
            var rawText = new TextDecoder('utf-8').decode(arrayBuffer);
            var data = JSON.parse(rawText);

            var result = Array.isArray(data) ? data[0] : data;

            // ── YENİ 2 AŞAMALI FORMAT: { textureImage, analysis } ──
            var textureBase64 = result.textureImage || '';
            var analysis = result.analysis || {};

            // ── FALLBACK: eski format gelirse (geçiş dönemi) ──
            if (!result.analysis && !result.textureImage) {
                var analysisText = '';
                if (result.candidates && result.candidates[0] && result.candidates[0].content) {
                    var parts = result.candidates[0].content.parts;
                    for (var i = 0; i < parts.length; i++) {
                        if (parts[i].text) analysisText = parts[i].text;
                    }
                } else if (result.output) {
                    analysisText = result.output;
                } else if (result.text) {
                    analysisText = result.text;
                }
                try {
                    analysis = JSON.parse(analysisText.replace(/```json/g, '').replace(/```/g, '').trim());
                } catch (e) {
                    console.error('Analysis JSON parse error:', e);
                    analysis = { projectName: 'ANALYSIS', materials: [], colors: [] };
                }
            }

            renderBoard(analysis, langCode, textureBase64);

        } catch (error) {
            console.error('Sunum Error:', error);
            alert(lang.error);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.classList.remove('bg-blue-600', 'animate-pulse');
        }
    };

    // ============================================================
    // renderBoard — İKİLİ GÖRSEL LAYOUT (orijinal + texture render)
    // ============================================================
    function renderBoard(analysis, langCode, textureBase64) {
        var lang = getLang();
        var projectName = (analysis.projectName || 'CONCEPT BOARD').toUpperCase();
        var materials = analysis.materials || [];
        var colors = analysis.colors || [];
        var imageSrc = 'data:image/jpeg;base64,' + window._sunumImageBase64;
        var textureSrc = textureBase64 ? ('data:image/png;base64,' + textureBase64) : '';

        var materialsHTML = '';
        for (var i = 0; i < materials.length; i++) {
            var m = materials[i];
            var hex = m.hex || m.hexColor || '#CCC';
            materialsHTML += '<div class="flex items-center gap-4 mb-5">' +
                '<div class="w-14 h-14 rounded-full shadow-md border-2 border-gray-200 flex-shrink-0" style="background-color:' + hex + '"></div>' +
                '<div class="flex-1">' +
                '<div contenteditable="true" class="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gray-800 outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + (m.title || lang.material + ' ' + (i+1)) + '</div>' +
                '<div contenteditable="true" class="text-[0.55rem] tracking-wider text-gray-500 uppercase mt-0.5 outline-none hover:bg-gray-100 px-1 rounded cursor-text leading-relaxed">' + (m.desc || '') + '</div>' +
                '</div></div>';
        }

        var colorsHTML = '';
        for (var j = 0; j < colors.length; j++) {
            var c = colors[j];
            var chex = typeof c === 'string' ? c : (c.hex || '#CCC');
            var ral = typeof c === 'string' ? '' : (c.ral || '');
            var name = typeof c === 'string' ? '' : (c.name || '');
            colorsHTML += '<div class="flex-1 flex flex-col items-center gap-1.5 min-w-[80px]">' +
                '<div class="w-full h-16 rounded shadow-inner border border-gray-200" style="background-color:' + chex + '"></div>' +
                '<span contenteditable="true" class="text-[0.5rem] tracking-widest text-gray-600 font-bold outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + chex + '</span>' +
                (ral ? '<span contenteditable="true" class="text-[0.45rem] tracking-wider text-gray-400 font-medium outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + ral + '</span>' : '') +
                (name ? '<span contenteditable="true" class="text-[0.4rem] tracking-wider text-gray-400 outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + name + '</span>' : '') +
                '</div>';
        }

        // ── SOL PANEL: Orijinal + Texture Render (ikili layout) ──
        var leftPanelHTML = '<div class="w-[55%] flex flex-col gap-4 justify-center">' +
            '<div class="bg-gray-50 p-3 border border-gray-100 rounded shadow-sm">' +
            '<p class="text-[0.45rem] tracking-[0.3em] text-gray-400 uppercase font-bold mb-2">ORIGINAL</p>' +
            '<img src="' + imageSrc + '" class="w-full h-auto object-contain max-h-[200px] mx-auto" style="mix-blend-mode:multiply;">' +
            '</div>';

        if (textureSrc) {
            leftPanelHTML += '<div class="bg-gray-50 p-3 border border-gray-100 rounded shadow-sm">' +
                '<p class="text-[0.45rem] tracking-[0.3em] text-gray-400 uppercase font-bold mb-2">MATERIAL ANALYSIS</p>' +
                '<img src="' + textureSrc + '" class="w-full h-auto object-contain max-h-[200px] mx-auto" style="mix-blend-mode:multiply;">' +
                '</div>';
        }

        leftPanelHTML += '</div>';

        document.getElementById('sunumBoardContainer').innerHTML =
            '<div id="sunumBoardPrint" class="bg-white w-[1100px] min-h-[780px] p-12 shadow-2xl rounded-sm relative" style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">' +
            '<div class="flex justify-between items-end border-b-2 border-gray-200 pb-4 mb-8"><div>' +
            '<h1 contenteditable="true" class="text-2xl font-light tracking-[0.25em] uppercase text-gray-800 outline-none hover:bg-gray-50 rounded px-2 -ml-2 cursor-text">' + lang.title + '</h1>' +
            '<p contenteditable="true" class="text-[0.65rem] tracking-[0.3em] text-gray-400 uppercase mt-2 font-bold outline-none hover:bg-gray-50 rounded px-2 -ml-2 cursor-text">' + lang.project + ': ' + projectName + '</p>' +
            '</div><div class="text-[0.55rem] font-bold tracking-[0.4em] text-gray-300 uppercase">ADEULL AI STUDIO</div></div>' +
            '<div class="flex gap-10">' +
            leftPanelHTML +
            '<div class="w-[45%] flex flex-col justify-between pl-6 border-l border-gray-100"><div>' +
            '<h3 contenteditable="true" class="text-[0.6rem] tracking-[0.3em] text-gray-400 font-bold uppercase mb-5 border-b border-gray-100 pb-2 outline-none hover:bg-gray-50 cursor-text px-1">' + lang.materials + '</h3>' +
            materialsHTML + '</div>' +
            '<div class="mt-6 pt-5 border-t border-gray-100">' +
            '<h3 contenteditable="true" class="text-[0.6rem] tracking-[0.3em] text-gray-400 font-bold uppercase mb-4 outline-none hover:bg-gray-50 cursor-text px-1">' + lang.colorPalette + '</h3>' +
            '<div class="flex gap-3">' + colorsHTML + '</div></div></div></div>' +
            '<div class="absolute bottom-4 left-12 right-12 flex justify-between items-end opacity-30">' +
            '<span class="text-[0.4rem] tracking-[0.3em] uppercase">ADEULL AI</span>' +
            '<span class="text-[0.4rem] tracking-[0.2em]">' + new Date().toLocaleDateString() + '</span></div></div>';

        showSunumOverlay();
    }

    function showSunumOverlay() {
        var overlay = document.getElementById('sunumOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
            setTimeout(function() { overlay.style.opacity = '1'; }, 30);
        }
    }

    window.closeSunumOverlay = function() {
        var overlay = document.getElementById('sunumOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(function() {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex');
            }, 400);
        }
    };

    window.downloadSunumBoard = function() {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }
        var board = document.getElementById('sunumBoardPrint');
        if (!board) return;
        html2canvas(board, { scale: 3, useCORS: true, backgroundColor: '#ffffff', scrollY: 0 }).then(function(canvas) {
            var link = document.createElement('a');
            link.download = 'ADEULL_BOARD_' + Date.now() + '.png';
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        });
    };

    window.analyzePresentation = window.startSunumAnalysis;
    window.generateTextureRender = function() { window.startSunumAnalysis(); };
    window.closePresentation = window.closeSunumOverlay;
    window.showPresentationScreen = showSunumOverlay;

})();