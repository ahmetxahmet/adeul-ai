// ==============================================================
// DASHBOARD.JS — ADEULL AI DASHBOARD PAGES
// Menü sayfaları: BILLING, MY ACCOUNT, RENDERS, + coming soon
// Paddle entegrasyonu hazır (API key placeholder)
// ADEULL estetiği — glass-panel, siyah/beyaz, tracking-widest
// ==============================================================

(function() {
    'use strict';

    // ============================================================
    // PADDLE CONFIG — Buraya kendi key'lerini koy
    // ============================================================
    var PADDLE_VENDOR_ID = '307212';
    var PADDLE_ENV = 'sandbox'; // 'sandbox' veya 'production'

    // ============================================================
    // PLAN VERİLERİ — Fiyatları ve limitleri sen ayarlarsın
    // ============================================================
    var PLANS = [
        {
            id: 'student',
            name: 'STUDENT',
            monthlyPrice: 9,
            yearlyPrice: 96,
            renders: 50,
            renders8k: 5,
            weeklyLimit: 15,
            color: 'rgba(255,255,255,0.05)',
            accent: 'rgba(255,255,255,0.4)',
            paddleMonthlyId: 'pri_01kn4cpg0x5c7n5pc563qxw3vt',
            paddleYearlyId: 'pri_01kn4cv9natt70v5f967mgqxa7'
        },
        {
            id: 'standard',
            name: 'STANDARD',
            monthlyPrice: 19,
            yearlyPrice: 182,
            renders: 125,
            renders8k: 12,
            weeklyLimit: 50,
            color: 'rgba(255,255,255,0.05)',
            accent: 'rgba(255,255,255,0.5)',
            paddleMonthlyId: 'pri_01kn4cznqrrbkwma7jq7y0452j',
            paddleYearlyId: 'pri_01kn4d13fsaax40b64z0xq2j96'
        },
        {
            id: 'pro',
            name: 'PRO',
            monthlyPrice: 39,
            yearlyPrice: 374,
            renders: 300,
            renders8k: 30,
            weeklyLimit: 100,
            popular: true,
            color: 'rgba(255,255,255,0.08)',
            accent: '#fff',
            paddleMonthlyId: 'pri_01kn4d4ds1t2z46acc3ewdpw60',
            paddleYearlyId: 'pri_01kn4d5s0ghezbdaep0rmkzhf2'
        },
        {
            id: 'ultra',
            name: 'ULTRA',
            monthlyPrice: 69,
            yearlyPrice: 662,
            renders: 700,
            renders8k: 70,
            weeklyLimit: 250,
            color: 'rgba(255,255,255,0.05)',
            accent: 'rgba(255,255,255,0.5)',
            paddleMonthlyId: 'pri_01kn4dbethm4fc7m1y86xemwpm',
            paddleYearlyId: 'pri_01kn4dcf93676kk55ryp92cydk'
        },
        {
            id: 'vision',
            name: 'VISION',
            monthlyPrice: 129,
            yearlyPrice: 1238,
            renders: 2000,
            renders8k: 200,
            weeklyLimit: 800,
            color: 'rgba(255,255,255,0.05)',
            accent: 'rgba(255,255,255,0.4)',
            paddleMonthlyId: 'pri_01kn4dep97bz8y918f6h7c3asf',
            paddleYearlyId: 'pri_01kn4dg601ncy38gdaz9dny4dk'
        }
    ];

    // ============================================================
    // DİL DESTEĞİ
    // ============================================================
    var dashLang = {
        'EN': { billing: 'BILLING', myAccount: 'MY ACCOUNT', renders: 'RENDERS', monthly: 'MONTHLY', yearly: 'YEARLY', save: 'SAVE', perMonth: '/MO', perYear: '/YR', rendersLabel: 'RENDERS', renders8kLabel: '8K RENDERS', weeklyLabel: 'WEEKLY LIMIT', subscribe: 'SUBSCRIBE', currentPlan: 'CURRENT PLAN', comingSoon: 'COMING SOON', comingSoonSub: 'This feature is under development.', profile: 'PROFILE', email: 'EMAIL', plan: 'PLAN', memberSince: 'MEMBER SINCE', changePw: 'CHANGE PASSWORD', currentPw: 'CURRENT PASSWORD', newPw: 'NEW PASSWORD', confirmPw: 'CONFIRM PASSWORD', updateProfile: 'UPDATE PROFILE', yourRenders: 'YOUR RENDERS', noRenders: 'No renders yet. Start creating!', back: 'BACK' },
        'TR': { billing: 'FATURALANDIRMA', myAccount: 'HESABIM', renders: 'RENDERLAR', monthly: 'AYLIK', yearly: 'YILLIK', save: 'TASARRUF', perMonth: '/AY', perYear: '/YIL', rendersLabel: 'RENDER', renders8kLabel: '8K RENDER', weeklyLabel: 'HAFTALIK LİMİT', subscribe: 'ABONE OL', currentPlan: 'MEVCUT PLAN', comingSoon: 'YAKINDA', comingSoonSub: 'Bu özellik geliştirme aşamasında.', profile: 'PROFİL', email: 'E-POSTA', plan: 'PLAN', memberSince: 'ÜYELİK TARİHİ', changePw: 'ŞİFRE DEĞİŞTİR', currentPw: 'MEVCUT ŞİFRE', newPw: 'YENİ ŞİFRE', confirmPw: 'ŞİFRE TEKRAR', updateProfile: 'PROFİLİ GÜNCELLE', yourRenders: 'RENDERLARINIZ', noRenders: 'Henüz render yok. Oluşturmaya başlayın!', back: 'GERİ' }
    };

    function getDashLang() {
        var el = document.getElementById('activeCode');
        var code = el ? el.innerText.trim() : 'EN';
        return dashLang[code] || dashLang['EN'];
    }

    // ============================================================
    // PANEL CONTAINER — side panel içine sayfa render eder
    // ============================================================
    var _activeDashPage = null;

    function showDashPage(pageHTML, pageId) {
        _activeDashPage = pageId;
        var panel = document.getElementById('userSidePanel');
        if (!panel) return;

        var existing = document.getElementById('dashPageOverlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = 'dashPageOverlay';
        overlay.style.cssText = 'position:absolute;inset:0;z-index:110;background:rgba(0,0,0,0.95);' +
            'overflow-y:auto;padding:24px;display:flex;flex-direction:column;';
        overlay.innerHTML = pageHTML;
        panel.appendChild(overlay);
    }

    function closeDashPage() {
        _activeDashPage = null;
        var overlay = document.getElementById('dashPageOverlay');
        if (overlay) overlay.remove();
    }

    window.closeDashPage = closeDashPage;

    // ============================================================
    // BILLING SAYFASI
    // ============================================================
    window._billingYearly = false;

    window.toggleBillingPeriod = function(yearly) {
        window._billingYearly = yearly;
        showBillingPage();
    };

    window.showBillingPage = function() {
        var L = getDashLang();
        var isYearly = window._billingYearly;

        // Header
        var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
            '<button onclick="closeDashPage()" style="background:none;border:none;color:rgba(255,255,255,0.4);' +
            'font-size:9px;font-weight:700;letter-spacing:0.2em;cursor:pointer;text-transform:uppercase;' +
            'font-family:inherit;padding:6px 0;transition:color 0.2s;" onmouseenter="this.style.color=\'#fff\'" ' +
            'onmouseleave="this.style.color=\'rgba(255,255,255,0.4)\'">← ' + L.back + '</button>' +
            '<h2 style="font-size:14px;font-weight:700;letter-spacing:0.3em;color:rgba(255,255,255,0.8);' +
            'text-transform:uppercase;margin:0;">' + L.billing + '</h2>' +
            '<div style="width:50px;"></div></div>';

        // Monthly / Yearly toggle
        var mActive = !isYearly ? 'background:rgba(255,255,255,0.15);color:#fff;' : 'background:transparent;color:rgba(255,255,255,0.3);';
        var yActive = isYearly ? 'background:rgba(255,255,255,0.15);color:#fff;' : 'background:transparent;color:rgba(255,255,255,0.3);';

        html += '<div style="display:flex;justify-content:center;margin-bottom:20px;">' +
            '<div style="display:flex;gap:2px;background:rgba(255,255,255,0.05);border-radius:10px;padding:3px;' +
            'border:1px solid rgba(255,255,255,0.06);">' +
            '<button onclick="toggleBillingPeriod(false)" style="padding:8px 16px;border-radius:8px;font-size:8px;' +
            'font-weight:700;letter-spacing:0.2em;text-transform:uppercase;border:none;cursor:pointer;' +
            'transition:all 0.2s;font-family:inherit;' + mActive + '">' + L.monthly + '</button>' +
            '<button onclick="toggleBillingPeriod(true)" style="padding:8px 16px;border-radius:8px;font-size:8px;' +
            'font-weight:700;letter-spacing:0.2em;text-transform:uppercase;border:none;cursor:pointer;' +
            'transition:all 0.2s;font-family:inherit;' + yActive + '">' + L.yearly + ' <span style="font-size:7px;color:rgba(100,255,100,0.7);margin-left:4px;">−20%</span></button>' +
            '</div></div>';

        // Plan kartları
        for (var i = 0; i < PLANS.length; i++) {
            var p = PLANS[i];
            var price = isYearly ? p.yearlyPrice : p.monthlyPrice;
            var period = isYearly ? L.perYear : L.perMonth;
            var monthlySaving = isYearly ? Math.round(p.monthlyPrice * 12 - p.yearlyPrice) : 0;
            var isPopular = p.popular || false;

            var cardBorder = isPopular ? 'border:1px solid rgba(255,255,255,0.25);' : 'border:1px solid rgba(255,255,255,0.06);';
            var cardBg = isPopular ? 'background:rgba(255,255,255,0.08);' : 'background:rgba(255,255,255,0.02);';

            html += '<div style="' + cardBg + cardBorder + 'border-radius:14px;padding:16px;margin-bottom:10px;' +
                'transition:all 0.2s;position:relative;">';

            // Popular badge
            if (isPopular) {
                html += '<div style="position:absolute;top:-1px;right:16px;background:rgba(255,255,255,0.9);' +
                    'color:#000;font-size:6px;font-weight:800;letter-spacing:0.2em;padding:3px 10px;' +
                    'border-radius:0 0 6px 6px;text-transform:uppercase;">POPULAR</div>';
            }

            // Plan header
            html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">' +
                '<div>' +
                '<div style="font-size:12px;font-weight:700;letter-spacing:0.25em;color:' + p.accent + ';' +
                'text-transform:uppercase;">' + p.name + '</div>' +
                '</div>' +
                '<div style="text-align:right;">' +
                '<span style="font-size:22px;font-weight:300;color:#fff;letter-spacing:0.05em;">$' + price + '</span>' +
                '<span style="font-size:8px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;margin-left:2px;">' + period + '</span>';

            if (isYearly && monthlySaving > 0) {
                html += '<div style="font-size:7px;color:rgba(100,255,100,0.6);letter-spacing:0.1em;margin-top:2px;">' +
                    L.save + ' $' + monthlySaving + '</div>';
            }

            html += '</div></div>';

            // Features
            html += '<div style="display:flex;gap:12px;margin-bottom:12px;">' +
                '<div style="flex:1;text-align:center;padding:8px 0;background:rgba(255,255,255,0.03);border-radius:8px;">' +
                '<div style="font-size:14px;font-weight:700;color:rgba(255,255,255,0.8);">' + p.renders + '</div>' +
                '<div style="font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">' + L.rendersLabel + '</div>' +
                '</div>' +
                '<div style="flex:1;text-align:center;padding:8px 0;background:rgba(255,255,255,0.03);border-radius:8px;">' +
                '<div style="font-size:14px;font-weight:700;color:rgba(255,255,255,0.8);">' + p.renders8k + '</div>' +
                '<div style="font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">' + L.renders8kLabel + '</div>' +
                '</div>' +
                '<div style="flex:1;text-align:center;padding:8px 0;background:rgba(255,255,255,0.03);border-radius:8px;">' +
                '<div style="font-size:14px;font-weight:700;color:rgba(255,255,255,0.8);">' + p.weeklyLimit + '</div>' +
                '<div style="font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">' + L.weeklyLabel + '</div>' +
                '</div>' +
                '</div>';

            // Subscribe button
            var btnStyle = isPopular
                ? 'background:rgba(255,255,255,0.9);color:#000;'
                : 'background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);';

            html += '<button onclick="subscribePlan(\'' + p.id + '\',' + (isYearly ? 'true' : 'false') + ')" ' +
                'style="width:100%;' + btnStyle + 'font-weight:700;font-size:8px;letter-spacing:0.25em;' +
                'text-transform:uppercase;padding:10px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;' +
                'cursor:pointer;transition:all 0.2s;font-family:inherit;">' + L.subscribe + '</button>';

            html += '</div>';
        }

        showDashPage(html, 'billing');
    };

    // ============================================================
    // PADDLE CHECKOUT
    // ============================================================
    window.subscribePlan = function(planId, yearly) {
        var plan = PLANS.find(function(p) { return p.id === planId; });
        if (!plan) return;

        var priceId = yearly ? plan.paddleYearlyId : plan.paddleMonthlyId;

        // Paddle checkout
        if (typeof Paddle !== 'undefined' && PADDLE_VENDOR_ID !== 'YOUR_PADDLE_VENDOR_ID') {
            Paddle.Checkout.open({
                items: [{ priceId: priceId, quantity: 1 }],
                customer: {
                    email: (document.getElementById('panelUserName') || {}).innerText || ''
                },
                customData: {
                    user_id: window.currentUserId || 'unknown_user'
                },
                settings: {
                    theme: 'dark',
                    locale: (document.getElementById('activeCode') || {}).innerText || 'en',
                    successUrl: window.location.origin + '?payment=success',
                    displayMode: 'overlay'
                }
            });
        } else {
            // Paddle henüz bağlanmadı
            alert('Payment system will be available soon. Plan: ' + plan.name + ' ($' + (yearly ? plan.yearlyPrice : plan.monthlyPrice) + ')');
        }
    };

    // ============================================================
    // MY ACCOUNT SAYFASI
    // ============================================================
    window.showMyAccountPage = function() {
        var L = getDashLang();
        var userName = (document.getElementById('panelUserName') || {}).innerText || 'User';
        var userPlan = (document.getElementById('panelUserPlan') || {}).innerText || 'FREE';
        var userCredits = (document.getElementById('panelCreditDisplay') || {}).innerText || '0';

        var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">' +
            '<button onclick="closeDashPage()" style="background:none;border:none;color:rgba(255,255,255,0.4);' +
            'font-size:9px;font-weight:700;letter-spacing:0.2em;cursor:pointer;text-transform:uppercase;' +
            'font-family:inherit;padding:6px 0;transition:color 0.2s;" onmouseenter="this.style.color=\'#fff\'" ' +
            'onmouseleave="this.style.color=\'rgba(255,255,255,0.4)\'">← ' + L.back + '</button>' +
            '<h2 style="font-size:14px;font-weight:700;letter-spacing:0.3em;color:rgba(255,255,255,0.8);' +
            'text-transform:uppercase;margin:0;">' + L.myAccount + '</h2>' +
            '<div style="width:50px;"></div></div>';

        // Avatar + info
        html += '<div style="text-align:center;margin-bottom:24px;">' +
            '<div style="width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.1);' +
            'border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;' +
            'margin:0 auto 12px;font-size:24px;">👤</div>' +
            '<div style="font-size:12px;font-weight:700;letter-spacing:0.2em;color:#fff;text-transform:uppercase;">' + userName + '</div>' +
            '<div style="font-size:8px;letter-spacing:0.3em;color:rgba(100,255,100,0.6);text-transform:uppercase;margin-top:4px;">' + userPlan + '</div>' +
            '</div>';

        // Stats
        html += '<div style="display:flex;gap:8px;margin-bottom:20px;">' +
            '<div style="flex:1;text-align:center;padding:12px 8px;background:rgba(255,255,255,0.03);' +
            'border:1px solid rgba(255,255,255,0.06);border-radius:10px;">' +
            '<div style="font-size:16px;font-weight:700;color:#fff;">' + userCredits + ' <span style="font-size:12px;color:rgba(255,200,0,0.7);">⚡</span></div>' +
            '<div style="font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">CREDITS</div>' +
            '</div>' +
            '<div style="flex:1;text-align:center;padding:12px 8px;background:rgba(255,255,255,0.03);' +
            'border:1px solid rgba(255,255,255,0.06);border-radius:10px;">' +
            '<div style="font-size:16px;font-weight:700;color:#fff;">' + userPlan + '</div>' +
            '<div style="font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">' + L.plan + '</div>' +
            '</div>' +
            '</div>';

        // Profile section
        html += '<div style="margin-bottom:16px;">' +
            '<div style="font-size:8px;font-weight:700;letter-spacing:0.25em;color:rgba(255,255,255,0.3);' +
            'text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.06);">' + L.profile + '</div>' +
            '<div style="display:flex;flex-direction:column;gap:8px;">' +
            '<input type="text" id="accName" value="' + userName + '" placeholder="NAME" style="' + inputStyle() + '">' +
            '<input type="email" id="accEmail" value="" placeholder="' + L.email + '" style="' + inputStyle() + '" readonly>' +
            '</div></div>';

        // Change password
        html += '<div style="margin-bottom:16px;">' +
            '<div style="font-size:8px;font-weight:700;letter-spacing:0.25em;color:rgba(255,255,255,0.3);' +
            'text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.06);">' + L.changePw + '</div>' +
            '<div style="display:flex;flex-direction:column;gap:8px;">' +
            '<input type="password" id="accCurrentPw" placeholder="' + L.currentPw + '" style="' + inputStyle() + '">' +
            '<input type="password" id="accNewPw" placeholder="' + L.newPw + '" style="' + inputStyle() + '">' +
            '<input type="password" id="accConfirmPw" placeholder="' + L.confirmPw + '" style="' + inputStyle() + '">' +
            '</div></div>';

        // Update button
        html += '<button onclick="updateProfile()" style="width:100%;background:rgba(255,255,255,0.08);' +
            'color:rgba(255,255,255,0.6);font-weight:700;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;' +
            'padding:12px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;cursor:pointer;' +
            'transition:all 0.2s;font-family:inherit;margin-top:8px;">' + L.updateProfile + '</button>';

        showDashPage(html, 'myaccount');
    };

    function inputStyle() {
        return 'width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);' +
            'border-radius:10px;padding:11px 14px;color:rgba(255,255,255,0.8);outline:none;font-size:10px;' +
            'letter-spacing:0.1em;text-transform:uppercase;box-sizing:border-box;font-family:inherit;' +
            'transition:border-color 0.2s;';
    }

    window.updateProfile = function() {
        // TODO: Supabase profil güncelleme
        var name = (document.getElementById('accName') || {}).value || '';
        var newPw = (document.getElementById('accNewPw') || {}).value || '';
        var confirmPw = (document.getElementById('accConfirmPw') || {}).value || '';

        if (newPw && newPw !== confirmPw) {
            alert('Passwords do not match!');
            return;
        }

        if (name && document.getElementById('panelUserName')) {
            document.getElementById('panelUserName').innerText = name;
        }

        alert('Profile updated!');
        closeDashPage();
    };

    // ============================================================
    // RENDERS SAYFASI — placeholder, Supabase entegrasyonu sonra
    // ============================================================
    window.showRendersPage = function() {
        var L = getDashLang();

        var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">' +
            '<button onclick="closeDashPage()" style="background:none;border:none;color:rgba(255,255,255,0.4);' +
            'font-size:9px;font-weight:700;letter-spacing:0.2em;cursor:pointer;text-transform:uppercase;' +
            'font-family:inherit;padding:6px 0;transition:color 0.2s;" onmouseenter="this.style.color=\'#fff\'" ' +
            'onmouseleave="this.style.color=\'rgba(255,255,255,0.4)\'">← ' + L.back + '</button>' +
            '<h2 style="font-size:14px;font-weight:700;letter-spacing:0.3em;color:rgba(255,255,255,0.8);' +
            'text-transform:uppercase;margin:0;">' + L.yourRenders + '</h2>' +
            '<div style="width:50px;"></div></div>';

        // Placeholder galeri
        html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'padding:40px 20px;text-align:center;">' +
            '<div style="font-size:32px;margin-bottom:12px;opacity:0.2;">🖼️</div>' +
            '<p style="font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.2);text-transform:uppercase;">' +
            L.noRenders + '</p>' +
            '</div>';

        showDashPage(html, 'renders');
    };

    // ============================================================
    // COMING SOON SAYFASI — diğer tüm menüler
    // ============================================================
    window.showComingSoonPage = function(pageName) {
        var L = getDashLang();

        var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">' +
            '<button onclick="closeDashPage()" style="background:none;border:none;color:rgba(255,255,255,0.4);' +
            'font-size:9px;font-weight:700;letter-spacing:0.2em;cursor:pointer;text-transform:uppercase;' +
            'font-family:inherit;padding:6px 0;transition:color 0.2s;" onmouseenter="this.style.color=\'#fff\'" ' +
            'onmouseleave="this.style.color=\'rgba(255,255,255,0.4)\'">← ' + L.back + '</button>' +
            '<h2 style="font-size:14px;font-weight:700;letter-spacing:0.3em;color:rgba(255,255,255,0.8);' +
            'text-transform:uppercase;margin:0;">' + (pageName || '') + '</h2>' +
            '<div style="width:50px;"></div></div>';

        html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'padding:60px 20px;text-align:center;">' +
            '<div style="font-size:11px;font-weight:700;letter-spacing:0.4em;color:rgba(255,255,255,0.15);' +
            'text-transform:uppercase;margin-bottom:8px;">' + L.comingSoon + '</div>' +
            '<p style="font-size:8px;letter-spacing:0.15em;color:rgba(255,255,255,0.1);">' + L.comingSoonSub + '</p>' +
            '</div>';

        showDashPage(html, 'comingsoon');
    };

    // ============================================================
    // MENÜ BUTONLARINI BAĞLA
    // ============================================================
    function bindMenuButtons() {
        var panel = document.getElementById('userSidePanel');
        if (!panel) return;

        var buttons = panel.querySelectorAll('.side-menu-item');
        buttons.forEach(function(btn) {
            var text = btn.innerText.trim().toUpperCase();
            var i18n = btn.getAttribute('data-i18n') || '';
            var spanI18n = btn.querySelector('[data-i18n]');
            var key = i18n || (spanI18n ? spanI18n.getAttribute('data-i18n') : '') || '';

            btn.addEventListener('click', function(e) {
                if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(function(){}); }

                if (key === 'billing' || text.indexOf('BILLING') > -1 || text.indexOf('FATURALANDIRMA') > -1) {
                    showBillingPage();
                } else if (key === 'myaccount' || text.indexOf('MY ACCOUNT') > -1 || text.indexOf('HESABIM') > -1) {
                    showMyAccountPage();
                } else if (key === 'renders' || text.indexOf('RENDERS') > -1 || text.indexOf('RENDERLAR') > -1) {
                    showRendersPage();
                } else if (key === 'settings' || text.indexOf('SETTINGS') > -1 || text.indexOf('AYARLAR') > -1) {
                    showComingSoonPage('SETTINGS');
                } else if (key === 'dashboard_menu' || text.indexOf('DASHBOARD') > -1) {
                    showComingSoonPage('DASHBOARD');
                } else if (key === 'projects' || text.indexOf('PROJECTS') > -1) {
                    showComingSoonPage('PROJECTS');
                } else if (key === 'assets' || text.indexOf('ASSETS') > -1) {
                    showComingSoonPage('ASSETS');
                } else if (key === 'workflows' || text.indexOf('WORKFLOWS') > -1) {
                    showComingSoonPage('WORKFLOWS');
                } else if (key === 'feed' || text.indexOf('FEED') > -1) {
                    showComingSoonPage('FEED');
                } else if (key === 'invite' || text.indexOf('INVITE') > -1) {
                    showComingSoonPage('INVITE TEAM');
                }
            });
        });
    }

    // ============================================================
    // PADDLE SCRIPT YÜKLE
    // ============================================================
    function loadPaddle() {
        if (PADDLE_VENDOR_ID === 'YOUR_PADDLE_VENDOR_ID') return;
        var script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.onload = function() {
            if (PADDLE_ENV === 'sandbox') {
                Paddle.Environment.set('sandbox');
            }
            Paddle.Setup({ seller: parseInt(PADDLE_VENDOR_ID) });
        };
        document.head.appendChild(script);
    }

    // ============================================================
    // INIT
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            bindMenuButtons();
            loadPaddle();
        });
    } else {
        bindMenuButtons();
        loadPaddle();
    }

})();