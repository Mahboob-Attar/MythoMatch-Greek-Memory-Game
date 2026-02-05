const letters = [
    'α','β','γ','δ','ε','ζ','η','θ',
    'ι','κ','λ','μ'
];

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let matchedPairs = 0;
let totalAttempts = 0;
let correctMatches = 0;

let previewInterval = null;
let gameInterval = null;
let timeLeft;

/* ================= ELEMENTS ================= */

const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const attemptsDisplay = document.getElementById("attempts");
const timerDisplay = document.getElementById("timer");
const difficultySelect = document.getElementById("difficulty");
const endScreen = document.getElementById("end-screen");
const resultText = document.getElementById("result-text");
const percentageText = document.getElementById("percentage-text");
const circle = document.querySelector(".progress-ring__circle");

/* ================= TIMER RING ================= */

const radius = 28;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
    const offset = circumference - percent * circumference;
    circle.style.strokeDashoffset = offset;
}

/* ================= INTRO ================= */

function beginGame() {
    document.getElementById("intro-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
}

/* ================= DEMO ================= */

function showDemo() {
    document.getElementById("demo-modal").classList.add("show");
    runAutoDemo();
}

function closeDemo() {
    document.getElementById("demo-modal").classList.remove("show");
}

function runAutoDemo() {

    const demoBoard = document.getElementById("demo-board");
    const demoStatus = document.getElementById("demo-status");

    const demoLetters = ['α','β','α','β'];
    const cards = [];

    demoLetters.forEach(letter => {
        const card = document.createElement("div");
        card.classList.add("demo-card");
        card.dataset.letter = letter;
        demoBoard.appendChild(card);
        cards.push(card);
    });

    setTimeout(() => {
        flipDemo(cards[0]);
        flipDemo(cards[1]);
        demoStatus.textContent = "❌ Wrong Match";
    }, 800);

    setTimeout(() => {
        unflipDemo(cards[0]);
        unflipDemo(cards[1]);
    }, 2000);

    setTimeout(() => {
        flipDemo(cards[0]);
        flipDemo(cards[2]);
        demoStatus.textContent = "✅ Correct Match!";
    }, 3200);
}

function flipDemo(card) {
    card.textContent = card.dataset.letter;
    card.classList.add("flipped");
}

function unflipDemo(card) {
    card.textContent = "";
    card.classList.remove("flipped");
}

/* ================= GAME START ================= */

function startGame() {

    clearInterval(previewInterval);
    clearInterval(gameInterval);

    matchedPairs = 0;
    totalAttempts = 0;
    correctMatches = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = true;

    scoreDisplay.textContent = 0;
    attemptsDisplay.textContent = 0;
    endScreen.classList.remove("show");

    createBoard(true);

    let previewTime = 6;

    if (difficultySelect.value === "easy") previewTime = 11;
    else if (difficultySelect.value === "medium") previewTime = 9;
    else previewTime = 6;

    startPreview(previewTime);
}

/* ================= PREVIEW TIMER ================= */

function startPreview(seconds) {

    let remaining = seconds;

    timerDisplay.textContent = remaining;
    circle.style.stroke = "#00ffcc";
    setProgress(1);

    previewInterval = setInterval(() => {

        remaining--;
        timerDisplay.textContent = remaining;
        setProgress(remaining / seconds);

        if (remaining <= 0) {
            clearInterval(previewInterval);
            endPreview();
        }

    }, 1000);
}

function endPreview() {

    document.querySelectorAll(".card").forEach(card => {
        card.textContent = "";
        card.classList.remove("flipped");
    });

    lockBoard = false;
    startGameTimer(60);
}

/* ================= GAME TIMER ================= */

function startGameTimer(seconds) {

    timeLeft = seconds;
    timerDisplay.textContent = timeLeft;

    circle.style.stroke = "#ff4444";
    setProgress(1);

    gameInterval = setInterval(() => {

        timeLeft--;
        timerDisplay.textContent = timeLeft;
        setProgress(timeLeft / seconds);

        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            endGame(false);
        }

    }, 1000);
}

/* ================= BOARD ================= */

function createBoard(showAll) {

    board.innerHTML = "";
    const cards = shuffle([...letters, ...letters]);

    cards.forEach(letter => {

        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.letter = letter;

        if (showAll) {
            card.textContent = letter;
            card.classList.add("flipped");
        }

        card.addEventListener("click", flipCard);
        board.appendChild(card);
    });
}

/* ================= CARD CLICK ================= */

function flipCard() {

    if (lockBoard || this.classList.contains("flipped")) return;

    // 🔊 Reliable Sound Method
    const sound = new Audio("assets/click.wav");
    sound.play();

    this.textContent = this.dataset.letter;
    this.classList.add("flipped");

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkMatch();
}

/* ================= MATCH CHECK ================= */

function checkMatch() {

    totalAttempts++;
    attemptsDisplay.textContent = totalAttempts;

    if (firstCard.dataset.letter === secondCard.dataset.letter) {

        correctMatches++;
        matchedPairs++;
        scoreDisplay.textContent = correctMatches;

        resetTurn();

        if (matchedPairs === letters.length) {
            clearInterval(gameInterval);
            endGame(true);
        }

    } else {

        lockBoard = true;

        setTimeout(() => {
            firstCard.textContent = "";
            secondCard.textContent = "";
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            resetTurn();
        }, 800);
    }
}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

/* ================= END GAME ================= */

function endGame(win) {

    endScreen.classList.add("show");

    resultText.textContent = win
        ? "🎉 You Won!"
        : "⏳ Time Up!";

    let accuracy = totalAttempts > 0
        ? (correctMatches / totalAttempts) * 100
        : 0;

    percentageText.textContent =
        "Accuracy: " + accuracy.toFixed(1) + "%";
}

function restartGame() {
    endScreen.classList.remove("show");
    startGame();
}

/* ================= SHUFFLE ================= */

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// ================= ADVERTISEMENT SYSTEM =================

const adOverlay = document.getElementById("ad-overlay");
const skipBtn = document.getElementById("skip-ad");
const adTimer = document.getElementById("ad-timer");
const adVideo = document.getElementById("ad-video");

let skipTime = 5;
let adCountdown;

// Show Ad When Page Loads
window.addEventListener("load", () => {
    showAd();
});

function showAd() {
    adOverlay.style.display = "flex";
    adVideo.play();

    let timeLeft = skipTime;
    adTimer.innerText = "Ad • " + timeLeft;

    adCountdown = setInterval(() => {
        timeLeft--;
        adTimer.innerText = "Ad • " + timeLeft;

        if (timeLeft <= 0) {
            clearInterval(adCountdown);
            skipBtn.disabled = false;
            adTimer.innerText = "You can skip now";
        }
    }, 1000);
}

// Skip Button
skipBtn.addEventListener("click", () => {
    closeAd();
});

// // Auto close when video ends
// adVideo.addEventListener("ended", () => {
//     closeAd();
// });

function closeAd() {
    adOverlay.style.display = "none";
    adVideo.pause();
}

const sponsorPopup = document.getElementById("sponsor-popup");

function visitSponsor() {
    sponsorPopup.style.display = "flex";
}

function closeSponsor() {
    sponsorPopup.style.display = "none";
}


const soundBtn = document.getElementById("sound-btn");

// Start muted (required for autoplay)
adVideo.muted = true;

soundBtn.addEventListener("click", () => {
    if (adVideo.muted) {
        adVideo.muted = false;
        adVideo.volume = 1;
        soundBtn.innerText = "🔈";
    } else {
        adVideo.muted = true;
        soundBtn.innerText = "🔊";
    }
});
