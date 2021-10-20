const TILE_SIZE = window.innerHeight / 30;

let downedControls = {}

class Terrain {
  constructor(width, height, players) {
    this.width = width;
    this.height = height;
    this.tiles = new Array(width * height).fill(0)
    // .map(e => Math.random() > 0.5 ? 1 : 0);
    this.init()

    this.players = []
    this.movePlayer(19, 19)
  }

  movePlayer(x = this.playerX, y = this.playerY) {
    this.playerX = x
    this.playerY = y
    this.playerAt = y * this.width + x
  }

  init() {
    for(let y = 20; y < this.height; y++) {
      for(let x = 0; x < this.width; x++) {
        let ix = y * this.width + x
        let rand = Math.random()
        if (y == 20) {
          this.tiles[ix] = 'green'
        } else if (y > 30 || (rand > 0.98 && y > 25)) {
          this.tiles[ix] = 'gray'
          if (rand > 0.995 && y > 45) {
            this.tiles[ix] = 'cyan'
          } else if (rand > 0.992 && y > 42) {
            this.tiles[ix] = 'gold'
          } else if (rand > 0.98 && y > 35) {
            this.tiles[ix] = 'brown'
          } else if (rand > 0.98) {
            this.tiles[ix] = 'black'
          } else {
            this.tiles[ix] = 'gray'
          }
        } else {
          this.tiles[ix] = 'maroon'
        }
      }
    }
  }

  drawPlayer() {
    this.ctx.fillText('◀', 10, 90);
  }

  draw(ctx) {
    // ctx.fillStyle = '#000';
    // ctx.fillRect(0, 0, this.width * TILE_SIZE, this.height * TILE_SIZE);
    const playersAt = this.players.map(p => [p.y * this.width + p.x, p])
    // console.log(playersAt)
    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i]) {
        ctx.fillStyle = this.tiles[i];
          // console.log(1)
          // debugger
        ctx.fillRect(i % this.width * TILE_SIZE, Math.floor(i / this.width) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      } 
    }

/*
if (playersAt[i]) {
        ctx.fillStyle = '#000';
        ctx.save()
        // ctx.scale(1, -1);
        // ctx.translate(this.width, 0);
        let m = ctx.measureText('🐒')
        // console.log(m)
        // ctx.fillRect(i % this.width * TILE_SIZE, Math.floor(i / this.width) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.fillText('🐒', i % this.width * TILE_SIZE - (m.width/4), Math.floor(i / this.width) * TILE_SIZE + m.actualBoundingBoxAscent);
        ctx.restore()
      }
      */

    for (const player of this.players) {
      ctx.fillStyle = player.color;
      let m = ctx.measureText('🐒')

      if (player.facing == 'left') {
        ctx.fillText('🐒', player.x * TILE_SIZE - (m.width/4), player.y * TILE_SIZE + m.actualBoundingBoxAscent);
      } else {
        ctx.save();
        // Multiply the y value by -1 to flip vertically
        ctx.scale(-1, 1);
        ctx.fillText('🐒', -player.x * TILE_SIZE - (m.width/4), player.y * TILE_SIZE + m.actualBoundingBoxAscent);
        ctx.restore();
      }

      // ctx.fillRect(player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // this.playerX = (this.playerX + 1) % this.width
    // this.movePlayer()
    this.players.forEach(p => p.tick())
  }

  getTile(x, y) {
    return this.tiles[y * this.width + x]
  }
}

class Player {
  constructor(env, positionX, positionY, gravity) {
    this.env = env
    this.x = positionX
    this.y = positionY
    this.gravity = gravity
  }

  isGrounded = false
  velocityY = 0
  jumpTicks = 0

  tick() { 
    // if (this.env.getTile(Math.floor(this.y), Math.floor(this.y))) {
    //   this.y += this.gravity
    // }
    // this.y = 0.2
    const isGrounded = !!this.env.getTile(Math.floor(this.x), Math.floor(this.y) + 1)
    // this.env.ctx.fillRect(player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    if (this.isGrounded !== isGrounded) console.log('Grounded', isGrounded)

    if (this.jumpTicks) {
      this.jumpTicks--
      this.y -= this.velocityY
      // console.log(1)
    } else if (downedControls.Jump && isGrounded) {
      if (this.jumpTicks == 0) {
        this.velocityY = 0.15
        this.jumpTicks = 10
      }
    } else if (!isGrounded) {
      this.y += this.gravity
      // console.log(3)
    }
    
    if (downedControls.Left) {
      // console.log(4)
      this.x -= 0.15
      this.facing = 'left'
    } else if (downedControls.Right) {
      this.x += 0.15
      this.facing = 'right'
    }

    this.isGrounded = isGrounded
    // console.log('Growwsads unded', isGrounded, this.env.getTile(Math.floor(this.x), Math.floor(this.y) - 1), downedControls.Jump)
  }
}

class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    let w = Math.floor(window.innerWidth / TILE_SIZE)
    let h = Math.floor(window.innerHeight / TILE_SIZE)
    console.log(w)

    this.terrain = new Terrain(w, h);
    this.player = new Player(this.terrain, 19, 19, 0.1)
    this.terrain.players = [this.player]
  }

  start() {
    this.loop();
  }

  clear() {
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#f0f0f0'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawBag(dry, rightOffset = 300) {
    let fontSize = 20
    if (this.canvas.width < 1100) fontSize = 16
    this.ctx.font = `bold ${fontSize}px 'Cascadia Code'`;
    this.ctx.fillStyle = 'black';
    rightOffset += 35
    if (!dry) this.ctx.fillText('👜 Bag', this.canvas.width - rightOffset, 30);
    fontSize -= 2
    this.ctx.font = `bold ${fontSize}px 'Cascadia Code'`;
    let width = 0
    for (let i = 0; i < 10; i++) {
      let m = `${i+1}. (empty)`
      width = Math.max(width, this.ctx.measureText(m).width)
      if (!dry) this.ctx.fillText(m, this.canvas.width - rightOffset, 60 + (i * 20));
    }
    return width
  }

  drawInputs(rightOffset) {
    this.ctx.font = `bold 16px 'Cascadia Code'`;
    this.ctx.fillStyle = 'black';
    rightOffset += 280
    // this.ctx.fillText('🔘 Input', this.canvas.width - rightOffset + 50, 50);
    let controls = ['Jump', 'Break', 'Use', 'Left', 'Place', 'Drop', 'Right', 'Attack', 'Pick[n]']
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        let i = x + y * 3
        let m = controls[i]
        if (downedControls[m]) {
          this.ctx.fillStyle = 'red';
        } else {
          this.ctx.fillStyle = 'black';
        }
        // console.log(downedControls, m)
        this.ctx.fillText(m, this.canvas.width - rightOffset + (70 * x), 60 + (y * 20));
      }
    }
  }

  drawPlayer() {
    this.ctx.font = `bold ${TILE_SIZE + 2}px 'Cascadia Code'`;
    // ▶
    this.ctx.fillText('◀', 10, 90);
  }

  draw() {
    this.terrain.draw(this.ctx);

    // Health
    if (this.canvas.width < 1100) this.ctx.scale(0.6, 0.6)
    this.ctx.fillStyle = 'black';
    this.ctx.font = `bold 28px 'Cascadia Code'`;
    this.ctx.fillText('💖 20', 10, 40);
    this.ctx.fillText('🍒 10', 140, 40);
    this.ctx.fillText('💧 10', 140 + 140, 40);
    this.ctx.fillText('💲 ' + this.player.isGrounded, 140 + 140 + 140, 40);
    this.ctx.fillText('👟', 140 + 140 + 140 + 140, 34);
    this.ctx.fillText(this.player.y, 140 + 140 + 140 + 140 + 54, 40);
    this.ctx.font = `bold 20px 'Cascadia Code'`;
    this.ctx.fillStyle = '#1f1f1f';
    // this.ctx.fillText('m/ms', 560 + 100, 38);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    let bagWidth = this.drawBag(true)
    this.drawBag(false, bagWidth)
    this.drawInputs(bagWidth)
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.drawPlayer()
  }

  timer

  loop = () => {
    this.timer = setInterval(() => {
      this.clear()
      this.draw()
    }, 1000 / 30)
    // this.clear();
    // this.draw();
    // this.timer = setTimeout(this.loop, 1000 / 60);
    // requestAnimationFrame(this.loop)
  }

  stop() {
    clearInterval(this.timer)
  }
}
let game

function load() {
  const canvas = document.getElementById('canvas');
  // draw black background
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#F0F0F0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // draw the game
  function start() {
    game = new Game(canvas, ctx)
    game.start()
  }

  start()
}

load()

let timer
window.addEventListener('resize', () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    game?.stop()
    game = null
    load()
  }, 500)
})

let down = new Set()

window.addEventListener('keydown', e => {
  // console.log(e.code)
  down.add(e.code)

  downedControls = {}
  if (down.has('ArrowUp')) downedControls['Jump'] = true
  if (down.has('ArrowLeft')) downedControls['Left'] = true
  if (down.has('ArrowRight')) downedControls['Right'] = true
  if (down.has('KeyW')) downedControls['Jump'] = true
  if (down.has('KeyA')) downedControls['Left'] = true
  if (down.has('KeyD')) downedControls['Right'] = true

  if (down.has('KeyQ')) downedControls['Drop'] = true
  if (down.has('KeyF')) downedControls['Break'] = true
  if (down.has('KeyG')) downedControls['Place'] = true
  if (down.has('Space')) downedControls['Attack'] = true
  // console.log(downedControls)

  e.preventDefault()
})

window.addEventListener('keyup', e => {
  // console.log('up', e.code)
  down.delete(e.code)
  if (e.code == ('ArrowUp')) downedControls['Jump'] = false
  if (e.code == ('ArrowLeft')) downedControls['Left'] = false
  if (e.code == ('ArrowRight')) downedControls['Right'] = false
  
  if (e.code == ('KeyW')) downedControls['Jump'] = false
  if (e.code == ('KeyA')) downedControls['Left'] = false
  if (e.code == ('KeyD')) downedControls['Right'] = false

  if (e.code == ('KeyQ')) downedControls['Drop'] = false
  if (e.code == ('KeyF')) downedControls['Break'] = false
  if (e.code == ('KeyG')) downedControls['Place'] = false
  if (e.code == ('Space')) downedControls['Attack'] = false
})