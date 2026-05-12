document.addEventListener('DOMContentLoaded', () => {
    const activities = [
        ['LHM csere', 8500],
        ['LHM rollout / PÜK', 12750],
        ['KMSZ csere', 2210],
        ['Kötőelem', 2300],
        ['HMKE / Mintavétel', 17000],
        ['Kisablak / HA / Készülék', 5100],
        ['Tábla csere', 1700],
        ['Plombálás', 5500],
        ['Műszaki', 7200],
        ['Kikapcsolás', 22000],
        ['Kódolt jelzés', 7225],
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
        if (confirm("Nullázod a mai tételeket?")) {
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
            } else {
                alert("❌ Hiba: " + result.message);
            }
        } catch (err) {
            alert("❌ Hiba történt a törlés során! Ellenőrizd az internetkapcsolatot.");
            console.error("Törlési hiba:", err);
        }
    });
});