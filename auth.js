// Google Sign-In
document.getElementById('google-login-btn').addEventListener('click', () => {
    const provider = new window.GoogleAuthProvider();
    window.signInWithPopup(window.auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = window.GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // Redirect to feed page
            window.location.href = 'feed.html';
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = window.GoogleAuthProvider.credentialFromError(error);
            console.error('Google Sign-In Error:', errorMessage);
        });
});

// Sign-out
function signOut() {
    window.auth.signOut().then(() => {
        // Sign-out successful.
        window.location.href = 'index.html';
    }).catch((error) => {
        // An error happened.
        console.error('Sign-Out Error:', error);
    });
}

// Route protection
window.auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in.
        // If on the login page, redirect to the feed.
        if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
            window.location.href = 'feed.html';
        }
    } else {
        // No user is signed in.
        // If not on the login page, redirect to the login page.
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }
});
