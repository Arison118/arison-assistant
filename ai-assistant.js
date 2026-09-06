// ==========================================================
// ARISON ASSISTANT - MULTI-MODEL FALLBACK & RAISONNEMENT ÉTENDU 24/7
// ==========================================================

const GEMINI_API_KEY = "AQ.Ab8RN6KNGVj0o20hzmkuy58zdB6WkM38x-gk6AG5yeEB8azqgQ"; // Apetraho eto ny API Key-nao

// Ireo Model rehetra namboarina handimby toerana (Apetraka koa ny Raisonnement étendu)
const GEMINI_MODELS = [
    "gemini-3.5-flash-lite", // Haingana indrindra sy voalohany amin'ny fitsitsiana limite
    "gemini-3.6-flash",     // Fanamiana be sy vonona mandrakariva
    "gemini-3.1-pro",       // Raisonnement avancé ho an'ny fanontaniana tsotra
    "gemini-2.5-pro"        // Raisonnement étendu / Résolution de problèmes complets
];

document.addEventListener("DOMContentLoaded", function () {
    console.log("Arison Assistant Raisonnement étendu vonona tanteraka!");
    createFullScreenAssistantUI();
});

function createFullScreenAssistantUI() {
    if (document.getElementById('arisonChatModal')) return;

    const chatHTML = `
        <div id="arisonChatModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:#0b0f19; z-index:9999; flex-direction:column; font-family:sans-serif;">
            <!-- Header Matihanina -->
            <div style="padding:15px 20px; background:#0f172a; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1);">
                <div style="color:#00f2fe; font-weight:bold; font-size:1.1rem; display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-robot"><b>Arison Assistant Pro</b></i>
                </div>
                <button onclick="closeArisonAssistant()" style="background:transparent; border:none; color:#fff; font-size:1.5rem; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <!-- Messages Container (Malalaka sy Madio) -->
            <div id="arisonChatMessages" style="flex:1; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:20px; font-size:1rem; color:#e2e8f0; background:#0b0f19;">
                <div style="background:transparent; padding:0; align-self:flex-start; max-width:95%; line-height:1.6;">
                    Miarahaba tompoko! Izaho no Arison Assistant, vonona hanampy sy hanoro anao amin'ny varotra sy ny fiofana ary fianarana rehetra eto amin'ny Boutique ARISON.
                </div>
            </div>

            <!-- Bokotra Fanampiny -->
            <div style="padding:10px 20px; background:#0f172a; display:flex; gap:10px; overflow-x:auto; border-top:1px solid rgba(255,255,255,0.05);">
                <a href="tel:+261383374408" style="background:#1e293b; color:#00f2fe; padding:8px 14px; border-radius:15px; font-size:0.85rem; text-decoration:none; display:flex; align-items:center; gap:5px; border:1px solid rgba(0,242,254,0.3);"><i class="fa-solid fa-phone"></i> Antsoy Mivantana</a>
                <button onclick="shareArisonBoutique()" style="background:#1e293b; color:#60efb8; padding:8px 14px; border-radius:15px; font-size:0.85rem; border:1px solid rgba(96,239,184,0.3); cursor:pointer; display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-share-nodes"></i> Partager ny Boutique</button>
                <button onclick="resetArisonChat()" style="background:#1e293b; color:#fbbf24; padding:8px 14px; border-radius:15px; font-size:0.85rem; border:1px solid rgba(251,191,36,0.3); cursor:pointer; display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-rotate-right"></i> Hiverina Salutation</button>
            </div>

            <!-- Input Bar -->
            <div style="padding:15px 20px; background:#0f172a; display:flex; gap:10px; border-top:1px solid rgba(255,255,255,0.1);">
                <input type="text" id="arisonUserInput" placeholder="Soraty eto ny fanontanianao amin'ny fiteny tianao..." style="flex:1; background:#1e293b; border:1px solid rgba(255,255,255,0.15); border-radius:25px; padding:12px 18px; color:#fff; font-size:1rem; outline:none;" onkeypress="if(event.key==='Enter') sendGeminiMessage()">
                <button onclick="sendGeminiMessage()" style="background:linear-gradient(135deg, #00f2fe, #4facfe); border:none; width:45px; height:45px; border-radius:50%; color:#000; font-size:1.1rem; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 15px rgba(0,242,254,0.4);"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);
}

window.openArisonAssistant = function() {
    const modal = document.getElementById('arisonChatModal');
    if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
};

window.closeArisonAssistant = function() {
    const modal = document.getElementById('arisonChatModal');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
};

window.shareArisonBoutique = function() {
    if (navigator.share) {
        navigator.share({ title: 'Boutique ARISON', text: 'Tsiditsidio ny Boutique ARISON!', url: window.location.href }).catch(() => {});
    } else {
        alert("Nikaika ny rohy!");
    }
};

window.resetArisonChat = function() {
    document.getElementById('arisonChatMessages').innerHTML = `
        <div style="background:transparent; padding:0; align-self:flex-start; max-width:95%; line-height:1.6;">
            Miarahaba indray tompoko! Inona no azontsika resahina androany?
        </div>
    `;
};

// HANDRAISANA SY FAMALIANA AMIN'NY ALALAN'NY RAISONNEMENT ÉTENDU SY MULTI-MODEL
window.sendGeminiMessage = async function() {
    const input = document.getElementById('arisonUserInput');
    const container = document.getElementById('arisonChatMessages');
    let rawText = input.value.trim();
    if (!rawText) return;

    const cleanUserText = sanitizeText(rawText);

    container.innerHTML += `<div style="background:linear-gradient(135deg, #0061ff, #60efb8); color:#fff; padding:12px 18px; border-radius:18px 18px 0 18px; align-self:flex-end; max-width:85%; line-height:1.5;">${cleanUserText}</div>`;
    input.value = '';
    container.scrollTop = container.scrollHeight;

    let loadingId = "loading_" + Date.now();
    container.innerHTML += `<div id="${loadingId}" style="background:transparent; padding:10px 0; align-self:flex-start; color:#00f2fe; font-style:italic;">Arison Assistant mamaha olana amin'ny Raisonnement étendu...</div>`;
    container.scrollTop = container.scrollHeight;

    const promptText = `
Ianao dia manam-pahaizana matihanina amin'ny varotra sy fampiofanana ao amin'ny Boutique ARISON. 
TSIRE-PAHASINA BE: Diniho tsara ny fitenin'ny mpanjifa eto ambany, ary TSY MAINTSY mamaly amin'IO FITENY IO PIKA IHANY ianao (Na Malagasy, Français, English, 中文 (Sinoa), Deutsch (Alemanta), Español (Espagnol), العربية (Arabo), na inona na inona fiteny ampiasainy dia valio amin'io fiteny io ihany).
Ity ny fangatahan'ny mpanjifa: "${cleanUserText}"

ZAVA-DEHIBE AMIN'NY FIRAFITRY NY VALINY:
- Mampiasà lohateny lehibe miendrika A), B), C) mifandraika amin'ny varotra sy fiofana.
- Eo ambanin'ny lohateny tsirairay, asio teboka toy ny 1 -, 2 - miloko volomparasy.
- Isaky ny misy sous-titre kely (1 - na 2 -), dia asio fanazavana lava be feno sy mazava tsara eo ambaniny mifanaraka amin'ny fitenin'ny mpanjifa (soratra tsotra tsy miloko, midina andalana).
- Aza asiana mihitsy ireo tarehintsoratra manimba soratra toy ny famantarana manokana.
`;

    let data = null;
    let success = false;

    // Fihodinana amin'ireo maodely rehetra ao anatin'izany ny Raisonnement étendu
    for (let modelName of GEMINI_MODELS) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
            });

            if (response.ok) {
                const resJson = await response.json();
                if (resJson.candidates && resJson.candidates[0].content.parts[0].text) {
                    data = resJson;
                    success = true;
                    break;
                }
            }
        } catch (e) {
            console.log(`Tsy nahomby tamin'ny ${modelName}, mandeha amin'ny manaraka...`);
        }
    }

    document.getElementById(loadingId).remove();

    if (success && data) {
        let rawReply = data.candidates[0].content.parts[0].text;
        const cleanReply = sanitizeText(rawReply);

        let botMsgDiv = document.createElement('div');
        botMsgDiv.style.cssText = "background:transparent; padding:0; align-self:flex-start; max-width:95%; line-height:1.7; color:#e2e8f0; font-size:1rem;";
        container.appendChild(botMsgDiv);
        
        let formattedHtml = formatAiResponsePerfect(cleanReply);
        
        let charIndex = 0;
        let finalHtmlContent = formattedHtml;
        botMsgDiv.innerHTML = "";
        
        function typeWriterHtml() {
            if (charIndex < finalHtmlContent.length) {
                botMsgDiv.innerHTML = finalHtmlContent.substring(0, charIndex + 1);
                charIndex++;
                container.scrollTop = container.scrollHeight;
                setTimeout(typeWriterHtml, 4);
            }
        }
        typeWriterHtml();

    } else {
        container.innerHTML += `<div style="background:transparent; padding:10px 0; align-self:flex-start; color:#ef4444;">Misy olana kely tamin'ny fifandraisana. Hamarino tsara ny API Key-nao tompoko!</div>`;
        container.scrollTop = container.scrollHeight;
    }
};

function sanitizeText(text) {
    if (!text) return "";
    const forbiddenChars = /[+&€#@)(/*"':;!?™®©%^¢$°¥π|√•`~π÷×§∆}{=✓[]\\]/g;
    return text.replace(forbiddenChars, '');
}

// FIRAFITRA PERFECT 100% (A, B, C / 1 -, 2 - / Fanazavana tsotra milamina)
function formatAiResponsePerfect(text) {
    let lines = text.split('\n');
    let htmlResult = '';

    lines.forEach(line => {
        let trimmed = line.trim();
        if (!trimmed) return;

        if (/^[A-Z]\)/.test(trimmed)) {
            htmlResult += `<br><strong style="color: #00ff66; font-family: Georgia, serif; font-style: italic; font-size: 1.1rem; display: block; margin-top: 15px;">🚀 ${trimmed}</strong><br>`;
        } 
        else if (/^[0-9]+\s*-/.test(trimmed) || /^[0-9]+\./.test(trimmed)) {
            htmlResult += `<br><strong style="color: #bf00ff; font-family: Georgia, serif; font-style: italic; display: block; margin-left: 20px; margin-top: 10px;">⭐ ${trimmed}</strong>`;
        } 
        else {
            htmlResult += `<div style="margin-left: 35px; margin-top: 5px; color: #e2e8f0; font-size: 0.95rem; line-height: 1.6;">${trimmed}</div>`;
        }
    });

    return htmlResult;
}
