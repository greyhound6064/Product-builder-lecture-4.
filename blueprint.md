# Poop Dodging Game (똥 피하기 게임)

## Overview
This is a web-based arcade game where the player controls a character to dodge falling obstacles ("poop") and collect items ("hamburgers") for invincibility. The game features a scoring system based on survival time and collected items, and a global leaderboard powered by Firebase.

## Design and Features

### Style and Design
*   **Theme:** Fun and casual pixel-art style (using emoji and simple graphics).
*   **Colors:** Blue/Sky-blue background palette (`#f0f9ff`, `#0ea5e9`) with distinct entity colors.
*   **Responsiveness:** Mobile-first design. Supports touch drag on mobile and arrow keys on PC.
*   **Modals:** Full-screen overlays for "Game Over" and "Ranking" screens.

### Features
*   **Core Gameplay:**
    *   **Player:** Controlled via arrow keys or touch drag.
    *   **Obstacles (Poop 💩):** Bounce around the screen. Speed and quantity increase over time.
    *   **Items (Hamburger 🍔):** Grant temporary invincibility (immune to poop) and allow eating poop for extra points.
    *   **Scoring:** +1 per tick, +10 for eating poop while invincible.
*   **Game Over:** Triggers when hitting a poop without invincibility. Shows final score.
*   **Leaderboard (Ranking):**
    *   Submit score with Name, Password, and a short Message.
    *   View top 10 scores.
    *   Powered by Firebase Firestore.

## Current Task: Improve Ranking View Visibility

*   **Objective:** Make the ranking view (Leaderboard) more visible and accessible.
*   **Changes:**
    *   **UI (`poop_style.css`):** Updated `#ranking-modal` style to be a full-screen fixed overlay with a dark backdrop (`rgba(0,0,0,0.5)`), matching the Game Over modal's design. This ensures it appears on top of the game area instead of below it.
    *   **Interaction:** "View Ranking" button opens this modal. "Close" button hides it.

## Technical Stack
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES Modules).
*   **Backend:** Firebase (Firestore for database, Analytics).
*   **Assets:** Local images (`412.PNG`) and audio (`Overboard...mp3`).