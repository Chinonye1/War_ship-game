class PlayerWarship {
  constructor() {
    this.width = 100;
    this.height = 50;
    this.speed = 5;
    this.warshipAction = document.getElementById('player-warship');
    this.container = this.warshipAction?.parentElement || document.body;
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
  }

  motionLeft() {
    const minX = 0;
    this.positionX = Math.max(minX, this.positionX - this.speed);
    this.motion();
  }
  motionRight() {
    const maxX = this.container.clientWidth - this.width;
    this.positionX = Math.min(maxX, this.positionX + this.speed);
    this.motion();
  }

  motionUp() {
    this.positionY = Math.max(0, this.positionY - this.speed);
    this.motion();
  }
  motionDown() {
    const maxY = this.container.clientHeight - this.height;
    this.positionY = Math.min(maxY, this.positionY + this.speed);
    this.motion();
  }

  // inside class PlayerWarship
  getPosition() {
    return { x: this.positionX, y: this.positionY };
  }
}
const newPlayer = new PlayerWarship();

const enemies = [];
const SPAWN_GAP = 20;

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

class EnemyWarship {
  constructor(element, startX, startY) {
    this.width = 100;
    this.height = 50;
    this.speed = 1;
    this.el = element;
    this.container = this.el.parentElement || document.body;
    this.positionX = startX;
    this.positionY = startY;
    this.updateDom();
    this.chaseInterval = setInterval(() => this.chasePlayer(), 100);
    this.shootInterval = setInterval(() => this.shoot(), 1200);
  }

  updateDom() {
    this.el.style.left = this.positionX + 'px';
    this.el.style.top = this.positionY + 'px';
    this.el.style.width = this.width + 'px';
    this.el.style.height = this.height + 'px';
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
    const hit =
      this.positionX < player.x + newPlayer.width &&
      this.positionX + this.width > player.x &&
      this.positionY < player.y + newPlayer.height &&
      this.positionY + this.height > player.y;

    if (hit) {
      window.location.href = './gemeOver.html';
    }
  }

  destroy() {
    clearInterval(this.chaseInterval);
    clearInterval(this.shootInterval);
    this.el.remove();
  }

  shoot() {
    const bulletX = this.positionX + this.width / 2 - 4;
    const bulletY = this.positionY + this.height;
    enemyBullets.push(new Bullet(bulletX, bulletY, 4, 'enemy'));
  }
}
function addElement() {
  const seaboard = document.getElementById('seaboard');

  if (!seaboard) {
    return;
  }

  if (enemies.length >= 6) {
    return;
  }

  const width = 100;
  const height = 50;
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
    const enemyBox = expandBox({ x: spawn.x, y: spawn.y, width, height }, SPAWN_GAP);
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
  newWarship.style.backgroundColor = 'red';
  newWarship.style.zIndex = '2';
  newWarship.style.left = `${spawn.x}px`;
  newWarship.style.top = `${spawn.y}px`;

  seaboard.appendChild(newWarship);
  enemies.push(new EnemyWarship(newWarship, spawn.x, spawn.y));
}

addElement();
setInterval(addElement, 3000);

const playerBullets = [];
const enemyBullets = [];

class Bullet {
  constructor(x, y, dy, owner) {
    this.width = 8;
    this.height = 16;
    this.dy = dy;
    this.owner = owner;
    this.el = document.createElement('div');
    this.el.className = owner === 'player' ? 'bullet bullet-player' : 'bullet bullet-enemy';
    this.el.style.position = 'absolute';
    this.el.style.width = `${this.width}px`;
    this.el.style.height = `${this.height}px`;
    this.el.style.zIndex = '5';
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
    this.positionY += this.dy;
    this.updateDom();
  }

  isOffscreen() {
    const maxY = this.container.clientHeight;
    return this.positionY < -this.height || this.positionY > maxY + this.height;
  }

  destroy() {
    this.el.remove();
  }
}

function updateBullets() {
  for (let i = playerBullets.length - 1; i >= 0; i -= 1) {
    const bullet = playerBullets[i];
    bullet.update();

    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      const enemy = enemies[j];
      const hitEnemy = rectanglesOverlap(
        { x: bullet.positionX, y: bullet.positionY, width: bullet.width, height: bullet.height },
        { x: enemy.positionX, y: enemy.positionY, width: enemy.width, height: enemy.height }
      );

      if (hitEnemy) {
        bullet.destroy();
        playerBullets.splice(i, 1);
        enemy.destroy();
        enemies.splice(j, 1);
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

  for (let i = enemyBullets.length - 1; i >= 0; i -= 1) {
    const bullet = enemyBullets[i];
    bullet.update();

    const hitPlayer = rectanglesOverlap(
      { x: bullet.positionX, y: bullet.positionY, width: bullet.width, height: bullet.height },
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
      window.location.href = './gemeOver.html';
      return;
    }

    if (bullet.isOffscreen()) {
      bullet.destroy();
      enemyBullets.splice(i, 1);
    }
  }
}

setInterval(updateBullets, 16);





document.addEventListener('keydown', (e) => {
  console.log(e);
  // Prevent the page from scrolling when using arrow keys
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === 'Space') {
    const bulletX = newPlayer.positionX + newPlayer.width / 2 - 4;
    const bulletY = newPlayer.positionY - 16;
    playerBullets.push(new Bullet(bulletX, bulletY, -6, 'player'));
  }

  if (e.code === 'ArrowRight') {
    newPlayer.motionRight();
  } else if (e.code === 'ArrowLeft') {
    newPlayer.motionLeft();
  } else if (e.code === 'ArrowUp') {
    newPlayer.motionUp();
  } else if (e.code === 'ArrowDown') {
    newPlayer.motionDown();
  }
});
