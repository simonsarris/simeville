import { random, randomInt } from './util.js';
import { Building } from './building.js';
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
// ctx.strokeStyle = 'rgba(50, 50, 50, 0.9)';
ctx.miterLimit = 3;
ctx.lineWidth = 1.5;

// eslint-disable-next-line no-unused-vars
// let mainX = 0;
// setInterval(() => {
//   const rando = Math.random();
//   let w = 0;
//   let h = 0;
//   let wf = 0;
//   let hf = 0;
//   let type = '';
//   // if (rando < 0.45) {
//   //   type = 'House';
//   //   w = randomInt(50, 120);
//   //   h = randomInt(60, 120);
//   //   wf = random(0.1, 0.8);
//   //   hf = random(0.35, 0.70);
//   //   // TODO: If aspect ratio is too tall (low)
//   //   //       then either make it less tall or more wide
//   // } else if (rando < 0.75) {
//   //   type = 'Tower';
//   //   w = randomInt(20, 40);
//   //   h = randomInt(100, 200);
//   //   wf = 0.5;
//   //   hf = random(0.5, 0.6);
//   // } else {
//   //   type = 'LongTower';
//   //   w = randomInt(25, 75);
//   //   h = randomInt(50, 100);
//   //   wf = random(0.2, 0.7);
//   //   hf = random(0.5, 0.7);
//   // }
//   type = 'House';
//   w = randomInt(50, 120);
//   h = randomInt(60, 120);
//   wf = random(0.1, 0.8);
//   hf = random(0.35, 0.70);
//   const b = new Building(w, h, wf, hf, type);
//   b.draw(null, ctx);

//   // ctx.translate(30, 0);
//   mainX += 30;
// }, 500);

let globalWidth = 70;
let globalHeight = 25 + 32;
let globalWidthFraction = 0.5;
let globalHeightFraction = 0.5;
let town;
function main() {
  town = new Town(can);
  town.draw();
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

