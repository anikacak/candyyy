const game = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
const hourlyEarningsDisplay = document.getElementById('hourly-earnings');
const collectEarningsButton = document.getElementById('collect-earnings');
const colors = ['red', 'yellow', 'orange', 'green', 'blue', 'purple'];
const width = 8; // 8x8 grid
let candies = [];
let selectedCandy = null;
let draggedCandy = null;
let selectedIndex = null;
let draggedIndex = null;
let score = 0;
let lastCollectTime = localStorage.getItem('lastCollectTime') ? new Date(localStorage.getItem('lastCollectTime')) : new Date();

// Şekerlerin ve puanın yerel depolamada saklanması
function saveGameState() {
    const candyStates = candies.map(candy => candy.style.backgroundColor);
    localStorage.setItem('candyStates', JSON.stringify(candyStates));
    localStorage.setItem('score', score);
    localStorage.setItem('lastCollectTime', lastCollectTime.toISOString());
}

function loadGameState() {
    const candyStates = JSON.parse(localStorage.getItem('candyStates'));
    if (candyStates) {
        candies.forEach((candy, index) => {
            candy.style.backgroundColor = candyStates[index];
        });
    }
    const savedScore = localStorage.getItem('score');
    if (savedScore) {
        score = parseInt(savedScore);
        scoreDisplay.textContent = `Score: ${score}`;
    }
    const savedLastCollectTime = localStorage.getItem('lastCollectTime');
    if (savedLastCollectTime) {
        lastCollectTime = new Date(savedLastCollectTime);
    }
}

// Şekerleri oluşturma ve ızgaraya ekleme
function createBoard() {
    candies = [];
    for (let i = 0; i < width * width; i++) {
        const candy = document.createElement('div');
        candy.classList.add('candy');
        candy.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        candy.setAttribute('draggable', true);
        candy.addEventListener('dragstart', dragStart);
        candy.addEventListener('dragend', dragEnd);
        candy.addEventListener('dragover', dragOver);
        candy.addEventListener('drop', dragDrop);

        // Mobil cihazlarda dokunmatik sürüklemeyi desteklemek için ekleyin
        candy.addEventListener('touchstart', touchStart);
        candy.addEventListener('touchmove', touchMove);
        candy.addEventListener('touchend', touchEnd);

        game.appendChild(candy);
        candies.push(candy);
    }
    loadGameState(); // Önceki durumları yükle
    checkMatches(); // Eşleşmeleri kontrol et
    updateHourlyEarnings(); // Saatlik kazancı güncelle
}

// Dokunmatik olay işleyicileri
function touchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    selectedCandy = document.elementFromPoint(touch.clientX, touch.clientY);
    selectedIndex = candies.indexOf(selectedCandy);
    selectedCandy.dataset.originalColor = selectedCandy.style.backgroundColor; // Orijinal rengi sakla
}

function touchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    draggedCandy = document.elementFromPoint(touch.clientX, touch.clientY);
    draggedIndex = candies.indexOf(draggedCandy);
}

function touchEnd(e) {
    e.preventDefault();
    if (draggedCandy && selectedCandy) {
        const targetIndex = candies.indexOf(draggedCandy);
        if (isValidMove(selectedIndex, targetIndex)) {
            // Geçerli bir hareketse şekerleri yer değiştir
            const selectedColor = selectedCandy.style.backgroundColor;
            const targetColor = draggedCandy.style.backgroundColor;

            selectedCandy.style.backgroundColor = targetColor;
            draggedCandy.style.backgroundColor = selectedColor;

            // Eşleşmeleri kontrol et
            checkMatches();
        } else {
            // Geçersiz hareketse şekerleri eski haline getir
            setTimeout(() => {
                selectedCandy.style.backgroundColor = selectedCandy.dataset.originalColor;
                draggedCandy.style.backgroundColor = draggedCandy.dataset.originalColor;
            }, 500);
        }
    }

    selectedCandy = null;
    draggedCandy = null;
    selectedIndex = null;
    draggedIndex = null;
}

function dragStart(e) {
    selectedCandy = e.target;
    selectedIndex = candies.indexOf(selectedCandy);
    selectedCandy.dataset.originalColor = selectedCandy.style.backgroundColor; // Orijinal rengi sakla
}

function dragEnd() {
    if (draggedCandy && selectedCandy) {
        const targetIndex = candies.indexOf(draggedCandy);
        if (isValidMove(selectedIndex, targetIndex)) {
            // Geçerli bir hareketse şekerleri yer değiştir
            const selectedColor = selectedCandy.style.backgroundColor;
            const targetColor = draggedCandy.style.backgroundColor;

            selectedCandy.style.backgroundColor = targetColor;
            draggedCandy.style.backgroundColor = selectedColor;

            // Eşleşmeleri kontrol et
            checkMatches();
        } else {
            // Geçersiz hareketse şekerleri eski haline getir
            setTimeout(() => {
                selectedCandy.style.backgroundColor = selectedCandy.dataset.originalColor;
                draggedCandy.style.backgroundColor = draggedCandy.dataset.originalColor;
            }, 500);
        }
    }

    selectedCandy = null;
    draggedCandy = null;
    selectedIndex = null;
    draggedIndex = null;
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop(e) {
    e.preventDefault();
    draggedCandy = e.target;
    draggedIndex = candies.indexOf(draggedCandy);
}

// Saatlik kazanç hesaplaması
function updateHourlyEarnings() {
    const now = new Date();
    const elapsedTime = now - lastCollectTime;
    const hoursElapsed = Math.floor(elapsedTime / (1000 * 60 * 60));
    const earnings = Math.floor(hoursElapsed / 3) * 350;
    hourlyEarningsDisplay.textContent = `Hourly Earnings: ${earnings} Score`;
}

// Kazancı toplama işlevi
function collectEarnings() {
    const now = new Date();
    const elapsedTime = now - lastCollectTime;
    if (elapsedTime >= 3 * 60 * 60 * 1000) { // 3 saat
        score += 350;
        scoreDisplay.textContent = `Score: ${score}`;
        saveGameState();
        lastCollectTime = now;
        localStorage.setItem('lastCollectTime', lastCollectTime.toISOString());
        updateHourlyEarnings();
    } else {
        alert('3 saat dolmadan önce kazanç toplamazsınız.');
    }
}

// Oyun başlatma
createBoard();
collectEarningsButton.addEventListener('click', collectEarnings);
setInterval(updateHourlyEarnings, 60000); // Her dakikada bir saatlik kazancı güncelle
