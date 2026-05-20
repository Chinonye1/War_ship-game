# Warship Game

A browser-based arcade sea battle game where you pilot a warship, dodge enemy fire, and take down enemy ships to win.

## How to Play

- Move: Arrow keys
- Shoot: Space bar
- Aim: Your last movement direction (up, down, left, right)

## Rules

- You start with 15 HP.
- Enemy ships have 10 HP each.
- Your shots reduce enemy HP; enemy shots reduce your HP.
- Colliding with an enemy deals damage.
- Reach 5 enemy kills to win.
- If your HP reaches 0, you lose.

## Win and Lose

- Win screen: You destroy 5 enemy ships.
- Defeat screen: Your ship HP reaches 0.

## Features

- Dynamic enemy spawns with spacing
- Health bars over each ship
- Player and enemy shooting
- Explosion and damage flash effects
- Background music and shooting sound

## Run Locally

Open the root index file in a local server:

- index.html

If you use VS Code Live Server, start it from the project root.

## Controls Summary

- Arrow keys: Move and aim
- Space: Fire

## Notes

- Audio starts on first key press due to browser policies.
- Images and audio are loaded from the images/ and src/sound/ folders.
