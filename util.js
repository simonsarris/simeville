function randomInt(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function random(min, max) { // max not included
  return Math.random() * (max - min) + min;
}
