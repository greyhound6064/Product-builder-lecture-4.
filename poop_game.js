const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const bgm = document.getElementById('bgm'); 

let score = 0;
let gameActive = false;
let gameLoopId;
let scoreIntervalId;
let difficultyIntervalId;
let hamburgerIntervalId; 
let immuneTimeoutId;

// Cache Dimensions (Performance Optimization)
let gameWidth = 0;
let gameHeight = 0;

function updateGameDimensions() {
    gameWidth = gameArea.clientWidth; // border 제외한 내부 너비
    gameHeight = gameArea.clientHeight;
}
window.addEventListener('resize', updateGameDimensions);
// 초기화 시 한 번 호출
updateGameDimensions();


// Player State
let playerX = 0;
let playerY = 0;
let PLAYER_SIZE = 30; // 기본 크기 30px
const MOVE_SPEED = 5; 
let isImmune = false; 

// Entities
let poops = []; 
let hamburgers = []; 
const POOP_SIZE = 18; // 기본 크기 18px
const HAMBURGER_SIZE = 30;

// Input State
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', (e) => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Mobile Touch Controls (Drag)
let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;

gameArea.addEventListener('touchstart', (e) => {
    if (!gameActive) return;
    touchActive = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

gameArea.addEventListener('touchmove', (e) => {
    if (!gameActive || !touchActive) return;
    e.preventDefault();
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    const diffX = touchX - touchStartX;
    const diffY = touchY - touchStartY;
    
    // 드래그 감도: 1.0 (직관적인 1:1 이동)
    playerX += diffX; 
    playerY += diffY;
    
    touchStartX = touchX;
    touchStartY = touchY;
    
    clampPlayer();
    updatePlayerPosition();
});

gameArea.addEventListener('touchend', () => {
    touchActive = false;
});


function startGame() {
    updateGameDimensions(); // 시작 전 확실하게 치수 업데이트
    gameActive = true;
    score = 0;
    scoreDisplay.textContent = score;
    startBtn.style.display = 'none';
    gameOverModal.classList.add('hidden');
    
    bgm.play().catch(e => console.log("Audio play failed:", e));

    // Reset Player
    playerX = gameWidth / 2 - 30 / 2; // PLAYER_SIZE가 변할 수 있으므로 상수로 계산
    playerY = gameHeight / 2 - 30 / 2;
    
    // 크기 및 상태 초기화
    PLAYER_SIZE = 30;
    player.style.width = '30px';
    player.style.height = '30px';
    
    deactivateImmunity(); 
    updatePlayerPosition();

    document.querySelectorAll('.poop, .hamburger').forEach(el => el.remove());
    poops = [];
    hamburgers = [];

    // Start with 1 Poop (Reduced from 7)
    for(let i=0; i<1; i++) {
        addEntity('poop');
    }

    gameLoopId = requestAnimationFrame(gameLoop);
    
    scoreIntervalId = setInterval(() => {
        score++;
        scoreDisplay.textContent = score;
    }, 100);

    difficultyIntervalId = setInterval(() => {
        addEntity('poop');
        
        if (score > 0 && score % 100 === 0) {
            poops.forEach(p => {
                p.vx *= 1.1;
                p.vy *= 1.1;
            });
        }
        
        scoreDisplay.style.color = 'red';
        setTimeout(() => scoreDisplay.style.color = '#333', 200);
    }, 2000); 

    hamburgerIntervalId = setInterval(() => {
        if (hamburgers.length < 2) {
            addEntity('hamburger');
        }
    }, 10000);
}

function resetGame() {
    gameOverModal.classList.add('hidden');
    startGame();
}

function clampPlayer() {
    const maxWidth = gameWidth - PLAYER_SIZE;
    const maxHeight = gameHeight - PLAYER_SIZE;
    
    if (playerX < 0) playerX = 0;
    if (playerX > maxWidth) playerX = maxWidth;
    if (playerY < 0) playerY = 0;
    if (playerY > maxHeight) playerY = maxHeight;
}

function updatePlayerPosition() {
    // Optimization: Use transform for GPU acceleration
    player.style.transform = `translate3d(${playerX}px, ${playerY}px, 0)`;
}

function activateImmunity() {
    isImmune = true;
    player.classList.add('immune');
    
    // 거대화 (3배)
    PLAYER_SIZE = 90;
    player.style.width = PLAYER_SIZE + 'px';
    player.style.height = PLAYER_SIZE + 'px';

    if (immuneTimeoutId) clearTimeout(immuneTimeoutId);
    
    immuneTimeoutId = setTimeout(deactivateImmunity, 3000); 
}

function deactivateImmunity() {
    isImmune = false;
    player.classList.remove('immune');
    
    // 크기 원상복구
    PLAYER_SIZE = 30;
    player.style.width = PLAYER_SIZE + 'px';
    player.style.height = PLAYER_SIZE + 'px';
}

function addEntity(type) {
    const el = document.createElement('div');
    const size = type === 'poop' ? POOP_SIZE : HAMBURGER_SIZE;
    
    el.classList.add(type);
    el.textContent = type === 'poop' ? '💩' : '🍔';
    
    // Spawn Logic
    let startX, startY;
    const edge = Math.floor(Math.random() * 4); 
    
    switch(edge) {
        case 0: // Top
            startX = Math.random() * (gameWidth - size);
            startY = 0;
            break;
        case 1: // Right
            startX = gameWidth - size;
            startY = Math.random() * (gameHeight - size);
            break;
        case 2: // Bottom
            startX = Math.random() * (gameWidth - size);
            startY = gameHeight - size;
            break;
        case 3: // Left
            startX = 0;
            startY = Math.random() * (gameHeight - size);
            break;
    }

    // Set Initial Position (Prevent flickering at 0,0)
    if (type === 'poop') {
        el.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
    } else {
        // Hamburger keeps left/top to avoid conflict with CSS animation transform
        el.style.left = startX + 'px';
        el.style.top = startY + 'px';
    }

    gameArea.appendChild(el);

    let vx = (Math.random() - 0.5) * 8; 
    let vy = (Math.random() - 0.5) * 8;
    
    if (edge === 0 && vy < 0) vy = -vy;
    if (edge === 2 && vy > 0) vy = -vy;
    if (edge === 3 && vx < 0) vx = -vx;
    if (edge === 1 && vx > 0) vx = -vx;
    
    if (Math.abs(vx) < 2) vx = vx < 0 ? -2 : 2;
    if (Math.abs(vy) < 2) vy = vy < 0 ? -2 : 2;

    const entity = {
        element: el,
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        size: size,
        type: type
    };

    if (type === 'poop') {
        poops.push(entity);
    } else {
        hamburgers.push(entity);
    }
}

function gameLoop() {
    if (!gameActive) return;

    // 1. Move Player (Keyboard)
    if (keys.ArrowUp) playerY -= MOVE_SPEED;
    if (keys.ArrowDown) playerY += MOVE_SPEED;
    if (keys.ArrowLeft) playerX -= MOVE_SPEED;
    if (keys.ArrowRight) playerX += MOVE_SPEED;
    
    // Joystick logic removed. Touch drag is handled in touchmove event directly.

    clampPlayer();
    updatePlayerPosition();

    const maxWidth = gameWidth;
    const maxHeight = gameHeight;

    // Helper function to move and bounce entities
    const processEntities = (arr) => {
        for (let i = 0; i < arr.length; i++) {
            const e = arr[i];
            e.x += e.vx;
            e.y += e.vy;

            // Bounce
            if (e.x <= 0) { e.x = 0; e.vx *= -1; }
            else if (e.x >= maxWidth - e.size) { e.x = maxWidth - e.size; e.vx *= -1; }
            
            if (e.y <= 0) { e.y = 0; e.vy *= -1; }
            else if (e.y >= maxHeight - e.size) { e.y = maxHeight - e.size; e.vy *= -1; }

            // Render Update
            if (e.type === 'poop') {
                e.element.style.transform = `translate3d(${e.x}px, ${e.y}px, 0)`;
            } else {
                e.element.style.left = e.x + 'px';
                e.element.style.top = e.y + 'px';
            }

            // Collision
            if (checkCollision(e)) {
                if (e.type === 'poop') {
                    if (!isImmune) {
                        gameOver();
                        return true; 
                    } else {
                        // Eat poop
                        e.element.remove();
                        arr.splice(i, 1);
                        i--;
                        score += 10;
                        scoreDisplay.textContent = score;
                    }
                } else if (e.type === 'hamburger') {
                    activateImmunity();
                    e.element.remove();
                    arr.splice(i, 1);
                    i--;
                }
            }
        }
        return false;
    };

    if (processEntities(poops)) return; 
    processEntities(hamburgers);

    if (gameActive) {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

function checkCollision(entity) {
    const playerInset = 2; // 1/4 보정
    const entityInset = 1; // 1/4 보정
    
    const playerLeft = playerX + playerInset;
    const playerRight = playerX + PLAYER_SIZE - playerInset;
    const playerTop = playerY + playerInset;
    const playerBottom = playerY + PLAYER_SIZE - playerInset;

    const entityLeft = entity.x + entityInset;
    const entityRight = entity.x + entity.size - entityInset;
    const entityTop = entity.y + entityInset;
    const entityBottom = entity.y + entity.size - entityInset;

    return (
        playerLeft < entityRight &&
        playerRight > entityLeft &&
        playerTop < entityBottom &&
        playerBottom > entityTop
    );
}

function gameOver() {
    gameActive = false;
    clearInterval(scoreIntervalId);
    clearInterval(difficultyIntervalId);
    clearInterval(hamburgerIntervalId);
    clearTimeout(immuneTimeoutId);
    cancelAnimationFrame(gameLoopId);
    
    bgm.pause();
    bgm.currentTime = 0;
    
    finalScoreDisplay.textContent = score;
    gameOverModal.classList.remove('hidden');
}