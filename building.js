import bezier from './easing.js';

const houseBez = bezier(0.00, 0.75, 0.29, 1.1);

const BuildTime = 1200;

// The x,y coords are the bottom left of the building, not the top left
// This is so buildings can be made bigger or smaller without changing the y-axis
export class Building {
  constructor(x, y, width, height, flip, img, imgx, imgy, imgw, imgh, delay) {
    this.x = x || 0;
    this.y = y || 0;
    // Caked-in assumption that buildings are 2x scale of background w.r.t. pixel density!
    this.width = width;
    this.height = height;
    this.flip = flip;
    this.img = img; // may be undefined
    this.imgx = imgx;
    this.imgy = imgy;
    this.imgw = imgw;
    this.imgh = imgh;
    // Animation:
    this.creationTime = 0; // Not yet
    this.delay = delay || 0;
  }

  toString() {
    return `${this.x}, ${this.y}, ${this.width}, ${this.height}, false, undefined, ${this.imgx}, ${this.imgy}, ${this.imgw}, ${this.imgh}`;
    // return ` { creationTime: ${this.creationTime}, finishTime: ${this.finishTime}, flip: ${this.flip}, height: ${this.height}, imgh: ${this.imgh}, imgw: ${this.imgw}, imgx: ${this.imgx}, imgy: ${this.imgy}, width: ${this.width}, x: ${this.x}, y: ${this.y} }`;
  }

  build() {
    this.creationTime = Date.now() + this.delay;
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
      if (elapsedTime < 0) return; // still have some delay, first
      if (elapsedTime > BuildTime) this.creationTime = 0;
      value = houseBez(elapsedTime / BuildTime); // Goes between 0 and (greater than bc of bezier) 1'
    }

    const { x, y, flip, img, width, height } = this;
    ctx.translate(x, y - height);

    if (flip) { ctx.translate(width, 0); ctx.scale(-1, 1); }
    if (animating) {
      // Starting from a fixed scale like 0.6 looks nicer than appearing from nowhere.
      // const scale = 0.8 + (value * 0.2);
      // if scaling: this x value during animation ensures it animates from the center, not the left side as it scales up
      ctx.translate(/* (1 - scale) * (width / 2) */ 0, (height - (height * value)));
      // ctx.scale(scale, scale);
    }


    if (this.imgx) {
      ctx.drawImage(img, this.imgx, this.imgy, this.imgw, this.imgh, 0, 0, width, height);
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

