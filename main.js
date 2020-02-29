import { Town } from './town.js';

const can = document.getElementById('can');
const ctx = can.getContext('2d');


CanvasRenderingContext2D.prototype.lineToRand = function (x, y) {
  this.lineTo(x, y);
  // const rand = 1;
  // const halfRand = rand / 2;
  // this.lineTo(x + (Math.random() * rand) - halfRand, y + (Math.random() * rand) - halfRand);
};
CanvasRenderingContext2D.prototype.moveToRand = function (x, y) {
  this.moveTo(x, y);
  // const rand = 1;
  // const halfRand = rand / 2;
  // this.moveTo(x + (Math.random() * rand) - halfRand, y + (Math.random() * rand) - halfRand);
};
ctx.miterLimit = 3;
ctx.lineWidth = 1.5;

let globalWidth = 70;
let globalHeight = 25 + 32;
let globalWidthFraction = 0.5;
let globalHeightFraction = 0.5;
let town;
function main() {
  town = new Town(can);
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

document.getElementById('widthSlider').addEventListener('input', sliderChange);
document.getElementById('heightSlider').addEventListener('input', sliderChange);
document.getElementById('widthFractionSlider').addEventListener('input', sliderChange);
document.getElementById('heightFractionSlider').addEventListener('input', sliderChange);

