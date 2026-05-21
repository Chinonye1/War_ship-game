# Warship Game

🚢 A browser-based arcade sea battle game where you pilot a warship, dodge enemy fire, manage limited ammo, and sink enemy ships to win.

## 🌐 Live Demo

[Play the game here](https://chinonye1.github.io/War_ship-game/)

## 🖼️ Preview

![Warship Game demo](images/demo%20pics.png)

## ✨ Highlights

- 🎯 Limited ammo system that makes every shot count.
- 🔁 Ammo refills when you destroy enemy ships.
- ⚠️ Low-ammo and empty-ammo HUD warnings.
- 📊 On-screen scoreboard for level, kills, ammo, and money.
- 🛡️ Player and enemy health bars for quick combat feedback.
- 💥 Explosion, hit-flash, and shooting effects.
- 🔊 Background music and fire sound effects.

## 🆕 What’s New

- Ammo is now visible at all times in the HUD.
- Ammo scales with the level so the game stays challenging but still beatable.
- Enemy ships were rebalanced to match the ammo economy.
- The scoreboard now highlights when ammo is running low or empty.
- A demo screenshot is included directly in the README.

## 🎮 How to Play

- Move: Arrow keys
- Shoot: Space bar
- Aim: Your last movement direction
- Recover ammo: Destroy enemy ships

## 📋 Rules

- You start with 15 HP.
- Enemy ships have 2 HP each.
- Your shots reduce enemy HP; enemy shots reduce your HP.
- Colliding with an enemy deals damage.
- Reach the required kill count to win the level.
- If your HP reaches 0, you lose.

## 🧭 Controls

| Action | Input |
| --- | --- |
| Move | Arrow keys |
| Aim | Last movement direction |
| Fire | Space bar |
| Mobile movement | On-screen D-pad |
| Mobile fire | FIRE button |

## 🧰 Features

- Dynamic enemy spawns with spacing
- Limited ammo with refill-on-kill rewards
- Health bars over each ship
- Player and enemy shooting
- Explosion and damage flash effects
- Background music and shooting sound
- HUD scoreboard for level, kills, ammo, and money

## 🚀 Run Locally

1. Open `index.html` from the project root using a local server.
2. If you use VS Code Live Server, start it from the project root.

## 📝 Notes

- Audio starts on the first key press because of browser autoplay rules.
- Images are loaded from the `images/` folder.
- Sound files are loaded from `src/sound/`.