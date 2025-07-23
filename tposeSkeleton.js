// p5.js Anatomical Skeleton in T-pose (Saved Version)
function setup() {
  let canvas = createCanvas(300, 120);
  canvas.parent('p5-animation-holder');
}

function draw() {
  background(245, 242, 230);
  drawSkeleton(width/2, height*0.7, 60);
}

function drawSkeleton(x, y, size) {
  // Proportions
  let headR = size * 0.22;
  let bodyLen = size * 0.6;
  let armLen = size * 0.7;
  let legLen = size * 0.7;
  let shoulderY = y - bodyLen/2 + headR;
  let pelvisY = y + bodyLen/2;

  stroke(180, 170, 140);
  strokeWeight(3);
  fill(245, 242, 230);

  // --- Skull ---
  push();
  translate(x, y - bodyLen/2 - headR);
  ellipse(0, 0, headR*2, headR*2); // Skull
  // Eye sockets
  fill(180, 170, 140);
  noStroke();
  ellipse(-headR*0.45, -headR*0.2, headR*0.45, headR*0.32);
  ellipse(headR*0.45, -headR*0.2, headR*0.45, headR*0.32);
  // Nasal cavity
  ellipse(0, headR*0.18, headR*0.18, headR*0.28);
  // Jaw
  noFill();
  stroke(180, 170, 140);
  strokeWeight(1.2);
  arc(0, headR*0.45, headR*1.1, headR*0.7, 0, PI);
  pop();

  // --- Spine ---
  stroke(180, 170, 140);
  strokeWeight(3);
  line(x, y - bodyLen/2, x, y + bodyLen/2);

  // --- Ribcage ---
  push();
  translate(x, y - bodyLen/2 + headR*1.1);
  strokeWeight(2);
  noFill();
  for (let i = 0; i < 4; i++) {
    let ribY = i * headR*0.32;
    arc(0, ribY, headR*1.5 - i*2, headR*0.7, PI+QUARTER_PI, TWO_PI-QUARTER_PI);
  }
  pop();

  // --- Arms (T-pose) ---
  stroke(180, 170, 140);
  strokeWeight(3);
  line(x - armLen, shoulderY, x + armLen, shoulderY);
  // Joints (shoulders, elbows, hands)
  drawJoint(x - armLen, shoulderY); // Left hand
  drawJoint(x + armLen, shoulderY); // Right hand
  drawJoint(x, shoulderY); // Center/shoulder

  // --- Pelvis ---
  push();
  translate(x, pelvisY);
  stroke(180, 170, 140);
  strokeWeight(2.2);
  fill(245, 242, 230);
  ellipse(0, 0, headR*1.2, headR*0.7);
  // Openings
  fill(180, 170, 140);
  ellipse(-headR*0.28, 0, headR*0.18, headR*0.28);
  ellipse(headR*0.28, 0, headR*0.18, headR*0.28);
  pop();

  // --- Legs ---
  stroke(180, 170, 140);
  strokeWeight(3);
  // Use negative and positive angles for left and right legs
  let leftLegAngle = radians(120);  // More negative angle for left leg
  let rightLegAngle = radians(60);  // More positive angle for right leg
  let leftLegX = x + cos(leftLegAngle) * legLen;
  let leftLegY = pelvisY + sin(leftLegAngle) * legLen;
  let rightLegX = x + cos(rightLegAngle) * legLen;
  let rightLegY = pelvisY + sin(rightLegAngle) * legLen;
  line(x, pelvisY, leftLegX, leftLegY);
  drawJoint(leftLegX, leftLegY); // Left foot
  line(x, pelvisY, rightLegX, rightLegY);
  drawJoint(rightLegX, rightLegY); // Right foot
  drawJoint(x, pelvisY); // Hip joint
}

function drawJoint(x, y) {
  noStroke();
  fill(180, 170, 140);
  ellipse(x, y, 8, 8);
} 