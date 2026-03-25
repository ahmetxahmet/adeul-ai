// ==============================================================
// SUNUM VE TEXTURE İŞLEMLERİ (sunum.js)
// ==============================================================

// 1. TEXTURE RENDER (REVİZYON MOTORUNU TETİKLER!)
async function generateTextureRender(btnId) {
    if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(e => {}); }
    const btn = document.getElementById(btnId);
    if (!btn || btn.disabled) return;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'ADEUL AI WORKING...';
    btn.classList.add('bg-blue-600', 'text-white', 'animate-pulse');

    const activeLangCodeElement = document.getElementById('activeCode');
    const activeLangCode = activeLangCodeElement ? activeLangCodeElement.innerText : 'EN';
    
    // Ürün görselini al
    let refImage = window.uploadedBase64['boxRef'];

    if (!refImage) {
        alert("Lütfen sol kutuya ürün (Reference) görseli yükleyin.");
        resetBtn(btn, originalText);
        return;
    }

    const customPrompt = document.getElementById('texturePrompt') ? document.getElementById('texturePrompt').value.trim() : "";
    let finalPrompt = customPrompt !== "" ? customPrompt : "A professional product material breakdown presentation. Keep original product EXACTLY as is. Show wireframe and material swatches.";

    // PAŞAM SİHİR BURADA:
    // Resmi 'boxRef' olarak değil, bilerek 'boxDesign' olarak N8N'e yolluyoruz.
    // N8N bunu görünce direkt senin o kusursuz Revizyon motorunu (ControlNet) çalıştıracak!
    const payload = {
        action: 'generate',
        prompt: finalPrompt,
        isSketch: "EVET", // Revizyon motorunu zorla açıyoruz!
        sketchData: "",
        images: { 
            boxDesign: refImage, // N8N'i Revizyon moduna sokan anahtar
            boxRef: refImage 
        },
        language: activeLangCode,
        aspectRatio: window.currentRatio
    };
    
    try {
        const response = await fetch(window.CLOUDFLARE_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("N8N Bağlantı Hatası");
        
        const data = await response.json();
        let rawOutput = Array.isArray(data) ? data[0] : data;
        
        let outputBase64 = rawOutput.output_url || rawOutput.output || rawOutput.image_url || ""; 
        if (!outputBase64 && rawOutput.candidates && rawOutput.candidates[0].content.parts[0].inlineData) {
            outputBase64 = rawOutput.candidates[0].content.parts[0].inlineData.data;
        }
        
        if (outputBase64) {
            let cleanBase64 = outputBase64;
            if (!outputBase64.startsWith('http')) {
                cleanBase64 = String(outputBase64).replace(/^data:image\/[a-z]+;base64,/, '').replace(/\s/g, '');
                window.uploadedBase64['boxPresentationRender'] = cleanBase64;
            } else {
                // Eğer URL gelirse (Fal.ai'den), o URL'i saklayıp sunuma yedireceğiz.
                window.uploadedBase64['boxPresentationRender'] = cleanBase64; 
            }

            const rightBox = document.getElementById('boxPresentationRender');
            if(rightBox) {
                Array.from(rightBox.children).forEach(child => child.style.display = 'none');
                const previewDiv = document.createElement('div');
                previewDiv.className = 'preview-container absolute inset-0 w-full h-full';
                
                let imgSrc = cleanBase64.startsWith('http') ? cleanBase64 : `data:image/jpeg;base64,${cleanBase64}`;
                
                previewDiv.innerHTML = `<img src="${imgSrc}" class="absolute inset-0 w-full h-full object-cover opacity-80 rounded-xl"><div class="absolute inset-0 flex items-center justify-center pointer-events-none"><span class="bg-green-600/90 px-4 py-2 rounded-lg text-[0.6rem] font-bold tracking-widest text-white shadow-lg uppercase">TEXTURE READY</span></div>`;
                rightBox.appendChild(previewDiv);
            }
        }
    } catch(e) {
        alert("Doku oluşturulamadı."); console.error(e);
    }
    resetBtn(btn, originalText);
}

// =========================================================================
// 2. SUNUM ANALİZİ (GÜVENLİ N8N WEBHOOK BAĞLANTISI)
// =========================================================================
async function analyzePresentation() {
    if (window.clickSound) { window.clickSound.currentTime = 0; window.clickSound.play().catch(e => {}); }

    const activeLangCodeElement = document.getElementById('activeCode');
    const activeLangCode = activeLangCodeElement ? activeLangCodeElement.innerText : 'EN';

    let refImage = window.uploadedBase64['boxRef'];
    let renderImageToAnalyze = window.uploadedBase64['boxPresentationRender'] || refImage;

    if (!renderImageToAnalyze) {
        alert("Lütfen önce bir ürün yükleyin veya Texture Render alın.");
        return;
    }

    // Yükleniyor durumunu simüle edelim
    toggleUpscaleLoader(true);
    const loaderTitle = document.getElementById('loaderTitle');
    if(loaderTitle) loaderTitle.innerText = "ANALYZING PRESENTATION...";

    try {
        // GÜVENLİK GÜNCELLEMESİ: API Key tamamen kaldırıldı. 
        // İstek doğrudan güvenli N8N webhook'una yönlendirildi.
        const n8nAnalyzeUrl = "https://adeul-ia.app.n8n.cloud/webhook/analyze-presentation";
        
        const promptText = `Analyze this ORIGINAL product image accurately. Give me a sophisticated concept name, up to 5 matching HEX colors from the actual pixels, and up to 5 distinct materials with titles and descriptions. IMPORTANT: Translate 'projectName', 'title', and 'desc' strictly to the language code: ${activeLangCode}. DO NOT USE MARKDOWN. Return ONLY a valid JSON like this: {"projectName": "...", "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"], "materials": [{"title": "...", "desc": "...", "hexColor": "#HEX"}, {"title": "...", "desc": "...", "hexColor": "#HEX"}]}`;

        let safeBase64ForGemini = renderImageToAnalyze;
        if(renderImageToAnalyze.startsWith('http')) {
             safeBase64ForGemini = refImage; 
        }

        const payload = {
            action: "analyze_presentation",
            prompt: promptText,
            image: safeBase64ForGemini,
            language: activeLangCode
        };

        const response = await fetch(n8nAnalyzeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`N8N Analysis Error: ${response.status}`);
        
        const data = await response.json();
        let analysis = {};

        try {
            // N8N'den dönen JSON verisini ayrıştırma
            let rawText = data.output || data.text || JSON.stringify(data);
            if (typeof rawText === 'string') {
                analysis = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
            } else {
                analysis = rawText; // Zaten obje ise direkt al
            }
        } catch(e) {
            console.error("JSON Parse Error:", e);
            analysis = {materials: [], colors: []};
        }

        const boardDict = {
            'EN': { mat: "MATERIAL", proj: "PROJECT", schem: "SCHEMATIC BOARD", t: "Material & Finish Board", f: "Textures & Finishes", c: "Global Color Palette" },
            'TR': { mat: "MALZEME", proj: "PROJE", schem: "ŞEMATİK PAFTA", t: "Malzeme ve Kaplama Paftası", f: "Dokular ve Kaplamalar", c: "Global Renk Paleti" },
            'ES': { mat: "MATERIAL", proj: "PROYECTO", schem: "TABLERO ESQUEMÁTICO", t: "Tablero de Materiales", f: "Texturas y Acabados", c: "Paleta de Colores" },
            'DE': { mat: "MATERIAL", proj: "PROJEKT", schem: "SCHEMATISCHES BOARD", t: "Material Board", f: "Texturen & Finishes", c: "Farbe Palette" },
            'FR': { mat: "MATÉRIEL", proj: "PROJET", schem: "PLANCHE SCHÉMATIQUE", t: "Planche de Matériaux", f: "Textures & Finitions", c: "Palette de Couleurs" },
            'PT': { mat: "MATERIAL", proj: "PROJETO", schem: "PLACA ESQUEMÁTICA", t: "Placa de Materiais", f: "Texturas e Acabamentos", c: "Paleta de Cores" },
            'ID': { mat: "MATERIAL", proj: "PROYEK", schem: "PAPAN SKEMA", t: "Papan Material", f: "Tekstur & Finis", c: "Palet Warna" },
            'HI': { mat: "सामग्री", proj: "परियोजना", schem: "योजनाबद्ध बोर्ड", t: "सामग्री बोर्ड", f: "बनावट और फिनिश", c: "रंग पैलेट" },
            'AR': { mat: "مادة", proj: "مشروع", schem: "لوحة تخطيطية", t: "لوحة المواد", f: "القوام والتشطيبات", c: "لوحة الألوان" }
        };
        
        let bLang = boardDict[activeLangCode] || boardDict['EN'];
        let safeProjectName = analysis.projectName || "CONCEPT BOARD";
        
        let finalImageSrc = renderImageToAnalyze.startsWith('http') ? renderImageToAnalyze : "data:image/jpeg;base64," + renderImageToAnalyze;

        function buildDynamicMaterials(boardId, shapeClass) {
            const container = document.getElementById(boardId).querySelector('.w-5\\/12 .flex.flex-col.gap-6');
            if (!container) return;
            
            container.innerHTML = `<h3 contenteditable="true" class="text-xs tracking-[0.3em] text-gray-400 font-bold uppercase mb-2 border-b border-gray-200 pb-2 outline-none hover:bg-gray-100 transition cursor-text px-1">${bLang.f}</h3>`;
            
            if (analysis.materials && analysis.materials.length > 0) {
                analysis.materials.forEach((m) => {
                    let hex = m.hexColor || '#EEE';
                    let matHtml = `
                    <div class="flex items-center gap-5 mt-2">
                        <div class="mat-shape w-20 h-20 ${shapeClass} overflow-hidden shadow-inner border border-gray-300 flex-shrink-0 flex items-center justify-center" style="background-color: ${hex}"></div>
                        <div class="flex flex-col">
                            <span contenteditable="true" class="text-sm font-bold tracking-widest uppercase text-gray-800 outline-none hover:bg-gray-100 transition px-1 rounded cursor-text">${m.title || bLang.mat}</span>
                            <span contenteditable="true" class="text-[0.65rem] tracking-wider text-gray-500 uppercase mt-1 outline-none hover:bg-gray-100 transition px-1 rounded cursor-text">${m.desc || ''}</span>
                        </div>
                    </div>`;
                    container.insertAdjacentHTML('beforeend', matHtml);
                });
            }
        }

        function buildDynamicColors(boardId) {
            const colorContainer = document.getElementById(boardId).querySelector('.flex.gap-3');
            if (!colorContainer) return;
            colorContainer.innerHTML = ''; 
            
            if (analysis.colors && analysis.colors.length > 0) {
                analysis.colors.forEach((c) => {
                    let hex = c.split('/')[0] ? c.split('/')[0].trim() : c;
                    let colHtml = `
                    <div class="flex-1 flex flex-col items-center gap-2">
                        <div class="w-full h-14 shadow-inner rounded-sm border border-gray-300" style="background-color: ${hex}"></div>
                        <span contenteditable="true" class="text-[0.55rem] tracking-widest text-gray-600 font-bold outline-none hover:bg-gray-100 transition px-1 rounded cursor-text">${c}</span>
                    </div>`;
                    colorContainer.insertAdjacentHTML('beforeend', colHtml);
                });
            }
        }

        if (window.currentBoardStyle === 1) {
            document.getElementById('boardTemplate1').classList.remove('hidden'); document.getElementById('boardTemplate2').classList.add('hidden'); document.getElementById('boardTemplate3').classList.add('hidden');
            document.getElementById('board1Img').src = finalImageSrc; 
            document.getElementById('board1Img').style.mixBlendMode = "multiply";
            document.getElementById('board1MainTitle').innerText = bLang.t;
            document.getElementById('board1Project').innerText = bLang.proj + ": " + safeProjectName.toUpperCase();
            buildDynamicMaterials('boardTemplate1', 'rounded-full');
            buildDynamicColors('boardTemplate1');
        } 
        else if (window.currentBoardStyle === 2) {
            document.getElementById('boardTemplate1').classList.add('hidden'); document.getElementById('boardTemplate2').classList.remove('hidden'); document.getElementById('boardTemplate3').classList.add('hidden');
            document.getElementById('board2Img').src = finalImageSrc;
            document.getElementById('board2Img').style.mixBlendMode = "multiply";
            document.getElementById('board2MainTitle').innerText = bLang.t;
            document.getElementById('board2Project').innerText = bLang.proj + ": " + safeProjectName.toUpperCase();
            buildDynamicMaterials('boardTemplate2', 'rounded-xl');
            buildDynamicColors('boardTemplate2');
        } 
        else if (window.currentBoardStyle === 3) {
            document.getElementById('boardTemplate1').classList.add('hidden'); document.getElementById('boardTemplate2').classList.add('hidden'); document.getElementById('boardTemplate3').classList.remove('hidden');
            document.getElementById('board3Img').src = finalImageSrc;
            document.getElementById('board3Img').style.mixBlendMode = "multiply";
            document.getElementById('board3MainTitle').innerText = bLang.schem;
            document.getElementById('board3Project').innerText = bLang.proj + ": " + safeProjectName.toUpperCase();
            
            const schemaContainer = document.getElementById('boardTemplate3').querySelector('.relative.flex-1');
            if (schemaContainer) {
                schemaContainer.innerHTML = `<div class="w-1/2 bg-white shadow-xl p-4 border border-gray-200 relative z-0 mx-auto mt-10"><img src="${finalImageSrc}" class="w-full h-auto object-contain max-h-[400px]" style="mix-blend-mode: multiply;"></div>`;
                let flexList = document.createElement('div');
                flexList.className = "flex flex-wrap justify-center gap-10 mt-10 w-full";
                
                if (analysis.materials) {
                    analysis.materials.forEach((m) => {
                        let hex = m.hexColor || '#EEE';
                        let matHtml = `
                        <div class="flex flex-col items-center text-center max-w-[150px]">
                            <div class="w-20 h-20 rounded-full shadow-lg border-4 border-white flex items-center justify-center mb-3" style="background-color: ${hex}"></div>
                            <p contenteditable="true" class="text-xs font-bold tracking-widest uppercase text-gray-800 outline-none hover:bg-gray-200 cursor-text">${m.title || bLang.mat}</p>
                            <p contenteditable="true" class="text-[0.55rem] text-gray-500 tracking-wider uppercase mt-1 outline-none hover:bg-gray-200 cursor-text">${m.desc || ''}</p>
                        </div>`;
                        flexList.insertAdjacentHTML('beforeend', matHtml);
                    });
                }
                schemaContainer.appendChild(flexList);
            }
        }
        if (typeof showPresentationScreen === 'function') showPresentationScreen();

    } catch (error) {
        console.error("Analysis Error:", error);
        alert("Sunum analizi başarısız oldu. Lütfen N8N bağlantısını kontrol edin.");
    } finally {
        toggleUpscaleLoader(false);
    }
}

function resetBtn(btn, text) {
    btn.innerHTML = text;
    btn.classList.remove('bg-blue-600', 'text-white', 'animate-pulse');
    btn.disabled = false;
}