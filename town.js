
import { Building } from './building.js';

export class Town {
  constructor(canvas) {
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
      console.log(x, y);
      const old = self.selection;
      self.selection = self.findObjectAt(x, y);
      if (self.selection !== old) {
        self.draw();
      }
    });
  }

  draw() {
    const { buildings, ctx, canvas, selection } = this; // wow. much destructure.
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
