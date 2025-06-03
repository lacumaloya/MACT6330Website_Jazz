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

function draw() {
  clear();
  drawArrowheadCursor(mouseX, mouseY, 30);
}

function drawArrowheadCursor(x, y, size) {
  push();
  translate(x, y);
  rotate(radians(40)); // Rotate 40 degrees to the right (clockwise)
  scale(-1, 1); // Flip horizontally after rotation

  // Outline points (traced from reference, scaled, now both sides jagged)
  const pts = [
    {x: 0, y: 0}, // tip
    {x: size * 0.7, y: size * -0.08}, // upper notch 1
    {x: size * 1.2, y: size * 0.02}, // upper notch 2
    {x: size * 1.7, y: size * -0.04}, // upper notch 3
    {x: size * 2.0, y: size * 0.08}, // upper edge
    {x: size * 2.3, y: size * 0.12}, // upper jag
    {x: size * 2.7, y: size * 0.18}, // upper tip
    {x: size * 2.5, y: size * 0.32},
    {x: size * 2.1, y: size * 0.55},
    {x: size * 1.7, y: size * 0.85},
    {x: size * 1.1, y: size * 1.1},
    {x: size * 0.7, y: size * 0.9},
    {x: size * 0.3, y: size * 0.6},
    {x: size * 0.1, y: size * 0.25},
  ];

  // Draw congruent shadow (polygon, offset down and right)
  noStroke();
  fill(80, 75, 90, 60);
  beginShape();
  for (let p of pts) vertex(p.x + 24, p.y + 32); // offset shadow
  endShape(CLOSE);

  // Main arrowhead shape
  stroke(35, 25, 45);
  strokeWeight(4);
  fill(50, 32, 60); // deep purple
  beginShape();
  for (let p of pts) vertex(p.x, p.y);
  endShape(CLOSE);

  // Facets (approximate, adjusted for new edge)
  noStroke();
  fill(140, 140, 140, 180); // facet 1
  beginShape();
  vertex(size * 0.3, size * 0.6);
  vertex(size * 0.7, size * 0.9);
  vertex(size * 1.1, size * 1.1);
  vertex(size * 1.0, size * 0.7);
  vertex(size * 0.7, size * 0.6);
  endShape(CLOSE);

  fill(180, 180, 180, 180); // facet 2
  beginShape();
  vertex(size * 0.7, size * 0.6);
  vertex(size * 1.0, size * 0.7);
  vertex(size * 1.7, size * 0.85);
  vertex(size * 1.3, size * 0.45);
  vertex(size * 1.0, size * 0.4);
  endShape(CLOSE);

  fill(200, 200, 200, 160); // facet 3
  beginShape();
  vertex(size * 1.3, size * 0.45);
  vertex(size * 1.7, size * 0.85);
  vertex(size * 2.1, size * 0.55);
  vertex(size * 1.7, size * 0.3);
  vertex(size * 1.3, size * 0.35);
  endShape(CLOSE);

  fill(210, 210, 210, 120); // facet 4
  beginShape();
  vertex(size * 1.7, size * 0.3);
  vertex(size * 2.1, size * 0.55);
  vertex(size * 2.5, size * 0.32);
  vertex(size * 2.3, size * 0.12);
  vertex(size * 2.0, size * 0.08);
  endShape(CLOSE);

  // Cracks (traced, organic, adjusted for new edge)
  stroke(180);
  strokeWeight(1.5);
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