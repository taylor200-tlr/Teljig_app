document.addEventListener('DOMContentLoaded', () => {
    // 2D-s tömb a tevékenységek és áraik tárolására
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
        ['EJKV', 12750],
        ['TJKV kicsi', 25500],
        ['TJKV nagy', 72250],
    ];

    const container = document.getElementById('activitiesContainer');
    const totalPriceElement = document.getElementById('totalPrice');

    // Funkció az elemek dinamikus generálásához
    function generateActivities() {
        activities.forEach(activity => {
            const activityName = activity[0];
            const activityPrice = activity[1];

            const activityDiv = document.createElement('div');
            activityDiv.classList.add('activity');
            activityDiv.setAttribute('data-price', activityPrice);

            activityDiv.innerHTML = `
                <h3>${activityName}</h3>
                <div class="controls">
                    <button class="decrease"> - </button>
                    <span class="quantity">0</span>
                    <button class="increase"> + </button>
                </div>
            `;
            container.appendChild(activityDiv);
        });
    }

    // A weboldal elemeinek generálása
    generateActivities();

    // Esemény delegálás a fő konténeren
    container.addEventListener('click', (event) => {
        if (event.target.classList.contains('decrease') || event.target.classList.contains('increase')) {
            const activityDiv = event.target.closest('.activity');
            const quantitySpan = activityDiv.querySelector('.quantity');

            let currentQuantity = parseInt(quantitySpan.textContent);

            if (event.target.classList.contains('increase')) {
                currentQuantity++;
            } else if (event.target.classList.contains('decrease') && currentQuantity > 0) {
                currentQuantity--;
            }

            quantitySpan.textContent = currentQuantity;
            updateTotalPrice();
        }
    });

    // Összesített ár frissítése
    function updateTotalPrice() {
        let totalPrice = 0;

        document.querySelectorAll('.activity').forEach(activityDiv => {
            const price = parseInt(activityDiv.dataset.price);
            const quantity = parseInt(activityDiv.querySelector('.quantity').textContent);

            totalPrice += price * quantity;
        });

        const formattedPrice = totalPrice.toLocaleString('hu-HU'); // 'hu-HU' a magyar nyelvhez
        totalPriceElement.textContent = `Összesen: ${formattedPrice} Ft`;
    }

    // Az első renderelés utáni kezdeti ár beállítása
    updateTotalPrice();

    // Reset gomb eseménykezelője
    const resetButton = document.getElementById('resetButton');

    resetButton.addEventListener('click', () => {
        if (confirm("Biztosan törölni szeretnéd a jelenlegi kiválasztást?")) {
            // Minden darabszámot nullára állítunk
            document.querySelectorAll('.quantity').forEach(span => {
                span.textContent = '0';
            });
            // Frissítjük az összesített árat
            updateTotalPrice();
        }
    });

    // Statisztika gomb (egyelőre csak egy üzenet, de ide jöhet a szűrés logikája)
    const statsButton = document.getElementById('statsButton');
    statsButton.addEventListener('click', () => {
        alert("Itt nyílhatna meg a naptár alapú szűrő felület!");
    });

    // MENTÉS GOMB LOGIKÁJA
    const saveButton = document.getElementById('saveButton');

    saveButton.addEventListener('click', () => {
        const adatok = [];
        let vegosszeg = 0;
        const most = new Date();
        const datumString = most.toLocaleDateString('hu-HU');

        // Adatok összegyűjtése
        document.querySelectorAll('.activity').forEach(activityDiv => {
            const nev = activityDiv.querySelector('h3').textContent;
            const mennyiseg = parseInt(activityDiv.querySelector('.quantity').textContent);
            const ar = parseInt(activityDiv.dataset.price);

            if (mennyiseg > 0) {
                adatok.push({
                    datum: datumString,
                    tevekenyseg: nev,
                    mennyiseg: mennyiseg,
                    ar: ar,
                    reszosszeg: ar * mennyiseg
                });
                vegosszeg += ar * mennyiseg;
            }
        });

        if (adatok.length === 0) {
            alert("Nincs mit menteni!");
            return;
        }

        // CSV tartalom összeállítása (Dátum, Tevékenység, Mennyiség, Ár, Összeg)
        let csvContent = "\uFEFF"; // UTF-8 BOM a magyar ékezetek miatt
        csvContent += "Dátum;Tevékenység;Mennyiség;Egységár;Részösszeg\n";

        adatok.forEach(sor => {
            csvContent += `${sor.datum};${sor.tevekenyseg};${sor.mennyiseg};${sor.ar};${sor.reszosszeg}\n`;
        });
        csvContent += `;;;ÖSSZESEN:;${vegosszeg}\n`;

        // Fájl létrehozása és letöltése
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        // Fájlnév generálása (pl: munka_2026-05-09.csv)
        const fajlNev = `munka_${most.toISOString().split('T')[0]}.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", fajlNev);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(`✅ Fájl elkészült: ${fajlNev}\nNézd meg a Letöltések mappában!`);

        // Nullázás
        document.querySelectorAll('.quantity').forEach(span => span.textContent = '0');
        updateTotalPrice();
    });
    const deleteLastButton = document.getElementById('deleteLastButton');

    deleteLastButton.addEventListener('click', () => {
        if (confirm("Biztosan törölni szeretnéd az UTOLSÓ mentett bejegyzést az adatbázisból?")) {
            fetch('http://localhost:3000/api/utolso-torles', {
                method: 'DELETE' // DELETE metódust használunk a törléshez
            })
                .then(res => res.json())
                .then(valasz => {
                    alert(valasz.message);
                })
                .catch(err => {
                    console.error("Hiba:", err);
                    alert("Nem sikerült a törlés.");
                });
        }
    });
});