# Visioneer Game

Visioneer Game is a computer vision-based game where you control the boxes using hand gestures. This project uses MediaPipe’s HandLandmarker to track your hand movements via your webcam. Use your index finger to pick up and drop boxes into the designated drop zone to score points!

## Table of Contents

- [Features](#features)
- [How to Play](#how-to-play)
- [Installation and Usage](#installation-and-usage)
- [How to Commit and Push on GitHub](#how-to-commit-and-push-on-github)
- [License](#license)

## Features

- **Hand Gesture Tracking:** Uses the MediaPipe HandLandmarker to detect and track your index finger in real time.
- **Interactive Gameplay:** Grab boxes and move them into the drop zone to earn points.
- **Dynamic Score Updating:** Earn 10 points per box. A dynamic typewriter effect shows the score incrementing.
- **Stylish Intro Animation:** Features a typewriter animation for both the title and the instructions.

## How to Play

1. **Start the Game:** Click the "Start Playing" button. This will activate your webcam and hide the initial game instructions.
2. **Control Your Hand:** Position your hand so your index finger is clearly visible. The game will detect the position of your finger.
3. **Grab a Box:** When your finger comes near a block (within a defined distance), the block will be grabbed.
4. **Score Points:** Move and drop the grabbed box into the drop zone. When successfully dropped, you will earn points (10 points per box, incrementing dynamically).
5. **Enjoy the Game:** Continue playing, trying to get as many points as possible before you stop the webcam.

## Installation and Usage

1. **Clone the Repository**

   Open your terminal and run:
   
   ```bash
   git clone https://github.com/IMmercato/visioneer.git
   cd visioneer
