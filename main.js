const can = document.getElementById('can');
const ctx = can.getContext('2d');

ctx.translate(20, 200);
ctx.scale(2, 2);
ctx.lineToRand = function (x, y) {
  this.lineTo(x, y);
  // const rand = 1;
  // const halfRand = rand / 2;
  // this.lineTo(x + (Math.random() * rand) - halfRand, y + (Math.random() * rand) - halfRand);
};
ctx.moveToRand = function (x, y) {
  this.moveTo(x, y);
  // const rand = 1;
  // const halfRand = rand / 2;
  // this.moveTo(x + (Math.random() * rand) - halfRand, y + (Math.random() * rand) - halfRand);
};
ctx.strokeStyle = 'rgba(50, 50, 50, 0.4)';
ctx.miterLimit = 3;
ctx.strokeWidth = 1.5;

let mainX = 0;
setInterval(() => {
  const b = new Building();
  b.draw(null, ctx);

  ctx.translate(30, 0);
  mainX += 30;
}, 300);

let globalWidth = 50;
let globalHeight = 50;
let globalWidthFraction = 0.5;
let globalHeightFraction = 0.5;
function draw() {
  ctx.clearRect(-500, -500, 1100, 1100);
  const b = new Building(globalWidth, globalHeight, globalWidthFraction, globalHeightFraction);
  b.draw(null, ctx);
  console.log((globalWidth / globalHeight).toFixed(2), globalWidth, globalHeight, globalWidthFraction, globalHeightFraction);
}
draw();

document.getElementById('widthSlider').addEventListener('input', sliderChange);
document.getElementById('heightSlider').addEventListener('input', sliderChange);
document.getElementById('widthFractionSlider').addEventListener('input', sliderChange);
document.getElementById('heightFractionSlider').addEventListener('input', sliderChange);

function sliderChange(e) {
  switch (e.target.id) {
    case 'widthSlider': globalWidth = e.target.valueAsNumber; break;
    case 'heightSlider': globalHeight = e.target.valueAsNumber; break;
    case 'widthFractionSlider': globalWidthFraction = e.target.valueAsNumber; break;
    case 'heightFractionSlider': globalHeightFraction = e.target.valueAsNumber; break;
  }
  draw();
}
