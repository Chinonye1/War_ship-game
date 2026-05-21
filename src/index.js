function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function getScreenTier() {
  const width = window.innerWidth;

  if (isTouchDevice() && width <= 1366) {
    return 'tablet';
  }

  if (width <= 768) {
    return 'mobile';
  }

  if (width <= 1024) {
    return 'tablet';
  }

  return 'desktop';
}

function getPlayerStats() {
  const tier = getScreenTier();

  if (tier === 'mobile') {
    return { width: 85, height: 65, speed: 3 };
  }

  if (tier === 'tablet') {
    return { width: 120, height: 92, speed: 4 };
  }

  return { width: 170, height: 130, speed: 5 };
}

function getEnemyStats() {
  const tier = getScreenTier();

  if (tier === 'mobile') {
    return { width: 100, height: 60, speed: 0.7 };
  }

  if (tier === 'tablet') {
    return { width: 150, height: 90, speed: 0.85 };
  }

  return { width: 200, height: 120, speed: 1 };
}

function getSpawnSize() {
  const tier = getScreenTier();

  if (tier === 'mobile') {
    return { width: 50, height: 25 };
  }

  if (tier === 'tablet') {
    return { width: 75, height: 38 };
  }

  return { width: 100, height: 50 };
}

class PlayerWarship {
  constructor() {
    const stats = getPlayerStats();
    this.width = stats.width;
    this.height = stats.height;
    this.speed = stats.speed;
    this.maxLife = 15;
    this.life = this.maxLife;
    this.isDead = false;
    this.direction = 'up';
    this.warshipAction = document.getElementById('player-warship');
    this.container = this.warshipAction?.parentElement || document.body;
    this.lifeLabel = this.createLifeLabel();
    this.positionX = Math.max(0, this.container.clientWidth / 2 - this.width / 2);
    this.positionY = Math.max(0, this.container.clientHeight - this.height - 10);
    this.motion();
  }

  motion() {
    this.warshipAction.style.left = this.positionX + 'px';
    this.warshipAction.style.top = this.positionY + 'px';
    this.warshipAction.style.width = this.width + 'px';
    this.warshipAction.style.height = this.height + 'px';

    this.getPosition();
    this.updateLifeLabel();
  }

  move(dx, dy, direction) {
    if (this.isDead) {
      return;
    }

    this.direction = direction;

    const maxX = this.container.clientWidth - this.width;
    const maxY = this.container.clientHeight - this.height;

    this.positionX = Math.max(0, Math.min(maxX, this.positionX + dx));
    this.positionY = Math.max(0, Math.min(maxY, this.positionY + dy));

    this.motion();
  }

  motionLeft() {
    this.move(-this.speed, 0, 'left');
  }

  motionRight() {
    this.move(this.speed, 0, 'right');
  }

  motionUp() {
    this.move(0, -this.speed, 'up');
  }

  motionDown() {
    this.move(0, this.speed, 'down');
  }

  getPosition() {
    return { x: this.positionX, y: this.positionY };
  }

  createLifeLabel() {
    if (!this.warshipAction) {
      return null;
    }

    const bar = document.createElement('div');
    bar.className = 'life-bar life-bar-player';

    const fill = document.createElement('div');
    fill.className = 'life-fill life-fill-player';

    bar.appendChild(fill);
    this.warshipAction.appendChild(bar);

    return { bar, fill };
  }

  updateLifeLabel() {
    if (!this.lifeLabel) {
      return;
    }

    const percent = Math.max(0, Math.min(100, (this.life / this.maxLife) * 100));
    this.lifeLabel.fill.style.width = `${percent}%`;
  }

  takeDamage(amount) {
    if (this.isDead) {
      return;
    }

    if (this.warshipAction) {
      this.warshipAction.classList.add('hit-flash');

      setTimeout(() => {
        this.warshipAction.classList.remove('hit-flash');
      }, 200);
    }

    this.life = Math.max(0, this.life - amount);
    this.updateLifeLabel();

    if (this.life === 0) {
      this.isDead = true;

      if (this.warshipAction) {
        const blastX = this.positionX + this.width / 2 - 24;
        const blastY = this.positionY + this.height / 2 - 24;
        createExplosion(this.container, blastX, blastY);
      }

      if (!gameEnded) {
        gameEnded = true;
        window.location.href = './src/gemeOver.html';
      }
    }
  }
}

const newPlayer = new PlayerWarship();

const backgroundSound = new Audio('./src/sound/backgroundmusic.mp3');
backgroundSound.loop = true;
backgroundSound.volume = 0.35;

const shootingSound = new Audio('./src/sound/shooting%20sound.mp3');
shootingSound.volume = 0.6;

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) {
    return;
  }

  audioUnlocked = true;
  backgroundSound.play().catch(() => {});
}

function playShootSound() {
  const shot = shootingSound.cloneNode();
  shot.volume = shootingSound.volume;
  shot.play().catch(() => {});
}

const enemies = [];
let SPAWN_GAP = 20;
let MAX_ENEMIES = 6;
let WIN_KILLS = 15;
let ENEMY_SPEED_MULT = 1;
let ENEMY_SHOOT_INTERVAL = 1200;
let ENEMY_SPAWN_RATE = 3000;

const BULLET_DAMAGE = 1;
const COLLISION_DAMAGE = 5;

let kills = 0;
let money = 0;
let gameEnded = false;
let gameStarted = false;
let currentLevel = 1;
let spawnIntervalId = null;
let bulletsIntervalId = null;

function getPlayerAmmoCap(level) {
  const expectedKills = 10 + level * 5;
  return Math.max(expectedKills * 4, expectedKills * 2 + 18);
}

let playerAmmoCap = getPlayerAmmoCap(currentLevel);
let playerAmmo = playerAmmoCap;

function applyLevelSettings(level) {
  // Stronger challenge curve: more enemies and faster pressure per level.
  MAX_ENEMIES = Math.min(7 + level * 2, 28);
  WIN_KILLS = 10 + level * 5;
  ENEMY_SPEED_MULT = Math.min(1 + level * 0.18, 4.2);
  ENEMY_SHOOT_INTERVAL = Math.max(320, 1400 - (level - 1) * 95);
  ENEMY_SPAWN_RATE = Math.max(450, 2200 - (level - 1) * 170);
}

function createScoreboard() {
  const board = document.createElement('div');
  board.className = 'scoreboard';
  board.innerHTML = `Level: ${currentLevel} <br> Kills: ${kills}/${WIN_KILLS} <br> Ammo: ${playerAmmo}/${playerAmmoCap} <br> Money: $${money}`;

  const seaboard = document.getElementById('seaboard');
  (seaboard || document.body).appendChild(board);

  return board;
}

const scoreboard = createScoreboard();

function updateScoreboard() {
  if (!scoreboard) {
    return;
  }

  scoreboard.classList.toggle('ammo-low', playerAmmo > 0 && playerAmmo <= 5);
  scoreboard.classList.toggle('ammo-empty', playerAmmo === 0);
  scoreboard.innerHTML = `Level: ${currentLevel} <br> Kills: ${kills}/${WIN_KILLS} <br> Ammo: ${playerAmmo}/${playerAmmoCap} <br> Money: $${money}`;
}

function rectanglesOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function expandBox(box, padding) {
  return {
    x: box.x - padding,
    y: box.y - padding,
    width: box.width + padding * 2,
    height: box.height + padding * 2,
  };
}

function getEdgeSpawnPosition(seaboard, width, height) {
  const edge = Math.floor(Math.random() * 4);
  const maxX = Math.max(0, seaboard.clientWidth - width);
  const maxY = Math.max(0, seaboard.clientHeight - height);

  if (edge === 0) {
    return { x: Math.random() * maxX, y: 0 };
  }

  if (edge === 1) {
    return { x: Math.random() * maxX, y: maxY };
  }

  if (edge === 2) {
    return { x: 0, y: Math.random() * maxY };
  }

  return { x: maxX, y: Math.random() * maxY };
}

function createExplosion(container, x, y) {
  if (!container) {
    return;
  }

  const blast = document.createElement('div');
  blast.className = 'explosion';
  blast.style.left = `${x}px`;
  blast.style.top = `${y}px`;

  container.appendChild(blast);

  setTimeout(() => {
    blast.remove();
  }, 500);
}

class EnemyWarship {
  constructor(element, startX, startY) {
    const stats = getEnemyStats();
    this.width = stats.width;
    this.height = stats.height;
    this.speed = stats.speed * ENEMY_SPEED_MULT;
    this.maxLife = 2;
    this.life = this.maxLife;
    this.isDestroyed = false;
    this.el = element;
    this.container = this.el.parentElement || document.body;
    this.lifeLabel = this.createLifeLabel();
    this.positionX = startX;
    this.positionY = startY;

    this.updateDom();

    this.chaseInterval = setInterval(() => this.chasePlayer(), 100);
    this.shootInterval = setInterval(() => this.shoot(), ENEMY_SHOOT_INTERVAL);
  }

  updateDom() {
    this.el.style.left = this.positionX + 'px';
    this.el.style.top = this.positionY + 'px';
    this.el.style.width = this.width + 'px';
    this.el.style.height = this.height + 'px';

    this.updateLifeLabel();
  }

  chasePlayer() {
    const player = newPlayer.getPosition();

    if (player.x > this.positionX) {
      this.positionX += this.speed;
    } else if (player.x < this.positionX) {
      this.positionX -= this.speed;
    }

    if (player.y > this.positionY) {
      this.positionY += this.speed;
    } else if (player.y < this.positionY) {
      this.positionY -= this.speed;
    }

    const maxX = Math.max(0, this.container.clientWidth - this.width);
    const maxY = Math.max(0, this.container.clientHeight - this.height);

    this.positionX = Math.max(0, Math.min(maxX, this.positionX));
    this.positionY = Math.max(0, Math.min(maxY, this.positionY));

    this.updateDom();
    this.checkCollision(player);
  }

  checkCollision(player) {
    if (this.isDestroyed) {
      return;
    }

    const hit =
      this.positionX < player.x + newPlayer.width &&
      this.positionX + this.width > player.x &&
      this.positionY < player.y + newPlayer.height &&
      this.positionY + this.height > player.y;

    if (hit) {
      newPlayer.takeDamage(COLLISION_DAMAGE);
      this.takeDamage(COLLISION_DAMAGE);
    }
  }

  destroy() {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    clearInterval(this.chaseInterval);
    clearInterval(this.shootInterval);

    this.el.remove();

    const idx = enemies.indexOf(this);

    if (idx !== -1) {
      enemies.splice(idx, 1);
    }
  }

  shoot() {
    if (this.isDestroyed || gameEnded || !gameStarted) {
      return;
    }

    const bulletX = this.positionX + this.width / 2 - 4;
    const bulletY = this.positionY + this.height / 2;

    const player = newPlayer.getPosition();
    const targetX = player.x + newPlayer.width / 2;
    const targetY = player.y + newPlayer.height / 2;

    const angle = Math.atan2(targetY - bulletY, targetX - bulletX);
    const speed = 4;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;

    enemyBullets.push(new Bullet(bulletX, bulletY, dx, dy, 'enemy'));
  }

  createLifeLabel() {
    const bar = document.createElement('div');
    bar.className = 'life-bar life-bar-enemy';

    const fill = document.createElement('div');
    fill.className = 'life-fill life-fill-enemy';

    bar.appendChild(fill);
    this.el.appendChild(bar);

    return { bar, fill };
  }

  updateLifeLabel() {
    if (!this.lifeLabel) {
      return;
    }

    const percent = Math.max(0, Math.min(100, (this.life / this.maxLife) * 100));
    this.lifeLabel.fill.style.width = `${percent}%`;
  }

  takeDamage(amount) {
    if (this.isDestroyed) {
      return;
    }

    this.el.classList.add('hit-flash');

    setTimeout(() => {
      this.el.classList.remove('hit-flash');
    }, 200);

    this.life = Math.max(0, this.life - amount);
    this.updateLifeLabel();

    if (this.life === 0) {
      const blastX = this.positionX + this.width / 2 - 24;
      const blastY = this.positionY + this.height / 2 - 24;

      createExplosion(this.container, blastX, blastY);
      this.destroy();
    }
  }
}

function addElement() {
  const seaboard = document.getElementById('seaboard');

  if (!seaboard) {
    return;
  }

  if (gameEnded) {
    return;
  }

  if (enemies.length >= MAX_ENEMIES) {
    return;
  }

  const spawnSize = getSpawnSize();
  const width = spawnSize.width;
  const height = spawnSize.height;

  const playerBox = expandBox(
    {
      x: newPlayer.positionX,
      y: newPlayer.positionY,
      width: newPlayer.width,
      height: newPlayer.height,
    },
    SPAWN_GAP
  );

  let spawn = getEdgeSpawnPosition(seaboard, width, height);
  let attempts = 0;

  while (attempts < 50) {
    const enemyBox = expandBox(
      {
        x: spawn.x,
        y: spawn.y,
        width,
        height,
      },
      SPAWN_GAP
    );

    const overlapsPlayer = rectanglesOverlap(enemyBox, playerBox);

    const overlapsEnemy = enemies.some((enemy) =>
      rectanglesOverlap(enemyBox, {
        x: enemy.positionX,
        y: enemy.positionY,
        width: enemy.width,
        height: enemy.height,
      })
    );

    if (!overlapsPlayer && !overlapsEnemy) {
      break;
    }

    spawn = getEdgeSpawnPosition(seaboard, width, height);
    attempts += 1;
  }

  if (attempts >= 50) {
    return;
  }

  const newWarship = document.createElement('div');
  newWarship.className = 'opponent-warship';
  newWarship.style.position = 'absolute';
  newWarship.style.width = `${width}px`;
  newWarship.style.height = `${height}px`;
  newWarship.style.backgroundColor = 'transparent';
  newWarship.style.zIndex = '2';
  newWarship.style.left = `${spawn.x}px`;
  newWarship.style.top = `${spawn.y}px`;

  seaboard.appendChild(newWarship);

  enemies.push(new EnemyWarship(newWarship, spawn.x, spawn.y));
}

function startGame(levelInput) {
  const modal = document.getElementById('difficulty-modal');
  if (modal) modal.style.display = 'none';

  if (typeof levelInput === 'number') {
    currentLevel = Math.max(1, Math.floor(levelInput));
  } else {
    // Keep compatibility with existing HTML button call startGame('easy').
    currentLevel = 1;
  }

  applyLevelSettings(currentLevel);
  playerAmmoCap = getPlayerAmmoCap(currentLevel);
  playerAmmo = playerAmmoCap;

  updateScoreboard();
  gameStarted = true;
  unlockAudio();

  addElement();
  spawnIntervalId = setInterval(addElement, ENEMY_SPAWN_RATE);
  bulletsIntervalId = setInterval(updateBullets, 16);
  updatePlayerMovement();
}

function handleLevelComplete() {
  gameStarted = false; // Pause actions
  clearInterval(spawnIntervalId);
  clearInterval(bulletsIntervalId);

  const nextLevel = currentLevel + 1;

  // Show "Next Level" Modal
  const nextModal = document.getElementById('next-level-modal');
  if (nextModal) {
    nextModal.style.display = 'flex';
    document.getElementById('next-level-desc').textContent = `Level ${nextLevel} incoming. Stronger enemies and faster attacks ahead!`;
    const nextBtn = document.getElementById('btn-next-level');
    nextBtn.onclick = () => {
      nextModal.style.display = 'none';
      resetForNextLevel();
      startGame(nextLevel);
    };
  }
}

function resetForNextLevel() {
  kills = 0;
  // Money persists across levels
  gameEnded = false;
  playerAmmoCap = getPlayerAmmoCap(currentLevel);
  playerAmmo = playerAmmoCap;

  // Clear enemies
  for (const enemy of [...enemies]) {
    enemy.isDestroyed = true;
    clearInterval(enemy.chaseInterval);
    clearInterval(enemy.shootInterval);
    enemy.el.remove();
  }
  enemies.length = 0;

  // Clear bullets
  for (const bullet of [...playerBullets, ...enemyBullets]) {
    bullet.destroy();
  }
  playerBullets.length = 0;
  enemyBullets.length = 0;

  // Reset player (optional full heal, but maybe just reset position)
  newPlayer.isDead = false;
  newPlayer.life = newPlayer.maxLife;
  newPlayer.updateLifeLabel();
  if (newPlayer.warshipAction) {
    newPlayer.warshipAction.style.display = 'block';
  }
  newPlayer.positionX = Math.max(0, newPlayer.container.clientWidth / 2 - newPlayer.width / 2);
  newPlayer.positionY = Math.max(0, newPlayer.container.clientHeight - newPlayer.height - 10);
  newPlayer.motion();
  
  updateScoreboard();
}

const playerBullets = [];
const enemyBullets = [];

class Bullet {
  constructor(x, y, dx, dy, owner) {
    // make bullet elements large enough for PNGs to display clearly
    if (owner === 'player') {
      this.width = 16;
      this.height = 32;
    } else {
      this.width = 14;
      this.height = 32;
    }
    this.dx = dx;
    this.dy = dy;
    this.owner = owner;

    this.el = document.createElement('div');
    this.el.className = owner === 'player' ? 'bullet bullet-player' : 'bullet bullet-enemy';
    this.el.style.position = 'absolute';
    this.el.style.width = `${this.width}px`;
    this.el.style.height = `${this.height}px`;
    this.el.style.zIndex = '5';

    // rotate the bullet to point in its movement direction
    const angle = Math.atan2(this.dy, this.dx); // radians from +x axis
    const angleDeg = (angle * 180) / Math.PI;
    // images are drawn pointing up, so add 90deg to align
    const rotationDeg = angleDeg + 90;
    this.el.style.transform = `rotate(${rotationDeg}deg)`;
    this.el.style.transformOrigin = 'center center';

    this.container = document.getElementById('seaboard') || document.body;
    this.container.appendChild(this.el);

    this.positionX = x;
    this.positionY = y;

    this.updateDom();
  }

  updateDom() {
    this.el.style.left = `${this.positionX}px`;
    this.el.style.top = `${this.positionY}px`;
  }

  update() {
    this.positionX += this.dx;
    this.positionY += this.dy;
    this.updateDom();
  }

  isOffscreen() {
    const maxY = this.container.clientHeight;
    const maxX = this.container.clientWidth;

    return (
      this.positionY < -this.height ||
      this.positionY > maxY + this.height ||
      this.positionX < -this.width ||
      this.positionX > maxX + this.width
    );
  }

  destroy() {
    this.el.remove();
  }
}

function shootPlayerBullet() {
  if (!gameStarted || gameEnded || newPlayer.isDead) {
    return;
  }
  if (playerAmmo <= 0) {
    updateScoreboard();
    return;
  }
  // Simple targeting: if there's an enemy, shoot at the nearest one (any angle).
  // Otherwise fall back to keyboard/direction aiming (including diagonals).
  const BULLET_SPEED = 6;

  // find nearest enemy center
  let target = null;
  if (enemies.length > 0) {
    const px = newPlayer.positionX + newPlayer.width / 2;
    const py = newPlayer.positionY + newPlayer.height / 2;
    let best = Infinity;
    for (const e of enemies) {
      const ex = e.positionX + e.width / 2;
      const ey = e.positionY + e.height / 2;
      const d = Math.hypot(ex - px, ey - py);
      if (d < best) {
        best = d;
        target = { x: ex, y: ey };
      }
    }
  }

  let ux, uy;
  if (target) {
    const px = newPlayer.positionX + newPlayer.width / 2;
    const py = newPlayer.positionY + newPlayer.height / 2;
    const vx = target.x - px;
    const vy = target.y - py;
    const mag = Math.hypot(vx, vy) || 1;
    ux = vx / mag;
    uy = vy / mag;
  } else {
    // keyboard / stored-direction fallback
    let vx = 0;
    let vy = 0;
    if (pressedKeys.has('ArrowUp')) vy -= 1;
    if (pressedKeys.has('ArrowDown')) vy += 1;
    if (pressedKeys.has('ArrowLeft')) vx -= 1;
    if (pressedKeys.has('ArrowRight')) vx += 1;

    if (vx === 0 && vy === 0) {
      const dir = newPlayer.direction || 'up';
      const dirMap = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        'up-left': { x: -1, y: -1 },
        'up-right': { x: 1, y: -1 },
        'down-left': { x: -1, y: 1 },
        'down-right': { x: 1, y: 1 },
      };
      const v = dirMap[dir] || dirMap.up;
      vx = v.x;
      vy = v.y;
    }

    const mag = Math.hypot(vx, vy) || 1;
    ux = vx / mag;
    uy = vy / mag;
  }

  const dx = ux * BULLET_SPEED;
  const dy = uy * BULLET_SPEED;

  // spawn bullet at ship front
  const BULLET_W = 16;
  const BULLET_H = 32;
  const originX = newPlayer.positionX + newPlayer.width / 2 + ux * (newPlayer.width / 2) - BULLET_W / 2;
  const originY = newPlayer.positionY + newPlayer.height / 2 + uy * (newPlayer.height / 2) - BULLET_H / 2;

  playerBullets.push(new Bullet(originX, originY, dx, dy, 'player'));
  playerAmmo = Math.max(0, playerAmmo - 1);
  updateScoreboard();
  playShootSound();
}

function updateBullets() {
  for (let i = playerBullets.length - 1; i >= 0; i -= 1) {
    const bullet = playerBullets[i];

    bullet.update();

    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      const enemy = enemies[j];

      const hitEnemy = rectanglesOverlap(
        {
          x: bullet.positionX,
          y: bullet.positionY,
          width: bullet.width,
          height: bullet.height,
        },
        {
          x: enemy.positionX,
          y: enemy.positionY,
          width: enemy.width,
          height: enemy.height,
        }
      );

      if (hitEnemy) {
        bullet.destroy();
        playerBullets.splice(i, 1);

        enemy.takeDamage(BULLET_DAMAGE);

        if (enemy.isDestroyed) {
          kills += 1;
          money += 100; // Reward money for destructing a ship
          
          // Refill player life back to max as a reward
          newPlayer.life = newPlayer.maxLife;
          newPlayer.updateLifeLabel();
          
          updateScoreboard();

          if (kills >= WIN_KILLS && !gameEnded) {
            handleLevelComplete();
          }
        }

        break;
      }
    }

    if (i >= playerBullets.length) {
      continue;
    }

    if (bullet.isOffscreen()) {
      bullet.destroy();
      playerBullets.splice(i, 1);
    }
  }

  // Bullet-vs-bullet collisions: destroy both bullets when they hit
  for (let i = playerBullets.length - 1; i >= 0; i -= 1) {
    const pb = playerBullets[i];
    for (let j = enemyBullets.length - 1; j >= 0; j -= 1) {
      const eb = enemyBullets[j];

      const hit = rectanglesOverlap(
        { x: pb.positionX, y: pb.positionY, width: pb.width, height: pb.height },
        { x: eb.positionX, y: eb.positionY, width: eb.width, height: eb.height }
      );

      if (hit) {
        // small explosion at collision point
        const mx = (pb.positionX + eb.positionX) / 2;
        const my = (pb.positionY + eb.positionY) / 2;
        createExplosion(pb.container || document.getElementById('seaboard') || document.body, mx, my);

        // remove both bullets
        pb.destroy();
        playerBullets.splice(i, 1);

        eb.destroy();
        enemyBullets.splice(j, 1);

        // break inner loop and continue outer
        break;
      }
    }
  }

  for (let i = enemyBullets.length - 1; i >= 0; i -= 1) {
    const bullet = enemyBullets[i];

    bullet.update();

    const hitPlayer = rectanglesOverlap(
      {
        x: bullet.positionX,
        y: bullet.positionY,
        width: bullet.width,
        height: bullet.height,
      },
      {
        x: newPlayer.positionX,
        y: newPlayer.positionY,
        width: newPlayer.width,
        height: newPlayer.height,
      }
    );

    if (hitPlayer) {
      bullet.destroy();
      enemyBullets.splice(i, 1);
      newPlayer.takeDamage(BULLET_DAMAGE);
      return;
    }

    if (bullet.isOffscreen()) {
      bullet.destroy();
      enemyBullets.splice(i, 1);
    }
  }
}

const pressedKeys = new Set();

document.addEventListener('keydown', (e) => {
  unlockAudio();

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === 'Space') {
    shootPlayerBullet();
    return;
  }

  pressedKeys.add(e.code);
});

document.addEventListener('keyup', (e) => {
  pressedKeys.delete(e.code);
});

function updatePlayerMovement() {
  if (!gameStarted) {
    return; // Will be started by startGame
  }

  if (gameEnded || newPlayer.isDead) {
    requestAnimationFrame(updatePlayerMovement);
    return;
  }

  let dx = 0;
  let dy = 0;
  let direction = newPlayer.direction;

  if (pressedKeys.has('ArrowUp')) {
    dy -= newPlayer.speed;
  }

  if (pressedKeys.has('ArrowDown')) {
    dy += newPlayer.speed;
  }

  if (pressedKeys.has('ArrowLeft')) {
    dx -= newPlayer.speed;
  }

  if (pressedKeys.has('ArrowRight')) {
    dx += newPlayer.speed;
  }

  if (dx < 0 && dy < 0) {
    direction = 'up-left';
  } else if (dx > 0 && dy < 0) {
    direction = 'up-right';
  } else if (dx < 0 && dy > 0) {
    direction = 'down-left';
  } else if (dx > 0 && dy > 0) {
    direction = 'down-right';
  } else if (dx < 0) {
    direction = 'left';
  } else if (dx > 0) {
    direction = 'right';
  } else if (dy < 0) {
    direction = 'up';
  } else if (dy > 0) {
    direction = 'down';
  }

  if (dx !== 0 || dy !== 0) {
    newPlayer.move(dx, dy, direction);
  }

  requestAnimationFrame(updatePlayerMovement);
}

updatePlayerMovement();

// Mobile controls setup
const handleTouchStart = (key) => (e) => {
  e.preventDefault();
  pressedKeys.add(key);
  unlockAudio();
};

const handleTouchEnd = (key) => (e) => {
  e.preventDefault();
  pressedKeys.delete(key);
};

const setupMobileButton = (id, key) => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('touchstart', handleTouchStart(key), { passive: false });
    btn.addEventListener('touchend', handleTouchEnd(key), { passive: false });
    btn.addEventListener('mousedown', handleTouchStart(key));
    btn.addEventListener('mouseup', handleTouchEnd(key));
    btn.addEventListener('mouseleave', handleTouchEnd(key));
  }
};

setupMobileButton('up-btn', 'ArrowUp');
setupMobileButton('down-btn', 'ArrowDown');
setupMobileButton('left-btn', 'ArrowLeft');
setupMobileButton('right-btn', 'ArrowRight');

const shootBtn = document.getElementById('shoot-btn');
if (shootBtn) {
  const fireStart = (e) => {
    e.preventDefault();
    unlockAudio();
    shootPlayerBullet();
  };
  shootBtn.addEventListener('touchstart', fireStart, { passive: false });
  shootBtn.addEventListener('mousedown', fireStart);
}
