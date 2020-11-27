import bezier from './easing.js';

const houseBez = bezier(0.00, 0.75, 0.29, 1.4);

// eslint-disable-next-line no-unused-vars
const Colors = {
  lightHouse: '#DDCDB2',
  darkHouse: '#DDCDB2',
  background: '#DDCDB2',
  redroof: '#DDCDB2',
  greenroof: '#DDCDB2',
};

// const Colors = {
//   lightHouse: '#f5f5f5',
//   darkHouse: '#DCDCDC',
//   background: '#e2d8ce',
//   redroof: '#d15d34',
//   greenroof: '#bdac36',
// };




const WindowSizes = {
  small: 3,
  big: 5,
};

const BuildTime = 800;

// The x,y coords are the bottom left of the building, not the top left
// This is so buildings can be made bigger or smaller without changing the y-axis
export class Building {
  constructor(x, y, width, height, flip, img, imgx, imgy, imgw, imgh) {
    this.x = x || 0;
    this.y = y || 0;
    // Caked-in assumption that buildings are 2x scale of background w.r.t. pixel density!
    this.width = width// / 2;
    this.height = height /// 2;
    this.flip = flip;
    this.img = img; // may be undefined
    this.imgx = imgx;
    this.imgy = imgy;
    this.imgw = imgw;
    this.imgh = imgh;
    // Animation:
    this.creationTime = 0; // Not yet
  }

  toString() {
    return `${this.x}, ${this.y}, ${this.width}, ${this.height}, false, undefined, ${this.imgx}, ${this.imgy}, ${this.imgw}, ${this.imgh}`;
    // return ` { creationTime: ${this.creationTime}, finishTime: ${this.finishTime}, flip: ${this.flip}, height: ${this.height}, imgh: ${this.imgh}, imgw: ${this.imgw}, imgx: ${this.imgx}, imgy: ${this.imgy}, width: ${this.width}, x: ${this.x}, y: ${this.y} }`;
  }

  build() {
    this.creationTime = Date.now();
    this.finishTime = this.creationTime + BuildTime;
  }

  // return true if x,y is within bounds
  containsPoint(x, y) {
    return ((this.x <= x) && ((this.x + this.width) >= x) &&
      (this.y >= y) && ((this.y - this.height) <= y));
  }

  // Buildings draw from their bottom center, rather than their top left corner.
  // This lets us adjust height etc later while maintaining their x/y positions
  draw(ctx) {
    const animating = (this.creationTime !== 0);
    let value = 1;
    if (animating) {
      const elapsedTime = Date.now() - this.creationTime;
      if (elapsedTime > BuildTime) this.creationTime = 0;
      value = houseBez(elapsedTime / BuildTime); // Goes between 0 and (greater than bc of bezier) 1'
    }

    const { x, y, flip, img, width, height } = this;
    ctx.translate(x, y - height);

    if (flip) { ctx.translate(width, 0); ctx.scale(-1, 1); }
    if (animating) {
      ctx.translate(0, height - (height * value));
      ctx.scale(value, value);
    }

    
    if (this.imgx) {
      ctx.drawImage(img,  this.imgx, this.imgy, this.imgw, this.imgh, 0, 0, width, height);
    } else {
      ctx.drawImage(img, 0, 0, width, height); // NYI
    }

    ctx.resetTransform();
    // if (animating) {
    //   ctx.scale(valfrac, valfrac);
    //   ctx.translate(0, -(h - (h * value)));
    // }
    // if (flip) { ctx.scale(-1, 1); ctx.translate(-w, 0); }
    // ctx.translate(-x, -y);
  } // end draw


} // end class

export default Building;

