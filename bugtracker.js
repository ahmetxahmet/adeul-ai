// ==============================================================
// BUGTRACKER.JS — ADEULL AI ONARIM AGENT (Frontend)
// Kullanıcı hata bildirimi + otomatik JS hata yakalama
// Supabase'e yazar → N8N workflow mail atar
// ==============================================================

(function() {
    'use strict';

    var SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';
    var SUPABASE_KEY = 'sb_publishable_4WYCqs4gxci5eQoOeysLWQ_5cqkdWaA';

    // ============================================================
    // 1. FLOATING BUG REPORT BUTONU
    // ============================================================
    function createBugButton() {
        var btn = document.createElement('div');
        btn.id = 'bugReportBtn';
        btn.innerHTML = '🐛';
        btn.style.cssText = 'position:fixed;bottom:40px;left:16px;z-index:9999;width:42px;height:42px;' +
            'background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.15);border-radius:50%;' +
            'display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;' +
            'backdrop-filter:blur(10px);transition:all 0.3s;opacity:0.5;';
        btn.onmouseenter = function() { btn.style.opacity = '1'; btn.style.transform = 'scale(1.1)'; };
        btn.onmouseleave = function() { btn.style.opacity = '0.5'; btn.style.transform = 'scale(1)'; };
        btn.onclick = function() { toggleBugModal(); };
        document.body.appendChild(btn);
    }

    // ============================================================
    // 2. BUG REPORT MODAL
    // ============================================================
    function createBugModal() {
        var modal = document.createElement('div');
        modal.id = 'bugReportModal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.85);' +
            'display:none;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);';

        var langCode = (document.getElementById('activeCode') || {}).innerText || 'EN';
        var isTR = langCode === 'TR';

        modal.innerHTML =
            '<div style="width:100%;max-width:420px;background:#111;border:1px solid rgba(255,255,255,0.1);' +
            'border-radius:24px;padding:32px;position:relative;box-shadow:0 25px 50px rgba(0,0,0,0.5);">' +

            '<button onclick="closeBugModal()" style="position:absolute;top:16px;right:16px;background:none;' +
            'border:none;color:rgba(255,255,255,0.4);font-size:20px;cursor:pointer;">✕</button>' +

            '<h3 style="font-size:16px;font-weight:800;letter-spacing:0.2em;color:#fff;text-transform:uppercase;' +
            'margin:0 0 6px;text-align:center;">' + (isTR ? 'HATA BİLDİR' : 'REPORT BUG') + '</h3>' +
            '<p style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.3);text-align:center;margin:0 0 24px;">' +
            (isTR ? 'Sorunu açıklayın, en kısa sürede çözeceğiz.' : 'Describe the issue, we will fix it ASAP.') + '</p>' +

            '<input type="email" id="bugEmail" placeholder="' + (isTR ? 'E-POSTA (opsiyonel)' : 'EMAIL (optional)') + '" ' +
            'style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);' +
            'border-radius:12px;padding:14px;color:#fff;outline:none;font-size:11px;letter-spacing:0.1em;' +
            'margin-bottom:12px;box-sizing:border-box;">' +

            '<textarea id="bugDescription" placeholder="' + (isTR ? 'Ne oldu? Ne bekliyordunuz?' : 'What happened? What did you expect?') + '" ' +
            'style="width:100%;height:100px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);' +
            'border-radius:12px;padding:14px;color:#fff;outline:none;font-size:11px;letter-spacing:0.05em;' +
            'resize:none;margin-bottom:16px;box-sizing:border-box;line-height:1.5;"></textarea>' +

            '<button onclick="submitBugReport()" id="bugSubmitBtn" style="width:100%;background:#fff;color:#000;' +
            'font-weight:800;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;padding:14px;' +
            'border:none;border-radius:12px;cursor:pointer;transition:all 0.2s;">' +
            (isTR ? 'GÖNDER' : 'SUBMIT') + '</button>' +

            '<div id="bugSuccessMsg" style="display:none;text-align:center;margin-top:16px;">' +
            '<div style="font-size:28px;margin-bottom:8px;">✅</div>' +
            '<p style="font-size:10px;letter-spacing:0.15em;color:rgba(255,255,255,0.6);">' +
            (isTR ? 'Bildiriminiz alındı. Teşekkürler!' : 'Report received. Thank you!') + '</p>' +
            '</div>' +

            '</div>';

        document.body.appendChild(modal);
    }

    window.toggleBugModal = function() {
        var modal = document.getElementById('bugReportModal');
        if (!modal) return;
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'flex';
            var desc = document.getElementById('bugDescription');
            if (desc) { desc.value = ''; desc.focus(); }
            var email = document.getElementById('bugEmail');
            if (email) email.value = '';
            var successMsg = document.getElementById('bugSuccessMsg');
            if (successMsg) successMsg.style.display = 'none';
            var submitBtn = document.getElementById('bugSubmitBtn');
            if (submitBtn) { submitBtn.style.display = 'block'; submitBtn.disabled = false; }
        }
    };

    window.closeBugModal = function() {
        var modal = document.getElementById('bugReportModal');
        if (modal) modal.style.display = 'none';
    };

    // ============================================================
    // 3. HATA BİLDİRİMİ GÖNDER → Supabase
    // ============================================================
    window.submitBugReport = async function() {
        var desc = (document.getElementById('bugDescription') || {}).value || '';
        var email = (document.getElementById('bugEmail') || {}).value || '';

        if (!desc.trim()) {
            var el = document.getElementById('bugDescription');
            if (el) { el.style.borderColor = '#ff4444'; setTimeout(function() { el.style.borderColor = 'rgba(255,255,255,0.1)'; }, 2000); }
            return;
        }

        var btn = document.getElementById('bugSubmitBtn');
        if (btn) { btn.disabled = true; btn.innerText = '...'; }

        var payload = {
            user_email: email || null,
            page: window.location.pathname + window.location.hash,
            description: desc,
            browser_info: navigator.userAgent,
            status: 'OPEN',
            priority: 'NORMAL'
        };

        try {
            var response = await fetch(SUPABASE_URL + '/rest/v1/bug_reports', {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                if (btn) btn.style.display = 'none';
                var successMsg = document.getElementById('bugSuccessMsg');
                if (successMsg) successMsg.style.display = 'block';
                setTimeout(function() { closeBugModal(); }, 2500);
            } else {
                if (btn) { btn.disabled = false; btn.innerText = 'ERROR — TRY AGAIN'; }
            }
        } catch (e) {
            console.error('Bug report error:', e);
            if (btn) { btn.disabled = false; btn.innerText = 'ERROR — TRY AGAIN'; }
        }
    };

    // ============================================================
    // 4. OTOMATİK JS HATA YAKALAMA → Supabase error_logs
    // ============================================================
    window.onerror = function(message, source, lineno, colno, error) {
        var payload = {
            error_type: 'JS_ERROR',
            message: message || 'Unknown error',
            stack_trace: error && error.stack ? error.stack.substring(0, 2000) : '',
            url: source || window.location.href,
            user_id: window.currentUserId || null
        };

        try {
            fetch(SUPABASE_URL + '/rest/v1/error_logs', {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload)
            });
        } catch (e) { /* sessizce geç */ }
    };

    window.addEventListener('unhandledrejection', function(event) {
        var reason = event.reason || {};
        var payload = {
            error_type: 'PROMISE_REJECTION',
            message: reason.message || String(reason).substring(0, 500),
            stack_trace: reason.stack ? reason.stack.substring(0, 2000) : '',
            url: window.location.href,
            user_id: window.currentUserId || null
        };

        try {
            fetch(SUPABASE_URL + '/rest/v1/error_logs', {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload)
            });
        } catch (e) { /* sessizce geç */ }
    });

    // ============================================================
    // INIT
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createBugButton();
            createBugModal();
        });
    } else {
        createBugButton();
        createBugModal();
    }

})();// ==============================================================
// BUGTRACKER.JS — ADEULL AI ONARIM AGENT (Frontend)
// Premium minimal tasarım — ADEULL estetiği
// Supabase'e yazar → N8N workflow mail atar
// İleriye dönük: canlı destek, ekran görüntüsü, kategori
// ==============================================================

(function() {
    'use strict';

    var SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';
    var SUPABASE_KEY = 'sb_publishable_4WYCqs4gxci5eQoOeysLWQ_5cqkdWaA';

    // ============================================================
    // DİL DESTEĞİ
    // ============================================================
    var bugLang = {
        'EN': { title: 'REPORT ISSUE', subtitle: 'Help us improve your experience.', email: 'EMAIL (OPTIONAL)', desc: 'DESCRIBE THE ISSUE...', category: 'CATEGORY', catBug: 'BUG', catUI: 'UI/UX', catPerf: 'PERFORMANCE', catOther: 'OTHER', submit: 'SUBMIT', sending: 'SENDING...', success: 'RECEIVED', successSub: 'We will resolve this shortly.', error: 'FAILED — RETRY' },
        'TR': { title: 'SORUN BİLDİR', subtitle: 'Deneyiminizi geliştirmemize yardımcı olun.', email: 'E-POSTA (OPSİYONEL)', desc: 'SORUNU AÇIKLAYIN...', category: 'KATEGORİ', catBug: 'HATA', catUI: 'ARAYÜZ', catPerf: 'PERFORMANS', catOther: 'DİĞER', submit: 'GÖNDER', sending: 'GÖNDERİLİYOR...', error: 'BAŞARISIZ — TEKRAR DENEYİN', success: 'ALINDI', successSub: 'En kısa sürede çözeceğiz.' },
        'ES': { title: 'REPORTAR PROBLEMA', subtitle: 'Ayúdanos a mejorar.', email: 'EMAIL (OPCIONAL)', desc: 'DESCRIBE EL PROBLEMA...', category: 'CATEGORÍA', catBug: 'ERROR', catUI: 'UI/UX', catPerf: 'RENDIMIENTO', catOther: 'OTRO', submit: 'ENVIAR', sending: 'ENVIANDO...', error: 'FALLIDO — REINTENTAR', success: 'RECIBIDO', successSub: 'Lo resolveremos pronto.' },
        'DE': { title: 'PROBLEM MELDEN', subtitle: 'Helfen Sie uns, Ihre Erfahrung zu verbessern.', email: 'E-MAIL (OPTIONAL)', desc: 'PROBLEM BESCHREIBEN...', category: 'KATEGORIE', catBug: 'FEHLER', catUI: 'UI/UX', catPerf: 'LEISTUNG', catOther: 'ANDERE', submit: 'SENDEN', sending: 'WIRD GESENDET...', error: 'FEHLGESCHLAGEN', success: 'ERHALTEN', successSub: 'Wir werden das bald beheben.' },
        'FR': { title: 'SIGNALER UN PROBLÈME', subtitle: 'Aidez-nous à améliorer votre expérience.', email: 'EMAIL (OPTIONNEL)', desc: 'DÉCRIVEZ LE PROBLÈME...', category: 'CATÉGORIE', catBug: 'BUG', catUI: 'UI/UX', catPerf: 'PERFORMANCE', catOther: 'AUTRE', submit: 'ENVOYER', sending: 'ENVOI...', error: 'ÉCHEC — RÉESSAYER', success: 'REÇU', successSub: 'Nous allons résoudre cela rapidement.' },
        'PT': { title: 'RELATAR PROBLEMA', subtitle: 'Ajude-nos a melhorar.', email: 'EMAIL (OPCIONAL)', desc: 'DESCREVA O PROBLEMA...', category: 'CATEGORIA', catBug: 'BUG', catUI: 'UI/UX', catPerf: 'DESEMPENHO', catOther: 'OUTRO', submit: 'ENVIAR', sending: 'ENVIANDO...', error: 'FALHOU — TENTAR NOVAMENTE', success: 'RECEBIDO', successSub: 'Resolveremos em breve.' },
        'ID': { title: 'LAPORKAN MASALAH', subtitle: 'Bantu kami meningkatkan pengalaman Anda.', email: 'EMAIL (OPSIONAL)', desc: 'JELASKAN MASALAHNYA...', category: 'KATEGORI', catBug: 'BUG', catUI: 'UI/UX', catPerf: 'PERFORMA', catOther: 'LAINNYA', submit: 'KIRIM', sending: 'MENGIRIM...', error: 'GAGAL — COBA LAGI', success: 'DITERIMA', successSub: 'Kami akan segera menyelesaikannya.' },
        'HI': { title: 'समस्या रिपोर्ट करें', subtitle: 'हमें बेहतर बनाने में मदद करें।', email: 'ईमेल (वैकल्पिक)', desc: 'समस्या का वर्णन करें...', category: 'श्रेणी', catBug: 'बग', catUI: 'UI/UX', catPerf: 'प्रदर्शन', catOther: 'अन्य', submit: 'भेजें', sending: 'भेज रहे हैं...', error: 'विफल — पुनः प्रयास करें', success: 'प्राप्त', successSub: 'हम इसे जल्द ही हल करेंगे।' },
        'AR': { title: 'الإبلاغ عن مشكلة', subtitle: 'ساعدنا في تحسين تجربتك.', email: 'البريد الإلكتروني (اختياري)', desc: 'صف المشكلة...', category: 'الفئة', catBug: 'خطأ', catUI: 'واجهة', catPerf: 'أداء', catOther: 'أخرى', submit: 'إرسال', sending: '...جاري الإرسال', error: 'فشل — إعادة المحاولة', success: 'تم الاستلام', successSub: 'سنقوم بحل هذا قريباً.' },
        'IT': { title: 'SEGNALA PROBLEMA', subtitle: 'Aiutaci a migliorare la tua esperienza.', email: 'EMAIL (OPZIONALE)', desc: 'DESCRIVI IL PROBLEMA...', category: 'CATEGORIA', catBug: 'BUG', catUI: 'UI/UX', catPerf: 'PRESTAZIONI', catOther: 'ALTRO', submit: 'INVIA', sending: 'INVIO...', error: 'FALLITO — RIPROVA', success: 'RICEVUTO', successSub: 'Lo risolveremo a breve.' }
    };

    function getBugLang() {
        var el = document.getElementById('activeCode');
        var code = el ? el.innerText.trim() : 'EN';
        return bugLang[code] || bugLang['EN'];
    }

    // ============================================================
    // SVG İKONLAR (emoji yerine)
    // ============================================================
    var ICON_REPORT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4m0 4h.01M3.6 20h16.8c1 0 1.6-.8 1.2-1.6l-8.4-14.8c-.4-.8-1.6-.8-2 0L2.4 18.4c-.4.8.2 1.6 1.2 1.6z"/></svg>';
    var ICON_CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    var ICON_CLOSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    // ============================================================
    // 1. FLOATING REPORT BUTONU — minimal, site uyumlu
    // ============================================================
    function createBugButton() {
        var btn = document.createElement('div');
        btn.id = 'bugReportBtn';
        btn.innerHTML = ICON_REPORT;
        btn.style.cssText = 'position:fixed;bottom:40px;left:16px;z-index:9999;width:36px;height:36px;' +
            'background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:10px;' +
            'display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,0.25);' +
            'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:all 0.3s ease;';
        btn.onmouseenter = function() {
            btn.style.opacity = '1';
            btn.style.color = 'rgba(255,255,255,0.7)';
            btn.style.borderColor = 'rgba(255,255,255,0.2)';
            btn.style.background = 'rgba(0,0,0,0.6)';
        };
        btn.onmouseleave = function() {
            btn.style.color = 'rgba(255,255,255,0.25)';
            btn.style.borderColor = 'rgba(255,255,255,0.08)';
            btn.style.background = 'rgba(0,0,0,0.4)';
        };
        btn.onclick = function() { toggleBugModal(); };
        document.body.appendChild(btn);
    }

    // ============================================================
    // 2. REPORT MODAL — glass-panel, ADEULL estetiği
    // ============================================================
    function createBugModal() {
        var modal = document.createElement('div');
        modal.id = 'bugReportModal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.8);' +
            'display:none;align-items:center;justify-content:center;padding:16px;' +
            'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transition:opacity 0.3s ease;opacity:0;';

        modal.innerHTML = buildModalHTML();
        document.body.appendChild(modal);
    }

    function buildModalHTML() {
        var L = getBugLang();
        return '<div style="width:100%;max-width:380px;background:rgba(10,10,10,0.95);' +
            'border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px 24px;' +
            'position:relative;box-shadow:0 30px 60px rgba(0,0,0,0.6);">' +

            // Close button
            '<button onclick="closeBugModal()" style="position:absolute;top:14px;right:14px;background:none;' +
            'border:none;color:rgba(255,255,255,0.25);cursor:pointer;padding:4px;transition:color 0.2s;" ' +
            'onmouseenter="this.style.color=\'rgba(255,255,255,0.7)\'" onmouseleave="this.style.color=\'rgba(255,255,255,0.25)\'">' +
            ICON_CLOSE + '</button>' +

            // Header
            '<div style="text-align:center;margin-bottom:20px;">' +
            '<h3 style="font-size:12px;font-weight:700;letter-spacing:0.3em;color:rgba(255,255,255,0.8);' +
            'text-transform:uppercase;margin:0 0 4px;">' + L.title + '</h3>' +
            '<p style="font-size:8px;letter-spacing:0.15em;color:rgba(255,255,255,0.2);margin:0;">' + L.subtitle + '</p>' +
            '</div>' +

            // Form
            '<div id="bugFormArea">' +

            // Category selector
            '<div style="display:flex;gap:4px;margin-bottom:12px;">' +
            '<button onclick="selectBugCategory(this,\'BUG\')" class="bugCatBtn" data-cat="BUG" style="' + catBtnStyle(true) + '">' + L.catBug + '</button>' +
            '<button onclick="selectBugCategory(this,\'UI\')" class="bugCatBtn" data-cat="UI" style="' + catBtnStyle(false) + '">' + L.catUI + '</button>' +
            '<button onclick="selectBugCategory(this,\'PERF\')" class="bugCatBtn" data-cat="PERF" style="' + catBtnStyle(false) + '">' + L.catPerf + '</button>' +
            '<button onclick="selectBugCategory(this,\'OTHER\')" class="bugCatBtn" data-cat="OTHER" style="' + catBtnStyle(false) + '">' + L.catOther + '</button>' +
            '</div>' +

            // Email
            '<input type="email" id="bugEmail" placeholder="' + L.email + '" ' +
            'style="width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);' +
            'border-radius:10px;padding:11px 14px;color:rgba(255,255,255,0.8);outline:none;font-size:10px;' +
            'letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;box-sizing:border-box;' +
            'transition:border-color 0.2s;font-family:inherit;" ' +
            'onfocus="this.style.borderColor=\'rgba(255,255,255,0.15)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.06)\'">' +

            // Description
            '<textarea id="bugDescription" placeholder="' + L.desc + '" ' +
            'style="width:100%;height:80px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);' +
            'border-radius:10px;padding:11px 14px;color:rgba(255,255,255,0.8);outline:none;font-size:10px;' +
            'letter-spacing:0.05em;text-transform:uppercase;resize:none;margin-bottom:12px;box-sizing:border-box;' +
            'line-height:1.6;transition:border-color 0.2s;font-family:inherit;" ' +
            'onfocus="this.style.borderColor=\'rgba(255,255,255,0.15)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.06)\'"></textarea>' +

            // Submit
            '<button onclick="submitBugReport()" id="bugSubmitBtn" style="width:100%;background:rgba(255,255,255,0.08);' +
            'color:rgba(255,255,255,0.7);font-weight:700;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;' +
            'padding:12px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;cursor:pointer;' +
            'transition:all 0.2s;font-family:inherit;" ' +
            'onmouseenter="this.style.background=\'rgba(255,255,255,0.15)\';this.style.color=\'#fff\'" ' +
            'onmouseleave="this.style.background=\'rgba(255,255,255,0.08)\';this.style.color=\'rgba(255,255,255,0.7)\'">' +
            L.submit + '</button>' +

            '</div>' +

            // Success message
            '<div id="bugSuccessMsg" style="display:none;text-align:center;padding:20px 0;">' +
            '<div style="color:rgba(255,255,255,0.5);margin-bottom:10px;display:flex;justify-content:center;">' + ICON_CHECK + '</div>' +
            '<p style="font-size:10px;font-weight:700;letter-spacing:0.3em;color:rgba(255,255,255,0.6);text-transform:uppercase;margin:0 0 4px;">' + L.success + '</p>' +
            '<p style="font-size:8px;letter-spacing:0.1em;color:rgba(255,255,255,0.25);margin:0;">' + L.successSub + '</p>' +
            '</div>' +

            '</div>';
    }

    function catBtnStyle(active) {
        if (active) {
            return 'flex:1;padding:8px 4px;border-radius:8px;font-size:8px;font-weight:700;letter-spacing:0.15em;' +
                'text-transform:uppercase;cursor:pointer;transition:all 0.2s;border:1px solid rgba(255,255,255,0.2);' +
                'background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8);font-family:inherit;text-align:center;';
        }
        return 'flex:1;padding:8px 4px;border-radius:8px;font-size:8px;font-weight:700;letter-spacing:0.15em;' +
            'text-transform:uppercase;cursor:pointer;transition:all 0.2s;border:1px solid rgba(255,255,255,0.05);' +
            'background:transparent;color:rgba(255,255,255,0.25);font-family:inherit;text-align:center;';
    }

    window._bugCategory = 'BUG';

    window.selectBugCategory = function(el, cat) {
        window._bugCategory = cat;
        var btns = document.querySelectorAll('.bugCatBtn');
        for (var i = 0; i < btns.length; i++) {
            if (btns[i].getAttribute('data-cat') === cat) {
                btns[i].style.cssText = catBtnStyle(true);
            } else {
                btns[i].style.cssText = catBtnStyle(false);
            }
        }
    };

    // ============================================================
    // MODAL TOGGLE — fade animasyonu
    // ============================================================
    window.toggleBugModal = function() {
        var modal = document.getElementById('bugReportModal');
        if (!modal) return;
        if (modal.style.display === 'flex') {
            closeBugModal();
        } else {
            // Dili güncelle
            modal.querySelector('div').outerHTML = buildModalHTML().match(/<div[\s\S]*<\/div>/)[0];
            modal.innerHTML = buildModalHTML();
            modal.style.display = 'flex';
            modal.style.opacity = '0';
            setTimeout(function() { modal.style.opacity = '1'; }, 20);
            window._bugCategory = 'BUG';
            var desc = document.getElementById('bugDescription');
            if (desc) setTimeout(function() { desc.focus(); }, 100);
        }
    };

    window.closeBugModal = function() {
        var modal = document.getElementById('bugReportModal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(function() { modal.style.display = 'none'; }, 300);
        }
    };

    // ============================================================
    // HATA BİLDİRİMİ GÖNDER → Supabase
    // ============================================================
    window.submitBugReport = async function() {
        var desc = (document.getElementById('bugDescription') || {}).value || '';
        var email = (document.getElementById('bugEmail') || {}).value || '';
        var L = getBugLang();

        if (!desc.trim()) {
            var el = document.getElementById('bugDescription');
            if (el) {
                el.style.borderColor = 'rgba(255,100,100,0.4)';
                setTimeout(function() { el.style.borderColor = 'rgba(255,255,255,0.06)'; }, 2000);
            }
            return;
        }

        var btn = document.getElementById('bugSubmitBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerText = L.sending;
            btn.style.opacity = '0.5';
        }

        // Ekran görüntüsü yakalama (html2canvas varsa)
        var screenshotUrl = null;
        /* İleriye dönük — aktif edilecek
        try {
            if (typeof html2canvas === 'function') {
                var canvas = await html2canvas(document.body, { scale: 0.5, useCORS: true, logging: false });
                screenshotUrl = canvas.toDataURL('image/jpeg', 0.5);
            }
        } catch(e) {}
        */

        var payload = {
            user_email: email || null,
            page: window.location.pathname + window.location.hash,
            description: '[' + (window._bugCategory || 'BUG') + '] ' + desc,
            screenshot_url: screenshotUrl,
            browser_info: navigator.userAgent,
            status: 'OPEN',
            priority: window._bugCategory === 'BUG' ? 'HIGH' : 'NORMAL'
        };

        try {
            var response = await fetch(SUPABASE_URL + '/rest/v1/bug_reports', {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                var formArea = document.getElementById('bugFormArea');
                if (formArea) formArea.style.display = 'none';
                var successMsg = document.getElementById('bugSuccessMsg');
                if (successMsg) successMsg.style.display = 'block';
                setTimeout(function() { closeBugModal(); }, 2500);
            } else {
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = L.error;
                    btn.style.opacity = '1';
                    btn.style.borderColor = 'rgba(255,100,100,0.3)';
                }
            }
        } catch (e) {
            console.error('Bug report error:', e);
            if (btn) {
                btn.disabled = false;
                btn.innerText = L.error;
                btn.style.opacity = '1';
            }
        }
    };

    // ============================================================
    // OTOMATİK JS HATA YAKALAMA → Supabase error_logs
    // ============================================================
    window.onerror = function(message, source, lineno, colno, error) {
        var payload = {
            error_type: 'JS_ERROR',
            message: message || 'Unknown error',
            stack_trace: error && error.stack ? error.stack.substring(0, 2000) : '',
            url: source || window.location.href,
            user_id: window.currentUserId || null
        };
        try {
            fetch(SUPABASE_URL + '/rest/v1/error_logs', {
                method: 'POST',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify(payload)
            });
        } catch (e) {}
    };

    window.addEventListener('unhandledrejection', function(event) {
        var reason = event.reason || {};
        var payload = {
            error_type: 'PROMISE_REJECTION',
            message: reason.message || String(reason).substring(0, 500),
            stack_trace: reason.stack ? reason.stack.substring(0, 2000) : '',
            url: window.location.href,
            user_id: window.currentUserId || null
        };
        try {
            fetch(SUPABASE_URL + '/rest/v1/error_logs', {
                method: 'POST',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify(payload)
            });
        } catch (e) {}
    });

    // ============================================================
    // İLERİYE DÖNÜK: CANLI DESTEK CHAT ALTYAPISI
    // Şimdilik devre dışı — aktif edildiğinde Supabase realtime
    // veya websocket ile çalışacak
    // ============================================================
    /*
    window.openLiveChat = function() {
        // TODO: Supabase realtime subscription
        // TODO: Chat UI (glass-panel, ADEULL estetiği)
        // TODO: Agent tarafı N8N + Claude API
    };
    */

    // ============================================================
    // ESC ile kapatma
    // ============================================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var modal = document.getElementById('bugReportModal');
            if (modal && modal.style.display === 'flex') {
                closeBugModal();
                e.stopPropagation();
            }
        }
    });

    // ============================================================
    // INIT
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createBugButton();
            createBugModal();
        });
    } else {
        createBugButton();
        createBugModal();
    }

})();