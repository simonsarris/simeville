
import { Building } from './building.js';
import { randomInt, random } from './util.js';

const stars = [
  32, 40,
  28, 78,
  36, 128,
  42, 184,
  38, 232,
  80, 244,
  50, 270,
  138, 280,
  266, 294,
  450, 290,
  458, 234,
  322, 244,
  292, 174,
  208, 184,
  186, 140,
  144, 84,
  190, 54,
  244, 46,
  254, 84,
  236, 104,
  538, 118,
  532, 222,
  540, 270,
  502, 290,
  400, 272,
  372, 222,
  330, 78,
  370, 44,
  452, 42,
  532, 30,
  564, 28,
  584, 164,
  240, 212
];

export class Town {
  constructor(canvas) {
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

    this.skyColor = 'hsla(199, 100%, 75%, 1)';
    this.foreColor = '#e2d8ce'; // ehhhh lame paper color
    this.skylineY = this.canvas.height / 2;
    const sunImage = new Image();
    sunImage.src = 'images/sun.png';
    this.sun = { x: 350, y: 50, width: 150, height: 150, img: sunImage };

    const self = this;
    canvas.addEventListener('mousedown', function (e) {
      // if (self.mode !== 'drag') return;
      self.setCoords(e);
      const { x, y } = self;
      // ?? right now only drags sun. THIS IS WEAK. WHAT ABOUT MOONS? etc
      if (self.containsObject(x, y, self.sun)) {
        self.draggedObject = self.sun;
        self.dragStartX = x;
        self.dragStartY = y;
        self.dragStartObjectX = self.sun.x;
        self.dragStartObjectY = self.sun.y;
      }
    });

    canvas.addEventListener('mousemove', function (e) {
      // if (self.mode !== 'drag') return;
      if (self.draggedObject === null) return;
      self.setCoords(e);
      const { x, y } = self;
      self.sun.x = self.dragStartObjectX - (self.dragStartX - x);
      self.sun.y = self.dragStartObjectY - (self.dragStartY - y);
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
    let w = 80;
    let h = 90;
    let wf = 0.5;
    let hf = 0.5;
    const flip = Math.random() > 0.5;
    let type = 'house';
    const rando = Math.random();
    if (rando < 0.70) {
      type = 'house';
      w = randomInt(60, 90);
      h = randomInt(50, 80);
      wf = random(0.2, 0.7);
      hf = random(0.45, 0.60);
      // TODO: If aspect ratio is too tall (low)
      //       then either make it less tall or more wide
    } else if (rando < 0.85) {
      type = 'tower';
      w = randomInt(20, 40);
      h = randomInt(150, 200);
      wf = 0.5;
      hf = random(0.3, 0.4);
    } else {
      type = 'longtower';
      w = randomInt(25, 75);
      h = randomInt(50, 100);
      wf = random(0.2, 0.7);
      hf = random(0.5, 0.7);
    }
    const newbuilding = new Building(x - (w / 2), y - h, w, h, wf, hf, type, flip);
    this.buildings.push(newbuilding);
    this.buildings.sort((a, b) => ((a.y + a.height >= b.y + b.height) ? 1 : -1));
    newbuilding.build();
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
      buildings, ctx, canvas, selection, sun, skylineY
    } = this; // wow. much destructure.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sunMid = (sun.y + (sun.height / 2));
    const darkness = Math.max(0, ((sunMid - skylineY) / (canvas.height - skylineY)));

    const luminosity = 75 - (50 * darkness);

    // Sky
    ctx.fillStyle = `hsla(203, 100%, ${luminosity}%, 1)`;
    ctx.fillRect(0, 0, canvas.width, skylineY);
    ctx.drawImage(sun.img, sun.x, sun.y, sun.width, sun.height);
    ctx.fillStyle = this.foreColor;
    ctx.fillRect(0, skylineY, canvas.width, canvas.height - skylineY);

    // Buildings
    const l = buildings.length;
    for (let i = 0; i < l; i++) {
      buildings[i].draw(ctx);
    }

    // Darkness
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.9, darkness.toFixed(2))})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.globalAlpha = darkness;
    for (let i = 0; i < stars.length; i += 2) {
      ctx.fillStyle = 'white';
      ctx.fillRect(stars[i], stars[i + 1], 2, 2);
    }
    ctx.globalAlpha = 1;


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
