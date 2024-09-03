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
        addTouchEvents(candy);

        game.appendChild(candy);
        candies.push(candy);
    }
    loadGameState();
    checkMatches();
    updateHourlyEarnings();
}

function addTouchEvents(candy) {
    candy.addEventListener('touchstart', dragStart);
    candy.addEventListener('touchend', dragEnd);
    candy.addEventListener('touchmove', (e) => {
        e.preventDefault();
        dragOver(e);
    });
    candy.addEventListener('touchend', dragDrop);
}

// Şekerlerin patlatılması ve düşürülmesi
function checkMatches() {
    let matched = false;
    const matches = [];

    // Satırda eşleşmeleri kontrol et
    for (let i = 0; i < width * width; i++) {
        const candy = candies[i];
        const color = candy.style.backgroundColor;

        // Satırda 3 veya daha fazla eşleşme
        if (i % width < width - 2) {
            const match = [candy, candies[i + 1], candies[i + 2]];
            if (match.every(c => c.style.backgroundColor === color)) {
                matched = true;
                matches.push(...match);
            }
        }

        // Sütunda 3 veya daha fazla eşleşme
        if (i < (width * (width - 2))) {
            const match = [candy, candies[i + width], candies[i + 2 * width]];
            if (match.every(c => c.style.backgroundColor === color)) {
                matched = true;
                matches.push(...match);
            }
        }
    }

    if (matched) {
        // Eşleşen şekerleri patlat ve puanı artır
        const uniqueMatches = [...new Set(matches)];
        let matchCount = uniqueMatches.length;
        let points = 0;

        uniqueMatches.forEach(candy => {
            candy.classList.add('burst'); // Patlayan şeker animasyonu
            setTimeout(() => {
                candy.style.backgroundColor = 'white'; // Patlayan şekerleri beyaza çevir
                candy.classList.remove('burst'); // Animasyon sınıfını kaldır
            }, 500);
        });

        // Her eşleşen şeker için puan ekle
        points = matchCount;
        score += points;
        scoreDisplay.textContent = `Score: ${score}`;

        saveGameState(); // Puan ve şeker durumunu kaydet

        setTimeout(() => {
            dropCandies(); // Patlayan şekerlerden sonra yeni şekerleri yerleştir
            checkMatches(); // Yeni eşleşmeleri kontrol et
        }, 500);
    } else if (selectedCandy && draggedCandy) {
        // Eşleşme yoksa şekerleri eski haline döndür
        setTimeout(() => {
            selectedCandy.style.backgroundColor = selectedCandy.dataset.originalColor;
            draggedCandy.style.backgroundColor = draggedCandy.dataset.originalColor;
        }, 500);
    }
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

function dragStart(e) {
    if (e.touches) e = e.touches[0];
    selectedCandy = e.target;
    selectedIndex = candies.indexOf(selectedCandy);
    selectedCandy.dataset.originalColor = selectedCandy.style.backgroundColor; // Orijinal rengi sakla
}

function dragEnd(e) {
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
