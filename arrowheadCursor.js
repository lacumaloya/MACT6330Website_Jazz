// p5.js Broken Arrowhead Cursor (Both Sides Jagged)
function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('pointer-events', 'none');
  canvas.style('z-index', '9999');
  canvas.style('position', 'fixed');
  
  // Add global CSS to hide cursor
  let style = document.createElement('style');
  style.textContent = '* { cursor: none !important; }';
  document.head.appendChild(style);
  
  noCursor();
  background(0,0,0,0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- Add global variables for click animation ---
let cursorScale = 1;
let clickAnimating = false;
let clickStartTime = 0;
const CLICK_ANIMATION_DURATION = 120; // ms

// --- Phantom trail variables ---
let cursorTrail = [];
const TRAIL_LENGTH = 12;

function mousePressed() {
  clickAnimating = true;
  clickStartTime = millis();
}

function draw() {
  clear();
  // --- Update click animation state ---
  if (clickAnimating) {
    let elapsed = millis() - clickStartTime;
    if (elapsed < CLICK_ANIMATION_DURATION) {
      let t = elapsed / CLICK_ANIMATION_DURATION;
      cursorScale = 1 - 0.3 * sin(PI * t);
    } else {
      cursorScale = 1;
      clickAnimating = false;
    }
  }
  // --- Update cursor trail ---
  cursorTrail.push({x: mouseX, y: mouseY});
  if (cursorTrail.length > TRAIL_LENGTH) cursorTrail.shift();
  // --- Draw phantom trail ---
  for (let i = 0; i < cursorTrail.length - 1; i++) {
    // Avoid p5.map to prevent potential conflicts; compute linearly
    let alpha;
    if (cursorTrail.length > 1) {
      let t = i / (cursorTrail.length - 1);
      alpha = 30 + t * (120 - 30);
    } else {
      alpha = 120;
    }
    drawArrowheadCursor(cursorTrail[i].x, cursorTrail[i].y, 15, alpha / 255);
  }
  // --- Draw main cursor ---
  drawArrowheadCursor(mouseX, mouseY, 15, 1);
}

function drawArrowheadCursor(x, y, size, alpha = 1) {
  push();
  // Define pts first so it can be used for transformation
  const pts = [
    {x: 0, y: 0}, // tip
    {x: size * 0.7, y: size * -0.08},
    {x: size * 1.2, y: size * 0.02},
    {x: size * 1.7, y: size * -0.04},
    {x: size * 2.0, y: size * 0.08},
    {x: size * 2.3, y: size * 0.12},
    {x: size * 2.7, y: size * 0.18}, // vertex 6
    {x: size * 2.5, y: size * 0.32},
    {x: size * 2.1, y: size * 0.55},
    {x: size * 1.7, y: size * 0.85},
    {x: size * 1.1, y: size * 1.1},
    {x: size * 0.7, y: size * 0.9},
    {x: size * 0.3, y: size * 0.6},
    {x: size * 0.1, y: size * 0.25},
  ];
  // Calculate the transformed position of vertex 6
  let px = pts[6].x;
  let py = pts[6].y;
  // Apply scale(-1, 1) and rotate(40deg) to vertex 6
  let sx = -px;
  let sy = py;
  let angle = radians(40);
  let tx = sx * cos(angle) - sy * sin(angle);
  let ty = sx * sin(angle) + sy * cos(angle);
  // Translate so that the transformed vertex 6 is at the mouse position
  translate(x - tx, y - ty);
  rotate(angle);
  scale(-1, 1);
  // --- Apply click animation scale ---
  scale(cursorScale);

  // --- SOFT SHADOW ---
  noStroke();
  for (let i = 6; i > 0; i--) {
    fill(80, 75, 90, 3 * alpha); // slightly denser shadow
    beginShape();
    for (let p of pts) vertex(p.x + 8 + i, p.y + 10 + i);
    endShape(CLOSE);
  }

  // --- TWO-TONE OUTLINE ---
  if (alpha < 1) {
    stroke(255, 230, 255, 40 * alpha); // lighter outer
    strokeWeight(3);
  } else {
    stroke(255, 230, 255, 80 * alpha); // normal outer
    strokeWeight(7);
  }
  fill(0,0,0,0);
  beginShape();
  for (let p of pts) vertex(p.x, p.y);
  endShape(CLOSE);
  if (alpha < 1) {
    stroke(35, 25, 45, 120 * alpha); // lighter inner
    strokeWeight(1.5);
  } else {
    stroke(35, 25, 45, 255 * alpha); // normal inner
    strokeWeight(3.5);
  }
  fill(0,0,0,0);
  beginShape();
  for (let p of pts) vertex(p.x, p.y);
  endShape(CLOSE);

  // --- GRADIENT FILL ---
  // Use p5.js drawingContext for gradient
  let ctx = drawingContext;
  let grad = ctx.createLinearGradient(0, 0, size * 2, size * 1.1);
  grad.addColorStop(0, '#e9d6f7'); // pale lavender
  grad.addColorStop(0.5, '#a18cd1'); // lavender
  grad.addColorStop(1, '#4b2744'); // deep merlot
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = grad;
  beginShape();
  for (let p of pts) vertex(p.x, p.y);
  endShape(CLOSE);
  ctx.globalAlpha = 1;
  ctx.restore();

  // --- PRONOUNCED FACETS ---
  noStroke();
  fill(200, 200, 255, 180 * alpha); // facet 1
  beginShape();
  vertex(size * 0.3, size * 0.6);
  vertex(size * 0.7, size * 0.9);
  vertex(size * 1.1, size * 1.1);
  vertex(size * 1.0, size * 0.7);
  vertex(size * 0.7, size * 0.6);
  endShape(CLOSE);

  fill(180, 180, 220, 180 * alpha); // facet 2
  beginShape();
  vertex(size * 0.7, size * 0.6);
  vertex(size * 1.0, size * 0.7);
  vertex(size * 1.7, size * 0.85);
  vertex(size * 1.3, size * 0.45);
  vertex(size * 1.0, size * 0.4);
  endShape(CLOSE);

  fill(220, 220, 255, 160 * alpha); // facet 3
  beginShape();
  vertex(size * 1.3, size * 0.45);
  vertex(size * 1.7, size * 0.85);
  vertex(size * 2.1, size * 0.55);
  vertex(size * 1.7, size * 0.3);
  vertex(size * 1.3, size * 0.35);
  endShape(CLOSE);

  fill(240, 240, 255, 120 * alpha); // facet 4
  beginShape();
  vertex(size * 1.7, size * 0.3);
  vertex(size * 2.1, size * 0.55);
  vertex(size * 2.5, size * 0.32);
  vertex(size * 2.3, size * 0.12);
  vertex(size * 2.0, size * 0.08);
  endShape(CLOSE);

  // --- CRACKS/DETAILS ---
  stroke(180, 255 * alpha);
  strokeWeight(1.2);
  line(size * 2.7, size * 0.18, size * 1.1, size * 1.1);
  line(size * 2.5, size * 0.32, size * 1.0, size * 0.7);
  line(size * 2.1, size * 0.55, size * 0.7, size * 0.9);
  line(size * 1.7, size * 0.3, size * 0.3, size * 0.6);
  line(size * 1.3, size * 0.35, size * 0.1, size * 0.25);
  // New cracks for jagged edge
  line(size * 0.7, size * -0.08, size * 1.2, size * 0.02);
  line(size * 1.2, size * 0.02, size * 1.7, size * -0.04);
  line(size * 1.7, size * -0.04, size * 2.0, size * 0.08);
  line(size * 2.0, size * 0.08, size * 2.3, size * 0.12);

  pop();
} 