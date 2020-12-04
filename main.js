import { Town } from './town.js';


CanvasRenderingContext2D.prototype.lineToRand = function (x, y) {
  // this.lineTo(x, y);
  const rand = 2;
  const halfRand = rand / 2;
  this.lineTo(x + (Math.random() * rand) - halfRand, y + (Math.random() * rand) - halfRand);
};
CanvasRenderingContext2D.prototype.moveToRand = function (x, y) {
  // this.moveTo(x, y);
  const rand = 2;
  const halfRand = rand / 2;
  this.moveTo(x + (Math.random() * rand) - halfRand, y + (Math.random() * rand) - halfRand);
};

CanvasRenderingContext2D.prototype.quadraticCurveToRand = function (x1, y1, x2, y2) {
  const oldStyle = this.fillStyle;
  this.fillStyle = 'red';
  this.fillRect(x1, y1, 4, 4);
  this.quadraticCurveTo(x1, y1, x2, y2);
  this.fillStyle = oldStyle;
};

let town;
function main() {
  const can = document.getElementById('town');
  const ctx = can.getContext('2d');
  ctx.miterLimit = 3;
  ctx.lineWidth = 1.5;
  const sky = document.getElementById('sky');
  town = new Town(can, sky);
  town.draw();
  window.town = town;
  document.getElementById('timeToBuild').addEventListener('click', function() { town.loadBuildings(); });
  document.getElementById('timeToDebug').addEventListener('click', function() { window.debug = !window.debug; });
}

main();
