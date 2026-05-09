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
    saveButton.addEventListener('click', () => {
        const adatok = [];
        let vegosszeg = 0;

        // Adatok összegyűjtése (a nullásokkal együtt)
        document.querySelectorAll('.activity').forEach(activityDiv => {
            const nev = activityDiv.querySelector('h3').textContent;
            const mennyiseg = parseInt(activityDiv.querySelector('.quantity').textContent) || 0;
            const ar = parseInt(activityDiv.dataset.price);

            adatok.push({
                tevekenyseg: nev,
                mennyiseg: mennyiseg
            });

            vegosszeg += ar * mennyiseg;
        });

        if (adatok.length === 0) return alert("Nincs mit menteni!");

        const googleUrl = "IDE_MÁSOLD_BE_A_SCRIPT_URL_EDET";

        // --- VIZUÁLIS VISSZAJELZÉS INDÍTÁSA ---
        saveButton.disabled = true;       // Kattintás letiltása
        saveButton.style.opacity = "0.3"; // Erős elhalványítás
        saveButton.style.cursor = "wait"; // Homokóra kurzor (gépen látszik)

        fetch(googleUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tetelek: adatok, osszesen: vegosszeg })
        })
            .then(() => {
                // Sikeres "küldés" után (no-cors esetén ez szinte azonnali)
                console.log("Adat elküldve a Google-nek");
            })
            .catch(err => {
                console.error("Hiba:", err);
                alert("Hiba történt a küldés során!");
            })
            .finally(() => {
                // Várunk 1.5 másodpercet, hogy a felhasználó lássa: történt valami,
                // majd visszaállítunk mindent az eredeti állapotra.
                setTimeout(() => {
                    saveButton.disabled = false;
                    saveButton.style.opacity = "1";
                    saveButton.style.cursor = "pointer";

                    // Értesítés és nullázás
                    alert("✅ Mentés sikeres!");
                    document.querySelectorAll('.quantity').forEach(span => span.textContent = '0');
                    updateTotalPrice();
                }, 1500);
            });
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
function doPost(e) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    var data = JSON.parse(e.postData.contents);

    var most = new Date();
    var datum = Utilities.formatDate(most, "GMT+1", "yyyy-MM-dd");
    var ido = Utilities.formatDate(most, "GMT+1", "HH:mm:ss");

    // Összeállítjuk a sort: [Dátum, Idő, ...tevékenységek értékei..., Végösszeg]
    // Fontos: Itt a sorrendnek egyeznie kell a táblázat fejlécével!
    var ujSor = [
        datum,
        ido
    ];

    // Sorban hozzáadjuk a mennyiségeket (a 0-t is!)
    data.tetelek.forEach(function (t) {
        ujSor.push(t.mennyiseg);
    });

    // A legvégére odatesszük a napi összkeresetet
    ujSor.push(data.osszesen);

    sheet.appendRow(ujSor);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
        .setMimeType(ContentService.MimeType.JSON);
}