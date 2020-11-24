const PARTICLE_COUNT = 2000;
const CANVAS_W = 800;
const CANVAS_H = 800;
const DEBUG_OSC = false;

const DRAW_IMAGE = false;
const SHOW_BACKGROUND = true;
const SHOW_LINES = true;

let img;
let isLoading = false;
let isPlaying = true;
const particles = [];

let count = 0;
let sum = [0, 0, 0];

let xDamp = 6;
let yDamp = 10;

const oscCount = 5;
const oscs = [];

const compressor = new p5.Compressor();
const reverb = new p5.Reverb();

compressor.disconnect();
compressor.connect(reverb);

const scale = teoria.note("a").scale("majorpentatonic");

// modified from https://github.com/CodingTrain/website/blob/main/Tutorials/P5JS/p5.js_video/11.6_p5.js_painting/particle.js
function Particle(x, y) {
  const startColor = img.get(x, y);
  this.x = x;
  this.y = y;
  this.osc = null;
  this.noiseAmt = 10;

  if (oscs.length < oscCount) {
    this.filter = new p5.LowPass();
    this.filter.disconnect();
    this.isNoise = saturation(startColor) < 10;
    // const type = brightness(startColor) > 60 ? "square" : "sine";

    // const osc =
    //   saturation(startColor) > 5 ? new p5.Oscillator(type) : new p5.Noise();

    const type = "triangle";
    const osc = this.isNoise ? new p5.Noise("pink") : new p5.Oscillator(type);
    this.osc = osc;
    this.osc.disconnect();
    this.osc.start();

    // const randIndex = Math.floor(random(scale.notes().length));

    const freqIndex = Math.floor(
      map(this.y, 0, height, 0, scale.notes().length * 4)
    );
    if (!this.isNoise) {
      this.osc.freq(scale.get(freqIndex).fq() / 3);
    }
    this.osc.pan(constrain(map(this.x, width, 0, 0, 1), 0, 1));
    if (this.isNoise) {
      this.osc.amp(0.1, 1);
    } else {
      this.osc.amp(0.2, 1);
    }

    this.filter.freq(0);
    if (this.isNoise) {
      this.filter.gain(0.1);
    }
    this.osc.connect(this.filter);
    this.filter.connect(compressor);
    oscs.push(this.osc);
  }
  this.a = brightness(startColor) > 20 ? 3 : 0;
  // this.r = map(startColor[2], 0, 255, 1, 100);

  this.update = function () {
    const noiseVal = noise(this.x, this.y);

    this.w = sin(count / startColor[1]) * map(startColor[2], 0, 255, 30, 120);
    this.h = cos(count / startColor[1]) * map(startColor[0], 0, 255, 30, 120);

    // const distX = mouseX - this.x;
    // const distY = mouseY - this.y;
    // const d = dist(mouseX, mouseY, this.x, this.y);
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

    // osc debugger
    if (this.osc && !isLoading) {
      const c = img.get(this.x, this.y);
      const [r, g, b] = c;
      const noteIndex = Math.floor(map(g, 0, 255, 0, scale.notes().length * 3));
      const newNote = scale.get(noteIndex);

      this.osc.pan(constrain(map(this.x, 0, width, -1, 1), -1, 1), 1);
      // const freqIndex = Math.floor(
      //   map(this.y, 0, height, 0, scale.notes().length)
      // );
      // this.osc.freq(scale.get(freqIndex).fq(), 0.5);
      if (!this.isNoise) {
        this.osc.freq(newNote.fq() / 3 + (noiseVal * this.noiseAmt - 5), 2);
      }
      if (this.w) {
        // console.log(this.w);
        let freq = map(Math.abs(this.w), 0, 50, 20, 10000);
        freq = constrain(freq, 0, 22050);
        // console.log(freq);
        this.filter.freq(freq, 0.5);
      }

      if (this.h) {
        const vol = map(Math.abs(this.h), 0, 100, 0, 0.8);
        // console.log("VOL", vol);
        if (this.isNoise) {
          this.osc.amp(vol * 0.1, 0.2);
        } else {
          this.osc.amp(vol, 0.5);
        }
      }

      if (DEBUG_OSC) {
        fill(255, 0, 0);
        circle(this.x, this.y, 10);
      }
    }
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

function mouseMoved() {
  const d = dist(mouseX, mouseY, width / 2, height / 2);
  const dryWet = map(d, 0, width / 2, 0, 1);
  const amp = map(d, 0, width / 2, 0.4, 1);
  reverb.drywet(dryWet, 0.5);
  reverb.amp(amp, 0.5);
}

const setImage = (newImg) => {
  img = newImg;
  clear();
  oscs.forEach((osc) => {
    osc.disconnect();
  });
  oscs.length = 0;
  isLoading = false;
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
  isLoading = true;
  console.log("loading new image...");
  const URL = "https://source.unsplash.com/random/";
  const w = Math.floor(random(CANVAS_W - 50, CANVAS_W + 50));
  const h = Math.floor(random(CANVAS_W - 50, CANVAS_W + 50));
  oscs.forEach((osc) => {
    osc.amp(0, 1);
  });
  // oscs.length = 0;
  loadImage(`${URL}${w}x${h}`, setImage);
};

function keyPressed() {
  if (key === "s") {
    save("texturizer.png");
  }
  if (key === " ") {
    isPlaying = !isPlaying;
    compressor.amp(isPlaying ? 1 : 0, 1);
  }
}
