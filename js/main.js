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

    // Reset funkció
    document.getElementById('resetButton').addEventListener('click', () => {
        if (confirm("Nullázod az aktuális tételeket?")) {
            document.querySelectorAll('.quantity').forEach(s => s.textContent = '0');
            updateTotal();
        }
    });

    // --- MENTÉS BEKÖTÉSE ---
    document.getElementById('exportButton').addEventListener('click', async () => {
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

        if (adatok.length === 0) return alert("Nincs mit menteni!");

        // Összeg kiszedése (csak a számok kellenek belőle)
        const vegosszeg = parseInt(totalPriceElement.textContent.replace(/\D/g, ''));

        try {
            // A '/' jel miatt a főkönyvtárban keresi a mentes.php-t
            const response = await fetch('/mentes.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tetelek: adatok, osszesen: vegosszeg })
            });

            const result = await response.json();

            if (result.status === "success") {
                alert("✅ Adatbázisba mentve!");
                // Nullázás mentés után
                document.querySelectorAll('.quantity').forEach(s => s.textContent = '0');
                updateTotal();
                refreshDailyStats(); // Frissítjük a napi statisztikát
            } else {
                alert("❌ Szerver hiba: " + result.message);
            }
        } catch (err) {
            alert("❌ Hiba történt a küldés során! Ellenőrizd a kapcsolatot.");
            console.error(err);
        }
    });
    // --- UTOLSÓ SOR TÖRLÉSE ---
    document.getElementById('deleteLastButton').addEventListener('click', async () => {
        // Először rákérdezünk, hogy ne legyen véletlen törlés
        if (!confirm("Biztosan törlöd az UTOLSÓ mentett bejegyzést az adatbázisból?")) return;

        try {
            // Meghívjuk a törlő PHP-t
            const response = await fetch('/torles.php');
            const result = await response.json();

            if (result.status === "success") {
                alert("🗑️ " + result.message);
                refreshDailyStats(); // Frissítjük a napi statisztikát
            } else {
                alert("❌ Hiba: " + result.message);
            }
        } catch (err) {
            alert("❌ Hiba történt a törlés során! Ellenőrizd az internetkapcsolatot.");
            console.error("Törlési hiba:", err);
        }
    });
    async function refreshDailyStats() {
        try {
            const response = await fetch('/napi_lista.php');
            const data = await response.json();

            const listContainer = document.getElementById('dailyList');
            const totalContainer = document.getElementById('todayGrandTotal');

            let html = '';
            let sum = 0;

            data.forEach(row => {
                html += `<div class="daily-row">
                        <span>${row.ido}</span>
                        <span>${parseInt(row.osszesen).toLocaleString('hu-HU')} Ft</span>
                     </div>`;
                sum += parseInt(row.osszesen);
            });

            listContainer.innerHTML = html || '<p style="font-size: 0.8em; color: gray;">Még nincs mai mentés.</p>';
            totalContainer.textContent = sum.toLocaleString('hu-HU') + " Ft";

        } catch (err) {
            console.error("Hiba a statisztika frissítésekor:", err);
        }
    }
    refreshDailyStats();
});