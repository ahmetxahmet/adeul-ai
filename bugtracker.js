// ==============================================================
// BUGTRACKER.JS — ADEULL AI ONARIM AGENT (Frontend)
// Premium minimal tasarım — ADEULL estetiği
// Writes to Supabase -> Core Engine sends email
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
        'EN': { title: 'REPORT ISSUE', subtitle: 'Help us improve your experience.', email: 'EMAIL (OPTIONAL)', desc: 'DESCRIBE THE ISSUE...', category: 'CATEGORY', catBug: 'BUG', catUI: 'UI/UX', catPerf: 'PERFORMANCE', catOther: 'OTHER', submit: 'SUBMIT', sending: 'SENDING...', success: 'RECEIVED', successSub: 'We will resolve this shortly.', error: 'FAILED — RETRY', btnLabel: 'REPORT' },
        'TR': { title: 'SORUN BİLDİR', subtitle: 'Deneyiminizi geliştirmemize yardımcı olun.', email: 'E-POSTA (OPSİYONEL)', desc: 'SORUNU AÇIKLAYIN...', category: 'KATEGORİ', catBug: 'HATA', catUI: 'ARAYÜZ', catPerf: 'PERFORMANS', catOther: 'DİĞER', submit: 'GÖNDER', sending: 'GÖNDERİLİYOR...', error: 'BAŞARISIZ — TEKRAR DENEYİN', success: 'ALINDI', successSub: 'En kısa sürede çözeceğiz.', btnLabel: 'BİLDİR' },
        'ES': { title: 'REPORTAR PROBLEMA', subtitle: 'Ayúdanos a mejorar.', email: 'EMAIL (OPCIONAL)', desc: 'DESCRIBE EL PROBLEMA...', category: 'CATEGORÍA', catBug: 'ERROR', catUI: 'UI/UX', catPerf: 'RENDIMIENTO', catOther: 'OTRO', submit: 'ENVIAR', sending: 'ENVIANDO...', error: 'FALLIDO — REINTENTAR', success: 'RECIBIDO', successSub: 'Lo resolveremos pronto.', btnLabel: 'REPORTAR' },
        'DE': { title: 'PROBLEM MELDEN', subtitle: 'Helfen Sie uns, Ihre Erfahrung zu verbessern.', email: 'E-MAIL (OPTIONAL)', desc: 'PROBLEM BESCHREIBEN...', category: 'KATEGORIE', catBug: 'FEHLER', catUI: 'UI/UX', catPerf: 'LEISTUNG', catOther: 'ANDERE', submit: 'SENDEN', sending: 'WIRD GESENDET...', error: 'FEHLGESCHLAGEN', success: 'ERHALTEN', successSub: 'Wir werden das bald beheben.', btnLabel: 'MELDEN' },
        'FR': { title: 'SIGNALER UN PROBLÈME', subtitle: 'Aidez-nous à améliorer votre expérience.', email: 'EMAIL (OPTIONNEL)', desc: 'DÉCRIVEZ LE PROBLÈME...', category: 'CATÉGORIE', catBug: 'BUG', catUI: 'UI/UX', catPerf: 'PERFORMANCE', catOther: 'AUTRE', submit: 'ENVOYER', sending: 'ENVOI...', error: 'ÉCHEC — RÉESSAYER', success: 'REÇU', successSub: 'Nous allons résoudre cela rapidement.', btnLabel: 'SIGNALER' },
        'PT': { title: 'RELATAR PROBLEMA', subtitle: 'Ajude-nos a melhorar.', email: 'EMAIL (OPCIONAL)', desc: 'DESCREVA O PROBLEMA...', category: 'CATEGORIA', catBug: 'BUG', catUI: 'UI/UX', catPerf: 'DESEMPENHO', catOther: 'OUTRO', submit: 'ENVIAR', sending: 'ENVIANDO...', error: 'FALHOU — TENTAR NOVAMENTE', success: 'RECEBIDO', successSub: 'Resolveremos em breve.', btnLabel: 'RELATAR' },
        'ID': { title: 'LAPORKAN MASALAH', subtitle: 'Bantu kami meningkatkan pengalaman Anda.', email: 'EMAIL (OPSIONAL)', desc: 'JELASKAN MASALAHNYA...', category: 'KATEGORI', catBug: 'BUG', catUI: 'UI/UX', catPerf: 'PERFORMA', catOther: 'LAINNYA', submit: 'KIRIM', sending: 'MENGIRIM...', error: 'GAGAL — COBA LAGI', success: 'DITERIMA', successSub: 'Kami akan segera menyelesaikannya.', btnLabel: 'LAPOR' },
        'HI': { title: 'समस्या रिपोर्ट करें', subtitle: 'हमें बेहतर बनाने में मदद करें।', email: 'ईमेल (वैकल्पिक)', desc: 'समस्या का वर्णन करें...', category: 'श्रेणी', catBug: 'बग', catUI: 'UI/UX', catPerf: 'प्रदर्शन', catOther: 'अन्य', submit: 'भेजें', sending: 'भेज रहे हैं...', error: 'विफल — पुनः प्रयास करें', success: 'प्राप्त', successSub: 'हम इसे जल्द ही हल करेंगे।', btnLabel: 'रिपोर्ट' },
        'AR': { title: 'الإبلاغ عن مشكلة', subtitle: 'ساعدنا في تحسين تجربتك.', email: 'البريد الإلكتروني (اختياري)', desc: 'صف المشكلة...', category: 'الفئة', catBug: 'خطأ', catUI: 'واجهة', catPerf: 'أداء', catOther: 'أخرى', submit: 'إرسال', sending: '...جاري الإرسال', error: 'فشل — إعادة المحاولة', success: 'تم الاستلام', successSub: 'سنقوم بحل هذا قريباً.', btnLabel: 'إبلاغ' },
        'IT': { title: 'SEGNALA PROBLEMA', subtitle: 'Aiutaci a migliorare la tua esperienza.', email: 'EMAIL (OPZIONALE)', desc: 'DESCRIVI IL PROBLEMA...', category: 'CATEGORIA', catBug: 'BUG', catUI: 'UI/UX', catPerf: 'PRESTAZIONI', catOther: 'ALTRO', submit: 'INVIA', sending: 'INVIO...', error: 'FALLITO — RIPROVA', success: 'RICEVUTO', successSub: 'Lo risolveremo a breve.', btnLabel: 'SEGNALA' }
    };

    function getBugLang() {
        var el = document.getElementById('activeCode');
        var code = el ? el.innerText.trim() : 'EN';
        return bugLang[code] || bugLang['EN'];
    }

    // ============================================================
    // SVG İKONLAR
    // ============================================================
    var ICON_REPORT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    var ICON_CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    var ICON_CLOSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    // ============================================================
    // 1. FLOATING REPORT BUTONU — ikon + metin, site uyumlu
    // ============================================================
    function createBugButton() {
        var L = getBugLang();
        var btn = document.createElement('div');
        btn.id = 'bugReportBtn';
        btn.innerHTML = ICON_REPORT + '<span style="font-size:8px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-left:6px;">' + L.btnLabel + '</span>';
        btn.style.cssText = 'position:fixed;bottom:40px;left:16px;z-index:9999;height:32px;padding:0 12px;' +
            'background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:8px;' +
            'display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,0.2);' +
            'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:all 0.3s ease;font-family:inherit;';
        btn.onmouseenter = function() {
            btn.style.color = 'rgba(255,255,255,0.6)';
            btn.style.borderColor = 'rgba(255,255,255,0.15)';
            btn.style.background = 'rgba(0,0,0,0.6)';
        };
        btn.onmouseleave = function() {
            btn.style.color = 'rgba(255,255,255,0.2)';
            btn.style.borderColor = 'rgba(255,255,255,0.08)';
            btn.style.background = 'rgba(0,0,0,0.4)';
        };
        btn.onclick = function() { toggleBugModal(); };
        document.body.appendChild(btn);
    }

    // ============================================================
    // OYUN MODÜLÜ (ISOLATED IFRAME)
    // ============================================================
    function createGameButton() {
        var btn = document.createElement('div');
        btn.id = 'gameLaunchBtn';
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line></svg>' +
            '<span style="font-size:8px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-left:8px;">GAME</span>';
        btn.style.cssText = 'position:fixed;bottom:80px;left:16px;z-index:9999;height:32px;padding:0 12px;' +
            'background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:8px;' +
            'display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,0.2);' +
            'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:all 0.3s ease;font-family:inherit;';
        btn.onmouseenter = function() {
            btn.style.color = 'rgba(255,255,255,0.8)';
            btn.style.borderColor = 'rgba(255,255,255,0.2)';
            btn.style.background = 'rgba(0,0,0,0.6)';
        };
        btn.onmouseleave = function() {
            btn.style.color = 'rgba(255,255,255,0.2)';
            btn.style.borderColor = 'rgba(255,255,255,0.08)';
            btn.style.background = 'rgba(0,0,0,0.4)';
        };
        btn.onclick = function() { toggleGameModal(); };
        document.body.appendChild(btn);
    }

    window.toggleGameSize = function() {
        var gm = document.getElementById('gameModalWindow');
        if(!gm) return;
        if (gm.style.width === '100%') {
            gm.style.width = '420px'; gm.style.height = '600px';
            gm.style.bottom = '40px'; gm.style.right = '40px';
            gm.style.borderRadius = '16px';
        } else {
            gm.style.width = '100%'; gm.style.height = '100%';
            gm.style.bottom = '0'; gm.style.right = '0';
            gm.style.borderRadius = '0';
        }
    };

    window.toggleGameModal = function() {
        var modal = document.getElementById('gameModalWindow');
        if (modal) {
            modal.remove(); // Ram temizlensin diye tamamen yok ediyoruz
        } else {
            modal = document.createElement('div');
            modal.id = 'gameModalWindow';
            modal.style.cssText = 'position:fixed;bottom:40px;right:40px;width:420px;height:600px;z-index:10000;background:rgba(10,10,10,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);display:flex;flex-direction:column;transition:all 0.3s ease;';
            modal.innerHTML = '<div style="height:36px;background:rgba(0,0,0,0.5);display:flex;justify-content:space-between;align-items:center;padding:0 12px;border-bottom:1px solid rgba(255,255,255,0.05);">' +
                '<span style="color:rgba(255,255,255,0.5);font-size:9px;letter-spacing:0.2em;font-weight:bold;">ADEULL MINI GAME</span>' +
                '<div style="display:flex;gap:12px;"><button onclick="toggleGameSize()" style="color:rgba(255,255,255,0.5);background:none;border:none;cursor:pointer;font-size:12px;">[ ]</button>' +
                '<button onclick="toggleGameModal()" style="color:rgba(255,255,255,0.5);background:none;border:none;cursor:pointer;font-size:12px;">✕</button></div></div>' +
                '<iframe src="game.html" style="width:100%;height:calc(100% - 36px);border:none;"></iframe>';
            document.body.appendChild(modal);
        }
    };

    // ============================================================
    // 3. SOCIAL LINKS (LEFT SIDEBAR)
    // ============================================================
    function createSocialButtons() {
        var container = document.createElement('div');
        container.id = 'adeullSocialLinks';
        container.style.cssText = 'position:fixed;bottom:130px;left:24px;z-index:9999;display:flex;flex-direction:column;gap:16px;align-items:center;';
        
        var instagram = '<a href="https://www.instagram.com/adeullai/" target="_blank" style="color:rgba(255,255,255,0.4);transition:all 0.3s;display:block;" onmouseenter="this.style.color=\'#fff\';this.style.transform=\'scale(1.2)\'" onmouseleave="this.style.color=\'rgba(255,255,255,0.4)\';this.style.transform=\'scale(1)\'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>';
        var linkedin = '<a href="https://www.linkedin.com/company/adeull/" target="_blank" style="color:rgba(255,255,255,0.4);transition:all 0.3s;display:block;" onmouseenter="this.style.color=\'#fff\';this.style.transform=\'scale(1.2)\'" onmouseleave="this.style.color=\'rgba(255,255,255,0.4)\';this.style.transform=\'scale(1)\'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>';
        var youtube = '<a href="https://www.youtube.com/@adeull" target="_blank" style="color:rgba(255,255,255,0.4);transition:all 0.3s;display:block;" onmouseenter="this.style.color=\'#fff\';this.style.transform=\'scale(1.2)\'" onmouseleave="this.style.color=\'rgba(255,255,255,0.4)\';this.style.transform=\'scale(1)\'"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>';
        
        container.innerHTML = youtube + linkedin + instagram;
        document.body.appendChild(container);
    }

    // ============================================================
    // 4. REPORT MODAL — glass-panel, ADEULL estetiği
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
            '<button onclick="closeBugModal()" style="position:absolute;top:14px;right:14px;background:none;' +
            'border:none;color:rgba(255,255,255,0.25);cursor:pointer;padding:4px;transition:color 0.2s;" ' +
            'onmouseenter="this.style.color=\'rgba(255,255,255,0.7)\'" onmouseleave="this.style.color=\'rgba(255,255,255,0.25)\'">' +
            ICON_CLOSE + '</button>' +
            '<div style="text-align:center;margin-bottom:20px;">' +
            '<h3 style="font-size:12px;font-weight:700;letter-spacing:0.3em;color:rgba(255,255,255,0.8);' +
            'text-transform:uppercase;margin:0 0 4px;">' + L.title + '</h3>' +
            '<p style="font-size:8px;letter-spacing:0.15em;color:rgba(255,255,255,0.2);margin:0;">' + L.subtitle + '</p>' +
            '</div>' +
            '<div id="bugFormArea">' +
            '<div style="display:flex;gap:4px;margin-bottom:12px;">' +
            '<button onclick="selectBugCategory(this,\'BUG\')" class="bugCatBtn" data-cat="BUG" style="' + catBtnStyle(true) + '">' + L.catBug + '</button>' +
            '<button onclick="selectBugCategory(this,\'UI\')" class="bugCatBtn" data-cat="UI" style="' + catBtnStyle(false) + '">' + L.catUI + '</button>' +
            '<button onclick="selectBugCategory(this,\'PERF\')" class="bugCatBtn" data-cat="PERF" style="' + catBtnStyle(false) + '">' + L.catPerf + '</button>' +
            '<button onclick="selectBugCategory(this,\'OTHER\')" class="bugCatBtn" data-cat="OTHER" style="' + catBtnStyle(false) + '">' + L.catOther + '</button>' +
            '</div>' +
            '<input type="email" id="bugEmail" placeholder="' + L.email + '" ' +
            'style="width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);' +
            'border-radius:10px;padding:11px 14px;color:rgba(255,255,255,0.8);outline:none;font-size:10px;' +
            'letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;box-sizing:border-box;' +
            'transition:border-color 0.2s;font-family:inherit;" ' +
            'onfocus="this.style.borderColor=\'rgba(255,255,255,0.15)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.06)\'">' +
            '<textarea id="bugDescription" placeholder="' + L.desc + '" ' +
            'style="width:100%;height:80px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);' +
            'border-radius:10px;padding:11px 14px;color:rgba(255,255,255,0.8);outline:none;font-size:10px;' +
            'letter-spacing:0.05em;text-transform:uppercase;resize:none;margin-bottom:12px;box-sizing:border-box;' +
            'line-height:1.6;transition:border-color 0.2s;font-family:inherit;" ' +
            'onfocus="this.style.borderColor=\'rgba(255,255,255,0.15)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.06)\'"></textarea>' +
            '<button onclick="submitBugReport()" id="bugSubmitBtn" style="width:100%;background:rgba(255,255,255,0.08);' +
            'color:rgba(255,255,255,0.7);font-weight:700;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;' +
            'padding:12px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;cursor:pointer;' +
            'transition:all 0.2s;font-family:inherit;" ' +
            'onmouseenter="this.style.background=\'rgba(255,255,255,0.15)\';this.style.color=\'#fff\'" ' +
            'onmouseleave="this.style.background=\'rgba(255,255,255,0.08)\';this.style.color=\'rgba(255,255,255,0.7)\'">' +
            L.submit + '</button>' +
            '</div>' +
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
            btns[i].style.cssText = catBtnStyle(btns[i].getAttribute('data-cat') === cat);
        }
    };

    // ============================================================
    // MODAL TOGGLE
    // ============================================================
    window.toggleBugModal = function() {
        var modal = document.getElementById('bugReportModal');
        if (!modal) return;
        if (modal.style.display === 'flex') {
            closeBugModal();
        } else {
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
        if (btn) { btn.disabled = true; btn.innerText = L.sending; btn.style.opacity = '0.5'; }

        var payload = {
            user_email: email || null,
            page: window.location.pathname + window.location.hash,
            description: '[' + (window._bugCategory || 'BUG') + '] ' + desc,
            screenshot_url: null,
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
                if (btn) { btn.disabled = false; btn.innerText = L.error; btn.style.opacity = '1'; }
            }
        } catch (e) {
            console.error('Bug report error:', e);
            if (btn) { btn.disabled = false; btn.innerText = L.error; btn.style.opacity = '1'; }
        }
    };

    // ============================================================
    // OTOMATİK JS HATA YAKALAMA → Supabase error_logs
    // ============================================================
    var _lastErrTime = 0;
    var _errCount = 0;
    function allowErrorLog() {
        var now = Date.now();
        if (now - _lastErrTime > 10000) { _errCount = 0; }
        if (_errCount > 5) return false;
        _lastErrTime = now; _errCount++; return true;
    }

    window.onerror = function(message, source, lineno, colno, error) {
        return; // WARNING: Automatic error catching disabled to prevent spam.
        if (!allowErrorLog()) return;
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
            }).catch(function(){});
        } catch (e) {}
    };

    window.addEventListener('unhandledrejection', function(event) {
        return; // WARNING: Automatic error catching disabled to prevent spam.
        if (!allowErrorLog()) return;
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
            }).catch(function(){});
        } catch (e) {}
    });

    // ============================================================
    // İLERİYE DÖNÜK: CANLI DESTEK CHAT ALTYAPISI
    // ============================================================
    /*
    window.openLiveChat = function() {
        // TODO: Supabase realtime subscription
        // TODO: Chat UI (glass-panel, ADEULL estetiği)
        // TODO: Agent side Core Engine + AI API
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
            createGameButton();
            createSocialButtons();
            createBugModal();
        });
    } else {
        createBugButton();
        createGameButton();
        createSocialButtons();
        createBugModal();
    }

})();