import bezier from './easing.js';

const houseBez = bezier(0.00, 0.75, 0.29, 1.4);

// eslint-disable-next-line no-unused-vars
const Colors = {
  lightHouse: '#f5f5f5',
  darkHouse: '#DCDCDC',
  background: '#e2d8ce',
  redroof: '#d15d34',
  greenroof: '#bdac36',
};

const WindowSizes = {
  small: 3,
  big: 5,
};

const BuildTime = 800;


export class Building {
  constructor(x, y, width, height, widthFraction, heightFraction, type, flip) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 70;
    this.height = height || 58;
    this.widthFraction = widthFraction || 0.5;
    this.heightFraction = heightFraction || 0.5;
    this.flip = flip;
    this.type = type || 'house'; // house, tower, longtower
    // Animation:
    this.creationTime = 0; // Not yet
  }

  build() {
    this.creationTime = Date.now();
    this.finishTime = this.creationTime + BuildTime;
  }

  // return true if x,y is within bounds
  containsPoint(x, y) {
    return ((this.x <= x) && ((this.x + this.width) >= x) &&
      (this.y <= y) && ((this.y + this.height) >= y));
  }

  draw(ctx) {
    const animating = (this.creationTime !== 0);
    let value = 1;
    // let valfrac = 1;
    if (animating) {
      const elapsedTime = Date.now() - this.creationTime;
      if (elapsedTime > BuildTime) this.creationTime = 0;
      value = houseBez(elapsedTime / BuildTime); // Goes between 0 and (greater than bc of bezier) 1'
      // console.log(value);
      // valfrac = 1 / value;
    }

    const { x, y, flip, type } = this;
    const w = this.width;
    const h = this.height;
    const wf = this.widthFraction;
    const hf = this.heightFraction;
    // const aspectRatio = w / h;
    // divide width and height into fractions for roof and sides
    const w1 = w * wf;
    const w2 = w - w1;
    const h1 = h * hf;
    const h2 = h - h1;
    const rounds = 2;
    ctx.translate(x, y);
    if (flip) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    if (animating) {
      ctx.translate(0, h - (h * value));
      ctx.scale(value, value);
    }
    for (let i = 0; i < rounds; i++) {
      // gross and weird
      switch (type) {
        case 'house': this.drawHouse(ctx, w, h, w1, h1, w2, h2, i); break;
        case 'tower': this.drawTower(ctx, w, h, w1, h1, w2, h2, i); break;
        case 'longtower': this.drawLongTower(ctx, w, h, w1, h1, w2, h2, i); break;
      }
    }
    ctx.resetTransform();
    // if (animating) {
    //   ctx.scale(valfrac, valfrac);
    //   ctx.translate(0, -(h - (h * value)));
    // }
    // if (flip) { ctx.scale(-1, 1); ctx.translate(-w, 0); }
    // ctx.translate(-x, -y);
  } // end draw

  /** Draw a single window at (x, y). Does not stroke or fill */
  drawWindow(ctx, x, y, windowSize) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + windowSize, y);
    ctx.lineTo(x + windowSize, y + (windowSize * 2.3));
    ctx.lineTo(x, y + (windowSize * 2.3));
    ctx.closePath();
  }

  drawLongTower(ctx, w, h, w1, h1, w2, h2, i) {
    // Long towers have a short face and a long face

    // Front left face
    //  1   2
    //  4   3
    ctx.beginPath();
    ctx.moveToRand(0, h1);
    ctx.lineToRand(w1, h1);
    ctx.lineToRand(w1, h);
    ctx.lineToRand(0, h);
    ctx.closePath();
    if (i === 0) {
      ctx.fillStyle = Colors.lightHouse;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath(); // can skip on nonzero passes
    }
    // Right side face
    //  1   2
    //  4   3
    ctx.moveToRand(w1, h1);
    ctx.lineToRand(w, h1);
    ctx.lineToRand(w, h);
    ctx.lineToRand(w1, h);
    ctx.closePath();
    if (i === 0) {
      ctx.fillStyle = Colors.lightHouse;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath(); // can skip on nonzero passes
    }

    // Roof right, starts at top right
    //  4  1
    //   3  2
    const w1Half = (w1 / 2) * 1.4; // magic 1.4 to shorten roof
    ctx.moveToRand(w - w1Half, 0);
    ctx.lineToRand(w, h1); // bez?
    ctx.lineToRand(w1, h1);
    ctx.lineToRand(w1Half, 0); // bez?
    ctx.closePath();
    if (i === 0) {
      ctx.fillStyle = 'aaa'; // Right Roof
      ctx.fill();
      ctx.stroke();
      ctx.beginPath(); // can skip on nonzero passes
    }
    // Roof left
    //    1
    //  3  2
    ctx.moveToRand(w1Half, 0);
    ctx.lineToRand(w1, h1); // bez?
    ctx.lineToRand(0, h1);
    ctx.closePath(); // but bez?
    if (i === 0) {
      ctx.fillStyle = '#f1f1f1'; // Left Roof
      ctx.fill();
    }
    // don't close?
    ctx.stroke();
  }

  drawTower(ctx, w, h, w1, h1, w2, h2, i) {
    // Front left face
    //  1   2
    //  4   3
    ctx.beginPath();
    ctx.moveToRand(0, h1);
    ctx.lineToRand(w1, h1);
    ctx.lineToRand(w1, h);
    ctx.lineToRand(0, h);
    ctx.closePath();
    if (i === 0) {
      ctx.fillStyle = Colors.lightHouse;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath(); // can skip on nonzero passes
    }
    // Right side face
    //  1   2
    //  4   3
    ctx.moveToRand(w1, h1);
    ctx.lineToRand(w, h1);
    ctx.lineToRand(w, h);
    ctx.lineToRand(w1, h);
    ctx.closePath();
    if (i === 0) {
      ctx.fillStyle = Colors.lightHouse;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath(); // can skip on nonzero passes
    }
    // Roof right, starts at top right
    //  1
    //  3  2
    ctx.moveToRand(w1, 0);
    ctx.lineToRand(w, h1); // bez?
    ctx.lineToRand(w1, h1);
    ctx.closePath();
    if (i === 0) {
      ctx.fillStyle = '#dddddd'; // roof color a
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
    }
    // Roof RIGHT?
    //    2
    // 1  3
    ctx.moveToRand(0, h1);
    ctx.lineToRand(w1, 0); // bez?
    ctx.lineToRand(w1, h1);
    ctx.closePath(); // but bez?
    if (i === 0) {
      ctx.fillStyle = '#f1f1f1'; // roof color b
      ctx.fill();
    }
    // don't close?
    ctx.stroke();
  }

  drawHouse(ctx, w, h, w1, h1, w2, h2, i) {
    // Front face
    //    2
    //  1   3
    //  5   4
    ctx.beginPath();
    ctx.moveToRand(0, h1);
    ctx.lineToRand(w1 / 2, 0); // bez?
    ctx.lineToRand(w1, h1); // bez?
    ctx.lineToRand(w1, h);
    ctx.lineToRand(0, h);
    ctx.closePath();
    if (i === 0) {
      ctx.fillStyle = Colors.lightHouse;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath(); // can skip on nonzero passes
    }
    // Side face
    //  1   2
    //  4   3
    ctx.moveToRand(w1, h1);
    ctx.lineToRand(w, h1);
    ctx.lineToRand(w, h);
    ctx.lineToRand(w1, h);
    ctx.closePath();
    if (i === 0) {
      ctx.fillStyle = Colors.lightHouse;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath(); // can skip on nonzero passes
    }
    // Roof, starts at top right
    //  4   1
    //    3   2
    const w1Half = w1 / 2;
    ctx.moveToRand(w - w1Half, 0);
    ctx.lineToRand(w, h1); // bez?
    ctx.lineToRand(w1, h1);
    ctx.lineToRand(w1Half, 0); // bez?
    ctx.closePath();
    if (i === 0) {
      ctx.fillStyle = Colors.redroof; // roof color
      ctx.fill();
    }
    ctx.stroke();

    if (i === 0) {
      // Now draw windows

      ctx.beginPath();

      // // Right side along the rect
      // // From w1 to w
      // // From h1 to h
      // let y = h1;
      const windowSize = WindowSizes.small;
      // let numWindows = Math.floor(w2 / windowSize / 2) - 1; // Max
      // // randomize windows on half
      // if (Math.random() > 0.5) numWindows = Math.floor(Math.random() * numWindows);
      // let x = w1 + (w2 - ((numWindows * 2) - 1) * windowSize) / 2;
      // const startX = x;
      // const numRows = (Math.random() * 3) | 0;
      // for (let rows = 0; rows < numRows; rows++) {
      //   for (let k = 0; k < numWindows; k++) {
      //     this.drawWindow(ctx, x, y + windowSize, windowSize);
      //     x += windowSize * 2;
      //   }
      //   y += windowSize * 4;
      //   x = startX;
      //   if (y + windowSize * 3 > h) break; // very lazy way to stop drawing more vertical windows
      // }

      // Left side, along the attic triangle and below it
      // x = 0;
      let y = h1 / 2;
      const halfWindow = windowSize / 2;
      const centered = (w1 / 2) - halfWindow;
      this.drawWindow(ctx, centered, y, windowSize);
      y += windowSize * 4;
      // Maybe 2 more
      this.drawWindow(ctx, centered - windowSize * 2, y, windowSize);
      this.drawWindow(ctx, centered + windowSize * 2, y, windowSize);

      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fill();
    }
  }
} // end class

export default Building;

