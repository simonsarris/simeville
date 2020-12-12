/* eslint-disable radix */

import { Building } from './building.js';

const SceneWidth = 1600;
const SceneHeight = 880;
const Stars = [];
for (let i = 0; i < 50; i++) { Stars.push(Math.random() * 1600); Stars.push(Math.random() * 400); }

// horizon is approx 400
// buildings should span horizontally from 0 to 1600
const TownBuildings = [];
const BuildingCount = 250;
const BuildingInterval = SceneWidth / BuildingCount;
for (let i = 0; i < BuildingCount; i++) {
  TownBuildings.push({
    x: (BuildingInterval * i) + (Math.random() * 10),
    y: 405 + (Math.random() * 20)
  });
}


export class Town {
  constructor(canvas, skyCanvas) {
    const arr = [];
    this.buildings = arr;
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.selection = null;
    this.x = 0;
    this.y = 0;

    this.totalTimeout = 0;

    // dragging. draggedObject doubles as state, null = no drag ongoing
    this.draggedObject = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartObjectX = 0;
    this.dragStartObjectY = 0;

    // debug, building by hand
    this.currentBuildingIndex = 0; // Index of the array of buildings that click-building will build

    // sky, sun, foreground
    this.skyCtx = skyCanvas.getContext('2d');
    this.skylineY = this.canvas.height / 2;
    const skyImage = new Image();
    skyImage.src = 'images/sky.jpg';
    this.sky = { x: 0, y: 0, width: SceneWidth, height: 400, img: skyImage };
    const sunImage = new Image();
    sunImage.src = 'images/sun.png';
    this.sun = { x: 1050, y: 50, width: 150, height: 150, img: sunImage };
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
      { x: 28, y: 415, w: 95, h: 174 },
      { x: 143, y: 271, w: 115, h: 326 },
      { x: 265, y: 213, w: 110, h: 385 },
      { x: 407, y: 398, w: 99, h: 197 },
      { x: 512, y: 452, w: 165, h: 145 },
      { x: 678, y: 173, w: 111, h: 420 },
      { x: 808, y: 195, w: 61, h: 399 },
      { x: 895, y: 305, w: 160, h: 293 },
      { x: 1095, y: 416, w: 155, h: 177 },
      { x: 1275, y: 504, w: 112, h: 86 },
      { x: 1401, y: 479, w: 117, h: 97 },
      { x: 1552, y: 438, w: 110, h: 160 },
      { x: 1748, y: 0, w: 290, h: 593 }, // cathedral
      { x: 2108, y: 262, w: 60, h: 332 },
      { x: 2335, y: 310, w: 113, h: 318 },
      { x: 2474, y: 431, w: 188, h: 167 },
    ];
    this.lastBuiltIndex = 0;


    // For debug purposes (and later optimization?) make a single array of each building
    this.allBuildings = [];
    const l = this.buildingsImages.length;
    let x = 50;
    const y = 750;
    for (let i = 0; i < l; i++) {
      const building = this.buildingsImages[i];
      // This is one place we could apply scale to images, but it may be better to ctx.scale instead.
      const { w } = building;
      const { h } = building;
      // w / 2 = Half the image size. Lazy way of adding pixel resolution! Do elsewhere?
      this.allBuildings.push(
        new Building(x, y, w / 2, h / 2, false,
          this.buildingsImage, building.x, building.y, building.w, building.h)
      );
      x += w / 2;
    }



    const self = this;
    canvas.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return; // only left click drags for now
      self.setCoords(e);
      // eslint-disable-next-line no-shadow
      const { x, y } = self;
      // ehh this could generalize better
      if (self.containsObject(x, y, self.sun)) { self.draggedObject = self.sun; } else if (self.containsObject(x, y, self.moon)) { self.draggedObject = self.moon; } else { // look for buildings
        if (e.button === 0) self.selectHouse(x, y);
        const obj = self.findObjectAt(x, y);
        self.draggedObject = obj;
      }

      if (self.draggedObject !== null) {
        self.dragStartX = x;
        self.dragStartY = y;
        self.dragStartObjectX = self.draggedObject.x;
        self.dragStartObjectY = self.draggedObject.y;
      }
    });

    canvas.addEventListener('mousemove', function (e) {
      if (self.draggedObject === null) return;
      self.setCoords(e);
      // eslint-disable-next-line no-shadow
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
        self.draw();
      }
      self.setCoords(e);
      // eslint-disable-next-line no-shadow
      const { x, y } = self;
      if (e.button === 2) self.buildHouse(x | 0, y | 0, self.currentBuildingIndex);
    });

    canvas.addEventListener('keydown', function(e) {
      e.preventDefault();
      if (e.key === 'Delete' && self.selection !== null) {
        self.buildings.splice(self.buildings.indexOf(self.selection), 1);
        self.selection = null;
        self.draw();
      } else if (e.key.match('[1-9]') !== null) {
        self.currentBuildingIndex = parseInt(e.key);
      } else if (e.key === 'ArrowRight') {
        self.currentBuildingIndex++;
      } else if (e.key === 'ArrowLeft') {
        self.currentBuildingIndex--;
      } else if (e.key === 'ArrowUp') { // are you regetting that this isn't a switch statement yet?
        self.moveSelectionZ(true);
      } else if (e.key === 'ArrowDown') {
        self.moveSelectionZ(false);
      }
    });
    canvas.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    canvas.addEventListener('selectstart', function (e) { e.preventDefault(); });
    this.update();
  }


  // the only reason this sets x/y is to avoid allocating an array because I'm a grinch
  setCoords(e) {
    const can = this.canvas;
    const box = can.getBoundingClientRect(); // maybe do once, each time the canvas changes size
    this.x = (e.clientX - box.left) * (can.width / box.width);
    this.y = (e.clientY - box.top) * (can.height / box.height);
  }

  buildHouse(x, y, buildingIndex) {
    // Lazy way of building in the right order right now is to delay
    // the houses starting with the *most* delay for the last houses
    // Since the z-order of building is approx reverse the building order
    // I should fix this maybe by stuffing them in another array or something
    const timeout = this.totalTimeout;
    const builtSoFar = this.buildings.length;
    if (builtSoFar < 18) {
      this.totalTimeout += 80;
    } else {
      this.totalTimeout += Math.max(50 - (builtSoFar / 2), 10);
    }
    // dramatic pauses at 18 and 35 buildings
    if (builtSoFar === 18) this.totalTimeout += 700;
    if (builtSoFar === 35) this.totalTimeout += 700;
    if (this.totalTimeout < 0) this.totalTimeout = 0; // blah this is because I'm only approximating the total delay needed and counting downwards
    const self = this;
    const flip = false; // make optional param
    // use a sprite map of buildings
    const building = self.buildingsImages[buildingIndex];
    // This is one place we could apply scale to images, but it may be better to ctx.scale instead.
    const { w, h } = building;
    // w / 2 = Half the image size. Lazy way of adding pixel resolution! Do elsewhere?
    const newbuilding = new Building(
      x, y, w / 2, h / 2, flip, self.buildingsImage,
      building.x, building.y, w, h, timeout
    );
    console.log(timeout, buildingIndex);
    self.buildings.unshift(newbuilding); // we build this array from the back to the front since we add delay as we go
    newbuilding.build(); // should this just happen automatically?
  }


  // true if moving to front, false if back
  // only called when selection non-null
  moveSelectionZ(up) {
    const { selection, buildings } = this;
    if (selection === null) return;
    const fromIndex = buildings.indexOf(selection);
    console.log(`selection was at index${fromIndex}`);
    // no changes if its already at the bounds of the array
    if ((up && fromIndex === buildings.length - 1) || (!up && fromIndex === 0)) {
      return;
    }
    buildings.splice(fromIndex, 1);
    buildings.splice(fromIndex + (up ? 1 : -1), 0, selection);
    console.log(`selection is at index${buildings.indexOf(selection)}`);
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
      buildings, ctx, canvas, selection, skylineY, sky, sun, moon, stars, foreground, skyCtx, allBuildings, currentBuildingIndex
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
    let l = buildings.length;
    for (let i = 0; i < l; i++) {
      buildings[i].draw(ctx);
    }

    // Foreground
    ctx.drawImage(foreground.img, foreground.x, foreground.y, foreground.width, foreground.height);

    // Darkness
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.9, darkness.toFixed(2))})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    if (selection) {
      ctx.strokeStyle = 'magenta';
      ctx.lineWidth = 3;
      ctx.strokeRect(selection.x, selection.y - (selection.height), selection.width, selection.height);
    }

    if (window.debug) {
      // paint all the buildings below so we can select one etc
      l = allBuildings.length;
      ctx.font = '26px sans serif';
      for (let i = 0; i < l; i++) {
        const b = allBuildings[i];
        b.draw(ctx);
        ctx.fillStyle = currentBuildingIndex === i ? 'lime' : 'red';
        ctx.fillRect(b.x, b.y, 25, 25);
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'white';
        ctx.strokeText(i, b.x, b.y + 20);
        ctx.fillText(i, b.x, b.y + 20);
      }
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
  // big different right now in that this is used for sun and moon which have
  // x/y coord === top left, not bottom left
  containsObject(x, y, obj) {
    return ((obj.x <= x) && ((obj.x + obj.width) >= x) &&
      (obj.y <= y) && ((obj.y + obj.height) >= y));
  }

  saveBuildings() {
    const l = this.buildings.length;
    for (let i = 0; i < l; i++) {
      console.log(this.buildings[i].toString());
    }
  }

  loadBuildings() {
    this.totalTimeout = 0; // no starting delay?
    this.buildHouse(785, 351, 9);
    this.buildHouse(703, 342, 10);
    this.buildHouse(1130, 370, 10);
    this.buildHouse(494, 376, 8);
    this.buildHouse(353, 376, 9);
    this.buildHouse(172, 343, 4);
    this.buildHouse(152, 341, 3);
    this.buildHouse(902, 353, 1);
    this.buildHouse(1091, 379, 14);
    this.buildHouse(1303, 353, 15);
    this.buildHouse(1194, 351, 10);
    this.buildHouse(1273, 339, 10);
    this.buildHouse(1253, 325, 10);
    this.buildHouse(1299, 305, 10);
    this.buildHouse(1222, 319, 10);
    this.buildHouse(261, 370, 4);
    this.buildHouse(230, 363, 7);
    this.buildHouse(385, 385, 0);
    this.buildHouse(204, 325, 2);
    this.buildHouse(115, 343, 9);
    this.buildHouse(61, 355, 9);
    this.buildHouse(93, 341, 9);
    this.buildHouse(412, 370, 4);
    this.buildHouse(430, 365, 1);
    this.buildHouse(1234, 327, 6);
    this.buildHouse(613, 371, 9);
    this.buildHouse(561, 361, 9);
    this.buildHouse(601, 372, 15);
    this.buildHouse(551, 356, 7);
    this.buildHouse(113, 397, 14);
    this.buildHouse(988, 329, 9);
    this.buildHouse(1039, 357, 10);
    this.buildHouse(1041, 347, 10);
    this.buildHouse(962, 320, 10);
    this.buildHouse(940, 328, 11);
    this.buildHouse(1005, 320, 8);
    this.buildHouse(1126, 348, 4);
    this.buildHouse(863, 330, 10);
    this.buildHouse(337, 364, 9);
    this.buildHouse(835, 331, 0);
    this.buildHouse(1406, 366, 3);
    this.buildHouse(1180, 346, 1);
    this.buildHouse(1372, 338, 2);
    this.buildHouse(736, 364, 15);
    this.buildHouse(678, 331, 10);
    this.buildHouse(634, 326, 4);
    this.buildHouse(794, 324, 0);
    this.buildHouse(813, 334, 2);
    this.buildHouse(690, 319, 8);
    this.buildHouse(700, 259, 3);
    this.buildHouse(761, 315, 10);
    this.buildHouse(613, 305, 10);
    this.buildHouse(469, 356, 11);
    this.buildHouse(325, 375, 15);
    this.buildHouse(378, 338, 10);
    this.buildHouse(299, 324, 10);
    this.buildHouse(339, 325, 10);
    this.buildHouse(287, 301, 10);
    this.buildHouse(366, 316, 8);
    this.buildHouse(319, 324, 5);
    this.buildHouse(465, 336, 6);
    this.buildHouse(1314, 321, 13);
    this.buildHouse(922, 327, 12);
    this.buildHouse(1079, 364, 7);
    this.buildHouse(47, 348, 4);
    this.buildHouse(1446, 364, 11);
    this.buildHouse(1, 364, 15);
    this.buildHouse(630, 291, 1);
    this.buildHouse(509, 328, 4);
  }
}




export default Town;
