# Blueprint

## Overview
This blueprint outlines the integration of Google Analytics and MS Clarity into the web project to track user data.

## Project Outline
- **File:** `index.html`
  - **Description:** The main entry point of the web application, containing the game interface, modals, and Firebase integration.
  - **Changes:** 
    - Google Analytics tracking code has been added to the `<head>` section.
    - MS Clarity tracking code has been added to the `<head>` section.
- **File:** `poop_style.css`
  - **Description:** Stylesheet for the "poop game."
- **File:** `poop_game.js`
  - **Description:** JavaScript logic for the "poop game," including game mechanics, scoring, and interaction with Firebase for ranking.
- **File:** `carrot_game.html`
  - **Description:** Another HTML file in the project, which the user explicitly stated does not require tracking integrations.
- **Firebase Integration:** The project utilizes Firebase for a ranking system, including Firestore for data storage and Firebase Analytics (though the provided GA snippet is separate).

## Current Requested Change Plan and Steps

### Plan
The user requested to integrate MS Clarity for user behavior analytics, providing the specific script to be used.

### Steps
1. **Read `index.html`:** Identified `index.html` as the primary file for integration.
2. **Insert MS Clarity code:** Added the provided MS Clarity script to the `<head>` section of `index.html`, after the Google Analytics script.
3. **Document changes:** Updated `blueprint.md` to document the implemented changes.