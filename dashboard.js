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
    // PLAN ÖZELLİK LİSTELERİ (Çok Dilli)
    // ============================================================
    var planFeatures = {
        'EN': {
            student:  ['50 credits / month', 'Create up to 50 renders (1K quality)', 'Or mix: 4 × 4K OR 1 × 8K', 'All design menus', 'Prompt Builder & Chat', 'Email support'],
            standard: ['125 credits / month', 'Create up to 125 renders (1K quality)', 'Or mix: 10 × 4K OR 4 × 8K', 'All design menus', 'Prompt Builder & Chat', 'Priority email support'],
            pro:      ['300 credits / month', 'Create up to 300 renders (1K quality)', 'Or mix: 25 × 4K OR 10 × 8K', 'All design menus', 'Prompt Builder & Chat', 'Priority support', 'Network access (1 listing)'],
            ultra:    ['700 credits / month', 'Create up to 700 renders (1K quality)', 'Or mix: 58 × 4K OR 23 × 8K', 'All design menus', 'Prompt Builder & Chat', 'Priority support', 'Network access (4 listings)'],
            vision:   ['2000 credits / month', 'Create up to 2000 renders (1K quality)', 'Or mix: 166 × 4K OR 66 × 8K', 'All design menus', 'Prompt Builder & Chat', 'Dedicated support', 'Unlimited Network access']
        },
        'TR': {
            student:  ['Ayda 50 kredi', '50 adede kadar render oluştur (1K kalite)', 'Veya karıştır: 4 × 4K VEYA 1 × 8K', 'Tüm tasarım menüleri', 'Prompt Builder ve Sohbet', 'E-posta desteği'],
            standard: ['Ayda 125 kredi', '125 adede kadar render oluştur (1K kalite)', 'Veya karıştır: 10 × 4K VEYA 4 × 8K', 'Tüm tasarım menüleri', 'Prompt Builder ve Sohbet', 'Öncelikli e-posta desteği'],
            pro:      ['Ayda 300 kredi', '300 adede kadar render oluştur (1K kalite)', 'Veya karıştır: 25 × 4K VEYA 10 × 8K', 'Tüm tasarım menüleri', 'Prompt Builder ve Sohbet', 'Öncelikli destek', 'Ağ erişimi (1 kayıt)'],
            ultra:    ['Ayda 700 kredi', '700 adede kadar render oluştur (1K kalite)', 'Veya karıştır: 58 × 4K VEYA 23 × 8K', 'Tüm tasarım menüleri', 'Prompt Builder ve Sohbet', 'Öncelikli destek', 'Ağ erişimi (4 kayıt)'],
            vision:   ['Ayda 2000 kredi', '2000 adede kadar render oluştur (1K kalite)', 'Veya karıştır: 166 × 4K VEYA 66 × 8K', 'Tüm tasarım menüleri', 'Prompt Builder ve Sohbet', 'Özel destek', 'Sınırsız ağ erişimi']
        },
        'ES': {
            student:  ['50 créditos / mes', 'Hasta 50 renders (calidad 1K)', 'O mezcla: 4 × 4K O 1 × 8K', 'Todos los menús de diseño', 'Prompt Builder y Chat', 'Soporte por email'],
            standard: ['125 créditos / mes', 'Hasta 125 renders (calidad 1K)', 'O mezcla: 10 × 4K O 4 × 8K', 'Todos los menús de diseño', 'Prompt Builder y Chat', 'Soporte email prioritario'],
            pro:      ['300 créditos / mes', 'Hasta 300 renders (calidad 1K)', 'O mezcla: 25 × 4K O 10 × 8K', 'Todos los menús de diseño', 'Prompt Builder y Chat', 'Soporte prioritario', 'Acceso a la Red (1 listado)'],
            ultra:    ['700 créditos / mes', 'Hasta 700 renders (calidad 1K)', 'O mezcla: 58 × 4K O 23 × 8K', 'Todos los menús de diseño', 'Prompt Builder y Chat', 'Soporte prioritario', 'Acceso a la Red (4 listados)'],
            vision:   ['2000 créditos / mes', 'Hasta 2000 renders (calidad 1K)', 'O mezcla: 166 × 4K O 66 × 8K', 'Todos los menús de diseño', 'Prompt Builder y Chat', 'Soporte dedicado', 'Acceso ilimitado a la Red']
        },
        'DE': {
            student:  ['50 Credits / Monat', 'Bis zu 50 Renders (1K-Qualität)', 'Oder Mix: 4 × 4K ODER 1 × 8K', 'Alle Design-Menüs', 'Prompt Builder und Chat', 'E-Mail-Support'],
            standard: ['125 Credits / Monat', 'Bis zu 125 Renders (1K-Qualität)', 'Oder Mix: 10 × 4K ODER 4 × 8K', 'Alle Design-Menüs', 'Prompt Builder und Chat', 'Prioritäts-E-Mail-Support'],
            pro:      ['300 Credits / Monat', 'Bis zu 300 Renders (1K-Qualität)', 'Oder Mix: 25 × 4K ODER 10 × 8K', 'Alle Design-Menüs', 'Prompt Builder und Chat', 'Prioritätssupport', 'Netzwerkzugang (1 Eintrag)'],
            ultra:    ['700 Credits / Monat', 'Bis zu 700 Renders (1K-Qualität)', 'Oder Mix: 58 × 4K ODER 23 × 8K', 'Alle Design-Menüs', 'Prompt Builder und Chat', 'Prioritätssupport', 'Netzwerkzugang (4 Einträge)'],
            vision:   ['2000 Credits / Monat', 'Bis zu 2000 Renders (1K-Qualität)', 'Oder Mix: 166 × 4K ODER 66 × 8K', 'Alle Design-Menüs', 'Prompt Builder und Chat', 'Dedizierter Support', 'Unbegrenzter Netzwerkzugang']
        },
        'FR': {
            student:  ['50 crédits / mois', "Jusqu'à 50 rendus (qualité 1K)", 'Ou mixte: 4 × 4K OU 1 × 8K', 'Tous les menus de design', 'Prompt Builder et Chat', 'Support email'],
            standard: ['125 crédits / mois', "Jusqu'à 125 rendus (qualité 1K)", 'Ou mixte: 10 × 4K OU 4 × 8K', 'Tous les menus de design', 'Prompt Builder et Chat', 'Support email prioritaire'],
            pro:      ['300 crédits / mois', "Jusqu'à 300 rendus (qualité 1K)", 'Ou mixte: 25 × 4K OU 10 × 8K', 'Tous les menus de design', 'Prompt Builder et Chat', 'Support prioritaire', 'Accès au Réseau (1 fiche)'],
            ultra:    ['700 crédits / mois', "Jusqu'à 700 rendus (qualité 1K)", 'Ou mixte: 58 × 4K OU 23 × 8K', 'Tous les menus de design', 'Prompt Builder et Chat', 'Support prioritaire', 'Accès au Réseau (4 fiches)'],
            vision:   ['2000 crédits / mois', "Jusqu'à 2000 rendus (qualité 1K)", 'Ou mixte: 166 × 4K OU 66 × 8K', 'Tous les menus de design', 'Prompt Builder et Chat', 'Support dédié', 'Accès illimité au Réseau']
        },
        'PT': {
            student:  ['50 créditos / mês', 'Até 50 renders (qualidade 1K)', 'Ou mistura: 4 × 4K OU 1 × 8K', 'Todos os menus de design', 'Prompt Builder e Chat', 'Suporte por email'],
            standard: ['125 créditos / mês', 'Até 125 renders (qualidade 1K)', 'Ou mistura: 10 × 4K OU 4 × 8K', 'Todos os menus de design', 'Prompt Builder e Chat', 'Suporte email prioritário'],
            pro:      ['300 créditos / mês', 'Até 300 renders (qualidade 1K)', 'Ou mistura: 25 × 4K OU 10 × 8K', 'Todos os menus de design', 'Prompt Builder e Chat', 'Suporte prioritário', 'Acesso à Rede (1 listagem)'],
            ultra:    ['700 créditos / mês', 'Até 700 renders (qualidade 1K)', 'Ou mistura: 58 × 4K OU 23 × 8K', 'Todos os menus de design', 'Prompt Builder e Chat', 'Suporte prioritário', 'Acesso à Rede (4 listagens)'],
            vision:   ['2000 créditos / mês', 'Até 2000 renders (qualidade 1K)', 'Ou mistura: 166 × 4K OU 66 × 8K', 'Todos os menus de design', 'Prompt Builder e Chat', 'Suporte dedicado', 'Acesso ilimitado à Rede']
        },
        'ID': {
            student:  ['50 kredit / bulan', 'Buat hingga 50 render (kualitas 1K)', 'Atau campur: 4 × 4K ATAU 1 × 8K', 'Semua menu desain', 'Prompt Builder dan Chat', 'Dukungan email'],
            standard: ['125 kredit / bulan', 'Buat hingga 125 render (kualitas 1K)', 'Atau campur: 10 × 4K ATAU 4 × 8K', 'Semua menu desain', 'Prompt Builder dan Chat', 'Dukungan email prioritas'],
            pro:      ['300 kredit / bulan', 'Buat hingga 300 render (kualitas 1K)', 'Atau campur: 25 × 4K ATAU 10 × 8K', 'Semua menu desain', 'Prompt Builder dan Chat', 'Dukungan prioritas', 'Akses Jaringan (1 listing)'],
            ultra:    ['700 kredit / bulan', 'Buat hingga 700 render (kualitas 1K)', 'Atau campur: 58 × 4K ATAU 23 × 8K', 'Semua menu desain', 'Prompt Builder dan Chat', 'Dukungan prioritas', 'Akses Jaringan (4 listing)'],
            vision:   ['2000 kredit / bulan', 'Buat hingga 2000 render (kualitas 1K)', 'Atau campur: 166 × 4K ATAU 66 × 8K', 'Semua menu desain', 'Prompt Builder dan Chat', 'Dukungan khusus', 'Akses Jaringan tak terbatas']
        },
        'RU': {
            student:  ['50 кредитов / месяц', 'До 50 рендеров (качество 1K)', 'Или смешанно: 4 × 4K ИЛИ 1 × 8K', 'Все меню дизайна', 'Prompt Builder и Чат', 'Email поддержка'],
            standard: ['125 кредитов / месяц', 'До 125 рендеров (качество 1K)', 'Или смешанно: 10 × 4K ИЛИ 4 × 8K', 'Все меню дизайна', 'Prompt Builder и Чат', 'Приоритетная email поддержка'],
            pro:      ['300 кредитов / месяц', 'До 300 рендеров (качество 1K)', 'Или смешанно: 25 × 4K ИЛИ 10 × 8K', 'Все меню дизайна', 'Prompt Builder и Чат', 'Приоритетная поддержка', 'Доступ к Сети (1 запись)'],
            ultra:    ['700 кредитов / месяц', 'До 700 рендеров (качество 1K)', 'Или смешанно: 58 × 4K ИЛИ 23 × 8K', 'Все меню дизайна', 'Prompt Builder и Чат', 'Приоритетная поддержка', 'Доступ к Сети (4 записи)'],
            vision:   ['2000 кредитов / месяц', 'До 2000 рендеров (качество 1K)', 'Или смешанно: 166 × 4K ИЛИ 66 × 8K', 'Все меню дизайна', 'Prompt Builder и Чат', 'Выделенная поддержка', 'Неограниченный доступ к Сети']
        },
        'AR': {
            student:  ['50 رصيد / شهر', 'إنشاء حتى 50 عرضاً (جودة 1K)', 'أو مزج: 4 × 4K أو 1 × 8K', 'جميع قوائم التصميم', 'Prompt Builder والدردشة', 'دعم البريد الإلكتروني'],
            standard: ['125 رصيد / شهر', 'إنشاء حتى 125 عرضاً (جودة 1K)', 'أو مزج: 10 × 4K أو 4 × 8K', 'جميع قوائم التصميم', 'Prompt Builder والدردشة', 'دعم بريد إلكتروني ذو أولوية'],
            pro:      ['300 رصيد / شهر', 'إنشاء حتى 300 عرضاً (جودة 1K)', 'أو مزج: 25 × 4K أو 10 × 8K', 'جميع قوائم التصميم', 'Prompt Builder والدردشة', 'دعم ذو أولوية', 'الوصول إلى الشبكة (إدراج واحد)'],
            ultra:    ['700 رصيد / شهر', 'إنشاء حتى 700 عرضاً (جودة 1K)', 'أو مزج: 58 × 4K أو 23 × 8K', 'جميع قوائم التصميم', 'Prompt Builder والدردشة', 'دعم ذو أولوية', 'الوصول إلى الشبكة (4 إدراجات)'],
            vision:   ['2000 رصيد / شهر', 'إنشاء حتى 2000 عرضاً (جودة 1K)', 'أو مزج: 166 × 4K أو 66 × 8K', 'جميع قوائم التصميم', 'Prompt Builder والدردشة', 'دعم مخصص', 'وصول غير محدود للشبكة']
        },
        'IT': {
            student:  ['50 crediti / mese', 'Crea fino a 50 render (qualità 1K)', 'O misto: 4 × 4K O 1 × 8K', 'Tutti i menu di design', 'Prompt Builder e Chat', 'Supporto email'],
            standard: ['125 crediti / mese', 'Crea fino a 125 render (qualità 1K)', 'O misto: 10 × 4K O 4 × 8K', 'Tutti i menu di design', 'Prompt Builder e Chat', 'Supporto email prioritario'],
            pro:      ['300 crediti / mese', 'Crea fino a 300 render (qualità 1K)', 'O misto: 25 × 4K O 10 × 8K', 'Tutti i menu di design', 'Prompt Builder e Chat', 'Supporto prioritario', 'Accesso alla Rete (1 inserzione)'],
            ultra:    ['700 crediti / mese', 'Crea fino a 700 render (qualità 1K)', 'O misto: 58 × 4K O 23 × 8K', 'Tutti i menu di design', 'Prompt Builder e Chat', 'Supporto prioritario', 'Accesso alla Rete (4 inserzioni)'],
            vision:   ['2000 crediti / mese', 'Crea fino a 2000 render (qualità 1K)', 'O misto: 166 × 4K O 66 × 8K', 'Tutti i menu di design', 'Prompt Builder e Chat', 'Supporto dedicato', 'Accesso illimitato alla Rete']
        }
    };

    function getPlanFeatures(planId) {
        var el = document.getElementById('activeCode');
        var code = el ? el.innerText.trim() : 'EN';
        var langFeatures = planFeatures[code] || planFeatures['EN'];
        return langFeatures[planId] || [];
    }

    // ============================================================
    // DİL DESTEĞİ
    // ============================================================
    var dashLang = {
        'EN': { billing: 'BILLING', myAccount: 'MY ACCOUNT', renders: 'RENDERS', monthly: 'MONTHLY', yearly: 'YEARLY', save: 'SAVE', perMonth: '/MO', perYear: '/YR', rendersLabel: 'RENDERS', renders8kLabel: '8K RENDERS', weeklyLabel: 'WEEKLY LIMIT', subscribe: 'SUBSCRIBE', currentPlan: 'CURRENT PLAN', comingSoon: 'COMING SOON', comingSoonSub: 'This feature is under development.', profile: 'PROFILE', email: 'EMAIL', plan: 'PLAN', memberSince: 'MEMBER SINCE', changePw: 'CHANGE PASSWORD', currentPw: 'CURRENT PASSWORD', newPw: 'NEW PASSWORD', confirmPw: 'CONFIRM PASSWORD', updateProfile: 'UPDATE PROFILE', yourRenders: 'YOUR RENDERS', noRenders: 'No renders yet. Start creating!', back: 'BACK', viewAllRenders: 'VIEW ALL RENDERS →', welcomeBack: 'WELCOME BACK', total: 'TOTAL', thisMonth: 'THIS MONTH', today: 'TODAY', dashboardTitle: 'DASHBOARD', rendersPrefix: '', rendersSuffix: ' renders per month' },
        'TR': { billing: 'FATURALANDIRMA', myAccount: 'HESABIM', renders: 'RENDERLAR', monthly: 'AYLIK', yearly: 'YILLIK', save: 'TASARRUF', perMonth: '/AY', perYear: '/YIL', rendersLabel: 'RENDER', renders8kLabel: '8K RENDER', weeklyLabel: 'HAFTALIK LİMİT', subscribe: 'ABONE OL', currentPlan: 'MEVCUT PLAN', comingSoon: 'YAKINDA', comingSoonSub: 'Bu özellik geliştirme aşamasında.', profile: 'PROFİL', email: 'E-POSTA', plan: 'PLAN', memberSince: 'ÜYELİK TARİHİ', changePw: 'ŞİFRE DEĞİŞTİR', currentPw: 'MEVCUT ŞİFRE', newPw: 'YENİ ŞİFRE', confirmPw: 'ŞİFRE TEKRAR', updateProfile: 'PROFİLİ GÜNCELLE', yourRenders: 'RENDERLARINIZ', noRenders: 'Henüz render yok. Oluşturmaya başlayın!', back: 'GERİ', viewAllRenders: 'TÜM RENDERLARI GÖR →', welcomeBack: 'TEKRAR HOŞGELDİN', total: 'TOPLAM', thisMonth: 'BU AY', today: 'BUGÜN', dashboardTitle: 'PANEL', rendersPrefix: 'Ayda ', rendersSuffix: ' render' },
        'ES': { billing: 'FACTURACIÓN', myAccount: 'MI CUENTA', renders: 'RENDERS', viewAllRenders: 'VER TODOS LOS RENDERS →', welcomeBack: 'BIENVENIDO DE NUEVO', total: 'TOTAL', thisMonth: 'ESTE MES', today: 'HOY', dashboardTitle: 'PANEL', monthly: 'MENSUAL', yearly: 'ANUAL', save: 'AHORRAR', perMonth: '/MES', perYear: '/AÑO', rendersLabel: 'RENDERS', renders8kLabel: '8K RENDERS', weeklyLabel: 'LÍMITE SEMANAL', subscribe: 'SUSCRIBIRSE', currentPlan: 'PLAN ACTUAL', comingSoon: 'PRÓXIMAMENTE', comingSoonSub: 'Esta función está en desarrollo.', profile: 'PERFIL', email: 'EMAIL', plan: 'PLAN', memberSince: 'MIEMBRO DESDE', changePw: 'CAMBIAR CONTRASEÑA', currentPw: 'CONTRASEÑA ACTUAL', newPw: 'NUEVA CONTRASEÑA', confirmPw: 'CONFIRMAR CONTRASEÑA', updateProfile: 'ACTUALIZAR PERFIL', yourRenders: 'TUS RENDERS', noRenders: 'Sin renders aún. ¡Empieza a crear!', back: 'ATRÁS', rendersPrefix: '', rendersSuffix: ' renders al mes' },
        'DE': { billing: 'ABRECHNUNG', myAccount: 'MEIN KONTO', renders: 'RENDERS', viewAllRenders: 'ALLE RENDERS ANZEIGEN →', welcomeBack: 'WILLKOMMEN ZURÜCK', total: 'GESAMT', thisMonth: 'DIESER MONAT', today: 'HEUTE', dashboardTitle: 'DASHBOARD', monthly: 'MONATLICH', yearly: 'JÄHRLICH', save: 'SPAREN', perMonth: '/MONAT', perYear: '/JAHR', rendersLabel: 'RENDERS', renders8kLabel: '8K RENDERS', weeklyLabel: 'WÖCHENTLICHES LIMIT', subscribe: 'ABONNIEREN', currentPlan: 'AKTUELLER PLAN', comingSoon: 'BALD VERFÜGBAR', comingSoonSub: 'Diese Funktion wird entwickelt.', profile: 'PROFIL', email: 'E-MAIL', plan: 'PLAN', memberSince: 'MITGLIED SEIT', changePw: 'PASSWORT ÄNDERN', currentPw: 'AKTUELLES PASSWORT', newPw: 'NEUES PASSWORT', confirmPw: 'PASSWORT BESTÄTIGEN', updateProfile: 'PROFIL AKTUALISIEREN', yourRenders: 'DEINE RENDERS', noRenders: 'Noch keine Renders. Fang an zu erstellen!', back: 'ZURÜCK', rendersPrefix: '', rendersSuffix: ' Renders pro Monat' },
        'FR': { billing: 'FACTURATION', myAccount: 'MON COMPTE', renders: 'RENDUS', viewAllRenders: 'VOIR TOUS LES RENDUS →', welcomeBack: 'BIENVENUE', total: 'TOTAL', thisMonth: 'CE MOIS', today: "AUJOURD'HUI", dashboardTitle: 'TABLEAU DE BORD', monthly: 'MENSUEL', yearly: 'ANNUEL', save: 'ÉCONOMISER', perMonth: '/MOIS', perYear: '/AN', rendersLabel: 'RENDUS', renders8kLabel: 'RENDUS 8K', weeklyLabel: 'LIMITE HEBDO', subscribe: "S'ABONNER", currentPlan: 'PLAN ACTUEL', comingSoon: 'BIENTÔT', comingSoonSub: 'Cette fonctionnalité est en développement.', profile: 'PROFIL', email: 'EMAIL', plan: 'PLAN', memberSince: 'MEMBRE DEPUIS', changePw: 'CHANGER MOT DE PASSE', currentPw: 'MOT DE PASSE ACTUEL', newPw: 'NOUVEAU MOT DE PASSE', confirmPw: 'CONFIRMER MOT DE PASSE', updateProfile: 'METTRE À JOUR', yourRenders: 'VOS RENDUS', noRenders: 'Pas encore de rendus. Commencez à créer!', back: 'RETOUR', rendersPrefix: '', rendersSuffix: ' rendus par mois' },
        'PT': { billing: 'FATURAÇÃO', myAccount: 'MINHA CONTA', renders: 'RENDERS', viewAllRenders: 'VER TODOS OS RENDERS →', welcomeBack: 'BEM-VINDO DE VOLTA', total: 'TOTAL', thisMonth: 'ESTE MÊS', today: 'HOJE', dashboardTitle: 'PAINEL', monthly: 'MENSAL', yearly: 'ANUAL', save: 'POUPAR', perMonth: '/MÊS', perYear: '/ANO', rendersLabel: 'RENDERS', renders8kLabel: '8K RENDERS', weeklyLabel: 'LIMITE SEMANAL', subscribe: 'ASSINAR', currentPlan: 'PLANO ATUAL', comingSoon: 'EM BREVE', comingSoonSub: 'Esta funcionalidade está em desenvolvimento.', profile: 'PERFIL', email: 'EMAIL', plan: 'PLANO', memberSince: 'MEMBRO DESDE', changePw: 'ALTERAR SENHA', currentPw: 'SENHA ATUAL', newPw: 'NOVA SENHA', confirmPw: 'CONFIRMAR SENHA', updateProfile: 'ATUALIZAR PERFIL', yourRenders: 'SEUS RENDERS', noRenders: 'Nenhum render ainda. Comece a criar!', back: 'VOLTAR', rendersPrefix: '', rendersSuffix: ' renders por mês' },
        'ID': { billing: 'TAGIHAN', myAccount: 'AKUN SAYA', renders: 'RENDER', viewAllRenders: 'LIHAT SEMUA RENDER →', welcomeBack: 'SELAMAT DATANG KEMBALI', total: 'TOTAL', thisMonth: 'BULAN INI', today: 'HARI INI', dashboardTitle: 'DASHBOARD', monthly: 'BULANAN', yearly: 'TAHUNAN', save: 'HEMAT', perMonth: '/BLN', perYear: '/THN', rendersLabel: 'RENDER', renders8kLabel: 'RENDER 8K', weeklyLabel: 'BATAS MINGGUAN', subscribe: 'BERLANGGANAN', currentPlan: 'PAKET SAAT INI', comingSoon: 'SEGERA HADIR', comingSoonSub: 'Fitur ini sedang dikembangkan.', profile: 'PROFIL', email: 'EMAIL', plan: 'PAKET', memberSince: 'ANGGOTA SEJAK', changePw: 'UBAH KATA SANDI', currentPw: 'KATA SANDI SAAT INI', newPw: 'KATA SANDI BARU', confirmPw: 'KONFIRMASI KATA SANDI', updateProfile: 'PERBARUI PROFIL', yourRenders: 'RENDER ANDA', noRenders: 'Belum ada render. Mulai berkreasi!', back: 'KEMBALI', rendersPrefix: '', rendersSuffix: ' render per bulan' },
        'RU': { billing: 'ОПЛАТА', myAccount: 'МОЙ АККАУНТ', renders: 'РЕНДЕРЫ', viewAllRenders: 'ВСЕ РЕНДЕРЫ →', welcomeBack: 'С ВОЗВРАЩЕНИЕМ', total: 'ВСЕГО', thisMonth: 'ЭТОТ МЕСЯЦ', today: 'СЕГОДНЯ', dashboardTitle: 'ПАНЕЛЬ', monthly: 'ЕЖЕМЕСЯЧНО', yearly: 'ЕЖЕГОДНО', save: 'СКИДКА', perMonth: '/МЕС', perYear: '/ГОД', rendersLabel: 'РЕНДЕРЫ', renders8kLabel: '8K РЕНДЕРЫ', weeklyLabel: 'НЕДЕЛЬНЫЙ ЛИМИТ', subscribe: 'ПОДПИСАТЬСЯ', currentPlan: 'ТЕКУЩИЙ ПЛАН', comingSoon: 'СКОРО', comingSoonSub: 'Эта функция находится в разработке.', profile: 'ПРОФИЛЬ', email: 'EMAIL', plan: 'ПЛАН', memberSince: 'УЧАСТНИК С', changePw: 'ИЗМЕНИТЬ ПАРОЛЬ', currentPw: 'ТЕКУЩИЙ ПАРОЛЬ', newPw: 'НОВЫЙ ПАРОЛЬ', confirmPw: 'ПОДТВЕРДИТЬ ПАРОЛЬ', updateProfile: 'ОБНОВИТЬ ПРОФИЛЬ', yourRenders: 'ВАШИ РЕНДЕРЫ', noRenders: 'Рендеров пока нет. Начните создавать!', back: 'НАЗАД', rendersPrefix: '', rendersSuffix: ' рендеров в месяц' },
        'AR': { billing: 'الفواتير', myAccount: 'حسابي', renders: 'العروض', viewAllRenders: '← عرض جميع الريندرات', welcomeBack: 'مرحبا بعودتك', total: 'الإجمالي', thisMonth: 'هذا الشهر', today: 'اليوم', dashboardTitle: 'لوحة التحكم', monthly: 'شهري', yearly: 'سنوي', save: 'وفر', perMonth: '/شهر', perYear: '/سنة', rendersLabel: 'العروض', renders8kLabel: 'عروض 8K', weeklyLabel: 'الحد الأسبوعي', subscribe: 'اشترك', currentPlan: 'الخطة الحالية', comingSoon: 'قريبا', comingSoonSub: 'هذه الميزة قيد التطوير.', profile: 'الملف الشخصي', email: 'البريد الإلكتروني', plan: 'الخطة', memberSince: 'عضو منذ', changePw: 'تغيير كلمة المرور', currentPw: 'كلمة المرور الحالية', newPw: 'كلمة المرور الجديدة', confirmPw: 'تأكيد كلمة المرور', updateProfile: 'تحديث الملف الشخصي', yourRenders: 'عروضك', noRenders: 'لا عروض حتى الآن. ابدأ الإنشاء!', back: 'رجوع', rendersPrefix: '', rendersSuffix: ' تصيير شهريا' },
        'IT': { billing: 'FATTURAZIONE', myAccount: 'MIO ACCOUNT', renders: 'RENDERS', viewAllRenders: 'VEDI TUTTI I RENDERS →', welcomeBack: 'BENTORNATO', total: 'TOTALE', thisMonth: 'QUESTO MESE', today: 'OGGI', dashboardTitle: 'DASHBOARD', monthly: 'MENSILE', yearly: 'ANNUALE', save: 'RISPARMIA', perMonth: '/MESE', perYear: '/ANNO', rendersLabel: 'RENDERS', renders8kLabel: 'RENDERS 8K', weeklyLabel: 'LIMITE SETTIMANALE', subscribe: 'ABBONATI', currentPlan: 'PIANO ATTUALE', comingSoon: 'PROSSIMAMENTE', comingSoonSub: 'Questa funzione è in sviluppo.', profile: 'PROFILO', email: 'EMAIL', plan: 'PIANO', memberSince: 'MEMBRO DA', changePw: 'CAMBIA PASSWORD', currentPw: 'PASSWORD ATTUALE', newPw: 'NUOVA PASSWORD', confirmPw: 'CONFERMA PASSWORD', updateProfile: 'AGGIORNA PROFILO', yourRenders: 'I TUOI RENDERS', noRenders: 'Ancora nessun render. Inizia a creare!', back: 'INDIETRO', rendersPrefix: '', rendersSuffix: ' render al mese' }
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

            // Subtitle
            html += '<div style="font-size:9px;color:rgba(255,255,255,0.35);letter-spacing:0.12em;margin-bottom:12px;">' +
                (L.rendersPrefix || '') + p.renders + (L.rendersSuffix || ' renders per month') +
                '</div>';

            // Feature list
            var features = getPlanFeatures(p.id);
            if (features.length > 0) {
                html += '<ul style="margin:0 0 12px 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:5px;">';
                for (var f = 0; f < features.length; f++) {
                    html += '<li style="font-size:8px;color:rgba(255,255,255,0.45);letter-spacing:0.1em;display:flex;align-items:flex-start;gap:6px;">' +
                        '<span style="color:rgba(255,255,255,0.25);margin-top:1px;">›</span>' +
                        '<span>' + features[f] + '</span></li>';
                }
                html += '</ul>';
            }

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

        // Paddle henüz onaylanmadı, kapalı
        alert('🚀 Our payment system is launching soon!\n\nContact info@adeull.com for early access or to request a trial coupon.');
        return;

        // Aşağıdaki Paddle kodu Paddle onaylandıktan sonra aktif olacak
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
    window.showRendersPage = async function() {
        var L = getDashLang();

        var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
            '<button onclick="closeDashPage()" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:9px;font-weight:700;letter-spacing:0.2em;cursor:pointer;text-transform:uppercase;font-family:inherit;padding:6px 0;">← ' + L.back + '</button>' +
            '<h2 style="font-size:14px;font-weight:700;letter-spacing:0.3em;color:rgba(255,255,255,0.8);text-transform:uppercase;margin:0;">' + L.yourRenders + '</h2>' +
            '<div style="width:50px;"></div></div>';

        html += '<div id="rendersListContainer" style="display:flex;flex-direction:column;gap:10px;">' +
            '<div style="text-align:center;padding:40px 20px;color:rgba(255,255,255,0.3);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;">Loading renders...</div>' +
            '</div>';

        showDashPage(html, 'renders');

        if(window.supabaseClient && window.currentUserId) {
            try {
                var res = await window.supabaseClient
                    .from('renders')
                    .select('*')
                    .eq('user_id', window.currentUserId)
                    .order('created_at', { ascending: false })
                    .limit(50);
                var renders = res.data;
                var err = res.error;

                var container = document.getElementById('rendersListContainer');
                if(!container) return;
                if(err) throw err;

                if(!renders || renders.length === 0) {
                    container.innerHTML = '<div style="text-align:center;padding:60px 20px;"><div style="font-size:40px;margin-bottom:12px;opacity:0.15;">🖼️</div><p style="font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.2);text-transform:uppercase;">' + L.noRenders + '</p></div>';
                    return;
                }

                var rhtml = '';
                renders.forEach(function(r) {
                    var date = new Date(r.created_at).toLocaleString();
                    var badge = r.is_8k
                        ? '<span style="font-size:6px;background:rgba(255,200,0,0.2);color:rgba(255,200,0,0.8);padding:3px 7px;border-radius:4px;letter-spacing:0.1em;font-weight:700;">8K</span>'
                        : '<span style="font-size:6px;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);padding:3px 7px;border-radius:4px;letter-spacing:0.1em;font-weight:700;">4K</span>';
                    rhtml += '<div style="padding:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;cursor:pointer;" onmouseover="this.style.background=\'rgba(255,255,255,0.05)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.03)\'">' +
                        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">' +
                        '<span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.85);letter-spacing:0.15em;text-transform:uppercase;">' + r.menu_type + '</span>' +
                        badge + '</div>' +
                        '<div style="font-size:7px;color:rgba(255,255,255,0.35);letter-spacing:0.1em;margin-bottom:4px;">' + date + ' · ' + (r.credits_used || 1) + ' credits · ' + (r.aspect_ratio || '16:9') + '</div>' +
                        (r.prompt ? '<div style="font-size:8px;color:rgba(255,255,255,0.5);margin-top:6px;font-style:italic;line-height:1.4;">' + r.prompt.substring(0, 120) + (r.prompt.length > 120 ? '...' : '') + '</div>' : '') +
                        '</div>';
                });
                container.innerHTML = rhtml;
            } catch(e) {
                console.error(e);
                var container = document.getElementById('rendersListContainer');
                if(container) container.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,80,80,0.6);font-size:9px;">Error loading renders</div>';
            }
        }
    };

    // ============================================================
    // DASHBOARD OVERVIEW SAYFASI
    // ============================================================
    window.showDashboardOverview = async function() {
        var L = getDashLang();
        var userName = (document.getElementById('panelUserName') || {}).innerText || 'User';
        var userCredits = (document.getElementById('panelCreditDisplay') || {}).innerText || '0';
        var userPlan = (document.getElementById('panelUserPlan') || {}).innerText || 'FREE';

        var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
            '<button onclick="closeDashPage()" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:9px;font-weight:700;letter-spacing:0.2em;cursor:pointer;text-transform:uppercase;font-family:inherit;padding:6px 0;">← ' + L.back + '</button>' +
            '<h2 style="font-size:14px;font-weight:700;letter-spacing:0.3em;color:rgba(255,255,255,0.8);text-transform:uppercase;margin:0;">' + L.dashboardTitle + '</h2>' +
            '<div style="width:50px;"></div></div>';

        html += '<div style="text-align:center;margin-bottom:20px;">' +
            '<div style="font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;">' + L.welcomeBack + '</div>' +
            '<div style="font-size:14px;color:#fff;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">' + userName + '</div>' +
            '</div>';

        html += '<div style="display:flex;gap:8px;margin-bottom:16px;">' +
            '<div style="flex:1;text-align:center;padding:14px 8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">' +
            '<div style="font-size:20px;font-weight:700;color:#fff;">' + userCredits + ' <span style="font-size:12px;color:rgba(255,200,0,0.7);">⚡</span></div>' +
            '<div style="font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">CREDITS</div>' +
            '</div>' +
            '<div style="flex:1;text-align:center;padding:14px 8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">' +
            '<div style="font-size:12px;font-weight:700;color:rgba(100,255,100,0.8);padding-top:4px;">' + userPlan + '</div>' +
            '<div style="font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:0.15em;text-transform:uppercase;margin-top:6px;">CURRENT PLAN</div>' +
            '</div>' +
            '</div>';

        html += '<div id="dashStatsContainer" style="margin-bottom:16px;">' +
            '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;">Loading stats...</div>' +
            '</div>';

        html += '<button onclick="showRendersPage()" style="width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px;color:rgba(255,255,255,0.6);font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;font-family:inherit;transition:all 0.2s;" onmouseover="this.style.background=\'rgba(255,255,255,0.08)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.04)\'">' + L.viewAllRenders + '</button>';

        showDashPage(html, 'dashboard');

        if(window.supabaseClient && window.currentUserId) {
            try {
                var statsRes = await window.supabaseClient.rpc('get_render_stats', { p_user_id: window.currentUserId });
                var stats = statsRes.data;
                if(stats) {
                    var statsHtml =
                        '<div style="display:flex;gap:8px;">' +
                        '<div style="flex:1;text-align:center;padding:12px 6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">' +
                        '<div style="font-size:16px;font-weight:700;color:#fff;">' + (stats.total || 0) + '</div>' +
                        '<div style="font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">' + L.total + '</div>' +
                        '</div>' +
                        '<div style="flex:1;text-align:center;padding:12px 6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">' +
                        '<div style="font-size:16px;font-weight:700;color:#fff;">' + (stats.this_month || 0) + '</div>' +
                        '<div style="font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">' + L.thisMonth + '</div>' +
                        '</div>' +
                        '<div style="flex:1;text-align:center;padding:12px 6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">' +
                        '<div style="font-size:16px;font-weight:700;color:#fff;">' + (stats.today || 0) + '</div>' +
                        '<div style="font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">' + L.today + '</div>' +
                        '</div>' +
                        '</div>';
                    var statsEl = document.getElementById('dashStatsContainer');
                    if(statsEl) statsEl.innerHTML = statsHtml;
                }
            } catch(e) {
                console.error('Dashboard data load error:', e);
            }
        }
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
                    showDashboardOverview();
                } else if (key === 'projects' || text.indexOf('PROJECTS') > -1) {
                    showComingSoonPage('PROJECTS');
                } else if (key === 'assets' || text.indexOf('ASSETS') > -1) {
                    showComingSoonPage('ASSETS');
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