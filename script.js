const PARTICLE_COUNT = 2000;
const CANVAS_W = 800;
const CANVAS_H = 800;

const DRAW_IMAGE = false;
const SHOW_BACKGROUND = true;
const SHOW_LINES = true;

let img;
const particles = [];

let count = 0;
let sum = [0, 0, 0];

let xDamp = 6;
let yDamp = 10;

// modified from https://github.com/CodingTrain/website/blob/main/Tutorials/P5JS/p5.js_video/11.6_p5.js_painting/particle.js
function Particle(x, y) {
  const startColor = img.get(x, y);
  this.x = x;
  this.y = y;
  // this.x = map(startColor[0], 0, 255, 0, width);
  // this.r = map(startColor[2], 0, 255, 1, 10);
  // sum[0] += startColor[0];
  // sum[1] += startColor[1];
  // sum[2] += startColor[2];

  this.a = brightness(startColor) > 20 ? 3 : 0;
  // this.r = map(startColor[2], 0, 255, 1, 100);

  this.update = function () {
    const noiseVal = noise(this.x, this.y);

    this.w = sin(count / startColor[1]) * map(startColor[2], 0, 255, 30, 120);
    this.h = cos(count / startColor[1]) * map(startColor[0], 0, 255, 30, 120);

    // const distX = mouseX - this.x;
    // const distY = mouseY - this.y;
    const d = dist(mouseX, mouseY, this.x, this.y);
    // if (d < 25 && d > 10) {
    //   this.w -= 20;
    //   this.h -= 20;
    //   fill(0, 3);
    //   push();
    //   translate(width / 2, height / 2);
    //   rotate(noise(frameCount) * 360);
    //   rect(this.x, this.y, noiseVal * 290, noiseVal * 10);
    //   pop();
    // }
    // this.w *= distX / width;
    // this.h *= distY / height;

    this.x +=
      (noiseVal * (mouseX / width - 0.5) * brightness(startColor)) / xDamp;
    this.y +=
      (noiseVal * (mouseY / height - 0.5) * brightness(startColor)) / yDamp;

    if (this.x > width) {
      this.x = 0;
    }
    if (this.y > height) {
      this.y = 0;
    }
    if (this.x < 0) {
      this.x = width;
    }
    if (this.y < 0) {
      this.y = height;
    }
    // if (this.a < 3) {
    //   this.a += 0.005;
    // }
  };

  this.show = function () {
    noStroke();
    const c = startColor;
    fill(c[0], c[1], c[2], this.a);
    // console.log(c);
    const thresh = 100;
    // rectMode(CENTER);
    const isRExtreme = c[0] > 255 - thresh && c[1] < thresh && c[2] < thresh;
    const isGExtreme = c[1] > 255 - thresh && c[0] < thresh && c[2] < thresh;
    const isBExtreme = c[2] > 255 - thresh && c[1] < thresh && c[2] < thresh;
    if (
      SHOW_LINES &&
      vertexCount < 100 &&
      (isRExtreme || isGExtreme || isBExtreme)
    ) {
      // console.log("adding vertex");
      vertex(this.x + this.w / 2, this.y + this.h / 2);
      vertexCount++;
    }
    // const x = map(startColor[0], 0, 255, 0, width);
    // ellipse(this.x, this.y, this.r, this.r);
    // translate(width/2, height/2);

    // if (c[0] > 150) {
    //   image(randomSquare1, this.x, this.y, 20, 20);
    // }
    if (SHOW_BACKGROUND) {
      rect(this.x, this.y, this.w, this.h);
    }
  };
}

let randomSquare1;
let randomSquare2;
let randomSquare3;
let input;

function setup() {
  // input = createFileInput(handleFile);
  createCanvas(CANVAS_W, CANVAS_H);
  getNewImage();
}

function handleFile(file) {
  // print(file);
  if (file.type === "image") {
    img = createImg(file.data, "");
    img.hide();
    setImage(img);
  }
}

let vertexCount = 0;
// let prevPos = [0, 0];
function draw() {
  background(20, 0, 20, 1);
  if (SHOW_LINES) {
    vertexCount = 0;
    beginShape();
  }

  // if (randomSquare1) {
  //   for (let i = 0; i < 800; i += 20) {
  //     for (let j = 0; j < 800; j += 20) {
  //       // const element = 800[i];
  //       blendMode(OVERLAY);
  //       image(randomSquare1, i, j, 20, 20);
  //     }
  //   }
  // }
  // sum = [0, 0, 0];
  for (let i = 0; i < particles.length; i++) {
    particles[i].show();
    particles[i].update();
    // blendMode(OVERLAY);
  }
  if (SHOW_LINES) {
    fill(255, 0);
    strokeWeight(2);
    stroke(255, 10);
    endShape(CLOSE);
  }

  // const noiseVal = noise(prevPos[0]) - 0.5;
  // noiseSeed(1);
  // const noiseVal2 = noise(prevPos[1]) - 0.5;
  // console.log(noiseVal);
  // console.log(noiseVal2);
  // const rX = noiseVal * 10;
  // const rY = noiseVal2 * 10;
  // strokeWeight(2);
  // stroke(0);
  // push();
  // translate(width / 2, height / 2);
  // line(prevPos[0], prevPos[1], rX, rY);
  // pop();

  // prevPos = [rX, rY];
  // // console.log(sum.map((x) => x / particles.length));

  count++;
}

function mousePressed() {
  getNewImage();
}

const setImage = (newImg) => {
  img = newImg;
  clear();
  // push();
  // fill(255);
  // background(255);
  // pop();

  if (DRAW_IMAGE) {
    image(img, 0, 0, width, height);
  }
  // count = 0;
  for (var i = 0; i < PARTICLE_COUNT; i++) {
    particles[i] = new Particle(random(width), random(height));
  }

  const randomX1 = Math.floor(random(img.width - 20));
  const randomY1 = Math.floor(random(img.width - 20));

  const randomX2 = Math.floor(random(img.width - 20));
  const randomY2 = Math.floor(random(img.width - 20));

  const randomX3 = Math.floor(random(img.width - 20));
  const randomY3 = Math.floor(random(img.width - 20));

  randomSquare1 = img.get(randomX1, randomY1, 20, 20);
  randomSquare2 = img.get(randomX2, randomY2, 20, 20);
  randomSquare3 = img.get(randomX3, randomY3, 20, 20);
};

const getNewImage = () => {
  console.log("loading new image...");
  const URL = "https://source.unsplash.com/random/";
  const w = Math.floor(random(CANVAS_W - 50, CANVAS_W + 50));
  const h = Math.floor(random(CANVAS_W - 50, CANVAS_W + 50));
  loadImage(`${URL}${w}x${h}`, setImage);
};

function keyPressed() {
  if (key === "s") {
    save("texturizer.png");
  }
}
