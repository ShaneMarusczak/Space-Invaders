# Space Invaders

A browser-based recreation of the classic arcade game, Space Invaders. This project challenges players to defend against waves of enemy ships that advance towards the player's ship. With dynamic enemy movement, progressive difficulty, and celebratory fireworks on victory, this game offers a nostalgic yet engaging experience.

---

## Installation Instructions

1. **Clone or Download the Repository**  
   Download the project files via GitHub or clone the repository using:
   git clone https://github.com/ShaneMarusczak/Space-Invaders.git

2. **Open the Project**  
   Navigate to the project directory and open the `index.html` file in your favorite browser. No additional server configuration or dependencies are required since the game is entirely client-side.

3. **Dependencies**  
   - Google Fonts are loaded dynamically via a CDN.
   - Favicon and web manifest files are included for enhanced mobile device support.
   - No external JavaScript libraries are needed.

---

## Usage Guide

- **Starting the Game**  
  Click on the “Start” button on the page. A modal popup will indicate the game’s commencement.
- **Controls**  
  - Move Left: Arrow Left or "a" key  
  - Move Right: Arrow Right or "d" key  
  - Fire Laser: Space, Arrow Up, or "w" key
- **Game Mechanics**  
  - Destroy enemy ships and avoid incoming enemy lasers.
  - The game accelerates as enemy ships descend, increasing difficulty.
  - Progress awards score upgrades and occasional visual effects like upgraded lasers.
- **Restarting**  
  When the game is over, click on the “Play Again” button to restart.

---

## File and Structure Overview

- **index.html**  
  The main HTML file that structures the game layout, including the canvas for fireworks effects, game board, and control buttons.

- **css/**  
  - *style.css* and *style.min.css*:  
    These files provide the layout, animations, and responsive design styling for the game elements such as enemy ships, lasers, and buttons.
  
- **js/**  
  - *space_invaders.js* and *space_invaders.min.js*:  
    Contains the game logic including enemy movement, player controls, collision detection, scoring, and game-loop management.
  - *fireworks.js* and *fireworks.min.js*:  
    Implements the celebratory fireworks effect using the HTML canvas when a player wins.
  
- **images/**  
  Stores all graphics used in the game including enemy ship images, player ship image, home icon, and GitHub icon.

- **LICENSE.md**  
  Contains the licensing information (unlicense) indicating that this project is public domain.

- **readme.md**  
  This file, offering an overview and instructions for the project.

- **site.webmanifest & Favicons**  
  Ensures proper display of icons and metadata on various devices.

---

## Configuration Details

- **Game Settings in JavaScript**  
  Several game parameters are defined in the JavaScript files:
  - Movement speed, firing intervals, laser upgrade thresholds, and enemy ship point values are set to balance game difficulty.
  - Cookies are used to persist the player's current score, high score, wins, and losses across sessions.
  
- **Styling Configurations**  
  Responsive design and animations (e.g., flashing and fade effects) are managed via CSS keyframes in both *style.css* and its minified version.

- **Manifest & Icons**  
  The manifest file (`site.webmanifest`) and favicons ensure that the game has a polished appearance on both desktop and mobile browsers.

---

## Contribution Guidelines

Contributions to enhance gameplay features, design, or performance improvements are welcome.  
- Please review the project's style and structure before submitting pull requests.
- For major changes or new feature suggestions, it is recommended to open an issue first to discuss potential modifications.  
See [CONTRIBUTING.md](CONTRIBUTING.md) for additional guidelines if available.

---

## License Information

This project is released into the public domain under the Unlicense.  
For full details, see the [LICENSE.md](LICENSE.md) file.

---

Enjoy playing Space Invaders and feel free to contribute or provide feedback to help make the game even better!
