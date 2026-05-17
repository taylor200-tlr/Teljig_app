let currentSelectedId = null;
let currentSelectedData = null;
const API = 'https://electroprime.hu';

// Kifelé is láthatóvá tesszuke a bezárást, hogy a HTML onclick is elérje
function closeBottomSheet() {
    document.getElementById('bottomSheet').classList.remove('open');
    currentSelectedId = null;
    currentSelectedData = null;
}

function closeStatsSheet() {
    document.getElementById('statsSheet').classList.remove('open');
}

window.closeStatsSheet = closeStatsSheet;

function openStatsSheet() {
    document.getElementById('statsSheet').classList.add('open');
}

// Kifelé láthatóvá tesszük a megnyitást is
function openBottomSheet(id) {
    currentSelectedId = id;
    window.elmentettSzerkesztoId = id;
    const talalat = window.currentDailyMunkak.find(item => item.id == id);
    if (talalat) {
        try {
            currentSelectedData = JSON.parse(talalat.adatok_json);
        } catch (e) {
            console.error("JSON parsing hiba:", e);
        }
        document.getElementById('sheetTitle').textContent = `${talalat.ido}-kori mentés`;
        document.getElementById('bottomSheet').classList.add('open');
    }
}

function formatCurrency(amount) {
    return parseInt(amount).toLocaleString('hu-HU') + " Ft";
}

// --- SZERKESZTÉS GOMB KEZELÉSE ---
function handleEditClick() {
    if (!currentSelectedData) return;

    // 1. Gyűjtsük össze az összes tevékenység elemet egyszer
    const activityElements = document.querySelectorAll('.activity');

    // 2. Minden számlálót nullázunk
    activityElements.forEach(div => {
        div.querySelector('.quantity').textContent = '0';
    });

    // 3. Visszatöltjük a mentett mennyiségeket hatékonyabban
    currentSelectedData.forEach(mentettTetel => {
        const targetActivity = Array.from(activityElements).find(div => div.dataset.name === mentettTetel.nev);
        if (targetActivity) {
            targetActivity.querySelector('.quantity').textContent = mentettTetel.db;
        }
    });

    // 4. Újraszámoljuk a főoldali végösszeget
    window.triggerUpdateTotal();

    // 5. GOMBOK CSERÉJE: Sima elrejt, Módosítás megmutat
    document.getElementById('exportButton').style.display = 'none';
    document.getElementById('updateButton').style.display = 'block';

    // 6. Bezárjuk az alsó menüt
    closeBottomSheet();

    alert("✏️ Adatok visszatöltve! Módosítsd a mennyiségeket, majd nyomj a 'Módosítás mentése' gombra.");
}

// --- CÉLZOTT TÖRLÉS GOMB KEZELÉSE ---
async function handleDeleteClick() {
    if (!currentSelectedId) return;
    if (!confirm("Biztosan törlöd ezt a konkrét mentést?")) return;

    try {
        const response = await fetch(`${API}/torles_id.php?id=${currentSelectedId}`);
        const result = await response.json();

        if (result.status === "success") {
            alert("🗑️ Sikeresen törölve!");
            closeBottomSheet();
            window.triggerRefreshStats();
        } else {
            alert("❌ Hiba: " + result.message);
        }
    } catch (err) {
        alert("❌ Hiba történt a törlés során.");
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- SERVICE WORKER REGISZTRÁCIÓ (OFFLINE MÓD) ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker aktív!'))
                .catch(err => console.log('SW hiba:', err));
        });
    }

    const activities = [
        ['LHM csere', 8500],
        ['LHM rollout', 12750],
        ['KMSZ csere', 2210],
        ['Kötőelem beépítés', 2300],
        ['Kisablak felszerelés', 5100],
        ['Tábla csere', 1700],
        ['Plombálás', 5500],
        ['Műszaki', 7200],
        ['Kódolt jelzés', 7225],
        ['Készülék fel / le', 5100],
        ['Helyszíni adategyeztetés', 5100],
        ['HMKE', 17000],
        ['EFIZ LHM', 12750],
        ['Passzív Ügyfél K.', 12750],
        ['Mintavételes mérő', 17000],
        ['Kikapcsolás', 22000],
        ['EJKV', 12750],
        ['TJKV kicsi', 25500],
        ['TJKV nagy', 72250]
    ];

    const container = document.getElementById('activitiesContainer');
    const totalPriceElement = document.getElementById('totalPrice');

    // Generálás
    activities.forEach(([name, price]) => {
        const div = document.createElement('div');
        div.className = 'activity';
        div.dataset.price = price;
        div.dataset.name = name;
        div.innerHTML = `
            <h3>${name}</h3>
            <div class="controls">
                <button class="decrease">-</button>
                <span class="quantity">0</span>
                <button class="increase">+</button>
            </div>`;
        container.appendChild(div);
    });

    // Delegált eseménykezelés
    container.addEventListener('click', (e) => {
        const btn = e.target;
        if (!btn.classList.contains('decrease') && !btn.classList.contains('increase')) return;

        const span = btn.closest('.activity').querySelector('.quantity');
        let val = parseInt(span.textContent);

        if (btn.classList.contains('increase')) val++;
        else if (val > 0) val--;

        span.textContent = val;
        updateTotal();
    });

    function updateTotal() {
        let total = 0;
        const activityDivs = container.querySelectorAll('.activity');
        activityDivs.forEach(div => {
            const price = parseInt(div.dataset.price);
            const qty = parseInt(div.querySelector('.quantity').textContent);
            total += price * qty;
        });
        totalPriceElement.textContent = formatCurrency(total);
    }
    window.triggerUpdateTotal = updateTotal;

    document.getElementById('resetButton').addEventListener('click', () => {
        if (confirm("Nullázod az aktuális tételeket?")) {
            resetToNormalMode();
        }
    });

    // --- STATISZTIKA GOMB KEZELÉSE ---
    document.getElementById('statsButton').addEventListener('click', async () => {
        openStatsSheet();
        const statsList = document.getElementById('statsList');
        statsList.innerHTML = '<p style="text-align:center;">Betöltés...</p>';

        try {
            const response = await fetch(`${API}/statisztika.php`);
            const data = await response.json();

            let html = '';
            if (data.length === 0) {
                html = '<p style="text-align:center; color:gray;">Nincs még adat.</p>';
            } else {
                data.forEach(row => {
                    html += `
                        <div class="daily-row" style="padding: 12px 0;">
                            <span>📅 ${row.nap}</span>
                            <strong>${formatCurrency(row.napi_osszeg)}</strong>
                        </div>`;
                });
            }
            statsList.innerHTML = html;
        } catch (err) {
            statsList.innerHTML = '<p style="text-align:center; color:red;">Hiba az adatok lekérésekor.</p>';
        }
    });

    function resetToNormalMode() {
        document.querySelectorAll('.quantity').forEach(s => s.textContent = '0');
        updateTotal();

        // Gombok visszaállítása alaphelyzetbe
        document.getElementById('exportButton').style.display = 'block';
        document.getElementById('updateButton').style.display = 'none';

        currentSelectedId = null;
        window.elmentettSzerkesztoId = null;
    }

    // --- SEGÉDFÜGGVÉNY: ADATOK ÖSSZEGYŰJTÉSE ---
    function getAktualisAdatok() {
        const adatok = [];
        document.querySelectorAll('.activity').forEach(div => {
            const mennyiseg = parseInt(div.querySelector('.quantity').textContent);
            if (mennyiseg > 0) {
                adatok.push({
                    nev: div.dataset.name,
                    db: mennyiseg
                });
            }
        });
        return adatok;
    }

    // --- 1. GOMB: SIMA ÚJ MENTÉS ---
    document.getElementById('exportButton').addEventListener('click', async () => {
        const adatok = getAktualisAdatok();
        if (adatok.length === 0) return alert("Nincs mit menteni!");

        const vegosszeg = parseInt(totalPriceElement.textContent.replace(/\D/g, ''));

        try {
            const response = await fetch(`${API}/mentes.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tetelek: adatok, osszesen: vegosszeg })
            });
            const result = await response.json();

            if (result.status === "success") {
//                alert("✅ Adatbázisba mentve!");
                resetToNormalMode();
                refreshDailyStats();
            } else {
                alert("❌ Szerver hiba: " + result.message);
            }
        } catch (err) {
            alert("❌ Hiba történt a küldés során!");
        }
    });

    // --- 2. GOMB: MÓDOSÍTÁS MENTÉSE ---
    document.getElementById('updateButton').addEventListener('click', async () => {
        const adatok = getAktualisAdatok();
        const vegosszeg = parseInt(totalPriceElement.textContent.replace(/\D/g, ''));

        // Itt a trükk: ha a sima változó null, megpróbáljuk a window-ból kiszedni
        const veglegesId = currentSelectedId || window.elmentettSzerkesztoId;

        const payload = {
            id: veglegesId, // Ezt küldjük el a PHP-nak
            tetelek: adatok,
            osszesen: vegosszeg
        };

        try {
            const response = await fetch(`${API}/modositas.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.status === "success") {
 //               alert("✏️ Sikeresen módosítva!");
                resetToNormalMode();
                refreshDailyStats();
            } else {
                alert("❌ Szerver hiba: " + result.message);
            }
        } catch (err) {
            alert("❌ Hiba történt a frissítés során!");
        }
    });

    // --- UTOLSÓ SOR TÖRLÉSE ---
    document.getElementById('deleteLastButton').addEventListener('click', async () => {
        if (!confirm("Biztosan törlöd az UTOLSÓ mentett bejegyzést az adatbázisból?")) return;
        try {
            const response = await fetch(`${API}/torles.php`);
            const result = await response.json();
            if (result.status === "success") {
    //            alert("🗑️ " + result.message);
                refreshDailyStats();
            } else {
                alert("❌ Hiba: " + result.message);
            }
        } catch (err) {
            alert("❌ Hiba történt a törlés során!");
        }
    });

    async function refreshDailyStats() {
        try {
            const response = await fetch(`${API}/napi_lista.php?t=` + new Date().getTime());
            const data = await response.json();
            const listContainer = document.getElementById('dailyList');
            const totalContainer = document.getElementById('todayGrandTotal');

            let html = '';
            let sum = 0;
            window.currentDailyMunkak = data;

            data.forEach(row => {
                html += `<div class="daily-row" onclick="openBottomSheet(${row.id})" style="cursor:pointer;">
                            <span>🕒 ${row.ido}</span>
                            <strong>${formatCurrency(row.osszesen)}</strong>
                         </div>`;
                sum += parseInt(row.osszesen);
            });

            listContainer.innerHTML = html || '<p style="font-size: 0.8em; color: gray; text-align:center;">Még nincs mai mentés.</p>';
            totalContainer.textContent = formatCurrency(sum);
        } catch (err) {
            console.error("Hiba a statisztika frissítésekor:", err);
        }
    }

    window.triggerRefreshStats = refreshDailyStats;
    refreshDailyStats();
});