const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let gameActive = false;
let gameLoopId;
let scoreIntervalId;
let difficultyIntervalId;
let hamburgerIntervalId; // 햄버거 생성 타이머
let immuneTimeoutId;

// Player State
let playerX = 0;
let playerY = 0;
const PLAYER_SIZE = 40; // px (Updated to match CSS)
const MOVE_SPEED = 5; // px per frame
let isImmune = false; // 무적 상태 플래그

// Entities
let poops = []; 
let hamburgers = []; // 햄버거 배열
const POOP_SIZE = 24; 
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

// Mobile Joystick Controls
const joystickContainer = document.getElementById('joystick-container');
const joystickKnob = document.getElementById('joystick-knob');
let joyX = 0; // -1 to 1
let joyY = 0; // -1 to 1
let joystickActive = false;
const JOYSTICK_MAX_RADIUS = 35; // Maximum distance knob can move

joystickContainer.addEventListener('touchstart', (e) => {
    e.preventDefault(); // 스크롤 방지
    joystickActive = true;
    updateJoystick(e.touches[0]);
});

joystickContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (joystickActive) {
        updateJoystick(e.touches[0]);
    }
});

joystickContainer.addEventListener('touchend', (e) => {
    e.preventDefault();
    joystickActive = false;
    joyX = 0;
    joyY = 0;
    joystickKnob.style.transform = `translate(-50%, -50%)`; // Reset knob position
});

function updateJoystick(touch) {
    const rect = joystickContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 터치 위치와 중심 사이의 거리 계산
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 최대 반경 내로 제한
    if (distance > JOYSTICK_MAX_RADIUS) {
        const angle = Math.atan2(deltaY, deltaX);
        deltaX = Math.cos(angle) * JOYSTICK_MAX_RADIUS;
        deltaY = Math.sin(angle) * JOYSTICK_MAX_RADIUS;
    }
    
    // Knob 이동
    joystickKnob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    
    // Normalize values (-1 to 1) for movement
    joyX = deltaX / JOYSTICK_MAX_RADIUS;
    joyY = deltaY / JOYSTICK_MAX_RADIUS;
}


function startGame() {
    gameActive = true;
    score = 0;
    scoreDisplay.textContent = score;
    startBtn.style.display = 'none';
    gameOverModal.classList.add('hidden');
    
    // Reset Player
    const rect = gameArea.getBoundingClientRect();
    playerX = rect.width / 2 - PLAYER_SIZE / 2;
    playerY = rect.height / 2 - PLAYER_SIZE / 2;
    deactivateImmunity(); // 초기화
    updatePlayerPosition();

    // Clear Entities
    document.querySelectorAll('.poop, .hamburger').forEach(el => el.remove());
    poops = [];
    hamburgers = [];

    // Start with 10 Poops immediately for a chaotic start
    for(let i=0; i<10; i++) {
        addEntity('poop');
    }

    // Start Loops
    gameLoopId = requestAnimationFrame(gameLoop);
    
    scoreIntervalId = setInterval(() => {
        score++;
        scoreDisplay.textContent = score;
    }, 100);

    // Difficulty: Add Poop every 2s (Faster!)
    difficultyIntervalId = setInterval(() => {
        addEntity('poop');
        
        // Every 10 seconds, increase general speed of ALL poops
        if (score > 0 && score % 100 === 0) {
            poops.forEach(p => {
                p.vx *= 1.1;
                p.vy *= 1.1;
            });
        }
        
        scoreDisplay.style.color = 'red';
        setTimeout(() => scoreDisplay.style.color = '#333', 200);
    }, 2000); 

    // Bonus: Add Hamburger every 8s (Slightly more frequent to compensate difficulty)
    hamburgerIntervalId = setInterval(() => {
        // 화면에 햄버거가 너무 많지 않게 제한 (최대 2개)
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
    const maxWidth = gameArea.offsetWidth - PLAYER_SIZE;
    const maxHeight = gameArea.offsetHeight - PLAYER_SIZE;
    
    if (playerX < 0) playerX = 0;
    if (playerX > maxWidth) playerX = maxWidth;
    if (playerY < 0) playerY = 0;
    if (playerY > maxHeight) playerY = maxHeight;
}

function updatePlayerPosition() {
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
}

function activateImmunity() {
    isImmune = true;
    player.classList.add('immune');
    
    // 기존 타이머가 있다면 취소 (시간 연장)
    if (immuneTimeoutId) clearTimeout(immuneTimeoutId);
    
    immuneTimeoutId = setTimeout(deactivateImmunity, 3000); // 3초 지속
}

function deactivateImmunity() {
    isImmune = false;
    player.classList.remove('immune');
}

function addEntity(type) {
    const el = document.createElement('div');
    const size = type === 'poop' ? POOP_SIZE : HAMBURGER_SIZE;
    
    el.classList.add(type);
    el.textContent = type === 'poop' ? '💩' : '🍔';
    gameArea.appendChild(el);
    
    const areaWidth = gameArea.offsetWidth;
    const areaHeight = gameArea.offsetHeight;
    
    // Spawn Logic (Same as before)
    let startX, startY;
    const edge = Math.floor(Math.random() * 4); 
    
    switch(edge) {
        case 0: // Top
            startX = Math.random() * (areaWidth - size);
            startY = 0;
            break;
        case 1: // Right
            startX = areaWidth - size;
            startY = Math.random() * (areaHeight - size);
            break;
        case 2: // Bottom
            startX = Math.random() * (areaWidth - size);
            startY = areaHeight - size;
            break;
        case 3: // Left
            startX = 0;
            startY = Math.random() * (areaHeight - size);
            break;
    }

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

    // 1. Move Player
    // Keyboard Input
    if (keys.ArrowUp) playerY -= MOVE_SPEED;
    if (keys.ArrowDown) playerY += MOVE_SPEED;
    if (keys.ArrowLeft) playerX -= MOVE_SPEED;
    if (keys.ArrowRight) playerX += MOVE_SPEED;
    
    // Joystick Input (Mobile)
    // 감도를 높이기 위해 MOVE_SPEED에 추가 계수(예: 1.5 ~ 2.0)를 곱함
    if (joyX !== 0 || joyY !== 0) {
        playerX += joyX * MOVE_SPEED * 2.0; 
        playerY += joyY * MOVE_SPEED * 2.0;
    }

    clampPlayer();
    updatePlayerPosition();

    const maxWidth = gameArea.offsetWidth;
    const maxHeight = gameArea.offsetHeight;

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

            e.element.style.left = e.x + 'px';
            e.element.style.top = e.y + 'px';

            // Collision
            if (checkCollision(e)) {
                if (e.type === 'poop') {
                    if (!isImmune) {
                        gameOver();
                        return true; // Game Over triggered
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

    if (processEntities(poops)) return; // Stop loop if game over
    processEntities(hamburgers);

    if (gameActive) {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

function checkCollision(entity) {
    // 히트박스 보정 (이미지 안쪽으로 판정을 좁힘)
    // 플레이어: 40px 크기에서 상하좌우 8px씩 안쪽으로 (여유롭게)
    const playerInset = 8; 
    // 똥/햄버거: 크기에서 상하좌우 4px씩 안쪽으로
    const entityInset = 4; 
    
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
    
    finalScoreDisplay.textContent = score;
    gameOverModal.classList.remove('hidden');
}