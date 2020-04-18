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


let globalWidth = 70;
let globalHeight = 25 + 32;
let globalWidthFraction = 0.5;
let globalHeightFraction = 0.5;
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
}

main();

function sliderChange(e) {
  switch (e.target.id) {
    case 'widthSlider': globalWidth = e.target.valueAsNumber; break;
    case 'heightSlider': globalHeight = e.target.valueAsNumber; break;
    case 'widthFractionSlider': globalWidthFraction = e.target.valueAsNumber; break;
    case 'heightFractionSlider': globalHeightFraction = e.target.valueAsNumber; break;
  }
  if (town && town.selection) {
    town.selection.updateValues(globalWidth, globalHeight, globalWidthFraction, globalHeightFraction);
  }
}
