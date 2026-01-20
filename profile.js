
window.auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User is signed in:", user);
        // User is signed in, update the profile page
        const profileImageContainer = document.querySelector('.profile-image .image-wrapper');
        const userIdElement = document.querySelector('.user-id');
        const userNameElement = document.querySelector('.user-name');

        if (profileImageContainer) {
            profileImageContainer.innerHTML = `<img src="${user.photoURL}" alt="Profile Picture">`;
        }
        if (userIdElement) {
            userIdElement.textContent = user.email;
        }
        if (userNameElement) {
            userNameElement.textContent = user.displayName;
        }
    } else {
        // No user is signed in.
        // This case is handled by auth.js, which will redirect to the login page.
        console.log("No user signed in.");
    }
});
