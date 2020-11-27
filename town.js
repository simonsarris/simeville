
import { Building } from './building.js';
import { randomInt, random } from './util.js';

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
      { x: 2335, y: 290, w: 113, h: 298 },
      { x: 2474, y: 431, w: 188, h: 167 },
    ];
    this.lastBuiltIndex = 0;


    // For debug purposes (and later optimization?) make a single array of each building
    this.allBuildings = [];
    const l = this.buildingsImages.length;
    let x = 50;
    const y = 750;
    for (var i = 0; i < l; i++) {
      const building = this.buildingsImages[i];
      // This is one place we could apply scale to images, but it may be better to ctx.scale instead.
      const w = building.w;
      const h = building.h;
      // w / 2 = Half the image size. Lazy way of adding pixel resolution! Do elsewhere?
      this.allBuildings.push(
        new Building(x, y, w/2, h/2, false,
        this.buildingsImage, building.x, building.y, building.w, building.h));
      x += w/2;
    }



    const self = this;
    canvas.addEventListener('mousedown', function (e) {
      if (e.button !== 2) return; // only right click right now for drags
      self.setCoords(e);
      const { x, y } = self;
      // ehh this could generalize better
      if (self.containsObject(x, y, self.sun)) { self.draggedObject = self.sun; }
      else if (self.containsObject(x, y, self.moon)) { self.draggedObject = self.moon; }
      else { // look for buildings
        if (e.button === 2) self.selectHouse(x, y);
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
      const { x, y } = self;
      if (e.button === 0) self.buildHouse(x | 0, y | 0, self.currentBuildingIndex);
    });

    canvas.addEventListener('keydown', function(e) {
      e.preventDefault();
      if (e.key === 'Delete' && self.selection !== null) {
        self.buildings.splice(self.buildings.indexOf(self.selection), 1);
        self.selection = null;
        self.draw();
      } else if (e.key.match('[1-9]') !== null) {
        self.currentBuildingIndex = parseInt(e.key);
      } else if (e.key === "ArrowRight") {
        self.currentBuildingIndex++;
      } else if (e.key === "ArrowLeft") {
        self.currentBuildingIndex--;
      } else if (e.key === "ArrowUp") { // are you regetting that this isn't a switch statement yet?
        self.moveSelectionZ(true);
      } else if (e.key === "ArrowDown") {
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

  buildHouse(x, y, optionalBuildingIndex) {
    console.log(x, y);
    const flip = false; // Math.random() > 0.5;
    // use a sprite map of buildings
    const building = this.buildingsImages[optionalBuildingIndex || this.lastBuiltIndex];
    // This is one place we could apply scale to images, but it may be better to ctx.scale instead.
    const w = building.w;
    const h = building.h;
    // w / 2 = Half the image size. Lazy way of adding pixel resolution! Do elsewhere?
    const newbuilding = new Building(x, y, w/2, h/2, flip, this.buildingsImage, building.x, building.y, building.w, building.h);
    this.buildings.unshift(newbuilding);
    // before we'd automatically pick a z order based on:
    // this.buildings.sort((a, b) => ((a.y + a.height >= b.y + b.height) ? 1 : -1));
    newbuilding.build();
    if (optionalBuildingIndex === undefined) {
      this.lastBuiltIndex++;
      if (this.lastBuiltIndex >= this.buildingsImages.length) this.lastBuiltIndex = 0;
    }
  }


  // true if moving to front, false if back
  // only called when selection non-null
  moveSelectionZ(up) {
    const { selection, buildings } = this; 
    if (selection === null) return;
    const fromIndex = buildings.indexOf(selection);
    console.log('selection was at index' + fromIndex);
    // no changes if its already at the bounds of the array
    if ((up && fromIndex === buildings.length - 1) || (!up && fromIndex === 0)) {
      return;
    }
    buildings.splice(fromIndex, 1);
    buildings.splice(fromIndex + (up ? 1 : -1), 0, selection);
    console.log('selection is at index' + buildings.indexOf(selection));
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
    const l = buildings.length;
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

    var debug = true;
    if (debug) {
      // paint all the buildings below so we can select one etc
      const l = allBuildings.length;
      ctx.font = '26px sans serif';
      for (let i = 0; i < l; i++) {
        var b = allBuildings[i];
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


  // Create a bunch of buildings and animate them in sequence
  ITS_TIME_TO_BUILD() {
    // it's time to randomize the building order:
    for(let i = TownBuildings.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * i)
      const temp = TownBuildings[i]
      TownBuildings[i] = TownBuildings[j]
      TownBuildings[j] = temp
    }
    const smallHouses = [0, 4, 8, 9, 10];

    for (var i = 0; i < TownBuildings.length; i ++) {
      const building = TownBuildings[i];
      const self = this;
      let heightAdjustment = i / 2;
      setTimeout(function() {
        if (Math.random() < 0.8) {
          var buildingType = smallHouses[Math.floor(Math.random() * smallHouses.length)];
          self.buildHouse(building.x, building.y - heightAdjustment, buildingType);
        } else {
          self.buildHouse(building.x, building.y - heightAdjustment);
        }
      }, i*25);
    }
  }
  
  saveBuildings() {
    const l = this.buildings.length;
    for (let i = 0; i < l; i++) {
      console.log(this.buildings[i].toString());
    }
  }

  loadBuildings() {
    this.buildings =[
      new Building(509, 328, 82.5, 72.5, false, this.buildingsImage, 512, 452, 165, 145),
      new Building(630, 291, 57.5, 163, false, this.buildingsImage, 143, 271, 115, 326),
      new Building(1, 364, 94, 83.5, false, this.buildingsImage, 2474, 431, 188, 167),
      new Building(1446, 364, 55, 80, false, this.buildingsImage, 1552, 438, 110, 160),
      new Building(47, 348, 82.5, 72.5, false, this.buildingsImage, 512, 452, 165, 145),
      new Building(1079, 364, 80, 146.5, false, this.buildingsImage, 895, 305, 160, 293),
      new Building(922, 327, 145, 296.5, false, this.buildingsImage, 1748, 0, 290, 593),
      new Building(1314, 321, 30, 166, false, this.buildingsImage, 2108, 262, 60, 332),
      new Building(465, 336, 30.5, 199.5, false, this.buildingsImage, 808, 195, 61, 399),
      new Building(319, 324, 55.5, 210, false, this.buildingsImage, 678, 173, 111, 420),
      new Building(366, 316, 77.5, 88.5, false, this.buildingsImage, 1095, 416, 155, 177),
      new Building(287, 301, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(339, 325, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(299, 324, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(378, 338, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(325, 375, 94, 83.5, false, this.buildingsImage, 2474, 431, 188, 167),
      new Building(469, 356, 55, 80, false, this.buildingsImage, 1552, 438, 110, 160),
      new Building(613, 305, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(761, 315, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(700, 259, 49.5, 98.5, false, this.buildingsImage, 407, 398, 99, 197),
      new Building(690, 319, 77.5, 88.5, false, this.buildingsImage, 1095, 416, 155, 177),
      new Building(813, 334, 55, 192.5, false, this.buildingsImage, 265, 213, 110, 385),
      new Building(794, 324, 47.5, 87, false, this.buildingsImage, 28, 415, 95, 174),
      new Building(634, 326, 82.5, 72.5, false, this.buildingsImage, 512, 452, 165, 145),
      new Building(678, 331, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(736, 364, 94, 83.5, false, this.buildingsImage, 2474, 431, 188, 167),
      new Building(1372, 338, 55, 192.5, false, this.buildingsImage, 265, 213, 110, 385),
      new Building(1180, 346, 57.5, 163, false, this.buildingsImage, 143, 271, 115, 326),
      new Building(1406, 366, 49.5, 98.5, false, this.buildingsImage, 407, 398, 99, 197),
      new Building(835, 331, 47.5, 87, false, this.buildingsImage, 28, 415, 95, 174),
      new Building(337, 364, 56, 43, false, this.buildingsImage, 1275, 504, 112, 86),
      new Building(863, 330, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(1126, 348, 82.5, 72.5, false, this.buildingsImage, 512, 452, 165, 145),
      new Building(1005, 320, 77.5, 88.5, false, this.buildingsImage, 1095, 416, 155, 177),
      new Building(940, 328, 55, 80, false, this.buildingsImage, 1552, 438, 110, 160),
      new Building(962, 320, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(1041, 347, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(1039, 357, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(988, 329, 56, 43, false, this.buildingsImage, 1275, 504, 112, 86),
      new Building(113, 327, 56.5, 149, false, this.buildingsImage, 2335, 290, 113, 298),
      new Building(551, 356, 80, 146.5, false, this.buildingsImage, 895, 305, 160, 293),
      new Building(601, 372, 94, 83.5, false, this.buildingsImage, 2474, 431, 188, 167),
      new Building(561, 361, 56, 43, false, this.buildingsImage, 1275, 504, 112, 86),
      new Building(613, 371, 56, 43, false, this.buildingsImage, 1275, 504, 112, 86),
      new Building(1234, 327, 30.5, 199.5, false, this.buildingsImage, 808, 195, 61, 399),
      new Building(430, 365, 57.5, 163, false, this.buildingsImage, 143, 271, 115, 326),
      new Building(412, 370, 82.5, 72.5, false, this.buildingsImage, 512, 452, 165, 145),
      new Building(93, 341, 56, 43, false, this.buildingsImage, 1275, 504, 112, 86),
      new Building(61, 355, 56, 43, false, this.buildingsImage, 1275, 504, 112, 86),
      new Building(115, 343, 56, 43, false, this.buildingsImage, 1275, 504, 112, 86),
      new Building(204, 325, 55, 192.5, false, this.buildingsImage, 265, 213, 110, 385),
      new Building(385, 385, 47.5, 87, false, this.buildingsImage, 28, 415, 95, 174),
      new Building(230, 363, 80, 146.5, false, this.buildingsImage, 895, 305, 160, 293),
      new Building(261, 370, 82.5, 72.5, false, this.buildingsImage, 512, 452, 165, 145),
      new Building(1222, 319, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(1299, 305, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(1253, 325, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(1273, 339, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(1194, 351, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(1303, 353, 94, 83.5, false, this.buildingsImage, 2474, 431, 188, 167),
      new Building(1091, 359, 56.5, 149, false, this.buildingsImage, 2335, 290, 113, 298),
      new Building(902, 353, 57.5, 163, false, this.buildingsImage, 143, 271, 115, 326),
      new Building(152, 341, 49.5, 98.5, false, this.buildingsImage, 407, 398, 99, 197),
      new Building(172, 343, 82.5, 72.5, false, this.buildingsImage, 512, 452, 165, 145),
      new Building(353, 376, 56, 43, false, this.buildingsImage, 1275, 504, 112, 86),
      new Building(494, 376, 77.5, 88.5, false, this.buildingsImage, 1095, 416, 155, 177),
      new Building(1130, 370, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(703, 342, 58.5, 48.5, false, this.buildingsImage, 1401, 479, 117, 97),
      new Building(785, 351, 56, 43, false, this.buildingsImage, 1275, 504, 112, 86)
      
  //  new Building(93,   341, 56,   43, false, this.buildingsImage,    1275, 504, 112, 86 ),
  //  new Building(61,   355, 56,   43, false, this.buildingsImage,    1275, 504, 112, 86 ),
  //  new Building(115,  343, 56,   43, false, this.buildingsImage,    1275, 504, 112, 86 ),
  //  new Building(204,  325, 55,   192.5, false, this.buildingsImage, 265,  213, 110, 385),
  //  new Building(382,  384, 47.5, 87, false, this.buildingsImage,    28,   415, 95,  174),
  //  new Building(230,  363, 80,   146.5, false, this.buildingsImage, 895,  305, 160, 293),
  //  new Building(261,  370, 82.5, 72.5, false, this.buildingsImage,  512,  452, 165, 145),
  //  new Building(1222, 319, 58.5, 48.5, false, this.buildingsImage,  1401, 479, 117, 97 ),
  //  new Building(1299, 305, 58.5, 48.5, false, this.buildingsImage,  1401, 479, 117, 97 ),
  //  new Building(1253, 325, 58.5, 48.5, false, this.buildingsImage,  1401, 479, 117, 97 ),
  //  new Building(1273, 339, 58.5, 48.5, false, this.buildingsImage,  1401, 479, 117, 97 ),
  //  new Building(1194, 351, 58.5, 48.5, false, this.buildingsImage,  1401, 479, 117, 97 ),
  //  new Building(1303, 353, 94,   83.5, false, this.buildingsImage,  2474, 431, 188, 167),
  //  new Building(1091, 359, 56.5, 149, false, this.buildingsImage,   2335, 290, 113, 298),
  //  new Building(902,  353, 57.5, 163, false, this.buildingsImage,   143,  271, 115, 326),
  //  new Building(152,  341, 49.5, 98.5, false, this.buildingsImage,  407,  398, 99,  197),
  //  new Building(172,  343, 82.5, 72.5, false, this.buildingsImage,  512,  452, 165, 145),
  //  new Building(494,  376, 77.5, 88.5, false, this.buildingsImage,  1095, 416, 155, 177),
  //  new Building(1130, 370, 58.5, 48.5, false, this.buildingsImage,  1401, 479, 117, 97 ),
  //  new Building(696,  337, 58.5, 48.5, false, this.buildingsImage,  1401, 479, 117, 97 ),
  //  new Building(785,  351, 56,   43, false, this.buildingsImage,    1275, 504, 112, 86 ),
  //  new Building(301,  380, 56,   43, false, this.buildingsImage,    1275, 504, 112, 86 )
  ]
  }

}




export default Town;
