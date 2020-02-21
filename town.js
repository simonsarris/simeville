
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
    canvas.addEventListener('click', function() {

    });
  }

  draw() {
    const { buildings, ctx, canvas } = this; // wow. much destructure.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const l = buildings.length;
    for (let i = 0; i < l; i++) {
      buildings[i].draw(ctx);
    }
  }

  findObjectAt(x, y) {
    const { buildings, ctx } = this;
    const l = buildings.length;
    for (let i = 0; i < l; i++) {
      buildings[i].draw(ctx);
    }
  }

}


export default Town;
