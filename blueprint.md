# Carrot and Stick Game

## Overview
This is a web application game where the user gains or loses "LIFE" points by receiving "comfort" (Carrot) or "insults" (Stick). It's a simple, interactive game designed to simulate the ups and downs of motivation.

## Design and Features

### Style and Design
*   **Theme:** Clean, modern interface with a focus on typography and clear feedback.
*   **Colors:** Uses distinctive colors for actions (Green for Comfort, Red for Insult/Stick).
*   **Animation:** Features floating text animations for score changes (+1, -1).
*   **Responsiveness:** Fully responsive layout suitable for mobile and desktop.

### Features
*   **Life System:** Starts with 10 LIFE. Game Over at 0, Win at >20.
*   **Interaction:**
    *   **Comfort Button:** Decreases LIFE by 1, shows a comforting message.
    *   **Insult Button:** Increases LIFE by 1, shows an insulting (motivating) message.
*   **Authentication (Google Sign-In):**
    *   Users can sign in with their Google account.
    *   Identifies the author of comments automatically.
*   **Comment System (Firestore):** Users can leave comments which are stored in a real-time database.
    *   **Real-time Updates:** Comments appear instantly for all users.
    *   **Ownership:** Only the authenticated author can delete their own comments.
    *   **No Passwords:** Security is handled via user unique IDs (UID).

## Current Task: Implement Google Sign-In

*   **Objective:** Integrate Firebase Authentication to manage user identity and secure comment ownership.
*   **Steps:**
    1.  **HTML (`index.html`):** 
        *   Add Login/Logout buttons and a User Profile display area.
        *   Remove "Author" and "Password" fields from the comment form (data comes from Auth).
    2.  **CSS (`style.css`):** Style the new auth UI elements.
    3.  **JavaScript (`main.js`):** 
        *   Initialize Firebase Auth.
        *   Implement `signInWithPopup` and `signOut`.
        *   Use `onAuthStateChanged` to manage UI state (show/hide form, toggle buttons).
        *   Update comment saving to include User ID (`uid`).
        *   Update comment rendering to show "Delete" button *only* if `current_user.uid == comment.uid`.
