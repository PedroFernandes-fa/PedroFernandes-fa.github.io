// ====================================================================================
// UTILITIES
// ====================================================================================
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function checkCollision(obj1, obj2) {
    if (!obj1 || !obj2) return false;
    const dist = distance(obj1.x, obj1.y, obj2.x, obj2.y);
    return dist < (obj1.size / 2) + (obj2.size / 2);
}

// ====================================================================================
// DATA PERSISTENCE & HELPERS
// ====================================================================================
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

function saveGems() {
    try { localStorage.setItem('rogeo_totalGems', totalGems.toString()); }
    catch (e) { console.error("Could not save gems.", e); }
}
function loadGems() {
    try {
        const savedGems = localStorage.getItem('rogeo_totalGems');
        if (savedGems) { totalGems = parseInt(savedGems, 10) || 0; }
    }
    catch (e) {
        console.error("Could not load gems.", e);
        totalGems = 0;
    }
}

function saveSettings() {
    try {
        localStorage.setItem('rogeo_language', currentLanguage);
        localStorage.setItem('rogeo_inputMode', inputMode);
    } catch(e) { console.error("Could not save settings.", e); }
}
function loadSettings() {
    try {
        const lang = localStorage.getItem('rogeo_language');
        const input = localStorage.getItem('rogeo_inputMode');
        if (lang) currentLanguage = lang;
        if (input) inputMode = input;
    } catch(e) { console.error("Could not load settings.", e); }
}
function resetAllData() {
    try {
        localStorage.removeItem('rogeo_totalGems');
        localStorage.removeItem('rogeo_language');
        localStorage.removeItem('rogeo_inputMode');
        alert("Dados resetados. A página será recarregada.");
        location.reload();
    } catch(e) {
        console.error("Could not reset data.", e);
    }
}