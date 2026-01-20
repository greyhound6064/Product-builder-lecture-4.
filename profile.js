console.log("profile.js script loaded");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Upload functionality
    const uploadButton = document.querySelector('.share-first-photo-btn');
    const uploadIcon = document.querySelector('.empty-icon');
    const fileInput = document.getElementById('file-upload');

    if(uploadButton) {
        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if(uploadIcon) {
        uploadIcon.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if(fileInput) {
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                console.log("File selected:", file);
                // Here you would handle the file upload process
            }
        });
    }

    window.auth.onAuthStateChanged(user => {
        console.log("onAuthStateChanged event fired");
        if (user) {
            console.log("User is signed in:", user);

            // User is signed in, update the profile page
            const profileImageContainer = document.querySelector('.profile-image .image-wrapper');
            const userIdElement = document.querySelector('.user-id');
            const userNameElement = document.querySelector('.user-name');

            console.log("profileImageContainer:", profileImageContainer);
            console.log("userIdElement:", userIdElement);
            console.log("userNameElement:", userNameElement);

            if (profileImageContainer) {
                console.log("Updating profile image");
                profileImageContainer.innerHTML = `<img src="${user.photoURL}" alt="Profile Picture">`;
            }
            if (userIdElement) {
                console.log("Updating user ID");
                userIdElement.textContent = user.email;
            }
            if (userNameElement) {
                console.log("Updating user name");
                userNameElement.textContent = user.displayName;
            }
        } else {
            // No user is signed in.
            // This case is handled by auth.js, which will redirect to the login page.
            console.log("No user signed in.");
        }
    });
});
