
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
    // eslint-disable-next-line no-param-reassign
    canvas.onselectstart = function () { return false; };
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
        new Building(x, y, w, h, false,
        this.buildingsImage, building.x, building.y, building.w, building.h));
      x += w/2;
    }



    const self = this;
    canvas.addEventListener('mousedown', function (e) {
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
      // console.log(x, y);
      if (e.button === 0) self.buildHouse(x, y, self.currentBuildingIndex);
      else if (e.button === 2) self.selectHouse(x, y);
    });

    canvas.addEventListener('contextmenu', function(e) { e.preventDefault(); })

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
    const newbuilding = new Building(x, y, w, h, flip, this.buildingsImage, building.x, building.y, building.w, building.h);
    this.buildings.push(newbuilding);
    this.buildings.sort((a, b) => ((a.y + a.height >= b.y + b.height) ? 1 : -1));
    newbuilding.build();
    if (optionalBuildingIndex === undefined) {
      this.lastBuiltIndex++;
      if (this.lastBuiltIndex >= this.buildingsImages.length) this.lastBuiltIndex = 0;
    }
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
      ctx.strokeStyle = 'lime';
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
      ctx.strokeStyle = 'black';
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

}




export default Town;
