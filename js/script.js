document.addEventListener('DOMContentLoaded', () => {
    // Megkeressük a fő konténert, ami az összes tevékenységet tartalmazza
    const container = document.body;

    // Hozzáadjuk az eseménykezelőt a fő konténerhez
    container.addEventListener('click', (event) => {
        // Ellenőrizzük, hogy a kattintás a - vagy + gomb valamelyikére történt-e
        if (event.target.classList.contains('decrease') || event.target.classList.contains('increase')) {
            
            // Megkeressük a szülő .activity elemet
            const activityDiv = event.target.closest('.activity');
            const quantitySpan = activityDiv.querySelector('.quantity');
            
            let currentQuantity = parseInt(quantitySpan.textContent);

            if (event.target.classList.contains('increase')) {
                currentQuantity++;
            } else if (event.target.classList.contains('decrease') && currentQuantity > 0) {
                currentQuantity--;
            }
            
            // Frissítjük a darabszámot
            quantitySpan.textContent = currentQuantity;

            // Frissítjük az összesített árat
            updateTotalPrice();
        }
    });

    function updateTotalPrice() {
        let totalPrice = 0;
        
        // Végigmegyünk az összes .activity elemen
        document.querySelectorAll('.activity').forEach(activityDiv => {
            const price = parseInt(activityDiv.dataset.price);
            const quantity = parseInt(activityDiv.querySelector('.quantity').textContent);
            
            totalPrice += price * quantity;
        });
        
        // Megjelenítjük az összesített árat a felületen
        document.getElementById('totalPrice').textContent = `Összesen: ${totalPrice} Ft`;
    }
});