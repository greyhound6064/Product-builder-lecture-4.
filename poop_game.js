const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const eatenCountDisplay = document.getElementById('eaten-count'); // 먹은 똥 표시 요소
const startBtn = document.getElementById('start-btn');
const descriptionModal = document.getElementById('description-modal');
const realStartBtn = document.getElementById('real-start-btn');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const bgm = document.getElementById('bgm'); 

let score = 0;
let eatenCount = 0; // 먹어치운 똥 카운트
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
let PLAYER_SIZE = 18; // 캐릭터 크기 2배 확대 (9 -> 18)
const MOVE_SPEED = 5; 
let isImmune = false; 

// Entities
let poops = []; 
let hamburgers = []; 
const POOP_SIZE = 18; // 기본 크기 18px
const HAMBURGER_SIZE = 15; // 햄버거 크기 축소 (18 -> 15)

// Input State
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Event Listeners
startBtn.addEventListener('click', showDescription);
realStartBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', (e) => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Mobile Touch Controls (Drag) - 화면 전체에서 인식하도록 document로 변경
let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;

document.addEventListener('touchstart', (e) => {
    if (!gameActive) return;
    touchActive = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    // 게임 영역 내부 터치일 때만 preventDefault (버튼 클릭 허용 등을 위해 조건부로 하면 좋으나, 게임 중에는 전체 방지가 안전)
    if(e.target.tagName !== 'BUTTON') e.preventDefault();
}, { passive: false }); // passive: false 추가

document.addEventListener('touchmove', (e) => {
    if (!gameActive || !touchActive) return;
    e.preventDefault();
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    const diffX = touchX - touchStartX;
    const diffY = touchY - touchStartY;
    
    // 드래그 감도: 0.7 (속도 하향 조정)
    playerX += diffX * 0.7; 
    playerY += diffY * 0.7;
    
    touchStartX = touchX;
    touchStartY = touchY;
    
    clampPlayer();
    updatePlayerPosition();
}, { passive: false });

document.addEventListener('touchend', () => {
    touchActive = false;
});


function showDescription() {
    descriptionModal.classList.remove('hidden');
}

function startGame() {
    descriptionModal.classList.add('hidden');
    updateGameDimensions(); // 시작 전 확실하게 치수 업데이트
    gameActive = true;
    score = 0;
    eatenCount = 0; // 초기화
    scoreDisplay.textContent = score;
    eatenCountDisplay.textContent = eatenCount;
    startBtn.style.display = 'none';
    gameOverModal.classList.add('hidden');
    
    bgm.play().catch(e => console.log("Audio play failed:", e));

    // Reset Player
    playerX = gameWidth / 2 - 18 / 2; // PLAYER_SIZE(18) 반영
    playerY = gameHeight / 2 - 18 / 2;
    
    // 크기 및 상태 초기화
    PLAYER_SIZE = 18;
    player.style.width = '18px';
    player.style.height = '18px';
    
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
                p.vx *= 1.05;
                p.vy *= 1.05;
            });
        }
        
        scoreDisplay.style.color = 'red';
        setTimeout(() => scoreDisplay.style.color = '#333', 200);
    }, 1000); 

    hamburgerIntervalId = setInterval(() => {
        if (hamburgers.length < 2) {
            addEntity('hamburger');
        }
    }, 10000); // 햄버거 생성 간격 원복
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
    
    // 햄버거 먹으면 1.5배 커짐 (18 * 1.5 = 27)
    PLAYER_SIZE = 27;
    player.style.width = '27px';
    player.style.height = '27px';
    
    clampPlayer(); // 커진 크기에 맞춰 위치 보정
    updatePlayerPosition();

    if (immuneTimeoutId) clearTimeout(immuneTimeoutId);
    
    immuneTimeoutId = setTimeout(deactivateImmunity, 3000); 
}

function deactivateImmunity() {
    isImmune = false;
    player.classList.remove('immune');
    
    // 다시 원래 크기로 (18)
    PLAYER_SIZE = 18;
    player.style.width = '18px';
    player.style.height = '18px';

    clampPlayer(); // 작아진 크기에 맞춰 위치 보정
    updatePlayerPosition();
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

    // 속도 설정 (햄버거 속도를 똥과 동일하게 4로 조정)
    let speedMultiplier = 4; 
    
    let vx = (Math.random() - 0.5) * speedMultiplier; 
    let vy = (Math.random() - 0.5) * speedMultiplier;
    
    if (edge === 0 && vy < 0) vy = -vy;
    if (edge === 2 && vy > 0) vy = -vy;
    if (edge === 3 && vx < 0) vx = -vx;
    if (edge === 1 && vx > 0) vx = -vx;
    
    // 최소 속도 보정 (햄버거 최소 속도를 똥과 동일하게 1로 조정)
    const minSpeed = 1; 
    if (Math.abs(vx) < minSpeed) vx = vx < 0 ? -minSpeed : minSpeed;
    if (Math.abs(vy) < minSpeed) vy = vy < 0 ? -minSpeed : minSpeed;

    const entity = {        element: el,
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

            const poopSound = document.getElementById('poop-sound');
            const yummySound = document.getElementById('yummy-sound');

            // Collision
            if (checkCollision(e)) {
                if (e.type === 'poop') {
                    if (!isImmune) {
                        playSound(poopSound); // Play poop sound on death
                        gameOver();
                        return true; 
                    } else {
                        // Eat poop
                        playSound(poopSound); // Play poop sound on eat
                        e.element.remove();
                        arr.splice(i, 1);
                        i--;
                        score += 10;
                        eatenCount++; // 먹은 똥 증가
                        scoreDisplay.textContent = score;
                        eatenCountDisplay.textContent = eatenCount;
                    }
                } else if (e.type === 'hamburger') {
                    playSound(yummySound); // Play yummy sound
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

function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0; // Reset sound to start
        audioElement.play().catch(e => console.log("Sound play failed:", e));
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

    // 랭킹 폼 초기화 (UI 관련 로직 추가)
    const submitBtn = document.getElementById('submit-score-btn');
    if(submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "기록 저장하기";
        document.getElementById('player-name').value = "";
        document.getElementById('player-pw').value = "";
        document.getElementById('player-msg').value = "";
    }
}