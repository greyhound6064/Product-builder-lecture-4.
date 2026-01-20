// Google Sign-In
document.getElementById('google-login-btn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = result.credential;
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
            const email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            const credential = error.credential;
            console.error('Google Sign-In Error:', errorMessage);
        });
});

// Sign-out
function signOut() {
    auth.signOut().then(() => {
        // Sign-out successful.
        window.location.href = 'index.html';
    }).catch((error) => {
        // An error happened.
        console.error('Sign-Out Error:', error);
    });
}

// Route protection
auth.onAuthStateChanged((user) => {
    if (!user && window.location.pathname !== '/index.html') {
        // No user is signed in, and we are not on the login page.
        // Redirect to the login page.
        window.location.href = 'index.html';
    }
});
