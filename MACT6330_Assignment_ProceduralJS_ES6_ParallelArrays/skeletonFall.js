// Skeleton Fall Apart Animation for Lloryn's Forensic Pathology Theme
// Original work by Jasmine Aguilar (2024)

let bones = [];
let falling = false;
let gravity = 0.7;
let scatter = 8;

function setup() {
  createCanvas(700, 600);
  background(245, 242, 230);
  // Head
  bones.push({type: 'head', x: 350, y: 140, r: 40, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity});
  // Spine (3 vertebrae)
  for (let i = 0; i < 3; i++) {
    bones.push({type: 'spine', x: 350, y: 190 + i * 30, w: 18, h: 18, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity});
  }
  // Pelvis
  bones.push({type: 'pelvis', x: 350, y: 290, w: 40, h: 20, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity});
  // Arms (left/right upper and lower)
  bones.push({type: 'arm', x1: 350, y1: 200, x2: 290, y2: 230, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity}); // left upper
  bones.push({type: 'arm', x1: 290, y1: 230, x2: 260, y2: 300, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity}); // left lower
  bones.push({type: 'arm', x1: 350, y1: 200, x2: 410, y2: 230, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity}); // right upper
  bones.push({type: 'arm', x1: 410, y1: 230, x2: 440, y2: 300, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity}); // right lower
  // Legs (left/right upper and lower)
  bones.push({type: 'leg', x1: 350, y1: 310, x2: 310, y2: 400, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity}); // left upper
  bones.push({type: 'leg', x1: 310, y1: 400, x2: 300, y2: 500, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity}); // left lower
  bones.push({type: 'leg', x1: 350, y1: 310, x2: 390, y2: 400, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity}); // right upper
  bones.push({type: 'leg', x1: 390, y1: 400, x2: 400, y2: 500, dx: random(-scatter, scatter), dy: random(2, scatter), ay: gravity}); // right lower
  falling = true;
}

function draw() {
  background(245, 242, 230);
  // Draw and animate bones
  for (let bone of bones) {
    if (falling) {
      if (bone.type === 'head') {
        bone.x += bone.dx;
        bone.y += bone.dy;
        bone.dy += bone.ay;
      } else if (bone.type === 'spine' || bone.type === 'pelvis') {
        bone.x += bone.dx;
        bone.y += bone.dy;
        bone.dy += bone.ay;
      } else if (bone.type === 'arm' || bone.type === 'leg') {
        bone.x1 += bone.dx;
        bone.y1 += bone.dy;
        bone.x2 += bone.dx;
        bone.y2 += bone.dy;
        bone.dy += bone.ay;
      }
    }
    drawBone(bone);
  }
}

function drawBone(bone) {
  stroke(180, 170, 140);
  strokeWeight(12);
  fill(245, 242, 230);
  if (bone.type === 'head') {
    ellipse(bone.x, bone.y, bone.r * 2, bone.r * 2);
    // Eyes
    fill(60);
    ellipse(bone.x - 12, bone.y - 8, 10, 14);
    ellipse(bone.x + 12, bone.y - 8, 10, 14);
    // Mouth
    noFill();
    stroke(60);
    strokeWeight(3);
    arc(bone.x, bone.y + 10, 18, 10, 0, PI);
  } else if (bone.type === 'spine') {
    stroke(180, 170, 140);
    strokeWeight(14);
    ellipse(bone.x, bone.y, bone.w, bone.h);
  } else if (bone.type === 'pelvis') {
    stroke(180, 170, 140);
    strokeWeight(16);
    ellipse(bone.x, bone.y, bone.w, bone.h);
  } else if (bone.type === 'arm' || bone.type === 'leg') {
    stroke(180, 170, 140);
    strokeWeight(12);
    line(bone.x1, bone.y1, bone.x2, bone.y2);
    // Joints
    noStroke();
    fill(200, 190, 160);
    ellipse(bone.x1, bone.y1, 18, 18);
    ellipse(bone.x2, bone.y2, 18, 18);
  }
} 