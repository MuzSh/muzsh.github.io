const choose = ['./images/im1.jpg', './images/i2.jpg','./images/iq3.jpg'];
var focus = 0;
const obje = [];  

// This function returns an object with random values
function setToRandom(scale) {
    return {
          x: Math.random() * scale, y: Math.random() * scale,
    };
}

function make() {
    let velocity = setToRandom(13); // {x:?, y:?}
    let position = setToRandom(800);
  let direction = 0;
    let game = document.getElementById('game');
    let img = document.createElement('img');
    img.style.position = 'absolute';
    img.src = choose[Math.floor(Math.random() * choose.length)];
    img.style.width = 100;
    img.style.left = position.x + "px";
    img.style.top = position.y + "px";
    game.appendChild(img);
    return {
          position, velocity, img, direction
    };
}
function sleep(miliseconds) {
  var currentTime = new Date().getTime();

  while (currentTime + miliseconds >= new Date().getTime()) {
  }
 }

function makeOne() 
{
  for (let i = 0; i < 1; i++) {
      obje.push(make());
      
  }
  for (let i = 0; i < 2; i++) {
  obje.push(make());
  
  }
}