console.log("profile.js script loaded");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Upload functionality
    const uploadIcon = document.querySelector('.empty-icon');
    const fileInput = document.getElementById('file-upload');
    const newPostForm = document.querySelector('.new-post-form');
    const emptyContent = document.querySelector('.empty-content');
    const imagePreview = document.getElementById('image-preview');
    const postCaption = document.getElementById('post-caption');
    const postButton = document.getElementById('post-button');
    const uploadButton = document.querySelector('.share-first-photo-btn');
    let downloadURL = '';

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
                // Show the new post form and hide the empty content message
                newPostForm.style.display = 'block';
                emptyContent.style.display = 'none';

                // Show a preview of the selected image
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                };
                reader.readAsDataURL(file);

                // Upload the file to Firebase Storage
                if (window.auth.currentUser) {
                    const userId = window.auth.currentUser.uid;
                    const storageRef = window.ref(window.storage, `images/${userId}/${file.name}`);
                    
                    console.log("Uploading file...");
                    window.uploadBytes(storageRef, file).then((snapshot) => {
                        console.log('Uploaded a blob or file!');
                        window.getDownloadURL(snapshot.ref).then((url) => {
                            console.log('File available at', url);
                            downloadURL = url; // Save the download URL
                        });
                    });
                }
            }
        });
    }

    if(postButton) {
        postButton.addEventListener('click', () => {
            const caption = postCaption.value;
            if (caption && downloadURL && window.auth.currentUser) {
                const userId = window.auth.currentUser.uid;
                const postsRef = window.collection(window.db, "posts");

                window.addDoc(postsRef, {
                    userId: userId,
                    caption: caption,
                    imageUrl: downloadURL,
                    timestamp: window.serverTimestamp()
                }).then(() => {
                    console.log("Post created successfully!");
                    // Reset the form
                    newPostForm.style.display = 'none';
                    emptyContent.style.display = 'block';
                    postCaption.value = '';
                    imagePreview.src = '#';
                    downloadURL = '';
                }).catch((error) => {
                    console.error("Error creating post:", error);
                });
            } else {
                console.log("Please enter a caption and select an image.");
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
