document.addEventListener('DOMContentLoaded', () => {
    // 2D-s tömb a tevékenységek és áraik tárolására
    const activities = [
        ['LHM csere', 8500],
        ['LHM rollout', 12750],
        ['KMSZ csere', 2210],
        ['Kötőelem', 2300],
        ['HMKE', 17000],
        ['Ablak fel', 5100],
        ['Tábla csere', 1700],
        ['Plombálás', 5500],
        ['Kikapcsolás', 22000],
        ['Mágneskapcsoló', 5100],
        ['EJKV', 12750],
        ['TJKV kicsi', 25500],
        ['TJKV nagy', 72250],
        ['PÜK cím', 12750],
        ['Mintavétel', 17000],        
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
});