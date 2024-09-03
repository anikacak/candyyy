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

        // Mobil uyumluluk için touch olaylarını ekle
        candy.addEventListener('touchstart', dragStart);
        candy.addEventListener('touchend', dragEnd);
        candy.addEventListener('touchmove', (e) => {
            e.preventDefault();
            dragOver(e);
        });
        candy.addEventListener('touchend', dragDrop);

        game.appendChild(candy);
        candies.push(candy);
    }
    loadGameState();
    checkMatches();
    updateHourlyEarnings();
}

function dragStart(e) {
    e.preventDefault();
    if (e.touches) e = e.touches[0];
    selectedCandy = e.target;
    selectedIndex = candies.indexOf(selectedCandy);
    selectedCandy.dataset.originalColor = selectedCandy.style.backgroundColor; // Orijinal rengi sakla
}

function dragEnd(e) {
    e.preventDefault();
    if (e.touches) e = e.touches[0];
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
    if (e.touches) e = e.touches[0];
    draggedCandy = e.target;
    draggedIndex = candies.indexOf(draggedCandy);

    // Düşürme olayını işlemek için
    if (selectedCandy && draggedCandy) {
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

// Şekerlerin üstten düşmesini sağlama
function dropCandies() {
    for (let col = 0; col < width; col++) {
        let emptySpaces = [];

        // Her sütunda boşlukları ve dolu şekerleri yönet
        for (let row = width - 1; row >= 0; row--) {
            const index = row * width + col;
            const candy = candies[index];
            if (candy.style.backgroundColor === 'white') {
                emptySpaces.push(index);
            } else if (emptySpaces.length > 0) {
                const emptyIndex = emptySpaces.shift();
                candies[emptyIndex].style.backgroundColor = candy.style.backgroundColor;
                candy.style.backgroundColor = 'white';
                emptySpaces.push(index);
            }
        }

        // Boşlukları doldurmak için üstten yeni şekerler ekle
        emptySpaces.forEach(index => {
            candies[index].style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            candies[index].classList.add('move'); // Hareket animasyonu
        });
    }
}

// Şekerlerin geçerli bir hareket olup olmadığını kontrol et
function isValidMove(fromIndex, toIndex) {
    const fromRow = Math.floor(fromIndex / width);
    const fromCol = fromIndex % width;
    const toRow = Math.floor(toIndex / width);
    const toCol = toIndex % width;

    // Komşu hücreleri kontrol et
    return (Math.abs(fromRow - toRow) === 1 && fromCol === toCol) || (Math.abs(fromCol - toCol) === 1 && fromRow === toRow);
}

// Kazançları toplama
function collectEarnings() {
    const now = new Date();
    const elapsedTime = now - lastCollectTime;
    const hoursElapsed = Math.floor(elapsedTime / (1000 * 60 * 60));
    const earnings = Math.floor(hoursElapsed / 3) * 350;
    score += earnings;
    scoreDisplay.textContent = `Score: ${score}`;
    lastCollectTime = now;
    saveGameState(); // Kazançları ve zaman bilgisini kaydet
    updateHourlyEarnings(); // Kazançları güncelle
}

// Oyun başlatma
createBoard();
collectEarningsButton.addEventListener('click', collectEarnings);
