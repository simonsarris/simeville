
import { Building } from './building.js';
import { randomInt, random } from './util.js';

const SceneWidth = 1600;
const SceneHeight = 880;
const Stars = [];
for (let i = 0; i < 50; i++) { Stars.push(Math.random() * 1600); Stars.push(Math.random() * 400); }

export class Town {
  constructor(canvas, skyCanvas) {
    // eslint-disable-next-line no-param-reassign
    canvas.onselectstart = function () { return false; };
    const arr = [];
    this.buildings = arr;
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.selection = null;
    this.mode = 'build'; // or 'select' or 'drag'
    this.x = 0;
    this.y = 0;

    // dragging. draggedObject doubles as state, null = no drag ongoing
    this.draggedObject = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartObjectX = 0;
    this.dragStartObjectY = 0;

    // sky, sun, foreground
    this.skyCtx = skyCanvas.getContext('2d');
    this.skylineY = this.canvas.height / 2;
    const skyImage = new Image();
    skyImage.src = 'images/sky.jpg';
    this.sky = { x: 0, y: 0, width: SceneWidth, height: 400, img: skyImage };
    const sunImage = new Image();
    sunImage.src = 'images/sun.png';
    this.sun = { x: 950, y: 50, width: 150, height: 150, img: sunImage };
    const moonImage = new Image();
    moonImage.src = 'images/moon.png';
    this.moon = { x: 350, y: 600, width: 75, height: 75, img: moonImage };
    const starsImage = new Image();
    starsImage.src = 'images/stars.png';
    this.stars = { x: 0, y: -200, width: 1600, height: 1600, img: starsImage, rotation: 0 };
    const foreImage = new Image();
    foreImage.src = 'images/foreground.png';
    this.foreground = { x: 0, y: 0, width: SceneWidth, height: SceneHeight, img: foreImage };

    this.buildingsImage = new Image();
    this.buildingsImage.src = 'images/buildings/buildings-template.png';
    this.buildingsImages = [
      { x: 8, y: 136, w: 30, h: 60 },
      { x: 46, y: 93, w: 31, h: 104 },
      { x: 91, y: 72, w: 32, h: 125 },
      { x: 173, y: 154, w: 49, h: 41 },
    ];
    this.lastBuiltIndex = 0;


    const self = this;
    canvas.addEventListener('mousedown', function (e) {
      // if (self.mode !== 'drag') return;
      self.setCoords(e);
      const { x, y } = self;
      // ehh
      if (self.containsObject(x, y, self.sun)) self.draggedObject = self.sun;
      if (self.containsObject(x, y, self.moon)) self.draggedObject = self.moon;

      if (self.draggedObject !== null) {
        self.dragStartX = x;
        self.dragStartY = y;
        self.dragStartObjectX = self.draggedObject.x;
        self.dragStartObjectY = self.draggedObject.y;
      }
    });

    canvas.addEventListener('mousemove', function (e) {
      // if (self.mode !== 'drag') return;
      if (self.draggedObject === null) return;
      self.setCoords(e);
      const { x, y } = self;
      self.draggedObject.x = self.dragStartObjectX - (self.dragStartX - x);
      self.draggedObject.y = self.dragStartObjectY - (self.dragStartY - y);
      if (self.draggedObject === self.sun) {
        self.moon.y = Math.max(20, 650 - self.sun.y);
      } else if (self.draggedObject === self.moon) {
        self.sun.y = Math.max(20, 650 - self.moon.y);
      }
    });

    canvas.addEventListener('mouseup', function (e) {
      if (self.draggedObject !== null) {
        self.draggedObject = null;
        return;
      }
      self.setCoords(e);
      const { x, y } = self;
      console.log(x, y);
      if (self.mode === 'build') self.buildHouse(x, y);
      else if (self.mode === 'select') self.selectHouse(x, y);
    });

    this.update();
  }

  // the only reason this sets x/y is to avoid allocating an array because I'm a grinch
  setCoords(e) {
    const can = this.canvas;
    const box = can.getBoundingClientRect(); // maybe do once, each time the canvas changes size
    this.x = (e.clientX - box.left) * (can.width / box.width);
    this.y = (e.clientY - box.top) * (can.height / box.height);
  }

  buildHouse(x, y) {
    console.log(x, y);
    let w = 80;
    let h = 90;
    const flip = false; // Math.random() > 0.5;
    // use a sprite map of buildings
    const building = this.buildingsImages[this.lastBuiltIndex];
    // This is one place we could apply scale to images, but it may be better to ctx.scale instead.
    w = building.w * 2.5;
    h = building.h * 2.5;
    // w / 2 = Half the image size. Lazy way of adding pixel resolution! Do elsewhere?
    const newbuilding = new Building(x - (building.w/2), y - building.h, w / 2, h / 2, flip, this.buildingsImage, building.x, building.y, building.w, building.h);
    this.buildings.push(newbuilding);
    this.buildings.sort((a, b) => ((a.y + a.height >= b.y + b.height) ? 1 : -1));
    newbuilding.build();
    this.lastBuiltIndex++;
    if (this.lastBuiltIndex >= this.buildingsImages.length) this.lastBuiltIndex = 0;
  }

  selectHouse(x, y) {
    const old = this.selection;
    this.selection = this.findObjectAt(x, y);
    if (this.selection !== old) {
      this.draw();
    }
  }

  update() {
    // eekums this just happens forever, but if animation is gonna be ongoing
    // maybe that's better than adding invalidation state
    this.draw();
    const self = this;
    requestAnimationFrame(function() { self.update(); });
  }

  draw() {
    const {
      buildings, ctx, canvas, selection, skylineY, sky, sun, moon, stars, foreground, skyCtx
    } = this; // wow. much destructure.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false; // could set this once in constructor if it will never get reset
    const sunMid = (sun.y + (sun.height / 2));
    let darkness = Math.max(0, ((sunMid - skylineY) / (canvas.height - skylineY - 200)));
    darkness *= 1.75;
    // const luminosity = 75 - (50 * darkness);

    // Sky
    skyCtx.drawImage(sky.img, sky.x, sky.y, sky.width, sky.height);
    ctx.drawImage(sun.img, sun.x, sun.y, sun.width, sun.height);
    skyCtx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.9, (darkness / 2).toFixed(2))})`;
    skyCtx.fillRect(0, 0, canvas.width, canvas.height);
    // Stars png
    stars.rotation += 0.001;
    skyCtx.globalAlpha = darkness / 3;
    skyCtx.translate(stars.width / 2, stars.y + (stars.height / 2));
    skyCtx.rotate(stars.rotation);
    skyCtx.translate(-stars.width / 2, -stars.y - (stars.height) / 2);
    skyCtx.drawImage(stars.img, stars.x, stars.y, stars.width, stars.height);
    skyCtx.resetTransform();
    skyCtx.globalAlpha = 1;
    // Moon
    skyCtx.drawImage(moon.img, moon.x, moon.y, moon.width, moon.height);
    // Stars basic
    skyCtx.globalAlpha = Math.min(1, darkness * 3);
    // ??? debug console.log(skyCtx.globalAlpha);
    for (let i = 0; i < Stars.length; i += 2) {
      skyCtx.fillStyle = 'white';
      skyCtx.fillRect(Stars[i], Stars[i + 1], 2, 2);
    }
    skyCtx.globalAlpha = 1;

    // Buildings
    const l = buildings.length;
    for (let i = 0; i < l; i++) {
      buildings[i].draw(ctx);
    }

    // Foreground
    // TEMP off
    // ctx.drawImage(foreground.img, foreground.x, foreground.y, foreground.width, foreground.height);

    // Darkness
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.9, darkness.toFixed(2))})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    if (selection) {
      ctx.strokeStyle = 'lime';
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
      ctx.strokeStyle = 'black';
    }
  }

  // finds topmost object in z-order
  findObjectAt(x, y) {
    const { buildings } = this;
    const l = buildings.length;
    for (let i = l; i--;) {
      if (buildings[i].containsPoint(x, y)) return buildings[i];
    }
    return null;
  }

  // ?? this duplicates code found in building, maybe make an entity class?
  containsObject(x, y, obj) {
    return ((obj.x <= x) && ((obj.x + obj.width) >= x) &&
      (obj.y <= y) && ((obj.y + obj.height) >= y));
  }
}




export default Town;
