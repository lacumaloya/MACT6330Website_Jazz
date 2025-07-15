// Digital Fingerprint Effect with Multiple Patterns (ES6 Class Refactor)
(function() {
  var canvas = document.getElementById('fingerprint-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Color interpolation (blue to purple to pink)
  function lerpColor(a, b, t) {
    var ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
    var br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
    return 'rgb(' +
      Math.round(ar + (br - ar) * t) + ',' +
      Math.round(ag + (bg - ag) * t) + ',' +
      Math.round(ab + (bb - ab) * t) + ')';
  }
  var blue = 0x00bfff, purple = 0x7c3aed, pink = 0xff69b4;

  // --- Base Class ---
  class DigitalFingerprint {
    constructor(canvas, ctx) {
      this.canvas = canvas;
      this.ctx = ctx;
      this.cx = canvas.width / 2;
      this.cy = canvas.height / 2;
      this.maxR = Math.min(canvas.width, canvas.height) * 0.32;
      this.ridges = 15;
      this.pointsPerRidge = 50;
      this.ridgePaths = [];
    }
    generate() {
      this.ridgePaths = [];
      for (let r = 0; r < this.ridges; r++) {
        let baseOffset = (r / this.ridges) * (this.maxR - 10) + 10;
        this.ridgePaths.push(this.generatePath(r, baseOffset));
      }
    }
    draw(dotsDrawn, dotsPerFrame) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let r = 0; r < this.ridgePaths.length; r++) {
        let path = this.ridgePaths[r];
        let maxDots = dotsDrawn[r] || 0;
        for (let i = 0; i < maxDots && i < path.length; i++) {
          let pt = path[i];
          let color = pt.t < 0.5 ? lerpColor(blue, purple, pt.t * 2) : lerpColor(purple, pink, (pt.t - 0.5) * 2);
          let fade = 1.0;
          if (pt.t > 0.85) fade = Math.max(0, 1.0 - (pt.t - 0.85) * 4.5);
          this.ctx.save();
          this.ctx.globalAlpha = 0.85 * fade;
          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, 2.1 + 1.2 * Math.sin(r + i * 0.13), 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }
        if (maxDots < path.length) {
          dotsDrawn[r] = maxDots + dotsPerFrame;
        }
      }
    }
  }

  // --- Subclasses for each fingerprint type ---
  class Whorl extends DigitalFingerprint {
    generatePath(r, baseOffset) {
      let path = [];
      let spiralTurns = 2.2 + 2.5 * (r / this.ridges);
      for (let i = 0; i < this.pointsPerRidge * spiralTurns; i++) {
        let t = i / (this.pointsPerRidge * spiralTurns);
        let theta = t * Math.PI * 2 * spiralTurns;
        let flow = Math.sin(theta * 1.2 + r * 0.18) * 0.18 + Math.sin(theta * 3.1 + r * 0.5) * 0.07;
        let rr = baseOffset + 13 * t + 2 * Math.sin(theta * 2.5 + r * 0.7);
        let x = this.cx + rr * Math.cos(theta + flow) * 0.7;
        let y = this.cy + rr * Math.sin(theta + flow) * 1.15;
        path.push({x, y, t});
      }
      return path;
    }
  }

  class Loop extends DigitalFingerprint {
    generatePath(r, baseOffset) {
      let path = [];
      let loopWidth = this.maxR * 1.2;
      let loopHeight = this.maxR * 0.8;
      let ridgeOffset = (r - this.ridges / 2) * 7;
      let coreX = this.cx - loopWidth * 0.25;
      let coreY = this.cy + loopHeight * 0.1;
      for (let i = 0; i < this.pointsPerRidge; i++) {
        let t = i / (this.pointsPerRidge - 1);
        let angle = Math.PI * (0.8 * t + 0.1);
        let x = coreX + Math.cos(angle) * (loopWidth * (0.7 - 0.2 * t));
        let y = coreY + Math.sin(angle) * (loopHeight * (1.0 - 0.4 * t)) + ridgeOffset;
        y += Math.sin(t * Math.PI * 2 + r * 0.18) * 1.2;
        path.push({x, y, t});
      }
      return path;
    }
  }

  class DoubleLoop extends DigitalFingerprint {
    generatePath(r, baseOffset) {
      let path = [];
      let doubleLoopRidges = 90;
      let doubleLoopPoints = 160;
      let loopWidth = this.maxR * 1.12;
      let loopHeight = this.maxR * 1.02;
      let leftCore = { x: this.cx - loopWidth * 0.32, y: this.cy + loopHeight * 0.18 };
      let rightCore = { x: this.cx + loopWidth * 0.32, y: this.cy - loopHeight * 0.18 };
      let randAngle = (Math.random() - 0.5) * 0.18;
      let randRadius = (Math.random() - 0.5) * this.maxR * 0.04;
      for (let i = 0; i < doubleLoopPoints; i++) {
        let t = i / (doubleLoopPoints - 1);
        let spiralT = t < 0.5 ? t * 2 : (1 - t) * 2;
        let thetaL = Math.PI * (1.1 * spiralT + 0.1 + randAngle) + spiralT * Math.PI * 0.5;
        let thetaR = Math.PI * (1.1 * spiralT + 0.1 - randAngle) + spiralT * Math.PI * 0.5;
        let radiusL = loopWidth * (0.7 - 0.25 * spiralT) + baseOffset * 0.7 + randRadius;
        let radiusR = loopWidth * (0.7 - 0.25 * spiralT) + baseOffset * 0.7 - randRadius;
        let xL = leftCore.x + Math.cos(thetaL) * radiusL;
        let yL = leftCore.y + Math.sin(thetaL) * (loopHeight * (1.0 - 0.5 * spiralT)) + (r - doubleLoopRidges / 2) * 1.5;
        let xR = rightCore.x + Math.cos(Math.PI - thetaR) * radiusR;
        let yR = rightCore.y + Math.sin(Math.PI - thetaR) * (loopHeight * (1.0 - 0.5 * spiralT)) + (r - doubleLoopRidges / 2) * 1.5;
        let sBlend = 0.5 - 0.5 * Math.cos(Math.PI * t);
        let x = xL * (1 - sBlend) + xR * sBlend;
        let y = yL * (1 - sBlend) + yR * sBlend;
        y += Math.sin(t * Math.PI * 2 + r * 0.18) * 2.2;
        y += Math.sin(t * 7 + r * 0.12) * 1.1;
        y += Math.sin(t * 13 + r * 0.22) * 0.7;
        x += Math.sin(t * 5 + r * 0.19) * 0.7;
        path.push({ x, y, t });
      }
      return path;
    }
  }

  class Arch extends DigitalFingerprint {
    generatePath(r, baseOffset) {
      let path = [];
      let archRadius = this.maxR * 0.9 - r * (this.maxR * 0.035);
      let centerY = this.cy + this.maxR * 0.7;
      let sweep = Math.PI * 0.95;
      let ridgeOffset = (r - this.ridges / 2) * 2.2;
      for (let i = 0; i < this.pointsPerRidge; i++) {
        let t = i / (this.pointsPerRidge - 1);
        let theta = Math.PI + sweep * (t - 0.5);
        let x = this.cx + archRadius * Math.cos(theta);
        let y = centerY + archRadius * Math.sin(theta) + ridgeOffset;
        y += Math.sin(t * Math.PI * 2 + r * 0.18) * 0.6;
        path.push({ x, y, t });
      }
      return path;
    }
  }

  class TentedArch extends DigitalFingerprint {
    generatePath(r, baseOffset) {
      let path = [];
      let archRadius = this.maxR * 0.9 - r * (this.maxR * 0.035);
      let centerY = this.cy + this.maxR * 0.7;
      let sweep = Math.PI * 0.95;
      let ridgeOffset = (r - this.ridges / 2) * 2.2;
      for (let i = 0; i < this.pointsPerRidge; i++) {
        let t = i / (this.pointsPerRidge - 1);
        let theta = Math.PI + sweep * (t - 0.5);
        let x = this.cx + archRadius * Math.cos(theta);
        let y = centerY + archRadius * Math.sin(theta) + ridgeOffset;
        if (t > 0.45 && t < 0.55) {
          y -= Math.sin((t - 0.5) * Math.PI * 10) * 20;
        }
        y += Math.sin(t * Math.PI * 2 + r * 0.18) * 0.6;
        path.push({ x, y, t });
      }
      return path;
    }
  }

  // --- Animation and cycling logic ---
  const types = [Whorl, Loop, Arch, TentedArch, DoubleLoop];
  let currentType = 0;
  let fingerprint = null;
  let dotsDrawn = [];
  let dotsPerFrame = 5;
  let animating = true;
  let patternComplete = false;
  let transitionDelay = 1800;

  function generateFingerprint() {
    fingerprint = new types[currentType](canvas, ctx);
    // Set density for double loop
    if (fingerprint instanceof DoubleLoop) {
      fingerprint.ridges = 90;
      fingerprint.pointsPerRidge = 160;
    } else {
      fingerprint.ridges = 15;
      fingerprint.pointsPerRidge = 50;
    }
    fingerprint.generate();
    dotsDrawn = [];
  }

  function drawFingerprint() {
    fingerprint.draw(dotsDrawn, dotsPerFrame);
    let stillDrawing = false;
    for (let r = 0; r < fingerprint.ridgePaths.length; r++) {
      if (dotsDrawn[r] < fingerprint.ridgePaths[r].length) stillDrawing = true;
    }
    if (!stillDrawing && !patternComplete) {
      patternComplete = true;
      setTimeout(() => {
        currentType = (currentType + 1) % types.length;
        generateFingerprint();
        patternComplete = false;
        requestAnimationFrame(drawFingerprint);
      }, transitionDelay);
    } else if (!patternComplete) {
      requestAnimationFrame(drawFingerprint);
    }
  }

  function restart() {
    generateFingerprint();
    patternComplete = false;
    animating = true;
    requestAnimationFrame(drawFingerprint);
  }
  window.addEventListener('resize', restart);
  generateFingerprint();
  requestAnimationFrame(drawFingerprint);
})(); 