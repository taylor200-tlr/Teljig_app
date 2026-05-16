let currentSelectedId = null;
let currentSelectedData = null;
const API = 'https://electroprime.hu';

// Kifelé is láthatóvá tesszuke a bezárást, hogy a HTML onclick is elérje
function closeBottomSheet() {
    document.getElementById('bottomSheet').classList.remove('open');
    currentSelectedId = null;
    currentSelectedData = null;
}

// Kifelé láthatóvá tesszük a megnyitást is
function openBottomSheet(id) {
    currentSelectedId = id;
    window.elmentettSzerkesztoId = id;
    const talalat = window.currentDailyMunkak.find(item => item.id == id);
    if (talalat) {
        currentSelectedData = JSON.parse(talalat.adatok_json);
        document.getElementById('sheetTitle').textContent = `${talalat.ido}-kori mentés`;
        document.getElementById('bottomSheet').classList.add('open');
    }
}

// --- SZERKESZTÉS GOMB KEZELÉSE ---
function handleEditClick() {
    if (!currentSelectedData) return;

    // 1. Minden számlálót ledfaultolunk nullára
    document.querySelectorAll('.activity').forEach(div => {
        div.querySelector('.quantity').textContent = '0';
    });

    // 2. Visszatöltjük a mentett mennyiségeket az appba
    currentSelectedData.forEach(mentettTetel => {
        document.querySelectorAll('.activity').forEach(div => {
            const nev = div.querySelector('h3').textContent;
            if (nev === mentettTetel.nev) {
                div.querySelector('.quantity').textContent = mentettTetel.db;
            }
        });
    });

    // 3. Újraszámoljuk a főoldali végösszeget
    window.triggerUpdateTotal();

    // 4. GOMBOK CSERÉJE: Sima elrejt, Módosítás megmutat
    document.getElementById('exportButton').style.display = 'none';
    document.getElementById('updateButton').style.display = 'block';

    // 5. Bezárjuk az alsó menüt
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
        document.querySelectorAll('.activity').forEach(div => {
            total += parseInt(div.dataset.price) * parseInt(div.querySelector('.quantity').textContent);
        });
        totalPriceElement.textContent = total.toLocaleString('hu-HU') + " Ft";
    }
    window.triggerUpdateTotal = updateTotal;

    // Reset funkció
    document.getElementById('resetButton').addEventListener('click', () => {
        if (confirm("Nullázod az aktuális tételeket?")) {
            resetToNormalMode();
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
                    nev: div.querySelector('h3').textContent,
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.status === "success") {
                alert("✏️ Sikeresen módosítva!");
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
                            <strong>${parseInt(row.osszesen).toLocaleString('hu-HU')} Ft</strong>
                         </div>`;
                sum += parseInt(row.osszesen);
            });

            listContainer.innerHTML = html || '<p style="font-size: 0.8em; color: gray; text-align:center;">Még nincs mai mentés.</p>';
            totalContainer.textContent = sum.toLocaleString('hu-HU') + " Ft";
        } catch (err) {
            console.error("Hiba a statisztika frissítésekor:", err);
        }
    }

    window.triggerRefreshStats = refreshDailyStats;
    refreshDailyStats();
});