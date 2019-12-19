let cam;
let domain = [];
let range = [];
let R = 64;
let resTheta;
let resPhi;
let amt = 0;
let step = .01;
let stage = 0;
let direction = 1;
let animating = false;
let readyToReset = false;
let choice;
let moebing = false;
const a = new Complex(1, 0);
const b = new Complex(0, 1);
const c = new Complex(1, 0);
const d = new Complex(0, 0);

function setup() {
  let canvas = createCanvas(650, 400, WEBGL);
  canvas.parent('sketch-holder');
  resTheta = 120;
  resPhi = 120;
  cam = createCamera();
  camera(0, -200, 200, 0, 0, 0, 0, 1, 0);
  background(250);
  colorMode(HSB);

  for (let i = 0; i < TWO_PI; i = i + TWO_PI / resTheta) {
    for (let j = 0; j < PI; j = j + PI / resPhi) {
      let zz = new ExtendedComplex(new Complex({
        arg: i,
        abs: tan(j)
      }));
      domain.push(zz);
      let ww = new ExtendedComplex(new Complex({
        arg: i,
        abs: tan(j)
      }));
      range.push(ww);
    }
  }
}

function draw() {
  frameRate(30);
  background(0, 0, 90);
  if (!document.querySelector('[name="myFunction"]:checked')) {
    document.getElementById('execute').disabled = true;
  } else {
    document.getElementById('execute').disabled = false;
  }
  orbitControl();
  stroke(0);
  strokeWeight(.5);
  grid();
  strokeWeight(10);
  if (animating == true) {
    if (document.querySelector('[name="myFunction"]:checked')) {
      choice = document.querySelector('[name="myFunction"]:checked').value;
    }

    calculateAndAnimate();
  }

  display();
  if (amt >= 1 && moebing == false) {
    animating = false;
  }
}


function ExtendedComplex(z) {
  this.num = z;
  this.phase = 180 * this.num.arg() / PI;
  if (this.num.arg() < 0) {
    this.phase = 360 + this.phase
  }
  this.col = color(this.phase, 100, 90);
  this.toPlane = function() {
    stroke(this.col);
    point(R * this.num.re, 0, -R * this.num.im);
  }
  this.toSphere = function() {
    stroke(this.col);
    point(R * cos(this.num.arg()) * sin(2 * atan2(1, this.num.abs())),
      -R * cos(2 * atan2(1, this.num.abs())),
      -R * sin(this.num.arg()) * sin(2 * atan2(1, this.num.abs())));
  }

}

function ln(z) {
  let w = z.log();
  let q = new Complex({
    arg: z.arg() + amt * (w.arg() - z.arg()),
    abs: z.abs() + amt * (w.abs() - z.abs())
  })
  return q;
}

function E(z) {
  let w = z.exp();
  let q = new Complex({
    arg: z.arg() + amt * (w.arg() - z.arg()),
    abs: z.abs() + amt * (w.abs() - z.abs())
  })
  return q;
}

function altMoeb(z) {
  let w = ((z.mul(a)).add(b)).div((z.mul(c)).add(d));
  let q = z.mul(1 - amt).add(w.mul(amt))
  return q
}

function Tan(z) {
  let w = z.tan();
  let q = z.mul(1 - amt).add(w.mul(amt))
  return q
}


function display() {
  for (let i = 0; i < range.length; i++) {
    if (document.getElementById("sphere").checked) {
      range[i].toSphere();
    }
    if (document.getElementById("plane").checked) {
      range[i].toPlane();
    }

  }
}

function grid() {
  for (let i = 0; i < 9; i++) {
    line(-4 * R / 2, 0, -4 * R / 2 + R * i / 2, 4 * R / 2, 0, -4 * R / 2 + R * i / 2);
    line(-4 * R / 2 + R * i / 2, 0, -4 * R / 2, -4 * R / 2 + R * i / 2, 0, 4 * R / 2);
  }
}

function calculateAndAnimate() {
  if (choice == 0) {
    domain = [];
    range = [];
    for (let i = 0; i < TWO_PI; i = i + TWO_PI / resTheta) {
      for (let j = 0; j < PI; j = j + PI / resPhi) {
        let zz = new ExtendedComplex(new Complex({
          arg: i,
          abs: tan(j)
        }));
        domain.push(zz);
        let ww = new ExtendedComplex(new Complex({
          arg: i,
          abs: tan(j)
        }));
        range.push(ww);
      }
    }
  } else if (choice == 1) {
    for (let i = 0; i < range.length; i++) {
      range[i].num = altMoeb(domain[i].num);
    };
  } else if (choice == 2) {
    for (let i = 0; i < range.length; i++) {
      range[i].num = ln(domain[i].num);
    };
  } else if (choice == 3) {
    for (let i = 0; i < range.length; i++) {
      range[i].num = E(domain[i].num);
    };
  } else if (choice == 4) {
    for (let i = 0; i < range.length; i++) {
      range[i].num = Tan(domain[i].num);
    };
  }

  amt = amt + step;
}

function startAnimating() {
  let element = document.getElementById("execute");
  if (element.value == "GO!" && document.querySelector('[name="myFunction"]:checked')) {
    animating = true;
    a.re = parseFloat(document.getElementById('Ar').value);
    a.im = parseFloat(document.getElementById('Ai').value);
    b.re = parseFloat(document.getElementById('Br').value);
    b.im = parseFloat(document.getElementById('Bi').value);
    c.re = parseFloat(document.getElementById('Cr').value);
    c.im = parseFloat(document.getElementById('Ci').value);
    d.re = parseFloat(document.getElementById('Dr').value);
    d.im = parseFloat(document.getElementById('Di').value);
    element.value = "RESET";
  } else if (element.value == "RESET") {
    fullReset();
    element.value = "GO!";
  }

}

function fullReset() {
  animating = false;
  amt = 0;
  choice = 0;
  document.getElementById('moebius').checked = false;
  document.getElementById('ln').checked = false;
  document.getElementById('exp').checked = false;
  document.getElementById('tan').checked = false;
  domain = [];
  range = [];
  for (let i = 0; i < TWO_PI; i = i + TWO_PI / resTheta) {
    for (let j = 0; j < PI; j = j + PI / resPhi) {
      let zz = new ExtendedComplex(new Complex({
        arg: i,
        abs: tan(j)
      }));
      domain.push(zz);
      let ww = new ExtendedComplex(new Complex({
        arg: i,
        abs: tan(j)
      }));
      range.push(ww);
    }
  }

}
