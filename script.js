const levels = [
    { id: 1, pairs: 2, time: 20 },
    { id: 2, pairs: 3, time: 25 },
    { id: 3, pairs: 4, time: 30 },
    { id: 4, pairs: 6, time: 45 },
    { id: 5, pairs: 8, time: 60 },
    { id: 6, pairs: 10, time: 80 },
    { id: 7, pairs: 12, time: 100 },
    { id: 8, pairs: 15, time: 130 },
    { id: 9, pairs: 18, time: 160 },
    { id: 10, pairs: 20, time: 200 }
];

const symbols = ['🧠', '⚡', '🌟', '💎', '🔥', '🌈', '🍀', '🍎', '🚀', '🛸', '👾', '🎸', '🎨', '🧩', '🔑', '🔔', '🌍', '🌙', '☀️', '🌸'];

let currentLevel = 0;
let score = 0;
let timer;
let timeLeft;
let flippedCards = [];
let matchedPairs = 0;
let isGameActive = false;

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');
const levelDisplay = document.getElementById('level-display');
const pulseOverlay = document.getElementById('pulse-overlay');

// Buttons
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('next-btn').addEventListener('click', nextLevel);
document.getElementById('whatsapp-share-btn').addEventListener('click', shareOnWhatsApp);
document.getElementById('restart-btn').addEventListener('click', () => {
    currentLevel = 0;
    score = 0;
    startGame();
});

function startGame() {
    showScreen('game-screen');
    loadLevel(currentLevel);
}

function shareOnWhatsApp() {
    const levelStr = currentLevel + 1;
    const scoreStr = score;
    const githubLink = "https://github.com/snr-project/anti-alzheimer"; // Buraya gerçek linkinizi ekleyebilirsiniz
    
    const message = `🧠 Zihnimi SNR ile güçlendiriyorum!\nAnti-Alzheimer oyununda ${levelStr}. seviyeye ulaştım ve ${scoreStr} puan topladım!\nBakalım sen beni geçebilecek misin?\nHemen dene: ${githubLink}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function loadLevel(levelIndex) {
    const levelData = levels[levelIndex];
    matchedPairs = 0;
    flippedCards = [];
    isGameActive = true;
    timeLeft = levelData.time;
    
    levelDisplay.textContent = levelData.id;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    pulseOverlay.classList.remove('pulse-active');
    
    generateBoard(levelData.pairs);
    startTimer();
}

function generateBoard(pairCount) {
    gameBoard.innerHTML = '';
    const levelSymbols = symbols.slice(0, pairCount);
    const gameSymbols = [...levelSymbols, ...levelSymbols];
    shuffle(gameSymbols);
    
    // Adjust grid columns based on pair count
    let cols = 2;
    if (pairCount > 15) cols = 8;
    else if (pairCount > 8) cols = 6;
    else if (pairCount > 4) cols = 4;
    else if (pairCount > 2) cols = 3;
    
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    gameSymbols.forEach(symbol => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-front">?</div>
            <div class="card-back">${symbol}</div>
        `;
        card.addEventListener('click', () => flipCard(card, symbol));
        gameBoard.appendChild(card);
    });
}

function flipCard(card, symbol) {
    if (!isGameActive || card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length === 2) return;
    
    card.classList.add('flipped');
    flippedCards.push({ card, symbol });
    
    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.symbol === card2.symbol) {
        matchedPairs++;
        score += 10 + (currentLevel * 5);
        scoreDisplay.textContent = score;
        
        card1.card.classList.add('matched');
        card2.card.classList.add('matched');
        
        createParticles(card2.card);
        playPositiveSound();
        
        flippedCards = [];
        
        if (matchedPairs === levels[currentLevel].pairs) {
            endLevel(true);
        }
    } else {
        setTimeout(() => {
            card1.card.classList.remove('flipped');
            card2.card.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 5) {
            pulseOverlay.classList.add('pulse-active');
        }
        
        if (timeLeft <= 0) {
            endLevel(false);
        }
    }, 1000);
}

function endLevel(success) {
    clearInterval(timer);
    isGameActive = false;
    pulseOverlay.classList.remove('pulse-active');
    
    setTimeout(() => {
        showScreen('result-screen');
        const title = document.getElementById('result-title');
        const message = document.getElementById('result-message');
        const nextBtn = document.getElementById('next-btn');
        const restartBtn = document.getElementById('restart-btn');
        const whatsappBtn = document.getElementById('whatsapp-share-btn');
        
        document.getElementById('final-level').textContent = currentLevel + 1;
        document.getElementById('final-time').textContent = levels[currentLevel].time - timeLeft;
        document.getElementById('final-score').textContent = score;
        
        if (success) {
            if (currentLevel === levels.length - 1) {
                title.textContent = "TEBRİKLER!";
                message.textContent = "Tüm seviyeleri tamamlayarak zihnini en üst seviyeye taşıdın! (by SNR)";
                nextBtn.classList.add('hidden');
                restartBtn.classList.remove('hidden');
                whatsappBtn.classList.remove('hidden');
            } else {
                title.textContent = "Harika!";
                message.textContent = `${currentLevel + 1}. Seviyeyi başarıyla tamamladın.`;
                nextBtn.classList.remove('hidden');
                restartBtn.classList.add('hidden');
                whatsappBtn.classList.remove('hidden');
            }
        } else {
            title.textContent = "Süre Doldu!";
            message.textContent = "Zihnini biraz daha dinlendirip tekrar dene.";
            nextBtn.classList.add('hidden');
            restartBtn.classList.remove('hidden');
            whatsappBtn.classList.remove('hidden'); // Kaybedince de paylaşabilsin
        }
    }, 500);
}

function nextLevel() {
    currentLevel++;
    startGame();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        document.body.appendChild(particle);
        
        const destinationX = (Math.random() - 0.5) * 200;
        const destinationY = (Math.random() - 0.5) * 200;
        const rotation = Math.random() * 360;
        
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        
        const animation = particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${destinationX}px, ${destinationY}px) scale(0) rotate(${rotation}deg)`, opacity: 0 }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        });
        
        animation.onfinish = () => particle.remove();
    }
}

function playPositiveSound() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
}

// LocalStorage for High Scores
function saveHighScore() {
    const highScores = JSON.parse(localStorage.getItem('anti-alzheimer-scores') || '[]');
    highScores.push({ score, date: new Date().toLocaleDateString() });
    highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem('anti-alzheimer-scores', JSON.stringify(highScores.slice(0, 5)));
}
