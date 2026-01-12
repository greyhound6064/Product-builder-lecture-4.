# Music Genre Recommendation Service

## Overview
This is a web application that recommends a random music genre to the user. It features a dark mode UI, a glassmorphism-style card to display the recommendation, and is fully responsive.

## Design and Features

### Style and Design
*   **Theme:** Dark mode with a deep, immersive feel.
*   **Layout:** A centrally-located button to trigger the recommendation.
*   **Card UI:** A semi-transparent "glassmorphism" card that appears with a smooth animation to display the genre information. It includes a relevant image for each genre.
*   **Typography:** Clean, modern fonts for readability.
*   **Responsiveness:** The layout adapts gracefully to both mobile and desktop screens.

### Features
*   **Random Genre Recommendation:** Clicking the "Recommend Today's Music Genre" button selects a random genre from a predefined list.
*   **Detailed Information:** The recommendation card displays the genre's name, a representative image, a brief description, a prominent artist, and a classic song.

## Current Task: Add Images and More Genres

*   **Objective:** Enhance the user experience by adding more genres and displaying a unique image for each recommendation.
*   **Steps:**
    1.  **HTML (`index.html`):** Add an `<img>` element to the card structure to hold the genre image.
    2.  **CSS (`style.css`):** Style the new image element to ensure it is responsive and visually integrated into the card design.
    3.  **JavaScript (`main.js`):**
        *   Expand the `genreData` array with more genres.
        *   Add an `imageUrl` property to each genre object.
        *   Update the recommendation logic to set the image source dynamically.
