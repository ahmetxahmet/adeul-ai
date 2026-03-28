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

})();