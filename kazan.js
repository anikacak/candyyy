const collectEarningsButton = document.getElementById('collect-earnings');
const hourlyEarningsDisplay = document.getElementById('hourly-earnings');
const earningsPerCollection = 350; // Kazanç miktarı
const collectionInterval = 3 * 60 * 60 * 1000; // 3 saat

let lastCollectionTime = localStorage.getItem('lastCollectionTime') || Date.now();
let hourlyEarnings = parseInt(localStorage.getItem('hourlyEarnings')) || 0;

// Kazanç butonuna tıklama olayı
collectEarningsButton.addEventListener('click', () => {
    const now = Date.now();
    const timeElapsed = now - lastCollectionTime;

    if (timeElapsed >= collectionInterval) {
        // 3 saat tamamlandıysa kazancı ekle
        hourlyEarnings += earningsPerCollection;
        score += earningsPerCollection; // Kazancı skora ekle
        localStorage.setItem('hourlyEarnings', hourlyEarnings);
        localStorage.setItem('score', score);
        lastCollectionTime = now;
        localStorage.setItem('lastCollectionTime', lastCollectionTime);
        alert(`You have collected ${earningsPerCollection} score!`);
    } else {
        const timeRemaining = Math.ceil((collectionInterval - timeElapsed) / 60000);
        alert(`You can collect earnings again in ${timeRemaining} minutes.`);
    }
    updateEarningsDisplay();
});

// Ekranı güncelle
function updateEarningsDisplay() {
    hourlyEarningsDisplay.textContent = `Hourly Earnings: ${hourlyEarnings}`;
}

// Sayfa yüklendiğinde kazancı ve toplama zamanını yükleme
window.addEventListener('load', () => {
    updateEarningsDisplay();
});
