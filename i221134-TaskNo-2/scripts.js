// DOM Elements
const gameArea = document.querySelector('#gameArea');
const arrow = document.querySelector('#arrow');
const target = document.querySelector('#target');
const scoreText = document.querySelector('#score');
const timeText = document.querySelector('#time');
const restartButton = document.querySelector('#restartButton');

// Game Constants
const INITIAL_GAME_TIME = 60;
const INITIAL_TARGET_SPEED = 2;
const INITIAL_ARROW_SPEED = 8;
const INITIAL_TARGET_SIZE = 60;
const DIFFICULTY_THRESHOLD = 3;
const TARGET_SIZE_DECREASE = 5;
const TARGET_SIZE_MIN = 25;
const ARROW_START_POS = 60;
const ARROW_START_TOP = 190;

// Game State Variables
let score = 0;
let timeLeft = INITIAL_GAME_TIME;
let gameOver = false;
let targetSpeed = INITIAL_TARGET_SPEED;
let arrowSpeed = INITIAL_ARROW_SPEED;

// Interval Trackers
let targetInterval = null;
let timerInterval = null;

// Event Listeners
gameArea.addEventListener('click', (e) => {
    if (gameOver) return;

    // Check if target was clicked
    if (e.target === target) {
        updateScore();
        increaseDifficulty();
    } else {
        // Background click - shoot arrow
        shootArrow();
    }
});

if (restartButton) {
    restartButton.addEventListener('click', restartGame);
}

/**
 * Shoots an arrow from the bow towards the target
 * Arrow moves across the game area and checks for collisions
 */
function shootArrow() {
    if (gameOver) return;

    arrow.style.display = 'block';
    arrow.style.left = ARROW_START_POS + "px";

    let arrowMove = setInterval(() => {
        if (gameOver) {
            clearInterval(arrowMove);
            return;
        }

        let currentLeft = arrow.offsetLeft;
        arrow.style.left = (currentLeft + arrowSpeed) + "px";

        checkCollision();

        if (currentLeft > gameArea.clientWidth) {
            clearInterval(arrowMove);
            arrow.style.display = "none";
        }
    }, 20);
}

/**
 * Updates the player's score when target is hit
 */
function updateScore() {
    score++;
    scoreText.textContent = score;
}

/**
 * Checks collision between arrow and target using AABB collision detection
 */
function checkCollision() {
    let arrowRect = arrow.getBoundingClientRect();
    let targetRect = target.getBoundingClientRect();

    // AABB (Axis-Aligned Bounding Box) collision detection
    if (
        arrowRect.left < targetRect.right &&
        arrowRect.right > targetRect.left &&
        arrowRect.top < targetRect.bottom &&
        arrowRect.bottom > targetRect.top
    ) {
        updateScore();
        increaseDifficulty();
        arrow.style.display = "none";
    }
}

/**
 * Moves the target continuously within game area boundaries
 * Target bounces off walls to stay within bounds
 */
function moveTarget() {
    if (targetInterval) clearInterval(targetInterval);

    targetInterval = setInterval(() => {
        if (gameOver) return;

        // Get current position
        let currentTop = target.offsetTop;
        let currentLeft = target.offsetLeft;

        // Random direction: 1 or -1
        let directionY = Math.random() > 0.5 ? 1 : -1;
        let directionX = Math.random() > 0.5 ? 1 : -1;

        // Calculate new position
        let newTop = currentTop + (directionY * targetSpeed);
        let newLeft = currentLeft + (directionX * targetSpeed);

        // Keep target within game area bounds
        const targetSize = target.offsetWidth;
        const maxTop = gameArea.clientHeight - targetSize;
        const maxLeft = gameArea.clientWidth - targetSize;

        if (newTop < 0 || newTop > maxTop) {
            newTop = Math.max(0, Math.min(newTop, maxTop));
        }
        if (newLeft < 0 || newLeft > maxLeft) {
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        }

        target.style.top = newTop + "px";
        target.style.left = newLeft + "px";
    }, 50);
}

/**
 * Starts the game timer countdown
 * Ends game when time reaches zero
 */
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (gameOver) return;

        timeLeft--;
        timeText.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

/**
 * Increases game difficulty by:
 * - Increasing target movement speed
 * - Decreasing target size
 * - Changing target color for visual feedback
 */
function increaseDifficulty() {
    // Increase difficulty every N hits
    if (score % DIFFICULTY_THRESHOLD === 0 && score > 0) {
        targetSpeed += 1;

        // Reduce target size (min limit)
        let size = target.offsetWidth - TARGET_SIZE_DECREASE;

        if (size > TARGET_SIZE_MIN) {
            target.style.width = size + "px";
            target.style.height = size + "px";
        }

        // Change color randomly for visual feedback
        target.style.background = `hsl(${Math.random() * 360}, 70%, 50%)`;
    }
}

/**
 * Ends the game and displays final score
 */
function endGame() {
    gameOver = true;
    clearInterval(targetInterval);
    clearInterval(timerInterval);
    arrow.style.display = "none";

    alert("Game Over! Final Score: " + score);
}

/**
 * Resets all game variables and restarts the game
 */
function restartGame() {
    // Clear any running intervals
    clearInterval(targetInterval);
    clearInterval(timerInterval);

    // Reset game state
    score = 0;
    timeLeft = INITIAL_GAME_TIME;
    gameOver = false;
    targetSpeed = INITIAL_TARGET_SPEED;
    arrowSpeed = INITIAL_ARROW_SPEED;

    // Reset UI elements
    scoreText.textContent = score;
    timeText.textContent = timeLeft;
    arrow.style.display = "none";

    // Reset target appearance
    target.style.width = INITIAL_TARGET_SIZE + "px";
    target.style.height = INITIAL_TARGET_SIZE + "px";
    target.style.background = "red";
    target.style.top = "150px";
    target.style.left = "initial";

    // Restart game systems
    moveTarget();
    startTimer();
}

// Initialize game on page load
window.addEventListener('DOMContentLoaded', () => {
    arrow.style.display = "none";
    moveTarget();
    startTimer();
});
