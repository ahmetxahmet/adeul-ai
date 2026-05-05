// ==============================================================
// SUNUM.JS — ADEULL AI PRESENTATION MODULE
// Core endpoint: window.CORE_ENGINE_V2
// Core routing: action === "presentation"
// 2 AŞAMALI SİSTEM: TEXTURE RENDER + ANALİZ
// BOARD 1: Yuvarlak — premium klasik
// BOARD 2: Kare — modern minimalist
// Her iki board da YATAY A4 formatında (1100x780)
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
    // CSS TEXTURE PATTERN GENERATOR
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

        if (t.match(/leather|deri|cuir|leder|pelle|cuero|couro|suede|nubuck|hide|aniline|nappa|faux\s?leather/i)) {
            return base + 'background-image:' +
                'radial-gradient(ellipse at 20% 50%,' + D1 + ' 0%,transparent 50%),' +
                'radial-gradient(ellipse at 80% 20%,' + D1 + ' 0%,transparent 40%),' +
                'radial-gradient(ellipse at 40% 80%,' + L1 + ' 0%,transparent 45%),' +
                'repeating-linear-gradient(45deg,transparent,' + D2 + ' 1px,transparent 2px,transparent 6px),' +
                'repeating-linear-gradient(-30deg,transparent,' + D2 + ' 0.5px,transparent 1px,transparent 4px);';
        }
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
        if (t.match(/wood|ahşap|madera|bois|holz|legno|madeira|oak|walnut|teak|pine|cedar|birch|maple|cherry|ash|beech|mahogany|veneer|kaplama|parquet|parke|laminate|laminat|bamboo|bambu|plywood|kontrplak/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(90deg,transparent,' + D1 + ' 0.5px,transparent 1px,transparent 8px),' +
                'repeating-linear-gradient(85deg,transparent,' + L1 + ' 0.3px,transparent 0.6px,transparent 12px),' +
                'repeating-linear-gradient(92deg,transparent,' + D2 + ' 0.4px,transparent 0.8px,transparent 5px),' +
                'repeating-linear-gradient(88deg,transparent,' + L2 + ' 0.3px,transparent 0.5px,transparent 15px);';
        }
        if (t.match(/stone|taş|marble|mermer|travertine|granite|granit|piedra|pierre|stein|pietra|pedra|limestone|slate|onyx|quartzite|sandstone|basalt|dolomite|terrazzo/i)) {
            return base + 'background-image:' +
                'linear-gradient(135deg,' + D1 + ' 0%,transparent 40%,transparent 60%,' + L1 + ' 100%),' +
                'radial-gradient(ellipse at 25% 75%,' + D2 + ' 0%,transparent 50%),' +
                'radial-gradient(ellipse at 75% 25%,' + L2 + ' 0%,transparent 45%),' +
                'repeating-linear-gradient(160deg,transparent,' + D1 + ' 0.5px,transparent 1px,transparent 15px),' +
                'repeating-linear-gradient(110deg,transparent,' + L2 + ' 0.3px,transparent 0.6px,transparent 20px);';
        }
        if (t.match(/metal|aluminum|aluminium|steel|çelik|iron|demir|brass|pirinç|copper|bakır|bronze|bronz|chrome|krom|inox|stainless|zinc|çinko|titanium|titanyum|wrought|ferforje|powder.?coat|toz.?boya|matte.?black|matt/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(180deg,' + L1 + ' 0px,' + L1 + ' 1px,transparent 1px,transparent 3px),' +
                'linear-gradient(180deg,' + D1 + ' 0%,' + L1 + ' 30%,' + D1 + ' 50%,' + L1 + ' 70%,' + D1 + ' 100%);';
        }
        if (t.match(/fabric|kumaş|textile|linen|keten|cotton|pamuk|velvet|kadife|silk|ipek|wool|yün|weave|örgü|tela|tissu|stoff|tessuto|tecido|chenille|şönil|boucle|bukle|tweed|canvas|upholster|döşeme|microfiber/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(0deg,transparent,' + D1 + ' 0.5px,transparent 1px,transparent 3px),' +
                'repeating-linear-gradient(90deg,transparent,' + D2 + ' 0.5px,transparent 1px,transparent 3px);' +
                'background-size:3px 3px;';
        }
        if (t.match(/glass|cam|vidrio|verre|glas|vetro|vidro|mirror|ayna|crystal|kristal/i)) {
            return base + 'background-image:' +
                'linear-gradient(135deg,rgba(255,255,255,0.35) 0%,transparent 50%,rgba(255,255,255,0.1) 100%),' +
                'linear-gradient(225deg,rgba(255,255,255,0.2) 0%,transparent 40%),' +
                'linear-gradient(315deg,rgba(255,255,255,0.1) 0%,transparent 30%);';
        }
        if (t.match(/ceramic|seramik|porcelain|porselen|tile|fayans|kalebodur|karo|mosaic|mozaik|terracotta|majolica|zellige|encaustic/i)) {
            return base + 'background-image:' +
                'linear-gradient(0deg,' + D2 + ' 1px,transparent 1px),' +
                'linear-gradient(90deg,' + D2 + ' 1px,transparent 1px),' +
                'radial-gradient(circle at 50% 50%,' + L1 + ' 0%,transparent 60%);' +
                'background-size:20px 20px,20px 20px,20px 20px;';
        }
        if (t.match(/paint|boya|lacquer|lak|coating|kaplama|enamel|emaye|varnish|vernik|finish|gloss|parlak|satin|matte|mat|semi.?gloss|powder/i)) {
            return base + 'background-image:' +
                'radial-gradient(ellipse at 30% 30%,' + L1 + ' 0%,transparent 70%),' +
                'radial-gradient(ellipse at 70% 70%,' + D2 + ' 0%,transparent 60%);';
        }
        if (t.match(/plaster|sıva|stucco|render|alçı|gypsum|clay|kil|lime|kireç|adobe|rammed|earth|toprak/i)) {
            return base + 'background-image:' +
                'radial-gradient(circle at 20% 30%,' + D1 + ' 0.5px,transparent 2px),' +
                'radial-gradient(circle at 60% 50%,' + D2 + ' 0.8px,transparent 1.5px),' +
                'radial-gradient(circle at 40% 70%,' + L2 + ' 0.5px,transparent 2.5px),' +
                'radial-gradient(circle at 80% 20%,' + D1 + ' 0.4px,transparent 1.5px),' +
                'radial-gradient(circle at 10% 90%,' + L1 + ' 0.6px,transparent 2px);' +
                'background-size:8px 8px,6px 6px,10px 10px,7px 7px,9px 9px;';
        }
        if (t.match(/brick|tuğla|ladrillo|brique|ziegel|mattone|tijolo/i)) {
            return base + 'background-image:' +
                'linear-gradient(0deg,' + D1 + ' 2px,transparent 2px),' +
                'linear-gradient(90deg,' + D2 + ' 1px,transparent 1px);' +
                'background-size:30px 15px;';
        }
        if (t.match(/rubber|kauçuk|plastic|plastik|resin|reçine|silicone|silikon|acrylic|akrilik|polycarbonate|pvc|vinyl|vinil|nylon|naylon|fiberglass|epoxy|epoksi|polymer|polimer/i)) {
            return base + 'background-image:' +
                'radial-gradient(circle at 50% 50%,' + L1 + ' 0%,transparent 80%),' +
                'repeating-linear-gradient(135deg,transparent,' + D2 + ' 0.3px,transparent 0.6px,transparent 5px);';
        }
        if (t.match(/wallpaper|duvar.?kağıdı|papel|papier.?peint|tapete|carta.?da.?parati/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(45deg,transparent,' + D2 + ' 0.5px,transparent 1px,transparent 8px),' +
                'repeating-linear-gradient(-45deg,transparent,' + L2 + ' 0.5px,transparent 1px,transparent 8px);' +
                'background-size:8px 8px;';
        }
        if (t.match(/carpet|halı|rug|kilim|moquette|teppich|tappeto|alfombra|tapete/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(0deg,transparent,' + D1 + ' 0.8px,transparent 1.2px,transparent 2.5px),' +
                'repeating-linear-gradient(90deg,transparent,' + D2 + ' 0.8px,transparent 1.2px,transparent 2.5px);' +
                'background-size:2.5px 2.5px;';
        }
        if (t.match(/rope|halat|rattan|wicker|hasır|cane|jute|jüt|sisal|seagrass|raffia/i)) {
            return base + 'background-image:' +
                'repeating-linear-gradient(60deg,transparent,' + D1 + ' 1px,transparent 1.5px,transparent 5px),' +
                'repeating-linear-gradient(-60deg,transparent,' + D2 + ' 1px,transparent 1.5px,transparent 5px);' +
                'background-size:5px 5px;';
        }
        // DEFAULT
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
            compressImage(input.files[0], 1536, 1536, 0.75, function(compressed) {
                window._sunumImageBase64 = compressed.split(',')[1];
                var box = document.getElementById('boxSunumImage');
                var old = box.querySelector('.sunum-preview');
                if (old) old.remove();
                var children = box.children;
                for (var i = 0; i < children.length; i++) {
                    if (!children[i].classList.contains('sunum-preview')) children[i].style.display = 'none';
                }
                var prev = document.createElement('div');
                prev.className = 'sunum-preview absolute inset-0 w-full h-full';
                prev.innerHTML = '<img src="' + compressed + '" class="absolute inset-0 w-full h-full object-contain opacity-90 rounded-2xl">' +
                    '<button onclick="event.stopPropagation(); sunumRemoveImage()" class="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-red-500 z-50 shadow-lg border border-white/20">✕</button>' +
                    '<div class="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none"><span class="bg-black/70 px-4 py-1.5 rounded-lg text-[0.55rem] font-bold tracking-widest text-green-300 shadow-lg uppercase">LOADED</span></div>';
                box.appendChild(prev);
            });
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
        if (!window.currentUserId || window.currentUserId === 'guest') { alert('Please login or sign up to use ADEULL AI rendering. Visit pricing page for plans.'); document.getElementById('loginScreen').style.display = 'flex'; return; }
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }

        var lang = getLang();
        var langCode = (document.getElementById('activeCode') || {}).innerText || 'EN';

        if (!window._sunumImageBase64) { alert(lang.noImage); return; }

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

        // Add secure auth token for Core Engine validation
        var sessionData = window.supabaseClient ? await window.supabaseClient.auth.getSession() : null;
        var authToken = sessionData && sessionData.data && sessionData.data.session ? sessionData.data.session.access_token : "";

        var payload = {
            action: 'presentation',
            prompt: userPrompt || 'Analyze materials, textures, and color palette',
            images: { boxRef: window._sunumImageBase64 },
            language: langCode,
            user_id: window.currentUserId || "guest",
            user_token: authToken
        };

        try {
            var response = await fetch(window.CORE_ENGINE_V2, {
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

            if (!result.analysis && !result.textureImage) {
                var analysisText = '';
                if (result.candidates && result.candidates[0] && result.candidates[0].content) {
                    var parts = result.candidates[0].content.parts;
                    for (var i = 0; i < parts.length; i++) { if (parts[i].text) analysisText = parts[i].text; }
                } else if (result.output) { analysisText = result.output; }
                else if (result.text) { analysisText = result.text; }
                try { analysis = JSON.parse(analysisText.replace(/```json/g, '').replace(/```/g, '').trim()); }
                catch (e) { analysis = { projectName: 'ANALYSIS', materials: [], colors: [] }; }
            }

            window._sunumLastAnalysis = analysis;
            window._sunumLastLangCode = langCode;
            window._sunumLastTextureBase64 = textureBase64;
            window._sunumActiveBoardType = 1;
            renderBoard(analysis, langCode, textureBase64, 1);

            // Render geçmişine kaydet
            if(window.currentUserId && window.supabaseClient) {
                try {
                    const _promptText = (document.getElementById('promptArea') || {}).value || '';
                    const _ratio = window.selectedRatio || '16:9';
                    await window.supabaseClient.from('renders').insert([{
                        user_id: window.currentUserId,
                        menu_type: 'PRESENTATION',
                        is_8k: false,
                        prompt: _promptText.substring(0, 500),
                        aspect_ratio: _ratio,
                        credits_used: 1
                    }]);
                } catch(e) {
                    console.warn('Render history save failed:', e);
                }
            }

        } catch (error) {
            console.error('Sunum Error:', error);
            alert(lang.error);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.classList.remove('bg-blue-600', 'animate-pulse');
        }
    };

    window.switchSunumBoard = function(boardType) {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }
        if (!window._sunumLastAnalysis) return;
        window._sunumActiveBoardType = boardType;
        renderBoard(window._sunumLastAnalysis, window._sunumLastLangCode, window._sunumLastTextureBase64, boardType);
    };

    // ============================================================
    // renderBoard — BOARD 1 (yuvarlak) & BOARD 2 (kare)
    // Her iki board da YATAY A4: 1100x780px
    // ============================================================
    function renderBoard(analysis, langCode, textureBase64, boardType) {
        var lang = getLang();
        var projectName = (analysis.projectName || 'CONCEPT BOARD').toUpperCase();
        var materials = analysis.materials || [];
        var colors = analysis.colors || [];
        var textureSrc = textureBase64 ? ('data:image/png;base64,' + textureBase64) : ('data:image/jpeg;base64,' + window._sunumImageBase64);
        var isBoard2 = (boardType === 2);

        // ── BOARD SELECTOR ──
        var b1Active = !isBoard2 ? 'background:#1a1a1a;color:#fff;' : 'background:transparent;color:#999;';
        var b2Active = isBoard2 ? 'background:#1a1a1a;color:#fff;' : 'background:transparent;color:#999;';
        var boardSelectorHTML = '<div style="display:flex;gap:2px;background:#f0f0f0;border-radius:8px;padding:2px;">' +
            '<button onclick="switchSunumBoard(1)" style="padding:5px 14px;border-radius:6px;font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;border:none;cursor:pointer;transition:all 0.2s;' + b1Active + '">' + lang.board1 + '</button>' +
            '<button onclick="switchSunumBoard(2)" style="padding:5px 14px;border-radius:6px;font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;border:none;cursor:pointer;transition:all 0.2s;' + b2Active + '">' + lang.board2 + '</button>' +
            '</div>';

        var boardHTML = '';

        if (isBoard2) {
            // ══════════════════════════════════════════════════
            // BOARD 2 — MODERN MİNİMALİST (YATAY A4)
            // Sol: görsel, Sağ üst: kare malzeme grid, Sağ alt: renk barı
            // ══════════════════════════════════════════════════

            // Kare malzeme kartları — yatay grid (2 veya 3 sütun)
            var matGridHTML = '';
            for (var i = 0; i < materials.length; i++) {
                var m = materials[i];
                var hex = m.hex || m.hexColor || '#CCC';
                var textureStyle = getTextureCSS(m.title || '', hex);
                matGridHTML += '<div style="flex:1;min-width:100px;max-width:160px;">' +
                    '<div style="width:100%;height:60px;border-radius:4px;' + textureStyle + 'border:1px solid rgba(0,0,0,0.08);"></div>' +
                    '<div contenteditable="true" style="font-size:8px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#333;margin-top:6px;outline:none;cursor:text;padding:1px 2px;">' + (m.title || lang.material + ' ' + (i+1)) + '</div>' +
                    '<div contenteditable="true" style="font-size:7px;letter-spacing:0.08em;color:#888;margin-top:2px;outline:none;cursor:text;padding:1px 2px;line-height:1.4;text-transform:uppercase;">' + (m.desc || '') + '</div>' +
                    '</div>';
            }

            // Renk barı — yatay
            var colorBarHTML = '';
            for (var j = 0; j < colors.length; j++) {
                var c = colors[j];
                var chex = typeof c === 'string' ? c : (c.hex || '#CCC');
                var ral = typeof c === 'string' ? '' : (c.ral || '');
                var cname = typeof c === 'string' ? '' : (c.name || '');
                colorBarHTML += '<div style="flex:1;text-align:center;">' +
                    '<div style="width:100%;height:40px;background-color:' + chex + ';border-radius:4px;border:1px solid rgba(0,0,0,0.06);"></div>' +
                    '<div contenteditable="true" style="font-size:7px;font-weight:700;letter-spacing:0.1em;color:#555;margin-top:4px;outline:none;cursor:text;">' + chex + '</div>' +
                    (ral ? '<div contenteditable="true" style="font-size:6px;letter-spacing:0.08em;color:#999;margin-top:1px;outline:none;cursor:text;">' + ral + '</div>' : '') +
                    (cname ? '<div contenteditable="true" style="font-size:5.5px;letter-spacing:0.08em;color:#aaa;margin-top:1px;outline:none;cursor:text;">' + cname + '</div>' : '') +
                    '</div>';
            }

            boardHTML = '<div id="sunumBoardPrint" style="width:1100px;height:780px;background:#fff;padding:40px 48px;position:relative;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;box-shadow:0 25px 50px rgba(0,0,0,0.15);overflow:hidden;">' +
                // Header
                '<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #1a1a1a;padding-bottom:14px;margin-bottom:24px;">' +
                '<div>' +
                '<h1 contenteditable="true" style="font-size:22px;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;color:#1a1a1a;margin:0;outline:none;cursor:text;">' + lang.title + '</h1>' +
                '<p contenteditable="true" style="font-size:9px;letter-spacing:0.3em;color:#999;text-transform:uppercase;margin:6px 0 0;font-weight:700;outline:none;cursor:text;">' + lang.project + ': ' + projectName + '</p>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">' +
                '<div style="font-size:8px;font-weight:700;letter-spacing:0.4em;color:#ccc;text-transform:uppercase;">ADEULL AI STUDIO</div>' +
                boardSelectorHTML +
                '</div></div>' +
                // Body — yatay layout
                '<div style="display:flex;gap:28px;height:calc(100% - 120px);">' +
                // Sol: Görsel
                '<div style="width:58%;display:flex;align-items:center;justify-content:center;background:#fafafa;border:1px solid #eee;border-radius:6px;padding:12px;">' +
                '<img src="' + textureSrc + '" style="max-width:100%;max-height:100%;object-fit:contain;">' +
                '</div>' +
                // Sağ: Malzemeler + Renkler
                '<div style="width:42%;display:flex;flex-direction:column;justify-content:space-between;">' +
                // Malzeme grid
                '<div>' +
                '<div contenteditable="true" style="font-size:8px;letter-spacing:0.3em;color:#999;font-weight:700;text-transform:uppercase;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #eee;outline:none;cursor:text;">' + lang.materials + '</div>' +
                '<div style="display:flex;flex-wrap:wrap;gap:12px;">' + matGridHTML + '</div>' +
                '</div>' +
                // Renk barı
                '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #eee;">' +
                '<div contenteditable="true" style="font-size:8px;letter-spacing:0.3em;color:#999;font-weight:700;text-transform:uppercase;margin-bottom:8px;outline:none;cursor:text;">' + lang.colorPalette + '</div>' +
                '<div style="display:flex;gap:8px;">' + colorBarHTML + '</div>' +
                '</div>' +
                '</div></div>' +
                // Footer
                '<div style="position:absolute;bottom:14px;left:48px;right:48px;display:flex;justify-content:space-between;opacity:0.25;">' +
                '<span style="font-size:7px;letter-spacing:0.3em;text-transform:uppercase;">ADEULL AI</span>' +
                '<span style="font-size:7px;letter-spacing:0.2em;">' + new Date().toLocaleDateString() + '</span>' +
                '</div></div>';

        } else {
            // ══════════════════════════════════════════════════
            // BOARD 1 — PREMİUM KLASİK (YATAY A4)
            // Sol: görsel, Sağ: yuvarlak malzeme + renk kartelası
            // ══════════════════════════════════════════════════

            var materialsHTML = '';
            for (var i2 = 0; i2 < materials.length; i2++) {
                var m2 = materials[i2];
                var hex2 = m2.hex || m2.hexColor || '#CCC';
                var ts2 = getTextureCSS(m2.title || '', hex2);
                materialsHTML += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">' +
                    '<div style="width:48px;height:48px;border-radius:50%;flex-shrink:0;border:2px solid #e5e5e5;box-shadow:0 2px 8px rgba(0,0,0,0.08);' + ts2 + '"></div>' +
                    '<div style="flex:1;">' +
                    '<div contenteditable="true" style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#333;outline:none;cursor:text;padding:1px 2px;">' + (m2.title || lang.material + ' ' + (i2+1)) + '</div>' +
                    '<div contenteditable="true" style="font-size:7.5px;letter-spacing:0.06em;color:#888;margin-top:3px;outline:none;cursor:text;padding:1px 2px;line-height:1.4;text-transform:uppercase;">' + (m2.desc || '') + '</div>' +
                    '</div></div>';
            }

            var colorsHTML = '';
            for (var j2 = 0; j2 < colors.length; j2++) {
                var c2 = colors[j2];
                var chex2 = typeof c2 === 'string' ? c2 : (c2.hex || '#CCC');
                var ral2 = typeof c2 === 'string' ? '' : (c2.ral || '');
                var name2 = typeof c2 === 'string' ? '' : (c2.name || '');
                colorsHTML += '<div style="flex:1;text-align:center;min-width:65px;">' +
                    '<div style="width:100%;height:48px;border-radius:4px;background-color:' + chex2 + ';border:1px solid rgba(0,0,0,0.06);box-shadow:inset 0 2px 4px rgba(0,0,0,0.06);"></div>' +
                    '<div contenteditable="true" style="font-size:7px;font-weight:700;letter-spacing:0.1em;color:#555;margin-top:5px;outline:none;cursor:text;">' + chex2 + '</div>' +
                    (ral2 ? '<div contenteditable="true" style="font-size:6px;letter-spacing:0.08em;color:#999;font-weight:500;margin-top:1px;outline:none;cursor:text;">' + ral2 + '</div>' : '') +
                    (name2 ? '<div contenteditable="true" style="font-size:5.5px;letter-spacing:0.08em;color:#aaa;margin-top:1px;outline:none;cursor:text;">' + name2 + '</div>' : '') +
                    '</div>';
            }

            boardHTML = '<div id="sunumBoardPrint" style="width:1100px;height:780px;background:#fff;padding:40px 48px;position:relative;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;box-shadow:0 25px 50px rgba(0,0,0,0.15);overflow:hidden;">' +
                // Header — ince gold accent çizgi
                '<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #e5e5e5;padding-bottom:14px;margin-bottom:24px;">' +
                '<div>' +
                '<h1 contenteditable="true" style="font-size:22px;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;color:#1a1a1a;margin:0;outline:none;cursor:text;">' + lang.title + '</h1>' +
                '<p contenteditable="true" style="font-size:9px;letter-spacing:0.3em;color:#999;text-transform:uppercase;margin:6px 0 0;font-weight:700;outline:none;cursor:text;">' + lang.project + ': ' + projectName + '</p>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">' +
                '<div style="font-size:8px;font-weight:700;letter-spacing:0.4em;color:#ccc;text-transform:uppercase;">ADEULL AI STUDIO</div>' +
                boardSelectorHTML +
                '</div></div>' +
                // Body
                '<div style="display:flex;gap:28px;height:calc(100% - 120px);">' +
                // Sol: Görsel
                '<div style="width:60%;display:flex;align-items:center;justify-content:center;background:#fafafa;border:1px solid #f0f0f0;border-radius:4px;padding:14px;">' +
                '<img src="' + textureSrc + '" style="max-width:100%;max-height:100%;object-fit:contain;">' +
                '</div>' +
                // Sağ: malzeme + renk
                '<div style="width:40%;display:flex;flex-direction:column;justify-content:space-between;padding-left:20px;border-left:1px solid #f0f0f0;">' +
                '<div>' +
                '<div contenteditable="true" style="font-size:8px;letter-spacing:0.3em;color:#999;font-weight:700;text-transform:uppercase;margin-bottom:14px;padding-bottom:6px;border-bottom:1px solid #f0f0f0;outline:none;cursor:text;">' + lang.materials + '</div>' +
                materialsHTML +
                '</div>' +
                '<div style="margin-top:14px;padding-top:12px;border-top:1px solid #f0f0f0;">' +
                '<div contenteditable="true" style="font-size:8px;letter-spacing:0.3em;color:#999;font-weight:700;text-transform:uppercase;margin-bottom:10px;outline:none;cursor:text;">' + lang.colorPalette + '</div>' +
                '<div style="display:flex;gap:8px;">' + colorsHTML + '</div>' +
                '</div></div></div>' +
                // Footer
                '<div style="position:absolute;bottom:14px;left:48px;right:48px;display:flex;justify-content:space-between;opacity:0.25;">' +
                '<span style="font-size:7px;letter-spacing:0.3em;text-transform:uppercase;">ADEULL AI</span>' +
                '<span style="font-size:7px;letter-spacing:0.2em;">' + new Date().toLocaleDateString() + '</span>' +
                '</div></div>';
        }

        document.getElementById('sunumBoardContainer').innerHTML = boardHTML;
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