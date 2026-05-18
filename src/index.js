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

class EnemyWarship {
  constructor(element) {
    this.width = 100;
    this.height = 50;
    this.speed = 1;
    this.el = element;
    this.container = this.el.parentElement || document.body;
    this.positionX = Math.max(0, Math.random() * Math.max(0, this.container.clientWidth - this.width));
    this.positionY = 10;
    this.updateDom();
    this.chaseInterval = setInterval(() => this.chasePlayer(), 100);
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
      this.positionX +=  Math.min(this.speed, Math.random)
    } else if (player.x < this.positionX) {
      this.positionX -= Math.min(this.speed, Math.random)
    }

    if (player.y > this.positionY) {
      this.positionY += this.speed;
    } else if(player.y=== this.positionY){
        this.positionX += Math.max(0, Math.random() * Math.max(0, this.container.clientWidth - this.width));

    }
    
    else if (player.y < this.positionY) {
      this.positionY -= this.speed;
    }

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
}
function addElement() {
  const seaboard = document.getElementById('seaboard');

  if (!seaboard) {
    return;
  }

  if (enemies.length >= 6) {
    return;
  }

  const newWarship = document.createElement('div');
  newWarship.className = 'opponent-warship';
  newWarship.style.position = 'absolute';
  newWarship.style.width = '100px';
  newWarship.style.height = '50px';
  newWarship.style.backgroundColor = 'red';
  newWarship.style.zIndex = '2';

  const maxX = Math.max(0, seaboard.clientWidth - 100);
  newWarship.style.left = Math.random() * maxX + 'px';
  newWarship.style.top = '10px';

  seaboard.appendChild(newWarship);
  enemies.push(new EnemyWarship(newWarship));
}

addElement();
setInterval(addElement, 3000);

class PlayerBullet {
  constructor() {
    this.width = 50;
    this.height = 30;
    this.speed = 5;
    this.item = document.getElementById('bullets');
    this.container = this.item?.parentElement || document.body;
    this.positionX = Math.max(0, this.container.clientWidth / 2 - this.width / 2);
    this.positionY = Math.max(0, this.container.clientHeight - this.height - 10);
    this.upDateBullet();
  }
  upDateBullet() {
    this.item.style.left = this.positionX + 'px';
    this.item.style.top = this.positionY + 'px';
    this.item.style.width = this.width + 'px';
    this.item.style.height = this.height + 'px';
  }
}


let playerBulletsArr = []

document.addEventListener("keydown", (e) => {
    if(e.code==="Space"){
        const bullet = new PlayerBullet()
        playerBulletsArr.push(bullet)
    }
})





document.addEventListener('keydown', (e) => {
  console.log(e);
  // Prevent the page from scrolling when using arrow keys
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
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
