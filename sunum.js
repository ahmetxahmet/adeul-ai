// ==============================================================
// SUNUM.JS — ADEULL AI PRESENTATION MODULE
// Ana webhook: window.CLOUDFLARE_URL (adeul-ai-v2)
// N8N routing: action === "presentation"
// 2 AŞAMALI SİSTEM: TEXTURE RENDER + ANALİZ
// BOARD 1: Yuvarlak malzeme daireleri
// BOARD 2: Kare/dikdörtgen malzeme kartları
// ==============================================================

(function() {
    'use strict';

    var sunumDict = {
        'EN': { title: 'MATERIAL & FINISH BOARD', project: 'PROJECT', materials: 'MATERIALS & TEXTURES', colorPalette: 'COLOR PALETTE (RAL)', analyzing: 'ANALYZING...', download: 'DOWNLOAD BOARD', noImage: 'Please upload an image first.', error: 'Analysis failed. Please check your connection and try again.', material: 'MATERIAL', board1: 'BOARD 1', board2: 'BOARD 2' },
        'TR': { title: 'MALZEME & KAPLAMA PAFTASI', project: 'PROJE', materials: 'MALZEMELER & DOKULAR', colorPalette: 'RENK KARTELASİ (RAL)', analyzing: 'ANALİZ EDİLİYOR...', download: 'PAFTAYI İNDİR', noImage: 'Lütfen önce bir görsel yükleyin.', error: 'Analiz başarısız. Lütfen bağlantınızı kontrol edip tekrar deneyin.', material: 'MALZEME', board1: 'PAFTA 1', board2: 'PAFTA 2' },
        'ES': { title: 'TABLERO DE MATERIALES', project: 'PROYECTO', materials: 'MATERIALES Y TEXTURAS', colorPalette: 'PALETA DE COLORES (RAL)', analyzing: 'ANALIZANDO...', download: 'DESCARGAR TABLERO', noImage: 'Suba una imagen primero.', error: 'Análisis fallido.', material: 'MATERIAL', board1: 'TABLERO 1', board2: 'TABLERO 2' },
        'DE': { title: 'MATERIAL & FINISH BOARD', project: 'PROJEKT', materials: 'MATERIALIEN & TEXTUREN', colorPalette: 'FARBPALETTE (RAL)', analyzing: 'ANALYSE LÄUFT...', download: 'BOARD HERUNTERLADEN', noImage: 'Bitte laden Sie zuerst ein Bild hoch.', error: 'Analyse fehlgeschlagen.', material: 'MATERIAL', board1: 'BOARD 1', board2: 'BOARD 2' },
        'FR': { title: 'PLANCHE DE MATÉRIAUX', project: 'PROJET', materials: 'MATÉRIAUX & TEXTURES', colorPalette: 'PALETTE COULEURS (RAL)', analyzing: 'ANALYSE EN COURS...', download: 'TÉLÉCHARGER PLANCHE', noImage: 'Veuillez charger une image.', error: 'Analyse échouée.', material: 'MATÉRIEL', board1: 'PLANCHE 1', board2: 'PLANCHE 2' },
        'PT': { title: 'PLACA DE MATERIAIS', project: 'PROJETO', materials: 'MATERIAIS & TEXTURAS', colorPalette: 'PALETA DE CORES (RAL)', analyzing: 'ANALISANDO...', download: 'BAIXAR PLACA', noImage: 'Carregue uma imagem primeiro.', error: 'Análise falhou.', material: 'MATERIAL', board1: 'PLACA 1', board2: 'PLACA 2' },
        'ID': { title: 'PAPAN MATERIAL & FINISHING', project: 'PROYEK', materials: 'MATERIAL & TEKSTUR', colorPalette: 'PALET WARNA (RAL)', analyzing: 'MENGANALISIS...', download: 'UNDUH PAPAN', noImage: 'Unggah gambar terlebih dahulu.', error: 'Analisis gagal.', material: 'MATERIAL', board1: 'PAPAN 1', board2: 'PAPAN 2' },
        'HI': { title: 'सामग्री और फिनिश बोर्ड', project: 'परियोजना', materials: 'सामग्री और बनावट', colorPalette: 'रंग पैलेट (RAL)', analyzing: 'विश्लेषण हो रहा है...', download: 'बोर्ड डाउनलोड करें', noImage: 'कृपया पहले छवि अपलोड करें।', error: 'विश्लेषण विफल।', material: 'सामग्री', board1: 'बोर्ड 1', board2: 'बोर्ड 2' },
        'AR': { title: 'لوحة المواد والتشطيبات', project: 'مشروع', materials: 'المواد والقوام', colorPalette: 'لوحة الألوان (RAL)', analyzing: '...جاري التحليل', download: 'تحميل اللوحة', noImage: 'يرجى تحميل صورة أولاً.', error: 'فشل التحليل.', material: 'مادة', board1: 'لوحة 1', board2: 'لوحة 2' },
        'IT': { title: 'TAVOLA MATERIALI E FINITURE', project: 'PROGETTO', materials: 'MATERIALI E TEXTURE', colorPalette: 'PALETTE COLORI (RAL)', analyzing: 'ANALISI IN CORSO...', download: 'SCARICA TAVOLA', noImage: 'Carica prima un\'immagine.', error: 'Analisi fallita.', material: 'MATERIALE', board1: 'TAVOLA 1', board2: 'TAVOLA 2' }
    };

    function getLang() {
        var el = document.getElementById('activeCode');
        var code = el ? el.innerText.trim() : 'EN';
        return sunumDict[code] || sunumDict['EN'];
    }

    // ============================================================
    // CSS TEXTURE PATTERN GENERATOR — GENİŞLETİLMİŞ
    // ============================================================
    function getTextureCSS(title, hex) {
        var t = (title || '').toLowerCase();
        var r = parseInt(hex.slice(1,3),16) || 128;
        var g = parseInt(hex.slice(3,5),16) || 128;
        var b = parseInt(hex.slice(5,7),16) || 128;
        var L1 = 'rgba(' + Math.min(r+35,255) + ',' + Math.min(g+35,255) + ',' + Math.min(b+35,255) + ',0.7)';
        var L2 = 'rgba(' + Math.min(r+18,255) + ',' + Math.min(g+18,255) + ',' + Math.min(b+18,255) + ',0.5)';
        var D1 = 'rgba(' + Math.max(r-30,0) + ',' + Math.max(g-30,0) + ',' + Math.max(b-30,0) + ',0.6)';
        var D2 = 'rgba(' + Math.max(r-15,0) + ',' + Math.max(g-15,0) + ',' + Math.max(b-15,0) + ',0.4)';
        var base = 'background-color:' + hex + ';';

        // LEATHER / DERİ / SUEDE / NUBUCK / HIDE
        if (t.match(/leather|deri|cuir|leder|pelle|cuero|couro|suede|nubuck|hide|aniline|nappa|faux\s?leather/i)) {
            return base + 'background-image:' +
                'radial-gradient(ellipse at 20% 50%,' + D1 + ' 0%,transparent 50%),' +
                'radial-gradient(ellipse at 80% 20%,' + D1 + ' 0%,transparent 40%),' +
                'radial-gradient(ellipse at 40% 80%,' + L1 + ' 0%,transparent 45%),' +
                'repeating-linear-gradient(45deg,transparent,' + D2 + ' 1px,transparent 2px,transparent 6px),' +
                'repeating-linear-gradient(-30deg,transparent,' + D2 + ' 0.5px,transparent 1px,transparent 4px);';
        }
        // CONCRETE / BETON / CEMENT / SCREED
        if (t.match(/concrete|beton|hormigón|béton|calcestruzzo|concreto|cement|çimento|screed|şap/i)) {
            return base + 'background-image:' +
                'radial-gradient(circle at 30% 40%,' + D1 + ' 1px,transparent 2px),' +
                'radial-gradient(circle at 70% 60%,' + D2 + ' 0.5px,transparent 1.5px),' +
                'radial-gradient(circle at 50% 20%,' + L1 + ' 1px,transparent 3px),' +
                'radial-gradient(circle at 15% 80%,' + D1 + ' 0.8px,transparent 2px),' +
                'radial-gradient(circle at 85% 30%,' + L2 + ' 0.5px,transparent 1px),' +
                'radial-gradient(circle at 55% 70%,' + D2 + ' 0.6px,transparent 1.5px);' +
                'background-size:12px 12px,8px 8px,15px 15px,10px 10px,6px 6px,9px 9px;';
        }
        // WOOD / AHŞAP / VENEER / PARQUET / LAMINATE
        if (t.match(/wood|ahşap|madera|bois|holz|legno|madeira|oak|walnut|teak|pine|cedar|birch|maple|cherry|ash|beech|mahogany|veneer|kaplama|parquet|parke|laminate|laminat|bamboo|bambu|plywood|kontrplak/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(90deg,transparent,' + D1 + ' 0.5px,transparent 1px,transparent 8px),' +
                'repeating-linear-gradient(85deg,transparent,' + L1 + ' 0.3px,transparent 0.6px,transparent 12px),' +
                'repeating-linear-gradient(92deg,transparent,' + D2 + ' 0.4px,transparent 0.8px,transparent 5px),' +
                'repeating-linear-gradient(88deg,transparent,' + L2 + ' 0.3px,transparent 0.5px,transparent 15px);';
        }
        // STONE / TAŞ / MARBLE / MERMER / TRAVERTINE / GRANITE / ONYX
        if (t.match(/stone|taş|marble|mermer|travertine|granite|granit|piedra|pierre|stein|pietra|pedra|limestone|slate|onyx|quartzite|sandstone|basalt|dolomite|terrazzo/i)) {
            return base + 'background-image:' +
                'linear-gradient(135deg,' + D1 + ' 0%,transparent 40%,transparent 60%,' + L1 + ' 100%),' +
                'radial-gradient(ellipse at 25% 75%,' + D2 + ' 0%,transparent 50%),' +
                'radial-gradient(ellipse at 75% 25%,' + L2 + ' 0%,transparent 45%),' +
                'repeating-linear-gradient(160deg,transparent,' + D1 + ' 0.5px,transparent 1px,transparent 15px),' +
                'repeating-linear-gradient(110deg,transparent,' + L2 + ' 0.3px,transparent 0.6px,transparent 20px);';
        }
        // METAL / STEEL / ALUMINUM / BRASS / COPPER / CHROME / IRON
        if (t.match(/metal|aluminum|aluminium|steel|çelik|iron|demir|brass|pirinç|copper|bakır|bronze|bronz|chrome|krom|inox|stainless|zinc|çinko|titanium|titanyum|wrought|ferforje|powder.?coat|toz.?boya|matte.?black|matt/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(180deg,' + L1 + ' 0px,' + L1 + ' 1px,transparent 1px,transparent 3px),' +
                'linear-gradient(180deg,' + D1 + ' 0%,' + L1 + ' 30%,' + D1 + ' 50%,' + L1 + ' 70%,' + D1 + ' 100%);';
        }
        // FABRIC / KUMAŞ / TEXTILE / UPHOLSTERY
        if (t.match(/fabric|kumaş|textile|linen|keten|cotton|pamuk|velvet|kadife|silk|ipek|wool|yün|weave|örgü|tela|tissu|stoff|tessuto|tecido|chenille|şönil|boucle|bukle|tweed|canvas|upholster|döşeme|microfiber/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(0deg,transparent,' + D1 + ' 0.5px,transparent 1px,transparent 3px),' +
                'repeating-linear-gradient(90deg,transparent,' + D2 + ' 0.5px,transparent 1px,transparent 3px);' +
                'background-size:3px 3px;';
        }
        // GLASS / CAM / MIRROR / AYNA
        if (t.match(/glass|cam|vidrio|verre|glas|vetro|vidro|mirror|ayna|crystal|kristal/i)) {
            return base + 'background-image:' +
                'linear-gradient(135deg,rgba(255,255,255,0.35) 0%,transparent 50%,rgba(255,255,255,0.1) 100%),' +
                'linear-gradient(225deg,rgba(255,255,255,0.2) 0%,transparent 40%),' +
                'linear-gradient(315deg,rgba(255,255,255,0.1) 0%,transparent 30%);';
        }
        // CERAMIC / PORCELAIN / TILE / SERAMİK / FAYANS
        if (t.match(/ceramic|seramik|porcelain|porselen|tile|fayans|kalebodur|karo|mosaic|mozaik|terracotta|majolica|zellige|encaustic/i)) {
            return base + 'background-image:' +
                'linear-gradient(0deg,' + D2 + ' 1px,transparent 1px),' +
                'linear-gradient(90deg,' + D2 + ' 1px,transparent 1px),' +
                'radial-gradient(circle at 50% 50%,' + L1 + ' 0%,transparent 60%);' +
                'background-size:20px 20px,20px 20px,20px 20px;';
        }
        // PAINT / LACQUER / COATING / BOYA / LAK
        if (t.match(/paint|boya|lacquer|lak|coating|kaplama|enamel|emaye|varnish|vernik|finish|gloss|parlak|satin|matte|mat|semi.?gloss|powder/i)) {
            return base + 'background-image:' +
                'radial-gradient(ellipse at 30% 30%,' + L1 + ' 0%,transparent 70%),' +
                'radial-gradient(ellipse at 70% 70%,' + D2 + ' 0%,transparent 60%);';
        }
        // PLASTER / STUCCO / SIVA / RENDER
        if (t.match(/plaster|sıva|stucco|render|alçı|gypsum|clay|kil|lime|kireç|adobe|rammed|earth|toprak/i)) {
            return base + 'background-image:' +
                'radial-gradient(circle at 20% 30%,' + D1 + ' 0.5px,transparent 2px),' +
                'radial-gradient(circle at 60% 50%,' + D2 + ' 0.8px,transparent 1.5px),' +
                'radial-gradient(circle at 40% 70%,' + L2 + ' 0.5px,transparent 2.5px),' +
                'radial-gradient(circle at 80% 20%,' + D1 + ' 0.4px,transparent 1.5px),' +
                'radial-gradient(circle at 10% 90%,' + L1 + ' 0.6px,transparent 2px);' +
                'background-size:8px 8px,6px 6px,10px 10px,7px 7px,9px 9px;';
        }
        // BRICK / TUĞLA
        if (t.match(/brick|tuğla|ladrillo|brique|ziegel|mattone|tijolo/i)) {
            return base + 'background-image:' +
                'linear-gradient(0deg,' + D1 + ' 2px,transparent 2px),' +
                'linear-gradient(90deg,' + D2 + ' 1px,transparent 1px);' +
                'background-size:30px 15px;';
        }
        // RUBBER / PLASTIC / RESIN / SİLİKON / ACRYLIC
        if (t.match(/rubber|kauçuk|plastic|plastik|resin|reçine|silicone|silikon|acrylic|akrilik|polycarbonate|pvc|vinyl|vinil|nylon|naylon|fiberglass|epoxy|epoksi|polymer|polimer/i)) {
            return base + 'background-image:' +
                'radial-gradient(circle at 50% 50%,' + L1 + ' 0%,transparent 80%),' +
                'repeating-linear-gradient(135deg,transparent,' + D2 + ' 0.3px,transparent 0.6px,transparent 5px);';
        }
        // WALLPAPER / DUVAR KAĞIDI
        if (t.match(/wallpaper|duvar.?kağıdı|papel|papier.?peint|tapete|carta.?da.?parati/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(45deg,transparent,' + D2 + ' 0.5px,transparent 1px,transparent 8px),' +
                'repeating-linear-gradient(-45deg,transparent,' + L2 + ' 0.5px,transparent 1px,transparent 8px);' +
                'background-size:8px 8px;';
        }
        // CARPET / RUG / HALI / KİLİM
        if (t.match(/carpet|halı|rug|kilim|moquette|teppich|tappeto|alfombra|tapete/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(0deg,transparent,' + D1 + ' 0.8px,transparent 1.2px,transparent 2.5px),' +
                'repeating-linear-gradient(90deg,transparent,' + D2 + ' 0.8px,transparent 1.2px,transparent 2.5px);' +
                'background-size:2.5px 2.5px;';
        }
        // ROPE / RATTAN / WICKER / HASIR / BAMBU ÖRGÜ
        if (t.match(/rope|halat|rattan|wicker|hasır|cane|jute|jüt|sisal|seagrass|raffia/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(60deg,transparent,' + D1 + ' 1px,transparent 1.5px,transparent 5px),' +
                'repeating-linear-gradient(-60deg,transparent,' + D2 + ' 1px,transparent 1.5px,transparent 5px);' +
                'background-size:5px 5px;';
        }

        // ── DEFAULT: Güçlü cross-hatch + noise pattern ──
        return base + 'background-image:' +
            'radial-gradient(circle at 25% 25%,' + L1 + ' 0%,transparent 40%),' +
            'radial-gradient(circle at 75% 75%,' + D1 + ' 0%,transparent 40%),' +
            'radial-gradient(circle at 50% 50%,' + L2 + ' 0%,transparent 50%),' +
            'repeating-linear-gradient(135deg,transparent,' + D2 + ' 0.5px,transparent 1px,transparent 6px),' +
            'repeating-linear-gradient(45deg,transparent,' + L2 + ' 0.5px,transparent 1px,transparent 6px);';
    }

    // ============================================================
    // BOARD STATE
    // ============================================================
    window._sunumImageBase64 = null;
    window._sunumLastAnalysis = null;
    window._sunumLastLangCode = 'EN';
    window._sunumLastTextureBase64 = '';
    window._sunumActiveBoardType = 1;

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
    // startSunumAnalysis
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
            images: { boxRef: window._sunumImageBase64 },
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

            var textureBase64 = result.textureImage || '';
            var analysis = result.analysis || {};

            // FALLBACK
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

            window._sunumLastAnalysis = analysis;
            window._sunumLastLangCode = langCode;
            window._sunumLastTextureBase64 = textureBase64;
            window._sunumActiveBoardType = 1;

            renderBoard(analysis, langCode, textureBase64, 1);

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
    // switchBoard
    // ============================================================
    window.switchSunumBoard = function(boardType) {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }
        if (!window._sunumLastAnalysis) return;
        window._sunumActiveBoardType = boardType;
        renderBoard(window._sunumLastAnalysis, window._sunumLastLangCode, window._sunumLastTextureBase64, boardType);
    };

    // ============================================================
    // renderBoard
    // ============================================================
    function renderBoard(analysis, langCode, textureBase64, boardType) {
        var lang = getLang();
        var projectName = (analysis.projectName || 'CONCEPT BOARD').toUpperCase();
        var materials = analysis.materials || [];
        var colors = analysis.colors || [];
        var textureSrc = textureBase64 ? ('data:image/png;base64,' + textureBase64) : ('data:image/jpeg;base64,' + window._sunumImageBase64);

        var isBoard2 = (boardType === 2);

        // ── MALZEME KARTLARI ──
        var materialsHTML = '';
        for (var i = 0; i < materials.length; i++) {
            var m = materials[i];
            var hex = m.hex || m.hexColor || '#CCC';
            var textureStyle = getTextureCSS(m.title || '', hex);

            if (isBoard2) {
                materialsHTML += '<div class="mb-5 border border-gray-200 rounded-lg overflow-hidden shadow-sm">' +
                    '<div class="w-full h-20" style="' + textureStyle + '"></div>' +
                    '<div class="p-3 bg-white">' +
                    '<div contenteditable="true" class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-gray-800 outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + (m.title || lang.material + ' ' + (i+1)) + '</div>' +
                    '<div contenteditable="true" class="text-[0.5rem] tracking-wider text-gray-500 uppercase mt-1 outline-none hover:bg-gray-100 px-1 rounded cursor-text leading-relaxed">' + (m.desc || '') + '</div>' +
                    '<div class="text-[0.4rem] tracking-widest text-gray-400 mt-1 px-1">' + hex + '</div>' +
                    '</div></div>';
            } else {
                materialsHTML += '<div class="flex items-center gap-4 mb-5">' +
                    '<div class="w-14 h-14 rounded-full shadow-md border-2 border-gray-200 flex-shrink-0" style="' + textureStyle + '"></div>' +
                    '<div class="flex-1">' +
                    '<div contenteditable="true" class="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gray-800 outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + (m.title || lang.material + ' ' + (i+1)) + '</div>' +
                    '<div contenteditable="true" class="text-[0.55rem] tracking-wider text-gray-500 uppercase mt-0.5 outline-none hover:bg-gray-100 px-1 rounded cursor-text leading-relaxed">' + (m.desc || '') + '</div>' +
                    '</div></div>';
            }
        }

        // ── RENK KARTELASİ ──
        var colorsHTML = '';
        for (var j = 0; j < colors.length; j++) {
            var c = colors[j];
            var chex = typeof c === 'string' ? c : (c.hex || '#CCC');
            var ral = typeof c === 'string' ? '' : (c.ral || '');
            var name = typeof c === 'string' ? '' : (c.name || '');

            if (isBoard2) {
                colorsHTML += '<div class="flex-1 flex flex-col items-center gap-1.5 min-w-[70px]">' +
                    '<div class="w-full h-14 rounded-lg shadow-sm border border-gray-200" style="background-color:' + chex + '"></div>' +
                    '<span contenteditable="true" class="text-[0.45rem] tracking-widest text-gray-600 font-bold outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + chex + '</span>' +
                    (ral ? '<span contenteditable="true" class="text-[0.4rem] tracking-wider text-gray-400 font-medium outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + ral + '</span>' : '') +
                    (name ? '<span contenteditable="true" class="text-[0.35rem] tracking-wider text-gray-400 outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + name + '</span>' : '') +
                    '</div>';
            } else {
                colorsHTML += '<div class="flex-1 flex flex-col items-center gap-1.5 min-w-[80px]">' +
                    '<div class="w-full h-16 rounded shadow-inner border border-gray-200" style="background-color:' + chex + '"></div>' +
                    '<span contenteditable="true" class="text-[0.5rem] tracking-widest text-gray-600 font-bold outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + chex + '</span>' +
                    (ral ? '<span contenteditable="true" class="text-[0.45rem] tracking-wider text-gray-400 font-medium outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + ral + '</span>' : '') +
                    (name ? '<span contenteditable="true" class="text-[0.4rem] tracking-wider text-gray-400 outline-none hover:bg-gray-100 px-1 rounded cursor-text">' + name + '</span>' : '') +
                    '</div>';
            }
        }

        // ── BOARD SELECTOR ──
        var b1Active = !isBoard2 ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600';
        var b2Active = isBoard2 ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600';
        var boardSelectorHTML = '<div class="flex gap-1 bg-gray-100 rounded-lg p-1">' +
            '<button onclick="switchSunumBoard(1)" class="px-4 py-1.5 rounded-md text-[0.5rem] font-bold tracking-[0.2em] uppercase transition cursor-pointer ' + b1Active + '">' + lang.board1 + '</button>' +
            '<button onclick="switchSunumBoard(2)" class="px-4 py-1.5 rounded-md text-[0.5rem] font-bold tracking-[0.2em] uppercase transition cursor-pointer ' + b2Active + '">' + lang.board2 + '</button>' +
            '</div>';

        // ── SOL PANEL (w-[60%]) ──
        var leftPanelHTML = '<div class="w-[60%] flex flex-col justify-center">' +
            '<div class="bg-gray-50 p-4 border border-gray-100 rounded shadow-sm">' +
            '<img src="' + textureSrc + '" class="w-full h-auto object-contain max-h-[480px] mx-auto" style="mix-blend-mode:multiply;">' +
            '</div>' +
            '</div>';

        // ── SAĞ PANEL (w-[40%]) ──
        var rightPanelHTML = '<div class="w-[40%] flex flex-col justify-between pl-6 border-l border-gray-100"><div>' +
            '<h3 contenteditable="true" class="text-[0.6rem] tracking-[0.3em] text-gray-400 font-bold uppercase mb-5 border-b border-gray-100 pb-2 outline-none hover:bg-gray-50 cursor-text px-1">' + lang.materials + '</h3>' +
            materialsHTML + '</div>' +
            '<div class="mt-6 pt-5 border-t border-gray-100">' +
            '<h3 contenteditable="true" class="text-[0.6rem] tracking-[0.3em] text-gray-400 font-bold uppercase mb-4 outline-none hover:bg-gray-50 cursor-text px-1">' + lang.colorPalette + '</h3>' +
            '<div class="flex gap-3">' + colorsHTML + '</div></div></div>';

        document.getElementById('sunumBoardContainer').innerHTML =
            '<div id="sunumBoardPrint" class="bg-white w-[1100px] min-h-[780px] p-12 shadow-2xl rounded-sm relative" style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">' +
            '<div class="flex justify-between items-end border-b-2 border-gray-200 pb-4 mb-8"><div>' +
            '<h1 contenteditable="true" class="text-2xl font-light tracking-[0.25em] uppercase text-gray-800 outline-none hover:bg-gray-50 rounded px-2 -ml-2 cursor-text">' + lang.title + '</h1>' +
            '<p contenteditable="true" class="text-[0.65rem] tracking-[0.3em] text-gray-400 uppercase mt-2 font-bold outline-none hover:bg-gray-50 rounded px-2 -ml-2 cursor-text">' + lang.project + ': ' + projectName + '</p>' +
            '</div><div class="flex flex-col items-end gap-2">' +
            '<div class="text-[0.55rem] font-bold tracking-[0.4em] text-gray-300 uppercase">ADEULL AI STUDIO</div>' +
            boardSelectorHTML +
            '</div></div>' +
            '<div class="flex gap-8">' +
            leftPanelHTML +
            rightPanelHTML +
            '</div>' +
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