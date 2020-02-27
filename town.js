
import { Building } from './building.js';
import { randomInt, random } from './util.js';

export class Town {
  constructor(canvas) {
    // eslint-disable-next-line no-param-reassign
    canvas.onselectstart = function () { return false; };
    const arr = [];
    arr.push(new Building(100, 100));
    arr.push(new Building(110, 150));
    this.buildings = arr;
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.selection = null;

    const self = this;
    canvas.addEventListener('click', function(e) {
      const can = self.canvas;
      const box = can.getBoundingClientRect(); // maybe do once, each time the canvas changes size
      const x = (e.clientX - box.left) * (canvas.width / box.width);
      const y = (e.clientY - box.top) * (canvas.height / box.height);
      let w = 80;
      let h = 90;
      let wf = 0.5;
      let hf = 0.5;
      const flip = Math.random() > 0.5;
      let type = 'house';
      const rando = Math.random();
      if (rando < 0.45) {
        type = 'house';
        w = randomInt(50, 120);
        h = randomInt(60, 120);
        wf = random(0.1, 0.8);
        hf = random(0.35, 0.70);
        // TODO: If aspect ratio is too tall (low)
        //       then either make it less tall or more wide
      } else if (rando < 0.75) {
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
      const b = new Building(x - (w / 2), y - h, w, h, wf, hf, type, flip);
      arr.push(b);
      b.build();
      // const old = self.selection;
      // self.selection = self.findObjectAt(x, y);
      // if (self.selection !== old) {
      //   self.draw();
      // }
    });

    this.update();
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
      buildings, ctx, canvas, selection,
    } = this; // wow. much destructure.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const l = buildings.length;
    for (let i = 0; i < l; i++) {
      buildings[i].draw(ctx);
    }
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
}




export default Town;
