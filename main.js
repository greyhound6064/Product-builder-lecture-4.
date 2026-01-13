// 당근과 채찍 게임 Logic

// ---------------------------------------------------------
// Firebase Imports & Configuration
// ---------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    query, 
    orderBy, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TODO: 아래 설정을 본인의 Firebase 프로젝트 설정으로 교체하세요.
// Firebase 콘솔 -> 프로젝트 설정 -> 일반 -> 내 앱 -> SDK 설정 및 구성
const firebaseConfig = {
  apiKey: "AIzaSyBSWPyayT7YAJ6HqoZGsNpvYgjkkYNj2r0",
  authDomain: "product-builder-test-1feab.firebaseapp.com",
  projectId: "product-builder-test-1feab",
  storageBucket: "product-builder-test-1feab.firebasestorage.app",
  messagingSenderId: "912765779748",
  appId: "1:912765779748:web:09f882bd363e6451ad3db1",
  measurementId: "G-X6ZRK5D8VF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const COMMENTS_COLLECTION = "comments";

// Current User State
let currentUser = null;


// ---------------------------------------------------------
// Game Data & Variables
// ---------------------------------------------------------
const comfortMessages = [
    "힘들었죠? 혼자 감당하지 않아도 괜찮아요.", "당신은 충분히 잘하고 있어요. 스스로를 믿어주세요.", "잠시 쉬어가도 괜찮아요. 모든 것은 지나갈 거예요.",
    "당신은 소중하고 사랑받을 자격이 충분합니다.", "지금 이 순간에도 당신은 빛나고 있어요.", "어떤 선택을 하든 당신의 결정을 응원합니다.",
    "넘어져도 괜찮아요. 다시 일어설 힘이 당신에게는 있어요.", "당신의 진심은 언제나 통할 거예요.", "오늘 하루도 정말 수고 많으셨습니다.",
    "당신은 생각보다 훨씬 더 강한 사람이에요.",
    "세상이 등을 돌려도, 나는 언제나 당신 편이에요.", "지금 겪는 어려움은 당신을 더 크게 성장시킬 거예요.", "당신의 존재만으로도 누군가에겐 큰 힘이 됩니다.",
    "결과가 어떻든, 당신의 노력은 결코 헛되지 않았어요.", "가장 어두운 밤도 결국엔 아침을 맞이해요.", "스스로를 너무 다그치지 마세요. 이미 충분해요.",
    "당신의 따뜻한 마음씨는 분명 빛을 발할 거예요.", "오늘은 아무 생각 말고 푹 쉬어요.", "괜찮아, 괜찮아, 다 괜찮아질 거예요.",
    "당신은 세상에서 가장 소중한 보물입니다."
];

const insultMessages = [
    "네 재능은 숨기는데 탁월하구나.", "생각하는 게 그렇게 힘들면 안 해도 돼.", "넌 평범함의 극치를 달리는구나.", "그 정도 노력으로 뭘 바라니?",
    "네 존재 자체가 민폐다.", "그 얼굴로 거울 볼 맛 나겠네.", "머리는 장식으로 달고 다니니?", "네가 하는 모든 말은 쓸데없다.",
    "딱히 할 말은 없지만, 할 말이 없게 만드는 재주가 있네.", "왜 사는지 모르겠다.",
    "너 같은 건 노력해도 안 돼. 그냥 포기해.", "네가 숨 쉬는 것만으로도 산소가 아깝다.", "어떻게 그렇게까지 멍청할 수가 있지? 뇌는 장식품인가?",
    "네 인생은 실패작이야. 다시 태어나는 게 빠를 듯.", "사회에 아무런 도움이 안 되는 기생충 같은 존재.", "그 얼굴로 밖에 돌아다닐 용기가 가상하다.",
    "네가 하는 모든 선택은 최악으로 귀결되지.", "존재 자체가 주변 사람들에게는 재앙이다.", "차라리 없는 게 나았을 텐데.",
    "네 생각, 네 의견, 전부 다 쓰레기야."
];

let life = 0;
let gameActive = false;

// DOM Elements
const startGameButton = document.getElementById('startGameButton');
const comfortButton = document.getElementById('comfortButton');
const insultButton = document.getElementById('insultButton');
const messageDisplay = document.getElementById('messageDisplay');
const lifeContainer = document.getElementById('lifeContainer');
const lifeDisplay = document.getElementById('lifeDisplay');
const lifeValueSpan = document.getElementById('lifeValue');

// Auth DOM Elements
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userProfile = document.getElementById('userProfile');
const userPhoto = document.getElementById('userPhoto');
const userName = document.getElementById('userName');
const loginRequestMsg = document.getElementById('loginRequestMsg');


// ---------------------------------------------------------
// Game Logic Functions
// ---------------------------------------------------------
function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

function showFloatingText(text, type) {
    const floatingText = document.createElement('span');
    floatingText.textContent = text;
    floatingText.className = `floating-text ${type}`;
    lifeContainer.appendChild(floatingText);

    setTimeout(() => {
        floatingText.remove();
    }, 1000); // Remove after animation ends (1s)
}

function updateGameStatus() {
    lifeValueSpan.textContent = life;
    messageDisplay.className = ''; // Reset classes
    messageDisplay.id = 'messageDisplay'; // Ensure ID is set

    // 게임 승리 조건: LIFE가 20점 초과하면 성공!
    if (life > 20) {
        messageDisplay.textContent = "축하합니다! 많은 모욕을 견뎌내며 당신은 더욱 단단해졌습니다.";
        messageDisplay.classList.add('win-message');
        endGame();
    }
    // 게임 패배 조건: LIFE가 0점 이하가 되면 사망!
    else if (life <= 0) {
        messageDisplay.textContent = "당신은 나약해 빠졌습니다. 모욕받기로 스스로를 더 단련하십시오.";
        messageDisplay.classList.add('lose-message');
        endGame();
    }
}

function startGame() {
    life = 10;
    gameActive = true;
    lifeDisplay.style.display = 'block';
    startGameButton.style.display = 'none';
    comfortButton.disabled = false;
    insultButton.disabled = false;
    messageDisplay.textContent = "시작! 위로받거나 모욕받으세요.";
    messageDisplay.className = '';
    updateGameStatus();
}

function endGame() {
    gameActive = false;
    comfortButton.disabled = true;
    insultButton.disabled = true;
    startGameButton.textContent = "다시 시작";
    startGameButton.style.display = 'block';
}

// Event Listeners for Game
if (startGameButton) startGameButton.addEventListener('click', startGame);

if (comfortButton) comfortButton.addEventListener('click', () => {
    if (gameActive) {
        life--;
        showFloatingText('-1', 'minus');
        messageDisplay.textContent = getRandomMessage(comfortMessages);
        messageDisplay.className = 'comfort-message';
        updateGameStatus();
    }
});

if (insultButton) insultButton.addEventListener('click', () => {
    if (gameActive) {
        life++;
        showFloatingText('+1', 'plus');
        messageDisplay.textContent = getRandomMessage(insultMessages);
        messageDisplay.className = 'insult-message';
        updateGameStatus();
    }
});


// ---------------------------------------------------------
// Authentication Logic
// ---------------------------------------------------------

// Sign In with Google
async function handleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login failed:", error);
        // 상세 에러 내용을 사용자에게 알림
        alert(`로그인 실패\n에러 코드: ${error.code}\n메시지: ${error.message}`);
    }
}

// Sign Out
async function handleLogout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed:", error);
    }
}

// Observe Auth State
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        // User is signed in
        if (loginButton) loginButton.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (userName) userName.textContent = user.displayName;
        if (userPhoto) userPhoto.src = user.photoURL || 'https://via.placeholder.com/32';
        
        // Show comment form
        if (commentForm) commentForm.style.display = 'flex';
        if (loginRequestMsg) loginRequestMsg.style.display = 'none';
    } else {
        // User is signed out
        if (loginButton) loginButton.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
        if (userName) userName.textContent = '';
        if (userPhoto) userPhoto.src = '';
        
        // Hide comment form
        if (commentForm) commentForm.style.display = 'none';
        if (loginRequestMsg) loginRequestMsg.style.display = 'block';
    }
    
    // Re-render comments with new auth state (stored data)
    renderComments(currentCommentsData);
});

if (loginButton) loginButton.addEventListener('click', handleLogin);
if (logoutButton) logoutButton.addEventListener('click', handleLogout);


// ---------------------------------------------------------
// Comment System Logic (Firebase Firestore)
// ---------------------------------------------------------

const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const commentList = document.getElementById('commentList');
let currentCommentsData = []; // Store for re-rendering on auth change

// Listen for real-time updates
const q = query(collection(db, COMMENTS_COLLECTION), orderBy('createdAt', 'desc'));
const unsubscribe = onSnapshot(q, (snapshot) => {
    // Convert snapshot to array of objects
    currentCommentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    renderComments(currentCommentsData);
});


// Save Comment to Firestore
async function saveComment(text) {
    if (!currentUser) return;

    try {
        await addDoc(collection(db, COMMENTS_COLLECTION), {
            uid: currentUser.uid,          // Security: Store who wrote it
            author: currentUser.displayName, // Display Name
            photoURL: currentUser.photoURL,  // Optional: Profile Pic
            text: text,
            createdAt: serverTimestamp(),
            date: new Date().toLocaleString() 
        });
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("댓글 저장에 실패했습니다.");
    }
}

// Render Comments
function renderComments(comments) {
    if (!commentList) return;
    commentList.innerHTML = '';
    
    if (comments.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.className = 'empty-message';
        emptyMsg.textContent = '첫 번째 댓글을 남겨보세요!';
        commentList.appendChild(emptyMsg);
        return;
    }

    comments.forEach(comment => {
        const li = document.createElement('li');
        li.className = 'comment-item';
        
        const header = document.createElement('div');
        header.className = 'comment-header';
        
        const authorSpan = document.createElement('span');
        authorSpan.className = 'comment-author';
        authorSpan.textContent = comment.author;
        
        const metaDiv = document.createElement('div');
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'comment-date';
        dateSpan.textContent = comment.date || new Date().toLocaleString();
        
        metaDiv.appendChild(dateSpan);

        // SHOW DELETE BUTTON ONLY IF OWNER
        if (currentUser && comment.uid === currentUser.uid) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-comment-btn';
            deleteBtn.textContent = '삭제';
            deleteBtn.ariaLabel = '삭제';
            
            deleteBtn.addEventListener('click', () => {
                deleteCommentFromFirestore(comment.id);
            });
            metaDiv.appendChild(deleteBtn);
        }
        
        header.appendChild(authorSpan);
        header.appendChild(metaDiv);
        
        const textDiv = document.createElement('div');
        textDiv.className = 'comment-text';
        textDiv.textContent = comment.text;
        
        li.appendChild(header);
        li.appendChild(textDiv);
        
        commentList.appendChild(li);
    });
}

// Delete from Firestore
async function deleteCommentFromFirestore(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        await deleteDoc(doc(db, COMMENTS_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting document: ", e);
        alert("삭제에 실패했습니다. (권한이 없을 수 있습니다)");
    }
}


// Form Submit Handler
if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = commentInput.value.trim();
        
        if (text) {
            saveComment(text);
            commentInput.value = ''; 
        }
    });
}

// Initial state check
document.addEventListener('DOMContentLoaded', () => {
    if (!gameActive) {
        if(lifeDisplay) lifeDisplay.style.display = 'none';
        if(comfortButton) comfortButton.disabled = true;
        if(insultButton) insultButton.disabled = true;
    }
});