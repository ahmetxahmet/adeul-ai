// ==============================================================
// PROMPT.JS — ADEULL AI PROMPT BUILDER
// Görsel yükle → mekanı/ürünü analiz et → 8K render prompt oluştur
// N8N webhook üzerinden Gemini text analizi (kredi düşmez)
// ADEULL estetiği — glass-panel, siyah/beyaz, tracking-widest
// ==============================================================

(function() {
    'use strict';

    // ============================================================
    // DİL DESTEĞİ (10 dil)
    // ============================================================
    var promptLang = {
        'EN': { title: 'PROMPT BUILDER', upload: 'UPLOAD IMAGE', instruction: 'What do you want? (e.g. "Generate prompt for only the walls" or "Ignore furniture, focus on architecture")', generate: 'GENERATE PROMPT', generating: 'ANALYZING...', copyBtn: 'COPY PROMPT', useBtn: 'USE IN RENDER', close: 'CLOSE', placeholder: 'Your generated prompt will appear here...', success: 'Prompt copied!', noImage: 'Please upload an image first.', error: 'An error occurred. Please try again.', couponTitle: 'REDEEM COUPON', couponPlaceholder: 'ENTER COUPON CODE', couponBtn: 'REDEEM', couponSuccess: 'Coupon redeemed!', couponError: 'Invalid coupon code.' },
        'TR': { title: 'PROMPT OLUŞTURUCU', upload: 'GÖRSEL YÜKLE', instruction: 'Ne istiyorsun? (örn. "Sadece duvarların promptunu oluştur" veya "Mobilyaları görmezden gel, mimariyi analiz et")', generate: 'PROMPT OLUŞTUR', generating: 'ANALİZ EDİLİYOR...', copyBtn: 'PROMPTU KOPYALA', useBtn: 'RENDER\'DA KULLAN', close: 'KAPAT', placeholder: 'Oluşturulan prompt burada görünecek...', success: 'Prompt kopyalandı!', noImage: 'Lütfen önce bir görsel yükleyin.', error: 'Bir hata oluştu. Tekrar deneyin.', couponTitle: 'KUPON GİR', couponPlaceholder: 'KUPON KODUNU GİRİN', couponBtn: 'KULLAN', couponSuccess: 'Kupon tanımlandı!', couponError: 'Geçersiz kupon kodu.' },
        'ES': { title: 'CONSTRUCTOR DE PROMPT', upload: 'SUBIR IMAGEN', instruction: 'Qué quieres? (ej. "Genera prompt solo para las paredes")', generate: 'GENERAR PROMPT', generating: 'ANALIZANDO...', copyBtn: 'COPIAR', useBtn: 'USAR EN RENDER', close: 'CERRAR', placeholder: 'El prompt aparecerá aquí...', success: 'Prompt copiado!', noImage: 'Suba una imagen primero.', error: 'Error. Inténtelo de nuevo.', couponTitle: 'CANJEAR CUPÓN', couponPlaceholder: 'CÓDIGO DE CUPÓN', couponBtn: 'CANJEAR', couponSuccess: 'Cupón canjeado!', couponError: 'Código inválido.' },
        'DE': { title: 'PROMPT GENERATOR', upload: 'BILD HOCHLADEN', instruction: 'Was möchten Sie? (z.B. "Nur die Wände analysieren")', generate: 'PROMPT ERSTELLEN', generating: 'ANALYSIERE...', copyBtn: 'KOPIEREN', useBtn: 'IM RENDER VERWENDEN', close: 'SCHLIEßEN', placeholder: 'Der generierte Prompt erscheint hier...', success: 'Kopiert!', noImage: 'Bitte laden Sie ein Bild hoch.', error: 'Fehler. Versuchen Sie es erneut.', couponTitle: 'GUTSCHEIN', couponPlaceholder: 'GUTSCHEINCODE', couponBtn: 'EINLÖSEN', couponSuccess: 'Gutschein eingelöst!', couponError: 'Ungültiger Code.' },
        'FR': { title: 'GÉNÉRATEUR DE PROMPT', upload: 'TÉLÉCHARGER IMAGE', instruction: 'Que voulez-vous? (ex. "Générer le prompt uniquement pour les murs")', generate: 'GÉNÉRER PROMPT', generating: 'ANALYSE EN COURS...', copyBtn: 'COPIER', useBtn: 'UTILISER DANS RENDER', close: 'FERMER', placeholder: 'Le prompt apparaîtra ici...', success: 'Copié!', noImage: 'Veuillez télécharger une image.', error: 'Erreur. Réessayez.', couponTitle: 'CODE PROMO', couponPlaceholder: 'ENTRER LE CODE', couponBtn: 'VALIDER', couponSuccess: 'Code validé!', couponError: 'Code invalide.' },
        'PT': { title: 'GERADOR DE PROMPT', upload: 'ENVIAR IMAGEM', instruction: 'O que você quer? (ex. "Gerar prompt apenas para as paredes")', generate: 'GERAR PROMPT', generating: 'ANALISANDO...', copyBtn: 'COPIAR', useBtn: 'USAR NO RENDER', close: 'FECHAR', placeholder: 'O prompt aparecerá aqui...', success: 'Copiado!', noImage: 'Envie uma imagem primeiro.', error: 'Erro. Tente novamente.', couponTitle: 'CUPOM', couponPlaceholder: 'CÓDIGO DO CUPOM', couponBtn: 'RESGATAR', couponSuccess: 'Cupom resgatado!', couponError: 'Código inválido.' },
        'ID': { title: 'PEMBUAT PROMPT', upload: 'UNGGAH GAMBAR', instruction: 'Apa yang Anda inginkan? (cth. "Buat prompt untuk dinding saja")', generate: 'BUAT PROMPT', generating: 'MENGANALISIS...', copyBtn: 'SALIN', useBtn: 'GUNAKAN DI RENDER', close: 'TUTUP', placeholder: 'Prompt akan muncul di sini...', success: 'Disalin!', noImage: 'Unggah gambar terlebih dahulu.', error: 'Terjadi kesalahan.', couponTitle: 'KUPON', couponPlaceholder: 'KODE KUPON', couponBtn: 'TUKAR', couponSuccess: 'Kupon ditukar!', couponError: 'Kode tidak valid.' },
        'RU': { title: 'КОНСТРУКТОР ПРОМПТОВ', upload: 'ЗАГРУЗИТЬ ИЗОБРАЖЕНИЕ', instruction: 'Что вы хотите? (напр. "Создай промпт только для стен" или "Игнорируй мебель, фокус на архитектуре")', generate: 'СОЗДАТЬ ПРОМПТ', generating: 'АНАЛИЗ...', copyBtn: 'КОПИРОВАТЬ', useBtn: 'ИСПОЛЬЗОВАТЬ В РЕНДЕРЕ', close: 'ЗАКРЫТЬ', placeholder: 'Сгенерированный промпт появится здесь...', success: 'Скопировано!', noImage: 'Пожалуйста, сначала загрузите изображение.', error: 'Ошибка. Попробуйте снова.', couponTitle: 'КУПОН', couponPlaceholder: 'КОД КУПОНА', couponBtn: 'ПРИМЕНИТЬ', couponSuccess: 'Купон применён!', couponError: 'Неверный код.' },
        'AR': { title: 'منشئ الأوامر', upload: 'تحميل صورة', instruction: 'ماذا تريد؟', generate: 'إنشاء الأمر', generating: 'جاري التحليل...', copyBtn: 'نسخ', useBtn: 'استخدام في التصيير', close: 'إغلاق', placeholder: 'سيظهر الأمر هنا...', success: 'تم النسخ!', noImage: 'يرجى تحميل صورة أولاً.', error: 'حدث خطأ.', couponTitle: 'قسيمة', couponPlaceholder: 'رمز القسيمة', couponBtn: 'استرداد', couponSuccess: 'تم الاسترداد!', couponError: 'رمز غير صالح.' },
        'IT': { title: 'GENERATORE DI PROMPT', upload: 'CARICA IMMAGINE', instruction: 'Cosa vuoi? (es. "Genera prompt solo per le pareti")', generate: 'GENERA PROMPT', generating: 'ANALISI...', copyBtn: 'COPIA', useBtn: 'USA NEL RENDER', close: 'CHIUDI', placeholder: 'Il prompt apparirà qui...', success: 'Copiato!', noImage: 'Carica prima un\'immagine.', error: 'Errore. Riprova.', couponTitle: 'COUPON', couponPlaceholder: 'CODICE COUPON', couponBtn: 'RISCATTA', couponSuccess: 'Coupon riscattato!', couponError: 'Codice non valido.' }
    };

    function getL() {
        var el = document.getElementById('activeCode');
        var code = el ? el.innerText.trim() : 'EN';
        return promptLang[code] || promptLang['EN'];
    }

    // ============================================================
    // PROMPT BUILDER STATE
    // ============================================================
    var _pbImageBase64 = null;
    var _pbOverlay = null;

    // ============================================================
    // PROMPT BUILDER OVERLAY
    // ============================================================
    window.openPromptBuilder = function() {
        if (!window.currentUserId || window.currentUserId === 'guest') { alert('Please login or sign up to use ADEULL AI rendering. Visit pricing page for plans.'); document.getElementById('loginScreen').style.display = 'flex'; return; }
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }
        var L = getL();
        _pbImageBase64 = null;

        if (_pbOverlay) _pbOverlay.remove();

        _pbOverlay = document.createElement('div');
        _pbOverlay.id = 'promptBuilderOverlay';
        _pbOverlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.95);backdrop-filter:blur(30px);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity 0.3s ease;';

        _pbOverlay.innerHTML =
            '<div style="width:100%;max-width:480px;max-height:90vh;overflow-y:auto;display:flex;flex-direction:column;gap:16px;">' +

            // Header
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<h2 style="font-size:14px;font-weight:700;letter-spacing:0.3em;color:#fff;text-transform:uppercase;margin:0;">' + L.title + '</h2>' +
            '<button onclick="closePromptBuilder()" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:24px;cursor:pointer;transition:color 0.2s;" onmouseenter="this.style.color=\'#fff\'" onmouseleave="this.style.color=\'rgba(255,255,255,0.4)\'">✕</button>' +
            '</div>' +

            // Upload Box
            '<div id="pbUploadBox" onclick="pbClickUpload()" ondragover="event.preventDefault(); this.style.borderColor=\'rgba(255,255,255,0.5)\'" ondragleave="this.style.borderColor=\'rgba(255,255,255,0.2)\'" ondrop="event.preventDefault(); this.style.borderColor=\'rgba(255,255,255,0.2)\'; pbHandleDrop(event)" style="width:100%;height:180px;border:1px dashed rgba(255,255,255,0.2);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;background:rgba(255,255,255,0.02);" onmouseenter="this.style.background=\'rgba(255,255,255,0.06)\'" onmouseleave="this.style.background=\'rgba(255,255,255,0.02)\'">' +
            '<span style="font-size:28px;margin-bottom:8px;opacity:0.4;">↑</span>' +
            '<span style="font-size:9px;font-weight:700;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;">' + L.upload + '</span>' +
            '</div>' +
            '<input type="file" id="pbFileInput" accept="image/*" style="display:none;" onchange="pbHandleFile(this)">' +

            // Instruction Input
            '<textarea id="pbInstruction" placeholder="' + L.instruction + '" style="width:100%;height:70px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;color:rgba(255,255,255,0.8);outline:none;font-size:10px;letter-spacing:0.05em;resize:none;font-family:inherit;box-sizing:border-box;transition:border-color 0.2s;" onfocus="this.style.borderColor=\'rgba(255,255,255,0.25)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.08)\'"></textarea>' +

            // Generate Button
            '<button id="pbGenerateBtn" onclick="pbGenerate()" style="width:100%;background:rgba(255,255,255,0.9);color:#000;font-weight:700;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;padding:14px;border:none;border-radius:12px;cursor:pointer;transition:all 0.2s;font-family:inherit;" onmouseenter="this.style.background=\'#fff\'" onmouseleave="this.style.background=\'rgba(255,255,255,0.9)\'">' + L.generate + '</button>' +

            // Output Area
            '<div id="pbOutputArea" style="display:none;flex-direction:column;gap:10px;">' +
            '<textarea id="pbOutputText" readonly style="width:100%;height:140px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;color:rgba(255,255,255,0.9);font-size:10px;letter-spacing:0.03em;line-height:1.6;resize:none;font-family:inherit;box-sizing:border-box;" placeholder="' + L.placeholder + '"></textarea>' +
            '<div style="display:flex;gap:8px;">' +
            '<button onclick="pbCopyPrompt()" style="flex:1;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-weight:700;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;padding:12px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;cursor:pointer;transition:all 0.2s;font-family:inherit;" onmouseenter="this.style.background=\'rgba(255,255,255,0.12)\'" onmouseleave="this.style.background=\'rgba(255,255,255,0.06)\'">' + L.copyBtn + '</button>' +
            '<button onclick="pbUseInRender()" style="flex:1;background:rgba(255,255,255,0.9);color:#000;font-weight:700;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;padding:12px;border:none;border-radius:10px;cursor:pointer;transition:all 0.2s;font-family:inherit;" onmouseenter="this.style.background=\'#fff\'" onmouseleave="this.style.background=\'rgba(255,255,255,0.9)\'">' + L.useBtn + '</button>' +
            '</div>' +
            '</div>' +

            '</div>';

        document.body.appendChild(_pbOverlay);
        setTimeout(function() { _pbOverlay.style.opacity = '1'; }, 10);
    };

    window.closePromptBuilder = function() {
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }
        if (_pbOverlay) {
            _pbOverlay.style.opacity = '0';
            setTimeout(function() { if (_pbOverlay) { _pbOverlay.remove(); _pbOverlay = null; } }, 300);
        }
        _pbImageBase64 = null;
    };

    // ESC ile kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('adeullChatOverlay')) closeAdeullChat();
            else if (document.getElementById('couponOverlay')) closeCouponModal();
            else if (_pbOverlay) closePromptBuilder();
        }
    });

    // ============================================================
    // IMAGE UPLOAD
    // ============================================================
    window.pbClickUpload = function() {
        document.getElementById('pbFileInput').click();
    };

    window.pbHandleFile = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                _pbImageBase64 = e.target.result.split(',')[1];
                var box = document.getElementById('pbUploadBox');
                if (box) {
                    box.innerHTML = '<img src="' + e.target.result + '" style="max-width:100%;max-height:160px;object-fit:contain;border-radius:10px;opacity:0.8;">' +
                        '<span style="font-size:7px;color:rgba(255,255,255,0.3);letter-spacing:0.2em;margin-top:6px;text-transform:uppercase;">Click to change</span>';
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    window.pbHandleDrop = function(event) {
        var files = event.dataTransfer.files;
        if (!files || !files.length) return;
        var file = files[0];
        if (!file.type.startsWith('image/')) { alert('Please drop an image file.'); return; }
        var input = document.getElementById('pbFileInput');
        if (input) {
            var dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            pbHandleFile(input);
        }
    };

    // ============================================================
    // GENERATE PROMPT (N8N webhook)
    // ============================================================
    window.pbGenerate = async function() {
        var L = getL();

        if (!_pbImageBase64) {
            alert(L.noImage);
            return;
        }

        var btn = document.getElementById('pbGenerateBtn');
        var instruction = (document.getElementById('pbInstruction') || {}).value || '';

        btn.innerText = L.generating;
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.5';

        try {
            // Auth token al
            var sessionData = window.supabaseClient ? await window.supabaseClient.auth.getSession() : null;
            var authToken = (sessionData && sessionData.data && sessionData.data.session) ? sessionData.data.session.access_token : '';
            var activeLang = (document.getElementById('activeCode') || {}).innerText || 'EN';

            var payload = {
                action: 'prompt_builder',
                images: { boxRef: _pbImageBase64 },
                prompt: instruction,
                language: activeLang,
                user_token: authToken,
                user_id: window.currentUserId || 'guest'
            };

            var response = await fetch(window.CORE_ENGINE_V2, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Server error');

            var data = await response.json();
            var result = Array.isArray(data) ? data[0] : data;

            // Gemini text yanıtını al
            var promptText = '';
            if (result.output) {
                promptText = result.output;
            } else if (result.candidates && result.candidates[0] && result.candidates[0].content) {
                var parts = result.candidates[0].content.parts;
                for (var i = 0; i < parts.length; i++) {
                    if (parts[i].text) promptText = parts[i].text;
                }
            } else if (typeof result === 'string') {
                promptText = result;
            }

            // Output göster
            var outputArea = document.getElementById('pbOutputArea');
            var outputText = document.getElementById('pbOutputText');
            if (outputArea && outputText) {
                outputText.value = promptText.trim();
                outputArea.style.display = 'flex';
            }

        } catch (err) {
            console.error('Prompt Builder error:', err);
            alert(L.error);
        } finally {
            btn.innerText = L.generate;
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        }
    };

    // ============================================================
    // COPY & USE
    // ============================================================
    window.pbCopyPrompt = function() {
        var L = getL();
        var text = (document.getElementById('pbOutputText') || {}).value || '';
        if (text) {
            navigator.clipboard.writeText(text).then(function() {
                alert(L.success);
            });
        }
    };

    window.pbUseInRender = function() {
        var text = (document.getElementById('pbOutputText') || {}).value || '';
        var promptArea = document.getElementById('promptArea');
        if (text && promptArea) {
            promptArea.value = text;
            closePromptBuilder();
        }
    };

    // ============================================================
    // COUPON SYSTEM
    // ============================================================
    window.openCouponModal = function() {
        if (!window.currentUserId || window.currentUserId === 'guest') { alert('Please login or sign up to use ADEULL AI rendering. Visit pricing page for plans.'); document.getElementById('loginScreen').style.display = 'flex'; return; }
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }
        var L = getL();

        var existing = document.getElementById('couponOverlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = 'couponOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.95);backdrop-filter:blur(30px);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity 0.3s ease;';

        overlay.innerHTML =
            '<div style="width:100%;max-width:380px;display:flex;flex-direction:column;gap:16px;text-align:center;">' +
            '<h2 style="font-size:14px;font-weight:700;letter-spacing:0.3em;color:#fff;text-transform:uppercase;">' + L.couponTitle + '</h2>' +
            '<input type="text" id="couponInput" placeholder="' + L.couponPlaceholder + '" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px;color:#fff;outline:none;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;text-align:center;font-family:inherit;box-sizing:border-box;">' +
            '<button onclick="redeemCoupon()" style="width:100%;background:rgba(255,255,255,0.9);color:#000;font-weight:700;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;padding:14px;border:none;border-radius:12px;cursor:pointer;font-family:inherit;">' + L.couponBtn + '</button>' +
            '<button onclick="closeCouponModal()" style="background:none;border:none;color:rgba(255,255,255,0.3);font-size:9px;letter-spacing:0.2em;cursor:pointer;font-family:inherit;text-transform:uppercase;padding:8px;">' + L.close + '</button>' +
            '</div>';

        document.body.appendChild(overlay);
        setTimeout(function() { overlay.style.opacity = '1'; }, 10);
    };

    window.closeCouponModal = function() {
        var overlay = document.getElementById('couponOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(function() { overlay.remove(); }, 300);
        }
    };

    window.redeemCoupon = async function() {
        var code = (document.getElementById('couponInput') || {}).value.trim().toUpperCase();
        if(!code) { alert('Please enter a coupon code'); return; }
        if(!window.currentUserId || !window.supabaseClient) {
            alert('Please login first');
            return;
        }

        try {
            var res = await window.supabaseClient.rpc('redeem_coupon', { p_code: code });
            var data = res.data;
            var error = res.error;
            if(error) throw error;

            if(data && data.success) {
                alert('✓ Success! ' + data.credits_added + ' credits added to your account.');
                var creditEl = document.getElementById('topCreditDisplay');
                var panelEl = document.getElementById('panelCreditDisplay');
                if(creditEl) creditEl.innerText = data.new_credits.toLocaleString();
                if(panelEl) panelEl.innerText = data.new_credits.toLocaleString();
                if(typeof closeCouponModal === 'function') closeCouponModal();
            } else {
                alert('❌ ' + (data && data.message ? data.message : 'Invalid coupon'));
            }
        } catch(e) {
            alert('Error: ' + e.message);
        }
    };

    // ============================================================
    // ADEULL CHAT — Canlı sohbet asistanı
    // ============================================================
    window.openAdeullChat = function() {
        if (!window.currentUserId || window.currentUserId === 'guest') { alert('Please login or sign up to use ADEULL AI rendering. Visit pricing page for plans.'); document.getElementById('loginScreen').style.display = 'flex'; return; }
        if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }
        var L = getL();

        var existing = document.getElementById('adeullChatOverlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = 'adeullChatOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.95);backdrop-filter:blur(30px);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity 0.3s ease;';

        overlay.innerHTML =
            '<div style="width:100%;max-width:480px;height:80vh;max-height:600px;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;background:rgba(0,0,0,0.8);">' +

            '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">' +
            '<h2 style="font-size:12px;font-weight:700;letter-spacing:0.3em;color:#fff;text-transform:uppercase;margin:0;">ADEULL AI</h2>' +
            '<button onclick="closeAdeullChat()" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:20px;cursor:pointer;">✕</button>' +
            '</div>' +

            '<div id="chatMessages" style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;">' +
            '<div style="background:rgba(255,255,255,0.05);border-radius:12px 12px 12px 4px;padding:12px 14px;max-width:85%;align-self:flex-start;">' +
            '<p style="font-size:10px;color:rgba(255,255,255,0.7);line-height:1.6;margin:0;letter-spacing:0.02em;">' +
            (L.title === 'PROMPT OLUŞTURUCU' ?
            'Merhaba! Ben ADEULL AI asistanıyım. Size menüler, render alma, sunum oluşturma veya mimari vizyon konularında yardımcı olabilirim. Ne sormak istersiniz?' :
            'Hello! I am the ADEULL AI assistant. I can help you with menus, rendering, presentations, and architectural vision. What would you like to know?') +
            '</p></div></div>' +

            '<div style="padding:12px 16px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;">' +
            '<input type="text" id="chatInput" placeholder="' + (L.title === 'PROMPT OLUŞTURUCU' ? 'Mesajınızı yazın...' : 'Type your message...') + '" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;color:#fff;outline:none;font-size:10px;letter-spacing:0.03em;font-family:inherit;box-sizing:border-box;" onkeypress="if(event.key===\'Enter\')sendChatMessage()">' +
            '<button onclick="sendChatMessage()" style="background:rgba(255,255,255,0.9);color:#000;border:none;border-radius:12px;padding:12px 16px;font-size:9px;font-weight:700;letter-spacing:0.15em;cursor:pointer;font-family:inherit;">→</button>' +
            '</div>' +

            '</div>';

        document.body.appendChild(overlay);
        setTimeout(function() { overlay.style.opacity = '1'; }, 10);
    };

    window.closeAdeullChat = function() {
        var overlay = document.getElementById('adeullChatOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(function() { overlay.remove(); }, 300);
        }
    };

    window.sendChatMessage = async function() {
        var input = document.getElementById('chatInput');
        var messages = document.getElementById('chatMessages');
        if (!input || !messages) return;
        var text = input.value.trim();
        if (!text) return;
        input.value = '';

        // Kullanıcı mesajı
        var userMsg = document.createElement('div');
        userMsg.style.cssText = 'background:rgba(255,255,255,0.1);border-radius:12px 12px 4px 12px;padding:12px 14px;max-width:85%;align-self:flex-end;';
        userMsg.innerHTML = '<p style="font-size:10px;color:rgba(255,255,255,0.9);line-height:1.6;margin:0;">' + text.replace(/</g,'&lt;') + '</p>';
        messages.appendChild(userMsg);
        messages.scrollTop = messages.scrollHeight;

        // Yükleniyor
        var loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'background:rgba(255,255,255,0.05);border-radius:12px 12px 12px 4px;padding:12px 14px;max-width:85%;align-self:flex-start;';
        loadingMsg.innerHTML = '<p style="font-size:10px;color:rgba(255,255,255,0.4);margin:0;letter-spacing:0.1em;">...</p>';
        messages.appendChild(loadingMsg);
        messages.scrollTop = messages.scrollHeight;

        try {
            var sessionData = window.supabaseClient ? await window.supabaseClient.auth.getSession() : null;
            var authToken = (sessionData && sessionData.data && sessionData.data.session) ? sessionData.data.session.access_token : '';
            var activeLang = (document.getElementById('activeCode') || {}).innerText || 'EN';

            var response = await fetch(window.CORE_ENGINE_V2, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'chat',
                    prompt: text,
                    language: activeLang,
                    user_token: authToken,
                    user_id: window.currentUserId || 'guest'
                })
            });

            var data = await response.json();
            var result = Array.isArray(data) ? data[0] : data;
            var reply = '';

            if (result.output) reply = result.output;
            else if (result.candidates && result.candidates[0]) {
                var parts = result.candidates[0].content.parts;
                for (var i = 0; i < parts.length; i++) {
                    if (parts[i].text) reply = parts[i].text;
                }
            }

            loadingMsg.innerHTML = '<p style="font-size:10px;color:rgba(255,255,255,0.7);line-height:1.6;margin:0;letter-spacing:0.02em;">' + (reply || 'Sorry, I could not process your request.').replace(/</g,'&lt;').replace(/\n/g,'<br>') + '</p>';
        } catch(e) {
            loadingMsg.innerHTML = '<p style="font-size:10px;color:rgba(255,100,100,0.7);margin:0;">Connection error. Please try again.</p>';
        }
        messages.scrollTop = messages.scrollHeight;
    };

    // ESC ile chat kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('adeullChatOverlay')) closeAdeullChat();
    });

})();