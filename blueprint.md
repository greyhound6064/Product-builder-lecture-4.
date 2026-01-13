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
*   **Comment System (Firestore):** Users can leave comments which are stored in a real-time database.
    *   **Real-time Updates:** Comments appear instantly for all users.
    *   **Deletion:** Users can delete their own comments using a password.

## Current Task: Migrate to Firebase Firestore

*   **Objective:** Replace LocalStorage with Firebase Firestore to enable shared, persistent comments across devices.
*   **Steps:**
    1.  **HTML (`index.html`):** Update script tag to support ES Modules.
    2.  **JavaScript (`main.js`):** 
        *   Import Firebase SDKs (App, Firestore).
        *   Initialize Firebase (User needs to provide Config).
        *   Replace `saveComment` with `addDoc`.
        *   Replace `loadComments` with `onSnapshot` (real-time listener).
        *   Replace `deleteComment` with `deleteDoc`.